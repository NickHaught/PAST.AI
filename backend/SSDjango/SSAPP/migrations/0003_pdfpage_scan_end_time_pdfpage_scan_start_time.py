# Generated by Django 5.0.4 on 2024-04-11 18:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SSAPP', '0002_pdfpage_cost_token_token_confidence'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfpage',
            name='scan_end_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='pdfpage',
            name='scan_start_time',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
