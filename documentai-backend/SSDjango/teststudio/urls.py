# urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.views.static import serve
from rest_framework.routers import DefaultRouter
from .views import PDFFileViewSet, PDFPageViewSet

router = DefaultRouter()
router.register(r"pdfs", PDFFileViewSet)
router.register(r"pages", PDFPageViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
