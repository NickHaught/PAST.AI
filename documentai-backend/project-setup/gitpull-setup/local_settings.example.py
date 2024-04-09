# local_settings.py

# Python Default Libraries
import os
from pathlib import Path

# Third-Party Libraries
from dotenv import load_dotenv

# Local Imports
from .settings import INSTALLED_APPS, MIDDLEWARE

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from the .env file
dotenv_path = os.path.join(BASE_DIR.parent, "project-setup", ".env")
load_dotenv(dotenv_path)

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# Add an app to INSTALLED_APPS
INSTALLED_APPS += []

# Add middleware to MIDDLEWARE
MIDDLEWARE += []

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Database
DATABASES = {}
