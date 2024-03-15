# views.py

from rest_framework import viewsets
from .models import PDFFile
from .serializers import PDFFileSerializer
from .utils import split_pdf


class PDFFileViewSet(viewsets.ModelViewSet):
    queryset = PDFFile.objects.all()
    serializer_class = PDFFileSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        pdf_file = PDFFile.objects.get(id=response.data["id"])
        split_pdf(pdf_file)

        return response
