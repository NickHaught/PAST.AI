
from django.urls import path
from . import views

urlpatterns = [
    path('hello-world/', views.hello_world, name='hello_world'),
    path('upload_pdfs/', views.upload_pdfs, name='upload_pdfs'),
    path('test_pdf/', views.test_pdf, name='test_pdf'),
    path('test_upload/', views.test_upload, name='test_upload'),
    path('pdf/', views.pdf, name='pdf'),
    path('pdf/<int:id>/', views.PDFdetails, name='PDFdetails'),
    path('processed_pages/<int:id>/', views.processed_pages, name='processed_pages')

]