# utils.py

import io
import os
from PIL import Image
import fitz  # PyMuPDF
import pypdfium2 as pdfium
from pathlib import Path
from django.core.files.base import ContentFile
from ..models import PDFPage
from .documentAI import process_page
from .filter_tokens import token_filter
from .gpt import gpt_token_processing
import logging

logger = logging.getLogger("django")

class NamedBytesIO(io.BytesIO):
    """
    A subclass of `io.BytesIO` that allows specifying a name for the stream.

    Args:
        buffer (bytes-like object, optional): The initial buffer value. Defaults to None.
        name (str, optional): The name of the stream. Defaults to None.

    Attributes:
        name (str): The name of the stream.

    Example:
        >>> stream = NamedBytesIO(b'Hello, World!', name='example.txt')
        >>> print(stream.name)
        example.txt

    Raises:
        TypeError: If the provided buffer is not a bytes-like object.
    """
    def __init__(self, buffer=None, name=None):
        if buffer is not None and not isinstance(buffer, (bytes, bytearray)):
            raise TypeError("buffer must be a bytes-like object or None")
        
        self._name = name
        super().__init__(buffer if buffer is not None else b'')

    @property
    def name(self):
        """
        Returns the name of the stream.
        """
        return self._name


def split_pdf(pdf_file):
    """
    Splits a PDF file into individual pages and saves each page as a separate PDF file.

    Args:
        pdf_file (File): The PDF file to be split.

    Returns:
        list: A list of IDs of the saved PDF pages.

    Raises:
        FileNotFoundError: If the specified PDF file does not exist.
        ValueError: If the PDF file cannot be processed.
        IOError: If there is an error saving files or thumbnails.
    """
    try:
        file_path = pdf_file.file.path
        doc = fitz.open(file_path)  # Attempt to open the PDF file
    except Exception as e:
        logger.error(f"The specified PDF file could not be opened: {e}")
        raise FileNotFoundError(f"The specified PDF file could not be opened: {e}")

    page_ids = []

    for page_number, page in enumerate(doc):
        logger.info(f"Processing page {page_number + 1} of {doc.page_count}...")
        try:
            output = io.BytesIO()
            sub_doc = fitz.open()  # Create a new PDF document in memory
            sub_doc.insert_pdf(doc, from_page=page_number, to_page=page_number)
            sub_doc.save(output, garbage=4, deflate=True)  # Save single page to BytesIO

            page_filename = f"{pdf_file.name}_page_{page_number + 1}.pdf"
            pdf_page = PDFPage(pdf_file=pdf_file, page_number=page_number + 1)
            output.seek(0)
            pdf_page.file.save(page_filename, ContentFile(output.read()))  # Save the PDF page file

            # Creating a thumbnail
            pix = page.get_pixmap(matrix=fitz.Matrix(0.5, 0.5))  # Generate a pixmap from the page
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)

            thumbnail_output = io.BytesIO()
            img.save(thumbnail_output, format="PNG")  # Save to BytesIO in PNG format
            thumbnail_output.seek(0)

            thumbnail_filename = f"{pdf_file.name}_page_{page_number + 1}_thumbnail.png"
            pdf_page.thumbnail.save(thumbnail_filename, ContentFile(thumbnail_output.getvalue()))

            pdf_page.save()  # Save the page model instance
            page_ids.append(pdf_page.id)

        except Exception as e:
            logger.error(f"Failed to process or save PDF page {page_number + 1}: {e}")
            raise IOError(f"Failed to process or save PDF page {page_number + 1}: {e}")

    return page_ids


def process_pages_util(page_ids: list):
    """
    Processes a list of pages using specified parameters, handling errors individually.

    Args:
        page_ids (list): The list of page IDs.

    Returns:
        dict: A dictionary that contains processing results with keys as page IDs and values as status messages.
    """
    results = {}

    for page_id in page_ids:
        try:
            # Process each page, filter tokens, and handle GPT processing
            logger.info(f"Document AI Processing for page {page_id}")
            process_page(page_id)
            logger.info(f"Token Filtering for page {page_id}")
            token_filter(page_id)
            logger.info(f"GPT Token Processing for page {page_id}")
            gpt_token_processing(page_id)
            results[page_id] = "Success"
        except Exception as e:
            # Record the error against the page ID in the results dictionary
            results[page_id] = f"Failed to process page {page_id}: {str(e)}"
            logger.error(f"Failed to process page {page_id}: {str(e)}")

    return results


def render_pdf_to_images(page_ids: list):
    """
    Renders PDF pages to images and saves them, handling errors along the way.

    Args:
        page_ids (list): The list of page IDs.

    Returns:
        list: A list of URLs to the rendered images.

    Raises:
        FileNotFoundError: If the PDF file does not exist.
        IOError: If there is an error reading the PDF or saving the image.
        Exception: For any other unexpected issues.
    """
    logger.info(f"Rendering PDF pages to images: {page_ids}")
    image_urls = []

    for page_id in page_ids:
        try:
            page = PDFPage.objects.get(id=page_id)
            try:
                pdf = pdfium.PdfDocument(page.file.path)
            except Exception as e:
                logger.error(f"Failed to open PDF file at {page.file.path}: {e}")
                raise FileNotFoundError(f"Failed to open PDF file at {page.file.path}: {e}")

            try:
                # Render the page to a bitmap
                bitmap = pdfium.PdfPage.render(pdf.get_page(0), scale=4)

                # Convert the bitmap to a PIL image
                pil_image = Image.frombytes("RGB", (bitmap.width, bitmap.height), bitmap.buffer)

                # Save the PIL image to a BytesIO object
                image_io = io.BytesIO()
                pil_image.save(image_io, format='JPEG')

                # Create a Django ContentFile from the BytesIO object
                image_content_file = ContentFile(image_io.getvalue())

                # Generate a filename
                filename = f'{page.pdf_file.name}_page_{page.page_number}.jpg'

                # Save the image to the high_res_image field
                page.high_res_image.save(filename, image_content_file)

                # Save the changes to the page object
                page.save()

                # Append the URL to the list
                image_urls.append(page.high_res_image.url)
                
            except Exception as e:
                logger.error(f"Error processing or saving image for page {page_id}: {e}")
                raise IOError(f"Error processing or saving image for page {page_id}: {e}")
            finally:
                # Ensure the PDF document is closed whether or not there was an error
                pdf.close()

        except PDFPage.DoesNotExist:
            logger.error(f"No PDFPage found with ID {page_id}")
            raise PDFPage.DoesNotExist(f"No PDFPage found with ID {page_id}")
        except Exception as e:
            logger.error(f"Failed to render image for page {page_id}: {e}")
            raise Exception(f"Failed to render image for page {page_id}: {e}")

    return image_urls


