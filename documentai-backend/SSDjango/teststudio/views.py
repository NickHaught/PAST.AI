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
        #print(request.FILES)
        pdf_files = request.FILES.getlist('files')
        pdf_files = pdf_files[:35]
        #print(pdf_files)
        pdf_names = [pdf_file.name for pdf_file in pdf_files]
        #print("PDF Names:", pdf_names)
        print("Number of uploaded PDF files:", len(pdf_files))
        return Response({"pdfNames": pdf_names}, status=200)

    return Response({"detail": "Invalid request"}, status=400)

@api_view(['GET'])
def test_pdf(request):
    return Response({"detail": "Test PDF endpoint hit"}, status=200)


@api_view(['POST'])
def pdf(request):
    if request.method == 'POST':
        # Directly access 'name' and 'filepaths' from request.data
        name = request.data.get('name', '')  # Default to empty string if 'name' is not provided
        filepaths = request.data.get('file', [])  # Default to empty list if 'filepaths' is not provided

        print(f"Name: {name}")
        print(f"Number of filepaths: {len(filepaths)}")

        data = [
        {
            "id": 100,
            "name": "Test",
            "file": "http://localhost:8000/api/media/pdfs/history1.pdf",
            "pages": [400, 401, 402],  # Example page numbers
            "thumbnails": [
                "http://localhost:8000/api/media/thumbnails/Test_page_1_thumbnail.png"
            ]
        },
        {
            "id": 101,
            "name": "Test",
            "file": "http://localhost:8000/api/media/pdfs/history2.pdf",
            "pages": [406, 407, 408],  # Example page numbers
            "thumbnails": [
                "http://localhost:8000/api/media/thumbnails/Test_page_1_thumbnail_DyVUYRQ.png"
            ]
        }
        ]
        print("Returned data")
        return Response(data)

    return Response({"detail": "Invalid request"}, status=400)

@api_view(['GET'])
def PDFdetails(request, id):
       
        print(f"File Request: {id}")
       

        data = {
            "id": 92,
            "name": "Test",
            "file": "http://localhost:8000/api/media/pdfs/test.pdf",
            "pages": [
        {
            "id": 350,
            "page_number": 1,
            "file": "http://localhost:8000/api/media/pdf_pages/Test_page_1.pdf",
            "thumbnail": "/Test_page_1_thumbnail.png"
        },
        {
            "id": 351,
            "page_number": 2,
            "file": "http://localhost:8000/api/media/pdf_pages/Test_page_2.pdf",
            "thumbnail": "/Test_page_2_thumbnail.png"
        },
        {
            "id": 352,
            "page_number": 1,
            "file": "http://localhost:8000/api/media/pdf_pages/Test_page_1.pdf",
            "thumbnail": "/Test_page_1_thumbnail.png"
        },
        {
            "id": 353,
            "page_number": 2,
            "file": "http://localhost:8000/api/media/pdf_pages/Test_page_2.pdf",
            "thumbnail": "/Test_page_2_thumbnail.png"
        },
        ]}

        return Response(data)

@api_view(['GET'])
def processed_pages(request, id):
    print(f"File Request to check scanned status: {id}")
    data = {
    "status": "scanned",
    "processed_pages": [
        {
            "page_id": 369,
            "json_output": {
                "title": "BENJAMIN RUSSELL HANBY 1833-1867",
                "content": "Song writer and minister of the United Brethren Church...",
                "source": "Westerville Historical Society and Ohio Historical Society"
            },
            "cost": 0.01134
        },{
            "page_id": 370,
            "json_output": {
                "title": "BENJAMIN RUSSELL HANBY 1833-1867",
                "content": "Song writer and minister of the United Brethren Church...",
                "source": "Westerville Historical Society and Ohio Historical Society"
            },
            "cost": 0.01134
        }]}
    
    return Response(data)

@api_view(['GET'])
def mock_pdf_data(request):
    # Hardcoded data to simulate the response
    data = [
        {
            "id": 100,
            "name": "Test",
            "file": "http://localhost:8000/api/media/pdfs/history1.pdf",
            "pages": [400, 401, 402],  # Example page numbers
            "thumbnails": [
                "http://localhost:8000/api/media/thumbnails/Test_page_1_thumbnail.png"
            ]
        },
        {
            "id": 101,
            "name": "Test",
            "file": "http://localhost:8000/api/media/pdfs/history2.pdf",
            "pages": [406, 407, 408],  # Example page numbers
            "thumbnails": [
                "http://localhost:8000/api/media/thumbnails/Test_page_1_thumbnail_DyVUYRQ.png"
            ]
        }
    ]

    return Response(data)
