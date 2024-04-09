# Generated by Django 3.2.4 on 2024-03-19 23:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('teststudio', '0003_pdfpage_thumbnail'),
    ]

    operations = [
        migrations.CreateModel(
            name='DocumentAIResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('result', models.TextField()),
                ('page', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='teststudio.pdfpage')),
            ],
        ),
    ]