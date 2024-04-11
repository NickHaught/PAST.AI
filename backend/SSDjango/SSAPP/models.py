from django.db import models
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
    
    if scanned == True:
        cost = models.FloatField(default=0.006)
    else:
        cost = models.FloatField(default=0.0)

    @property
    def processing_time(self):
        if self.scan_start_time and self.scan_end_time:
            return self.scan_end_time - self.scan_start_time
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
