# views.py

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import PDFFile, PDFPage
from .serializers import PDFFileSerializer, PDFPageSerializer
from .utils.utils import split_pdf, process_pages


class PDFFileViewSet(viewsets.ModelViewSet):
    queryset = PDFFile.objects.all()
    serializer_class = PDFFileSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        pdf_file = PDFFile.objects.get(id=response.data["id"])
        page_ids = split_pdf(pdf_file)

        response.data["pages"] = page_ids

        return response


class PDFPageViewSet(viewsets.ModelViewSet):
    queryset = PDFPage.objects.all()
    serializer_class = PDFPageSerializer

    @action(detail=False, methods=["post"])
    def process_pages(self, request):
        page_ids = request.data.get("page_ids", [])
        process_pages(page_ids)

        return Response(
            {"status": "Processing complete", "processed_pages": page_ids},
            status=status.HTTP_200_OK,
        )
