# serializers.py

from rest_framework import serializers
from .models import PDFFile


class PDFFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDFFile
        fields = ["id", "name", "file"]
