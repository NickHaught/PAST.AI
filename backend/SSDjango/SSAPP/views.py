# views.py

from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.storage import default_storage
from .models import PDFFile, PDFPage, GPTResponse
from .serializers import PDFFileSerializer, PDFPageSerializer
from .utils.utils import split_pdf, process_pages_util, render_pdf_to_images
import os
import logging

logger = logging.getLogger("django")

class CustomPagination(PageNumberPagination):
    page_size = 1
    page_query_param = 'page_size'  # Allow client to specify page size
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'results': data
        })
    

class PDFFileViewSet(viewsets.ModelViewSet):
    queryset = PDFFile.objects.all()
    serializer_class = PDFFileSerializer
    pagination_class = CustomPagination

    def create(self, request, *args, **kwargs):
        try:
            files = request.FILES.getlist('file')
            if not files:
                logger.error("No files provided.")
                return Response({"error": "No files provided."}, status=status.HTTP_400_BAD_REQUEST)
            
            responses = []
            for file in files:
                data = {
                    'name': request.data.get('name', 'Unnamed PDF'),
                    'file': file,
                }
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)

                try:
                    pdf_file = PDFFile.objects.get(id=serializer.data["id"])
                    split_pdf(pdf_file)  # Assuming this can raise exceptions
                    
                    pages = PDFPage.objects.filter(pdf_file=pdf_file)
                    page_ids = [page.id for page in pages]
                    thumbnail_paths = [
                        request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None 
                        for page in pages
                    ]

                    response_data = serializer.data
                    response_data["pages"] = page_ids
                    response_data["thumbnails"] = thumbnail_paths
                    responses.append(response_data)
                except Exception as e:
                    logger.error(f"Failed processing PDF file {file.name}: {str(e)}")
                    responses.append({"error": f"Failed processing PDF file {file.name}: {str(e)}"})

            return Response(responses, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"An error occurred while processing PDF files: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            try:
                pages = PDFPage.objects.filter(pdf_file=instance)
                page_ids = [page.id for page in pages]
                image_urls = render_pdf_to_images(page_ids)  # This might raise exceptions

                response_data = serializer.data
                response_data["pages"] = [
                    {
                        "id": page.id,
                        "page_number": page.page_number,
                        "file": request.build_absolute_uri(page.file.url),
                        "thumbnail": request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None,
                        "high_res_image": image_url,
                        "scanned": page.scanned,
                    }
                    for page, image_url in zip(pages, image_urls)
                ]
                return Response(response_data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Failed to render pages for PDF {instance.name}: {str(e)}")
                return Response({"error": f"Failed to render pages for PDF {instance.name}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An error occurred while retrieving PDF file: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['delete'])
    def delete_high_res_images(self, request, pk=None):
        try:
            pdf_file = self.get_object()
            pages = PDFPage.objects.filter(pdf_file=pdf_file)

            for page in pages:
                image_path = os.path.join('high_res_images', f'{page.pdf_file.name}_page_{page.page_number}.jpg')
                if default_storage.exists(image_path):
                    default_storage.delete(image_path)
                else:
                    return Response({"error": f"Image not found: {image_path}"}, status=status.HTTP_404_NOT_FOUND)

            return Response({"message": "High-resolution images deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"An error occurred while deleting high-resolution images: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PDFPageViewSet(viewsets.ModelViewSet):
    queryset = PDFPage.objects.all()
    serializer_class = PDFPageSerializer
    pagination_class = CustomPagination

    @action(detail=False, methods=["post"])
    def process_pages(self, request, *args, **kwargs):
        """
        Processes a list of PDF pages, updates their status, and gathers GPT responses.
        """
        page_ids = request.data.get("page_ids", [])
        if not page_ids:
            return Response({"error": "No page IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        results = process_pages_util(page_ids)  # Assume this function processes the pages

        responses = []
        for page_id in page_ids:
            try:
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
            except PDFPage.DoesNotExist:
                logger.error(f"PDFPage with id {page_id} does not exist.")
                return Response({"error": f"PDFPage with id {page_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            except GPTResponse.DoesNotExist:
                logger.error(f"GPTResponse for PDFPage with id {page_id} does not exist.")
                return Response({"error": f"GPTResponse for PDFPage with id {page_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"An error occurred while processing page {page_id}: {str(e)}")
                return Response({"error": f"An error occurred while processing page {page_id}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(
            {"status": "Processing complete", "processed_pages": responses},
            status=status.HTTP_200_OK,
        )

