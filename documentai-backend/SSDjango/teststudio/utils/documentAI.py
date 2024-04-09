import os
from google.api_core.client_options import ClientOptions
from google.cloud import documentai
from ..models import PDFPage, Token
from pathlib import Path
from PyPDF2 import (
    PdfReader as PyPDF2Reader,
    PdfWriter as PyPDF2Writer,
)


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
        ValueError: If the credentials file does not exist or settings are improperly configured.
    """
    # Set up Google Application Credentials
    google_app_creds_path = Path(__file__).parent / cred_file_name
    if not google_app_creds_path.is_file():
        raise ValueError(f"Credentials file does not exist: {google_app_creds_path}")
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(google_app_creds_path)

    # Define hardcoded settings (usually you would fetch this from a config file or environment)
    settings = {
        "compute_style_info": True,
        "enable_native_pdf_parsing": True,
        "enable_image_quality_scores": True,
        "enable_symbol": True,
        "location": "us",  # replace with your location
        "project_id": "ssdocumentai",  # replace with your project id
        "processor_id": "327a00af9402484d",  # replace with your processor id
        "processor_version": "pretrained-ocr-v2.0-2023-06-02",  # replace with your processor version
        "mime_type": "application/pdf",  # replace with your mime type
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


def process_page(page_id: int):
    """
    Process a page using Document AI.

    Args:
        page_id (int): The ID of the page.

    Raises:
        PDFPage.DoesNotExist: If the page with the specified ID does not exist.
    """
    process_options, client, client_version = initialize_configuration("cred.json")

    # Get the page from the database
    try:
        pdf_page = PDFPage.objects.get(id=page_id)
    except PDFPage.DoesNotExist:
        raise PDFPage.DoesNotExist(f"Page with ID {page_id} does not exist")

    # Read the file content
    with open(pdf_page.file.path, "rb") as file:
        content = file.read()

    # Prepare the request
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


def process_tokens(pdf_page, document, page_width, page_height):
    """
    Process the tokens in a Document AI document and save them as Token instances.

    Args:
        pdf_page (PDFPage): The PDFPage object.
        document (documentai.Document): The Document AI document.
        page_width (float): The width of the PDF page.
        page_height (float): The height of the PDF page.
    """
    document_text = document.text

    # Iterate over each page in the document
    for page_number, page in enumerate(document.pages, start=1):
        # Iterate over each token in the page
        for token_number, token in enumerate(page.tokens, start=1):

            # Get the bounding box of the token
            bounding_box = token.layout.bounding_poly

            # Convert the normalized coordinates to the PDF's coordinate system
            x1, y1, x2, y2 = convert_coordinates(
                bounding_box.normalized_vertices, page_width, page_height
            )

            token_id = f"page{page_number}_token{token_number}"
            token_info = token_info_to_dict(token, document_text)

            # Create a Token instance
            token = Token.objects.create(
                page=pdf_page,
                token_id=token_id,
                x1=x1,
                y1=y1,
                x2=x2,
                y2=y2,
            )
            token.set_token_info(token_info)
            token.save()


def get_page_dimensions(input_pdf_path):
    """
    Gets the dimensions of the first page of a PDF.

    Args:
        input_pdf_path (str): The path to the input PDF.

    Returns:
        tuple: The width and height of the page.

    Raises:
        ValueError: If the PDF page doesn't have any box defined.
    """

    pdf = PyPDF2Reader(input_pdf_path)
    page = pdf.pages[0]
    box = page.mediabox or page.artbox or page.bleedbox or page.cropbox or page.trimbox
    if box is None:
        raise ValueError("The PDF page doesn't have any box defined")
    page_width = box[2]
    page_height = box[3]

    return page_width, page_height


def convert_coordinates(normalized_vertices, page_width, page_height):
    """
    Converts normalized coordinates to the PDF's coordinate system.

    Args:
        normalized_vertices (list): The normalized vertices.
        page_width (float): The width of the PDF page.
        page_height (float): The height of the PDF page.

    Returns:
        tuple: The converted coordinates (x1, y1, x2, y2).
    """

    x1 = normalized_vertices[0].x * float(page_width)
    y1 = float(page_height) - normalized_vertices[0].y * float(page_height)
    x2 = normalized_vertices[2].x * float(page_width)
    y2 = float(page_height) - normalized_vertices[2].y * float(page_height)

    return x1, y1, x2, y2


def token_info_to_dict(token, document_text):
    """
    Converts a `Token` object to a dictionary.

    Args:
        token (documentai.Token): The token object.
        document_text (str): The text of the document.

    Returns:
        dict: A dictionary with the token info.
    """

    token_dict = {
        "text": document_text[
            token.layout.text_anchor.text_segments[0]
            .start_index : token.layout.text_anchor.text_segments[0]
            .end_index
        ],
        "layout": {
            "text_anchor": {
                "text_segments": [
                    {
                        "start_index": token.layout.text_anchor.text_segments[
                            0
                        ].start_index,
                        "end_index": token.layout.text_anchor.text_segments[
                            0
                        ].end_index,
                    }
                ]
            },
            "confidence": token.layout.confidence,
            "bounding_poly": {
                "vertices": [
                    [vertex.x, vertex.y]
                    for vertex in token.layout.bounding_poly.vertices
                ],
                "normalized_vertices": [
                    [vertex.x, vertex.y]
                    for vertex in token.layout.bounding_poly.normalized_vertices
                ],
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
            # Add other fields if necessary
        },
    }
    return token_dict
