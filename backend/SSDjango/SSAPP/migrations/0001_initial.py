# Generated by Django 5.0.4 on 2024-04-10 02:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='PDFFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('file', models.FileField(upload_to='pdfs/')),
            ],
        ),
        migrations.CreateModel(
            name='PDFPage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scanned', models.BooleanField(default=False)),
                ('page_number', models.IntegerField()),
                ('file', models.FileField(upload_to='pdf_pages/')),
                ('thumbnail', models.ImageField(blank=True, null=True, upload_to='thumbnails/')),
                ('high_res_image', models.ImageField(blank=True, null=True, upload_to='high_res_images/')),
                ('pdf_file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pages', to='SSAPP.pdffile')),
            ],
        ),
        migrations.CreateModel(
            name='GPTResponse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('_json_response', models.TextField(db_column='json_response')),
                ('cost', models.FloatField()),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='gpt_responses', to='SSAPP.pdfpage')),
            ],
        ),
        migrations.CreateModel(
            name='Token',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token_id', models.CharField(max_length=255)),
                ('x1', models.FloatField()),
                ('y1', models.FloatField()),
                ('x2', models.FloatField()),
                ('y2', models.FloatField()),
                ('token_info', models.TextField()),
                ('filtered', models.BooleanField(default=False)),
                ('page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tokens', to='SSAPP.pdfpage')),
            ],
        ),
    ]
