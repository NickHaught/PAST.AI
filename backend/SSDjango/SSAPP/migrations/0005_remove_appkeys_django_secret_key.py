# Generated by Django 5.0.4 on 2024-04-15 20:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('SSAPP', '0004_appkeys'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='appkeys',
            name='django_secret_key',
        ),
    ]