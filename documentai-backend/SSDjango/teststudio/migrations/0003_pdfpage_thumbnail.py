# Generated by Django 3.2.4 on 2024-03-15 01:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teststudio', '0002_pdfpage'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfpage',
            name='thumbnail',
            field=models.ImageField(blank=True, null=True, upload_to='thumbnails/'),
        ),
    ]
