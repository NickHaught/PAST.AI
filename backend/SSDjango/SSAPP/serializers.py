# serializers.py

from rest_framework import serializers
from .models import PDFFile, PDFPage


class PDFPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFPage
        fields = ["id", "page_number", "file", "thumbnail", 'high_res_image', 'scanned']


class PDFFileSerializer(serializers.ModelSerializer):
    pages = PDFPageSerializer(many=True, read_only=True)

    class Meta:
        model = PDFFile
        fields = ["id", "name", "file", "pages"]
