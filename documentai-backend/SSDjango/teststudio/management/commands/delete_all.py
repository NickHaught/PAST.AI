from django.core.management.base import BaseCommand
from django.apps import apps


# To use the command, run the following management command:
# docker-compose exec web python /code/documentai-backend/SSDjango/manage.py delete_all


class Command(BaseCommand):
    help = "Delete all objects in all models"

    def handle(self, *args, **options):
        app_models = apps.get_app_config("teststudio").get_models()
        for model in app_models:
            for obj in model.objects.all():
                obj.delete()
        self.stdout.write(
            self.style.SUCCESS("Successfully deleted all objects in all models")
        )
