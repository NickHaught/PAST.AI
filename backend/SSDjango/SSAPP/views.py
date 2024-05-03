# views.py

from rest_framework import viewsets, status, serializers
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
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
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample, OpenApiTypes, inline_serializer


logger = logging.getLogger("django")

class AllowedMethodsMixin:
    """
    A mixin that provides a method to set allowed methods for a viewset.
    """
    allowed_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS', 'TRACE']

    def check_permissions(self, request):
        if request.method not in self.allowed_methods:
            self.permission_denied(
                request, message=f'Method "{request.method}" not allowed.'
            )
        super().check_permissions(request)

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
    allowed_methods = ['GET', 'POST','DELETE']

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

    # Exclude 'put' and 'patch' methods from the schema
    @extend_schema(
        methods=['PUT'],
        exclude=True
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PATCH'],
        exclude=True
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['DELETE'],
        summary="Delete a PDF file",
        description="Deletes a PDF file along with its associated pages and metadata.",
        responses={204: None},
        tags=['PDFFiles']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        methods=['GET'],
        summary="Retrieve all PDF files",
        description="Retrieves all PDF files along with their pages and metadata.",
        parameters=[
            OpenApiParameter(name='all_pages_scanned', type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, description='Filter files by scanned status of all pages'),
        ],
        responses={200: PDFFileSerializer(many=True)},
        tags=['PDFFiles']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        methods=['POST'],
        summary="Upload PDF file(s)",
        description="Uploads one or more PDF files and processes them to extract individual pages.",
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {
                        'type': 'array',
                        'items': {
                            'type': 'string',
                            'format': 'binary',
                            'description': 'PDF file(s) to upload',
                        },
                        'required': True,
                    }

                }
            }
        },
        responses={200: PDFFileSerializer},
        tags=['PDFFiles']
    )
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

    @extend_schema(
        methods=['GET'],
        summary="Retrieve PDF file",
        description="Retrieves a PDF file along with its pages and their respective metadata.",
        parameters=[
            OpenApiParameter(name='only_scanned', type=OpenApiTypes.BOOL, location=OpenApiParameter.QUERY, description='Only return scanned pages'),
        ],
        responses={200: PDFFileSerializer},
        tags=['PDFFiles']
    )
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

    @extend_schema(
        methods=['DELETE'],
        summary="Delete high-resolution images",
        description="Deletes all high-resolution images associated with the PDF file.",
        responses={204: None},
        tags=['PDFFiles']
    )
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
    allowed_methods = ['GET', 'POST', 'DELETE']

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
    
    # Exclude 'put' and 'patch' methods from the schema
    @extend_schema(
        methods=['PUT'],
        exclude=True
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PATCH'],
        exclude=True
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['GET'],
        summary="Retrieve PDF pages",
        description="Retrieves PDF pages based on scan status.",
        parameters=[
            OpenApiParameter(name='scanned', description='Filter pages by scanned status', required=False, type=OpenApiTypes.STR, enum=['true', '1', 'false', '0'])
        ],
        responses={200: PDFPageSerializer(many=True)},  # Ensure 'many=True' is set for list responses
        tags=['PDFPages']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        methods=['GET'],
        summary="Retrieve PDF page",
        description="Retrieves a single PDF page by its ID.",
        responses={200: PDFPageSerializer},
        tags=['PDFPages']
    )
    def retrieve(self, request, *args, **pk):
        return super().retrieve(request, *args, **pk)
    
    @extend_schema(
        methods=['DELETE'],
        summary="Delete a PDF page",
        description="Deletes a PDF page along with its metadata.",
        responses={204: None},
        tags=['PDFPages']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        methods=['POST'],
        summary="Upload PDF page",
        description="Uploads a PDF page and processes it to extract text and metadata.",
        request={},
        responses={200: PDFPageSerializer},
        tags=['PDFPages']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        methods=['POST'],
        summary="Start automatic scanning",
        description="Initiates a process that automatically scans all unscanned PDF pages.",
        request={},
        responses={
            200: inline_serializer(
                name='AutoScanResponse',
                fields={
                    'status': serializers.CharField(),
                }
            )
        },
        tags=['PDFPages']
    )
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
    
    @extend_schema(
        methods=['POST'],
        summary="Stop scanning process",
        description="Stops the ongoing scanning process immediately.",
        request={},
        responses={
            200: inline_serializer(
                name='StopScanningResponse',
                fields={
                    'status': serializers.CharField(),
                }
            )
        },
        tags=['PDFPages']
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

    @extend_schema(
        methods=['POST'],
        summary="Process specified pages",
        description="Processes a list of PDF page IDs, updating their scanned status and other metadata.",
        request=inline_serializer(
            name='PageIDsRequest',
            fields={
                'page_ids': serializers.ListField(
                    child=serializers.IntegerField(),
                    help_text='List of page IDs to process'
                )
            }
        ),
        responses={
            200: inline_serializer(
                name='ProcessedPagesResponse',
                fields={
                    'status': serializers.CharField(),
                    'processed_pages': inline_serializer(
                        name='ProcessedPage',
                        fields={
                            'page_id': serializers.IntegerField(),
                            'json_output': serializers.JSONField(),
                            'gpt_cost': serializers.FloatField(),
                            'documentAI_cost': serializers.FloatField(),
                            'processing_time': serializers.FloatField(),
                            'scanned': serializers.BooleanField()
                        }
                    )
                },
                help_text='Detailed response for each processed page'
            ),
        },
        tags=['PDFPages']
    )
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
    
    @extend_schema(
        methods=['POST'],
        summary="Process specified pages (dummy)",
        description="Dummy endpoint for processing PDF pages. Returns static or randomly generated data.",
        request=inline_serializer(
            name='DummyPageIDsRequest',
            fields={
                'page_ids': serializers.ListField(
                    child=serializers.IntegerField(),
                    help_text='List of page IDs to process'
                )
            }
        ),
        responses={
            200: inline_serializer(
                name='DummyProcessedPagesResponse',
                fields={
                    'status': serializers.CharField(),
                    'processed_pages': inline_serializer(
                        name='DummyProcessedPage',
                        fields={
                            'page_id': serializers.IntegerField(),
                            'json_output': serializers.JSONField(),
                            'gpt_cost': serializers.FloatField(),
                            'documentAI_cost': serializers.FloatField(),
                            'processing_time': serializers.FloatField(),
                            'scanned': serializers.BooleanField()
                        }
                    )
                },
                help_text='Detailed response for each processed page'
            ),
        },
        tags=['PDFPages']
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


class AppKeysViewSet(AllowedMethodsMixin, viewsets.ModelViewSet):
    allowed_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    queryset = AppKeys.objects.all()
    serializer_class = AppKeysSerializer

    @extend_schema(
        methods=['GET'],
        responses={200: AppKeysSerializer},
        summary='Get all AppKey entries',
        description='Returns all existing AppKey entries.',
        tags=['AppKeys']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        methods=['GET'],
        responses={200: AppKeysSerializer},
        summary='Retrieve an AppKey entry',
        description='Returns a single AppKey entry by its ID.',
        tags=['AppKeys']
    )
    def retrieve(self, request, *args, **pk):
        """ Retrieve a specific AppKey by ID. """
        return super().retrieve(request, *args, **pk)

    @extend_schema(
        methods=['POST'],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'openai_api_key': {
                        'type': 'string',
                        'description': 'OpenAI API Key',
                        'required': True
                    },
                    'cred_file': {
                        'type': 'string',
                        'format': 'binary',  # Important for files
                        'description': 'Credential file',
                        'required': True
                    }
                }
            }
        },
        responses={201: AppKeysSerializer},
        summary='Create a new AppKey entry',
        description='Posts a new AppKey with an OpenAI API key and a credentials file.',
        tags=['AppKeys']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PUT'],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'openai_api_key': {
                        'type': 'string',
                        'description': 'OpenAI API Key',
                        'required': False
                    },
                    'cred_file': {
                        'type': 'string',
                        'format': 'binary',  # Important for files
                        'description': 'Credential file',
                        'required': False
                    }
                }
            }
        },
        responses={200: AppKeysSerializer},
        summary='Update an existing AppKey entry',
        description='Updates an existing AppKey with an OpenAI API key and/or a credentials file.',
        tags=['AppKeys']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PATCH'],
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'openai_api_key': {
                        'type': 'string',
                        'description': 'OpenAI API Key',
                        'required': False
                    },
                    'cred_file': {
                        'type': 'string',
                        'format': 'binary',  # Important for files
                        'description': 'Credential file',
                        'required': False
                    }
                }
            }
        },
        responses={200: AppKeysSerializer},
        summary='Partial update of an existing AppKey entry',
        description='Partially updates an existing AppKey with an OpenAI API key and/or a credentials file.',
        tags=['AppKeys']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['DELETE'],
        responses={204: None},
        summary='Delete all AppKey entries',
        description='Deletes all existing AppKey entries.',
        tags=['AppKeys']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    
class SettingsViewSet(AllowedMethodsMixin, viewsets.ModelViewSet):
    allowed_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer

    @extend_schema(
        methods=['GET'],
        responses={200: SettingsSerializer},
        summary='Get all Settings entries',
        description='Returns all existing Settings entries.',
        tags=['Settings']
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        methods=['GET'],
        responses={200: SettingsSerializer},
        summary='Retrieve a Settings entry',
        description='Returns a single Settings entry by its ID.',
        tags=['Settings']
    )
    def retrieve(self, request, *args, **pk):
        return super().retrieve(request, *args, **pk)
    
    @extend_schema(
        methods=['POST'],
        responses={201: SettingsSerializer},
        summary='Create a new Settings entry',
        description='Posts a new Settings entry with a key and a value.',
        tags=['Settings']
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PUT'],
        responses={200: SettingsSerializer},
        summary='Update an existing Settings entry',
        description='Updates an existing Settings entry with a key and/or a value.',
        tags=['Settings']
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['PATCH'],
        responses={200: SettingsSerializer},
        summary='Partial update of an existing Settings entry',
        description='Partially updates an existing Settings entry with a key and/or a value.',
        tags=['Settings']
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(
        methods=['DELETE'],
        responses={204: None},
        summary='Delete all Settings entries',
        description='Deletes all existing Settings entries.',
        tags=['Settings']
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(
        methods=['POST'],
        responses={200: SettingsSerializer(many=True)},
        summary='Reset Settings to Defaults',
        description='Resets all settings to their default values.',
        tags=['Settings']
    )
    @action(detail=False, methods=['post'], url_path='reset_to_defaults')
    @action(methods=['post'], detail=False)
    def reset_to_defaults(self, request):
        try:
            settings_instance = Settings.objects.first()  # Assuming there is only one settings object
            if not settings_instance:
                settings_instance = Settings.objects.create()  # Create if not exists

            # Set each field to its default value
            for field in settings_instance._meta.fields:
                default_value = field.get_default()
                if default_value is not None and hasattr(settings_instance, field.name):
                    setattr(settings_instance, field.name, default_value)
            
            settings_instance.save()
            serializer = self.get_serializer(settings_instance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
