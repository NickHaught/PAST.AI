# Generated by Django 3.2.4 on 2024-04-09 18:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teststudio', '0008_pdfpage_high_res_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfpage',
            name='scanned',
            field=models.BooleanField(default=False),
        ),
    ]
