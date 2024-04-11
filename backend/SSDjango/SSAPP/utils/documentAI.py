import os
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from ..models import PDFPage, Token
from pathlib import Path
from PyPDF2 import (
    PdfReader as PyPDF2Reader,
    PdfWriter as PyPDF2Writer,
)
import logging

logger = logging.getLogger("django")


def initialize_configuration(cred_file_name):
    """
    Initializes the application's configuration by setting up Google Application Credentials,
    fetching application settings, and preparing Document AI client and options.

    Args:
        cred_file_name (str): The name of the Google Application credentials file.

    Returns:
        tuple: Returns a tuple containing the configured process options, Document AI client,
               and the full resource path for the client version.

    Raises:
        FileNotFoundError: If the credentials file does not exist.
        ImportError: If the required modules are not found.
        Exception: General exceptions that could occur when setting up the client.
    """
    logger.info("Initializing configuration...")
    try:
        # Set up Google Application Credentials
        google_app_creds_path = Path(__file__).parent / cred_file_name
        if not google_app_creds_path.is_file():
            logger.error(f"Credentials file does not exist: {google_app_creds_path}")
            raise FileNotFoundError(f"Credentials file does not exist: {google_app_creds_path}")
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(google_app_creds_path)
        
        # Define hardcoded settings
        settings = {
            "compute_style_info": True,
            "enable_native_pdf_parsing": True,
            "enable_image_quality_scores": True,
            "enable_symbol": True,
            "location": "us",
            "project_id": "ssdocumentai",
            "processor_id": "327a00af9402484d",
            "processor_version": "pretrained-ocr-v2.0-2023-06-02",
            "mime_type": "application/pdf",
        }
        
        # Configure the Document AI client and process options
        process_options = documentai.ProcessOptions(
            ocr_config=documentai.OcrConfig(
                compute_style_info=settings["compute_style_info"],
                enable_native_pdf_parsing=settings["enable_native_pdf_parsing"],
                enable_image_quality_scores=settings["enable_image_quality_scores"],
                enable_symbol=settings["enable_symbol"],
            )
        )
        
        client = documentai.DocumentProcessorServiceClient(
            client_options=ClientOptions(
                api_endpoint=f"{settings['location']}-documentai.googleapis.com"
            )
        )
        
        client_version = client.processor_version_path(
            settings["project_id"],
            settings["location"],
            settings["processor_id"],
            settings["processor_version"],
        )

        return process_options, client, client_version

    except ImportError as e:
        logger.error(f"Failed to import required modules: {e}")
        raise ImportError(f"Failed to import required modules: {e}")
    except Exception as e:
        logger.error(f"An error occurred while initializing configuration: {e}")
        raise Exception(f"An error occurred while initializing configuration: {e}")


def process_page(page_id: int):
    """
    Process a page using Document AI.

    Args:
        page_id (int): The ID of the page.

    Raises:
        PDFPage.DoesNotExist: If the page with the specified ID does not exist.
        IOError: If there are issues reading the file.
        ValueError: If there are issues with processing the document.
        Exception: For any other unexpected issues.
    """
    logger.info(f"Processing page {page_id}...")
    try:
        # Initialize configuration
        process_options, client, client_version = initialize_configuration("cred.json")

        # Get the page from the database
        try:
            pdf_page = PDFPage.objects.get(id=page_id)
        except PDFPage.DoesNotExist:
            logger.error(f"Page with ID {page_id} does not exist")
            raise PDFPage.DoesNotExist(f"Page with ID {page_id} does not exist")

        # Read the file content
        try:
            with open(pdf_page.file.path, "rb") as file:
                content = file.read()
        except IOError as e:
            logger.error(f"Failed to read the file: {e}")
            raise IOError(f"Failed to read the file: {e}")

        # Prepare the request
        try:
            request = documentai.ProcessRequest(
                name=client_version,
                raw_document=documentai.RawDocument(
                    content=content, mime_type="application/pdf"
                ),
                process_options=process_options,
            )

            # Process the document
            response = client.process_document(request=request)
            document = response.document

            # Extract page dimensions
            page_width, page_height = get_page_dimensions(pdf_page.file.path)

            # Process the tokens extracted from the document
            process_tokens(pdf_page, document, page_width, page_height)
        except ValueError as e:
            logger.error(f"Document processing failed: {e}")
            raise ValueError(f"Document processing failed: {e}")
        except Exception as e:
            logger.error(f"An unexpected error occurred during document processing: {e}")
            raise Exception(f"An unexpected error occurred during document processing: {e}")

    except Exception as e:
        # Catch-all for any other exceptions not explicitly handled above
        raise Exception(f"Failed to process page {page_id}: {e}")


def process_tokens(pdf_page, document, page_width, page_height):
    """
    Process the tokens in a Document AI document and save them as Token instances.

    Args:
        pdf_page (PDFPage): The PDFPage object.
        document (documentai.Document): The Document AI document.
        page_width (float): The width of the PDF page.
        page_height (float): The height of the PDF page.

    Raises:
        ValueError: If any parameters are missing or incorrect.
        Exception: For handling unexpected errors during the token processing.
    """
    logger.info("Processing tokens...")
    try:
        if not document or not document.pages:
            logger.error("Invalid document format or empty pages.")
            raise ValueError("Invalid document format or empty pages.")

        document_text = document.text
        if not document_text:
            logger.error("Document contains no text.")
            raise ValueError("Document contains no text.")

        # Iterate over each page in the document
        for page_number, page in enumerate(document.pages, start=1):
            # Iterate over each token in the page
            for token_number, token in enumerate(page.tokens, start=1):

                # Get the bounding box of the token
                bounding_box = token.layout.bounding_poly
                if not bounding_box.normalized_vertices:
                    logger.error("Bounding box coordinates are missing for a token.")
                    raise ValueError("Bounding box coordinates are missing for a token.")

                # Convert the normalized coordinates to the PDF's coordinate system
                try:
                    x1, y1, x2, y2 = convert_coordinates(
                        bounding_box.normalized_vertices, page_width, page_height
                    )
                except Exception as e:
                    logger.error(f"Error converting coordinates: {e}")
                    raise Exception(f"Error converting coordinates: {e}")

                token_id = f"page{page_number}_token{token_number}"
                token_info = token_info_to_dict(token, document_text)

                # Create and save a Token instance
                try:
                    token_instance = Token.objects.create(
                        page=pdf_page,
                        token_id=token_id,
                        x1=x1,
                        y1=y1,
                        x2=x2,
                        y2=y2,
                    )
                    token_instance.set_token_info(token_info)
                    token_instance.save()
                except Exception as e:
                    logger.error(f"Failed to create or save token {token_id}: {e}")
                    raise Exception(f"Failed to create or save token {token_id}: {e}")

    except ValueError as ve:
        logger.error(f"Token processing error: {ve}")
        raise ValueError(f"Token processing error: {ve}")
    except Exception as e:
        logger.error(f"An unexpected error occurred during token processing: {e}")
        raise Exception(f"An unexpected error occurred during token processing: {e}")


def get_page_dimensions(input_pdf_path):
    """
    Gets the dimensions of the first page of a PDF.

    Args:
        input_pdf_path (str): The path to the input PDF.

    Returns:
        tuple: The width and height of the page.

    Raises:
        FileNotFoundError: If the PDF file does not exist.
        ValueError: If the PDF page doesn't have any box defined or the PDF is empty.
        IOError: If there are issues reading the PDF.
        Exception: For any other unexpected issues.
    """
    logger.info("Getting page dimensions...")
    try:
        # Attempt to open and read the PDF file
        try:
            pdf = PyPDF2Reader(input_pdf_path)
        except FileNotFoundError:
            logger.error(f"The file {input_pdf_path} does not exist.")
            raise FileNotFoundError(f"The file {input_pdf_path} does not exist.")
        except IOError as e:
            logger.error(f"Unable to read the PDF file: {e}")
            raise IOError(f"Unable to read the PDF file: {e}")

        # Check if there are pages in the PDF
        if not pdf.pages:
            logger.error("The PDF file is empty or does not contain any readable pages.")
            raise ValueError("The PDF file is empty or does not contain any readable pages.")

        # Access the first page
        page = pdf.pages[0]

        # Try to get one of the defined boxes for dimensions
        box = page.mediabox or page.artbox or page.bleedbox or page.cropbox or page.trimbox
        if box is None:
            logger.error("The PDF page doesn't have any box defined.")
            raise ValueError("The PDF page doesn't have any box defined.")

        # Extract dimensions
        page_width = box[2]
        page_height = box[3]

        return page_width, page_height

    except Exception as e:
        logger.error(f"An unexpected error occurred while obtaining page dimensions: {e}")
        raise Exception(f"An unexpected error occurred while obtaining page dimensions: {e}")


def convert_coordinates(normalized_vertices, page_width, page_height):
    
    """
    Converts normalized coordinates to the PDF's coordinate system.

    Args:
        normalized_vertices (list): The normalized vertices, expecting at least two points for a rectangle.
        page_width (float): The width of the PDF page.
        page_height (float): The height of the PDF page.

    Returns:
        tuple: The converted coordinates (x1, y1, x2, y2).

    Raises:
        ValueError: If the input vertices are not valid or insufficient.
        TypeError: If the input types are incorrect.
    """
    # logger.info("Converting coordinates...")

    try:
        # Ensure the page dimensions are of float type and properly converted
        page_width = float(page_width)
        page_height = float(page_height)
    except ValueError:
        logger.error("Page width and height must be numbers that can be converted to float.")
        raise TypeError("Page width and height must be numbers that can be converted to float.")

    # Attempt to calculate the coordinates, ensuring each vertex has an x and y attribute
    try:
        x1 = normalized_vertices[0].x * page_width
        y1 = page_height - normalized_vertices[0].y * page_height
        x2 = normalized_vertices[2].x * page_width
        y2 = page_height - normalized_vertices[2].y * page_height
    except AttributeError:
        logger.error("Each vertex must have 'x' and 'y' attributes.")
        raise ValueError("Each vertex must have 'x' and 'y' attributes as float types.")

    return x1, y1, x2, y2


def token_info_to_dict(token, document_text):
    """
    Converts a `Token` object to a dictionary.

    Args:
        token (documentai.Token): The token object.
        document_text (str): The text of the document.

    Returns:
        dict: A dictionary with the token info.

    Raises:
        ValueError: If the token object is incomplete or document text is missing.
        IndexError: If the text segments are improperly defined.
    """
    # logger.info("Converting token to dictionary...")
    try:
        # Ensure token and document_text are not None
        if not token or not document_text:
            logger.error("Token object or document text cannot be None.")
            raise ValueError("Token object or document text cannot be None.")

        # Extract text segment indices safely
        try:
            start_index = token.layout.text_anchor.text_segments[0].start_index
            end_index = token.layout.text_anchor.text_segments[0].end_index
            text_segment = document_text[start_index:end_index]
        except IndexError as e:
            logger.error(f"Text segment indices are out of range: {e}")
            raise IndexError(f"Text segment indices are out of range: {e}")
        except AttributeError as e:
            logger.error(f"Token layout properties are missing: {e}")
            raise ValueError(f"Token layout properties are missing: {e}")

        # Construct dictionary
        token_dict = {
            "text": text_segment,
            "layout": {
                "text_anchor": {
                    "text_segments": [
                        {"start_index": start_index, "end_index": end_index}
                    ]
                },
                "confidence": token.layout.confidence,
                "bounding_poly": {
                    "vertices": [[vertex.x, vertex.y] for vertex in token.layout.bounding_poly.vertices],
                    "normalized_vertices": [[vertex.x, vertex.y] for vertex in token.layout.bounding_poly.normalized_vertices],
                },
                "orientation": token.layout.orientation,
            },
            "detected_break": {"type_": token.detected_break.type_},
            "detected_languages": [
                {"language_code": lang.language_code, "confidence": lang.confidence}
                for lang in token.detected_languages
            ],
            "style_info": {
                "font_size": token.style_info.font_size,
                "pixel_font_size": token.style_info.pixel_font_size,
                "font_type": token.style_info.font_type,
                "font_weight": token.style_info.font_weight,
                "bold": token.style_info.bold,
                "italic": token.style_info.italic,
                "underlined": token.style_info.underlined,
                "handwritten": token.style_info.handwritten,
                "letter_spacing": token.style_info.letter_spacing,
                "text_color": {
                    "red": token.style_info.text_color.red,
                    "green": token.style_info.text_color.green,
                    "blue": token.style_info.text_color.blue,
                },
                "background_color": {
                    "red": token.style_info.background_color.red,
                    "green": token.style_info.background_color.green,
                    "blue": token.style_info.background_color.blue,
                },
            },
        }
        return token_dict

    except Exception as e:
        logger.error(f"Failed to convert token to dictionary: {e}")
        # General exception for any other issues that are not caught by specific exceptions
        raise Exception(f"Failed to convert token to dictionary: {e}")

