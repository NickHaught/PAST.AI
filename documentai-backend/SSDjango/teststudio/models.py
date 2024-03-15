from django.db import models
import os

# To delete all objects in all models, run the following management command:
# python manage.py delete_all


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
    page_number = models.IntegerField()
    file = models.FileField(upload_to="pdf_pages/")

    def delete(self, *args, **kwargs):
        if os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Page {self.page_number} of {self.pdf_file.name}"
