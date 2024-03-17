from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import PDFSerializer

@api_view(['GET'])
def hello_world(request):
    return Response({'message': 'Hello, world!'})
# Create your views here.

@api_view(['POST'])
def upload_pdf(request):
    if request.method == 'POST':
        serializer = PDFSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        else:
            return Response(serializer.errors, status=400)
    
    return Response({"detail": "Invalid request"}, status=400)