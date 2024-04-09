# views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.storage import default_storage
from .models import PDFFile, PDFPage, GPTResponse
from .serializers import PDFFileSerializer, PDFPageSerializer
from .utils.utils import split_pdf, process_pages_util, render_pdf_to_images



class PDFFileViewSet(viewsets.ModelViewSet):
    queryset = PDFFile.objects.all()
    serializer_class = PDFFileSerializer

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist('file')
        responses = []

        for file in files:
            data = {
                'name': request.data.get('name'),
                'file': file,
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            pdf_file = PDFFile.objects.get(id=serializer.data["id"])
            split_pdf(pdf_file)

            pages = PDFPage.objects.filter(pdf_file=pdf_file)
            page_ids = [page.id for page in pages]
            thumbnail_paths = [request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None for page in pages]

            response_data = serializer.data
            response_data["pages"] = page_ids
            response_data["thumbnails"] = thumbnail_paths
            responses.append(response_data)

        return Response(responses, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        pages = PDFPage.objects.filter(pdf_file=instance)
        page_ids = [page.id for page in pages]
        image_urls = render_pdf_to_images(page_ids)

        response_data = serializer.data
        response_data["pages"] = [
            {
                "id": page.id,
                "page_number": page.page_number,
                "file": request.build_absolute_uri(page.file.url),
                "thumbnail": request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None,
                "high_res_image": request.build_absolute_uri(image_url),
                "scanned": page.scanned,
            }
            for page, image_url in zip(pages, image_urls)
        ]

        return Response(response_data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'])
    def delete_high_res_images(self, request, pk=None):
        pdf_file = self.get_object()
        pages = PDFPage.objects.filter(pdf_file=pdf_file)

        for page in pages:
            image_path = os.path.join('high_res_images', f'{page.pdf_file.name}_page_{page.page_number}.jpg')
            if default_storage.exists(image_path):
                default_storage.delete(image_path)

        return Response({"message": "High-resolution images deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


class PDFPageViewSet(viewsets.ModelViewSet):
    queryset = PDFPage.objects.all()
    serializer_class = PDFPageSerializer

    @action(detail=False, methods=["post"])
    def process_pages(self, request):
        page_ids = request.data.get("page_ids", [])
        process_pages_util(page_ids)

        responses = []
        for page_id in page_ids:
            pdf_page = PDFPage.objects.get(id=page_id)
            pdf_page.scanned = True
            pdf_page.save()

            gpt_response = GPTResponse.objects.get(page_id=page_id)
            responses.append({
                'page_id': page_id,
                'json_output': gpt_response.json_response,
                'cost': gpt_response.cost,
                'scanned': pdf_page.scanned
            })

        return Response(
            {"status": "Processing complete", "processed_pages": responses},
            status=status.HTTP_200_OK,
        )
