from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import PDFSerializer

@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})
# Create your views here.

@api_view(['POST'])
def upload_pdfs(request):
    if request.method == 'POST':
        serializer = PDFSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
    
    return Response({"detail": "Invalid request"}, status=400)

@api_view(['POST'])
def test_upload(request):
    if request.method == 'POST':
        print(request.FILES)
        pdf_files = request.FILES.getlist('files')
        print(pdf_files)
        pdf_names = [pdf_file.name for pdf_file in pdf_files]
        print("PDF Names:", pdf_names)
        return Response({"pdfNames": pdf_names}, status=200)

    return Response({"detail": "Invalid request"}, status=400)

@api_view(['GET'])
def test_pdf(request):
    return Response({"detail": "Test PDF endpoint hit"}, status=200)
