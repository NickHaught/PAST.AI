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
    file = serializers.CharField(write_only=True)

    class Meta:
        model = PDFFile
        fields = ["id", "name", "file", "pages"]

    def validate_file(self, value):
        if not os.path.exists(value):
            raise serializers.ValidationError("File does not exist.")
        return value

    def create(self, validated_data):
        file_path = validated_data.pop('file')
        with open(file_path, 'rb') as f:
            validated_data['file'] = File(f, name=os.path.basename(file_path))
            return super().create(validated_data)
