import os
import shutil
from django.core.files.storage import default_storage
from django.conf import settings
from django.core.management.base import BaseCommand
from django.apps import apps


# To use the command, run the following management command:
# docker-compose exec web python /code/documentai-backend/SSDjango/manage.py delete_all


class Command(BaseCommand):
    help = "Delete all objects in all models"

    def handle(self, *args, **options):
        app_models = apps.get_app_config("SSAPP").get_models()
        for model in app_models:
            for obj in model.objects.all():
                obj.delete()

        # Delete the contents of the high_res_images directory
        high_res_dir = os.path.join(settings.MEDIA_ROOT, 'high_res_images')
        if os.path.exists(high_res_dir):
            shutil.rmtree(high_res_dir)
            os.makedirs(high_res_dir)

        creds = os.path.join(settings.MEDIA_ROOT, 'creds')
        if os.path.exists(creds):
            shutil.rmtree(creds)
            os.makedirs(creds)
        
        self.stdout.write(
            self.style.SUCCESS("Successfully deleted all objects in all models")
        )
