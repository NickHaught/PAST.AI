from rest_framework import serializers
from .models import PDFFile, PDFPage, AppKeys, Settings, GPTResponse
from django.core.files import File
import os

class PDFPageSerializer(serializers.ModelSerializer):
    json_output = serializers.SerializerMethodField()
    gpt_cost = serializers.SerializerMethodField()
    documentAI_cost = serializers.SerializerMethodField()
    processing_time = serializers.SerializerMethodField()

    class Meta:
        model = PDFPage
        fields = ["id", "page_number", "file", "thumbnail", 'high_res_image', 'scanned', 'cost', 'processing_time', 'json_output', 'gpt_cost', 'documentAI_cost']

    def get_json_output(self, obj):
        gpt_response = GPTResponse.objects.filter(page_id=obj.id).first()
        if gpt_response:
            return gpt_response.json_response
        else:
            return None

    def get_gpt_cost(self, obj):
        gpt_response = GPTResponse.objects.filter(page_id=obj.id).first()
        return gpt_response.cost if obj.scanned else None

    def get_documentAI_cost(self, obj):
        return obj.cost if obj.scanned else None

    def get_processing_time(self, obj):
        return obj.processing_time if obj.scanned else None

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

class AppKeysSerializer(serializers.ModelSerializer):
    openai_api_key = serializers.CharField()
    cred_file = serializers.FileField()
    
    class Meta:
        model = AppKeys
        fields = ['openai_api_key', 'cred_file']

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'