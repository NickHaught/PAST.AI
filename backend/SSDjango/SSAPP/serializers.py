# serializers.py

from rest_framework import serializers
from .models import PDFFile, PDFPage
from django.core.files import File
import os


class PDFPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFPage
        fields = ["id", "page_number", "file", "thumbnail", 'high_res_image', 'scanned', 'cost', 'processing_time']


class PDFFileSerializer(serializers.ModelSerializer):
    pages = PDFPageSerializer(many=True, read_only=True)
    file = serializers.FileField(write_only=True)

    class Meta:
        model = PDFFile
        fields = ["id", "name", "file", "pages"]

    def create(self, validated_data):
        file = validated_data.pop('file')
        validated_data['file'] = file
        return super().create(validated_data)
