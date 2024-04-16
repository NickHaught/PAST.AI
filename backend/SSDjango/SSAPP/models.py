from django.db import models
from django.contrib.auth.hashers import make_password, check_password
import os
import json

# To delete all objects in all models, run the following management command:
# docker-compose exec web python /code/documentai-backend/SSDjango/manage.py delete_all

# To create the database schema, run the following management command:
# docker-compose exec web python /code/documentai-backend/SSDjango/manage.py makemigrations
# docker-compose exec web python /code/documentai-backend/SSDjango/manage.py migrate


class PDFFile(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="pdfs/")

    def delete(self, *args, **kwargs):
        for page in self.pages.all():
            page.delete()
        if os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.name


class PDFPage(models.Model):
    pdf_file = models.ForeignKey(
        PDFFile, on_delete=models.CASCADE, related_name="pages"
    )
    scanned = models.BooleanField(default=False)
    scan_start_time = models.DateTimeField(null=True, blank=True)
    scan_end_time = models.DateTimeField(null=True, blank=True)
    page_number = models.IntegerField()
    file = models.FileField(upload_to="pdf_pages/")
    thumbnail = models.ImageField(upload_to="thumbnails/", null=True, blank=True)
    high_res_image = models.ImageField(upload_to='high_res_images/', null=True, blank=True)
    
    cost = models.FloatField(default=0.0)

    @property
    def processing_time(self):
        if self.scan_start_time and self.scan_end_time:
            return round((self.scan_end_time - self.scan_start_time).total_seconds())
        return None
        
    def delete(self, *args, **kwargs):
        if os.path.isfile(self.file.path):
            os.remove(self.file.path)
        if self.thumbnail and os.path.isfile(self.thumbnail.path):
            os.remove(self.thumbnail.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Page {self.page_number} of {self.pdf_file.name}"


class Token(models.Model):
    page = models.ForeignKey(PDFPage, on_delete=models.CASCADE, related_name="tokens")
    token_id = models.CharField(max_length=255)
    x1 = models.FloatField()
    y1 = models.FloatField()
    x2 = models.FloatField()
    y2 = models.FloatField()
    token_info = models.TextField()
    filtered = models.BooleanField(default=False)
    token_confidence = models.FloatField(default=0.0)

    def set_token_info(self, data):
        self.token_info = json.dumps(data)

    def get_token_info(self):
        return json.loads(self.token_info)
    

class GPTResponse(models.Model):
    page = models.ForeignKey(PDFPage, on_delete=models.CASCADE, related_name="gpt_responses")
    _json_response = models.TextField(db_column='json_response')
    cost = models.FloatField()

    @property
    def json_response(self):
        return json.loads(self._json_response)

    @json_response.setter
    def json_response(self, value):
        self._json_response = json.dumps(value)


class AppKeys(models.Model):
    openai_api_key = models.CharField(max_length=128)
    cred_file = models.FileField(upload_to='creds/')  # JSON credential file


class Settings(models.Model):

    # Document AI processing settings
    compute_style_info = models.BooleanField(default=True)
    enable_native_pdf_parsing = models.BooleanField(default=True)
    enable_image_quality_scores = models.BooleanField(default=True)
    enable_symbol = models.BooleanField(default=True)

    # Document AI import settings
    location = models.CharField(max_length=32, default='us')
    project_id = models.CharField(max_length=64)
    processor_id = models.CharField(max_length=64)
    processor_version = models.CharField(max_length=64)
    mime_type = models.CharField(max_length=64)

    # Token filtering settings
    color_filter = models.BooleanField(default=True)
    color_similarity_threshold = models.FloatField(default=0.6)
    handwritten_filter = models.BooleanField(default=True)
    unicode_filter = models.BooleanField(default=True)
    confidence_filter = models.FloatField(default=0.7)
    font_size_filter = models.IntegerField(default=3)

    # GPT settings
    gpt_max_tokens = models.IntegerField(default=2048)
    gpt_model = models.CharField(max_length=64, default='gpt-3.5-turbo')
    gpt_messages = models.JSONField(default=list)
