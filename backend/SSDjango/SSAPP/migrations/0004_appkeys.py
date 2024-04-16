# Generated by Django 5.0.4 on 2024-04-15 20:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('SSAPP', '0003_pdfpage_scan_end_time_pdfpage_scan_start_time'),
    ]

    operations = [
        migrations.CreateModel(
            name='AppKeys',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('django_secret_key', models.CharField(max_length=128)),
                ('openai_api_key', models.CharField(max_length=128)),
                ('cred_file', models.FileField(upload_to='creds/')),
            ],
        ),
    ]