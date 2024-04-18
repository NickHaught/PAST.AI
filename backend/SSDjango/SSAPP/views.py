# views.py

from rest_framework import viewsets, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.files.storage import default_storage
from .models import PDFFile, PDFPage, GPTResponse, AppKeys, Settings
from .serializers import PDFFileSerializer, PDFPageSerializer, AppKeysSerializer, SettingsSerializer
from .utils.utils import split_pdf, process_pages_util, render_pdf_to_images
import os
import logging
from django.db.models import Count, F
from django.db.models import Q
import random
from django.conf import settings
from functools import wraps
from django.utils import timezone


logger = logging.getLogger("django")

def assign_method_with_name(original_method, new_method):
    @wraps(original_method)
    def wrapped(*args, **kwargs):
        return new_method(*args, **kwargs)
    return wrapped


class CustomPagination(PageNumberPagination):
    page_size = 1
    page_size_query_param = 'page_size'  # Allow client to specify page size
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'links': {
                'next': self.get_next_link(),
                'previous': self.get_previous_link()
            },
            'count': self.page.paginator.count,
            'results': data
        })
    

class PDFFileViewSet(viewsets.ModelViewSet):
    queryset = PDFFile.objects.all()
    serializer_class = PDFFileSerializer
    pagination_class = CustomPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        all_pages_scanned = self.request.query_params.get('all_pages_scanned', None)
        if all_pages_scanned is not None:
            all_pages_scanned = all_pages_scanned.lower() in ['true', '1']  # Convert to boolean

            # Get PDF files where all pages are scanned
            queryset = queryset.annotate(num_pages=Count('pages'), num_scanned_pages=Count('pages', filter=Q(pages__scanned=True)))
            if all_pages_scanned:
                queryset = queryset.filter(num_pages=F('num_scanned_pages'))
            else:
                queryset = queryset.exclude(num_pages=F('num_scanned_pages'))

        return queryset

    def create(self, request, *args, **kwargs):
        files = request.FILES.getlist('file')
        if not files:
            logger.error("No files provided.")
            return Response({"error": "No files provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        responses = []
        for file in files:
            name = file.name
            if PDFFile.objects.filter(name=name).exists():
                responses.append({"error": f"PDF file {name} already exists."})
                continue

            data = {
                'name': name,
                'file': file,
            }
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            try:
                pdf_file = PDFFile.objects.get(id=serializer.data["id"])
                split_pdf(pdf_file)  # Assuming this can raise exceptions
                
                pages = PDFPage.objects.filter(pdf_file=pdf_file)
                page_ids = [page.id for page in pages]
                thumbnail_paths = [
                    request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None 
                    for page in pages
                ]

                response_data = serializer.data
                response_data["pages"] = page_ids
                response_data["thumbnails"] = thumbnail_paths
                responses.append(response_data)
            except Exception as e:
                logger.error(f"Failed processing PDF file {pdf_file.name}: {str(e)}")
                responses.append({"error": f"Failed processing PDF file {pdf_file.name}: {str(e)}"})

        return Response(responses, status=status.HTTP_201_CREATED)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)

            # Delete high-resolution images before creating new ones
            self.delete_high_res_images(request)

            try:
                pages = PDFPage.objects.filter(pdf_file=instance)
                only_scanned = self.request.query_params.get('only_scanned', 'false').lower() in ['true', '1']
                if only_scanned:
                    pages = pages.filter(scanned=True)

                page_ids = [page.id for page in pages]
                image_urls = render_pdf_to_images(page_ids)  # This might raise exceptions

                response_data = serializer.data
                response_data["pages"] = []
                for page, image_url in zip(pages, image_urls):
                    page_data = {
                        "id": page.id,
                        "page_number": page.page_number,
                        "file": request.build_absolute_uri(page.file.url),
                        "thumbnail": request.build_absolute_uri(page.thumbnail.url) if page.thumbnail else None,
                        "high_res_image": image_url,
                        "scanned": page.scanned,
                    }
                    if page.scanned:
                        gpt_response = GPTResponse.objects.filter(page_id=page.id).first()
                        page_data["json_output"] = gpt_response.json_response if gpt_response else None
                        page_data["gpt_cost"] = gpt_response.cost if gpt_response else None
                        page_data["documentAI_cost"] = page.cost
                        page_data["processing_time"] = page.processing_time
                    response_data["pages"].append(page_data)
                return Response(response_data, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Failed to render pages for PDF {instance.name}: {str(e)}")
                return Response({"error": f"Failed to render pages for PDF {instance.name}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"An error occurred while retrieving PDF file: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['delete'])
    def delete_high_res_images(self, request):
        try:
            # Get all PDFPage objects
            pages = PDFPage.objects.all()

            for page in pages:
                image_path = os.path.join('high_res_images', f'{page.pdf_file.name}_page_{page.page_number}.jpg')
                if default_storage.exists(image_path):
                    default_storage.delete(image_path)

            return Response({"message": "High-resolution images deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"An error occurred while deleting high-resolution images: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PDFPageViewSet(viewsets.ModelViewSet):
    queryset = PDFPage.objects.all()
    serializer_class = PDFPageSerializer
    pagination_class = CustomPagination

    # Global flag to control the scanning process
    should_continue_scanning = True

    def get_queryset(self):
        queryset = super().get_queryset()
        scanned = self.request.query_params.get('scanned', None)
        if scanned is not None:
            scanned = scanned.lower() in ['true', '1']  # Convert to boolean
            queryset = queryset.filter(scanned=scanned)
        return queryset
    
    @action(detail=False, methods=["post"])
    def auto_scan(self, request, *args, **kwargs):
        """
        Automatically scans all unscanned pages.
        """
        global should_continue_scanning
        should_continue_scanning = True

        unscanned_pages = PDFPage.objects.filter(scanned=False)

        for page in unscanned_pages:
            if not should_continue_scanning:
                break

            # Process the page
            self.process_page(page)

        return Response(
            {"status": "Scanning complete"},
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=["post"])
    def stop_scanning(self, request, *args, **kwargs):
        """
        Stops the scanning process.
        """
        global should_continue_scanning
        should_continue_scanning = False

        return Response(
            {"status": "Scanning stopped"},
            status=status.HTTP_200_OK,
        )
    
    def process_page(self, page):
        """
        Processes a single PDF page, updates its status, and gathers GPT responses.
        """
        try:

            # Process the page
            result = process_pages_util([page.id])

            # Update the page status
            page.scanned = True
            page.cost = 0.006
            page.save()

            # Get the GPT response
            gpt_response = GPTResponse.objects.get(page_id=page.id)

            response = {
                'page_id': page.id,
                'json_output': gpt_response.json_response,
                'gpt_cost': gpt_response.cost,
                'documentAI_cost': page.cost,
                'processing_time': page.processing_time,
                'scanned': page.scanned
            }
        except PDFPage.DoesNotExist:
            logger.error(f"PDFPage with id {page.id} does not exist.")
            return {"error": f"PDFPage with id {page.id} does not exist."}
        except GPTResponse.DoesNotExist:
            logger.error(f"GPTResponse for PDFPage with id {page.id} does not exist.")
            return {"error": f"GPTResponse for PDFPage with id {page.id} does not exist."}
        except Exception as e:
            logger.error(f"An error occurred while processing page {page.id}: {str(e)}")
            return {"error": f"An error occurred while processing page {page.id}: {str(e)}"}

        return response

    @action(detail=False, methods=["post"])
    def process_pages(self, request, *args, **kwargs):
        """
        Processes a list of PDF pages, updates their status, and gathers GPT responses.
        """
        page_ids = request.data.get("page_ids", [])
        if not page_ids:
            return Response({"error": "No page IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Separate scanned and unscanned pages
        scanned_page_ids = [page_id for page_id in page_ids if PDFPage.objects.get(id=page_id).scanned]
        unscanned_page_ids = [page_id for page_id in page_ids if not PDFPage.objects.get(id=page_id).scanned]

        # Process only unscanned pages
        results = process_pages_util(unscanned_page_ids)

        responses = []
        for page_id in unscanned_page_ids + scanned_page_ids:
            try:
                pdf_page = PDFPage.objects.get(id=page_id)

                if page_id in unscanned_page_ids:
                    pdf_page.scanned = True
                    pdf_page.cost = 0.006
                    pdf_page.save()

                gpt_response = GPTResponse.objects.get(page_id=page_id)

                responses.append({
                    'page_id': page_id,
                    'json_output': gpt_response.json_response,
                    'gpt_cost': gpt_response.cost,
                    'documentAI_cost': pdf_page.cost,
                    'processing_time': pdf_page.processing_time,
                    'scanned': pdf_page.scanned
                })
            except PDFPage.DoesNotExist:
                logger.error(f"PDFPage with id {page_id} does not exist.")
                return Response({"error": f"PDFPage with id {page_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            except GPTResponse.DoesNotExist:
                logger.error(f"GPTResponse for PDFPage with id {page_id} does not exist.")
                return Response({"error": f"GPTResponse for PDFPage with id {page_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"An error occurred while processing page {page_id}: {str(e)}")
                return Response({"error": f"An error occurred while processing page {page_id}: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(
            {"status": "Processing complete", "processed_pages": responses},
            status=status.HTTP_200_OK,
        )
    
    @action(detail=False, methods=["post"])
    def process_pages_dummy(self, request, *args, **kwargs):
        """
        Dummy endpoint for processing PDF pages. Returns static or randomly generated data.
        """
        page_ids = request.data.get("page_ids", [])
        if not page_ids:
            return Response({"error": "No page IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Predefined titles and contents to simulate realistic data
        dummy_data = [
            {
                "title": "Benjamin Russell Hanby",
                "content": "Song writer and minister of the United Brethren Church, Hanby was an Otterbein College graduate, class of 1858, known throughout the world for the inspiring songs, 'Darling Nellie Gray', 'Who is He in Yonder Stall', and 'Up on the Housetop'. Hanby House in Westerville is maintained as a memorial honoring Benjamin and his father, Bishop William Hanby.",
                "source": "Westerville Historical Society and Ohio Historical Society"
            },
            {
                "title": "Historic Landmark",
                "content": "This site has been recognized as a historic landmark due to its architectural uniqueness and its significance in the local history of the area.",
                "source": "Local Heritage Committee"
            },
            {
                "title": "Innovation in Agriculture",
                "content": "Exploring the advances in sustainable agriculture practices that have revolutionized farming in the region. These innovations include water-saving techniques and genetically modified crops that resist pests and diseases.",
                "source": "Agricultural Innovations Magazine"
            }
        ]

        responses = []
        for page_id in page_ids:
            try:
                pdf_page = PDFPage.objects.get(id=page_id)
                if not pdf_page.scanned:  # Only update if not already scanned
                    pdf_page.scan_start_time = timezone.now()
                    # Simulate scan duration
                    pdf_page.scan_end_time = pdf_page.scan_start_time + timezone.timedelta(seconds=random.randint(100, 200) / 1000)
                    pdf_page.scanned = True
                    pdf_page.save()

                    # Create or update the GPTResponse
                    gpt_response, created = GPTResponse.objects.update_or_create(
                        page=pdf_page,
                        defaults={
                            "json_response": random.choice(dummy_data),
                            "cost": random.choice([0.005, 0.006, 0.007])
                        }
                    )

                    response_data = {
                        'page_id': page_id,
                        'json_output': gpt_response.json_response,
                        'gpt_cost': gpt_response.cost,
                        'documentAI_cost': pdf_page.cost,
                        'processing_time': pdf_page.processing_time,
                        'scanned': pdf_page.scanned
                    }
                    responses.append(response_data)
                else:
                    responses.append({
                        'page_id': page_id,
                        'error': "Page already scanned."
                    })
            except PDFPage.DoesNotExist:
                return Response({"error": f"PDFPage with id {page_id} does not exist."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {"status": "Dummy processing complete", "processed_pages": responses},
            status=status.HTTP_200_OK,
        )
    
if settings.DUMMY_MODE:
    PDFPageViewSet.process_pages = assign_method_with_name(PDFPageViewSet.process_pages, PDFPageViewSet.process_pages_dummy)


class AppKeysViewSet(viewsets.ModelViewSet):
    queryset = AppKeys.objects.all()
    serializer_class = AppKeysSerializer


class SettingsViewSet(viewsets.ModelViewSet):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
