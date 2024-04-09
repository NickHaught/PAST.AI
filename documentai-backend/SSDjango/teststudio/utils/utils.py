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


class NamedBytesIO(io.BytesIO):
    """
    A subclass of `io.BytesIO` that allows specifying a name for the stream.

    Args:
        buffer (bytes-like object): The initial buffer value.
        name (str, optional): The name of the stream. Defaults to None.

    Attributes:
        name (str): The name of the stream.

    Example:
        >>> stream = NamedBytesIO(b'Hello, World!', name='example.txt')
        >>> print(stream.name)
        example.txt
    """

    def __init__(self, buffer, name=None):
        self._name = name
        super().__init__(buffer)

    @property
    def name(self):
        return self._name


def split_pdf(pdf_file):
    """
    Splits a PDF file into individual pages and saves each page as a separate PDF file.
    
    Args:
        pdf_file (File): The PDF file to be split.
        
    Returns:
        list: A list of IDs of the saved PDF pages.
    """
    file_path = pdf_file.file.path

    doc = fitz.open(file_path)

    page_ids = []

    for page_number, page in enumerate(doc):
        output = io.BytesIO()
        sub_doc = fitz.open()  # create a new PDF
        sub_doc.insert_pdf(doc, from_page=page_number, to_page=page_number)
        sub_doc.save(
            output, garbage=4, deflate=True
        )  # save the single page PDF to the BytesIO object

        page_filename = f"{pdf_file.name}_page_{page_number + 1}.pdf"
        pdf_page = PDFPage(pdf_file=pdf_file, page_number=page_number + 1)
        output.seek(0)
        pdf_page.file.save(page_filename, ContentFile(output.read()))

        # Create the thumbnail
        pix = page.get_pixmap(matrix=fitz.Matrix(0.5, 0.5))
        thumbnail_filename = f"{pdf_file.name}_page_{page_number + 1}_thumbnail.png"

        # Convert the Pixmap object to a Pillow Image object
        img = Image.frombytes("RGB", tuple([pix.width, pix.height]), pix.samples)

        # Create a BytesIO object to hold the thumbnail
        thumbnail_output = io.BytesIO()

        # Save the Image object to the BytesIO object as a PNG
        img.save(thumbnail_output, format="PNG")

        # Save the thumbnail to the model
        pdf_page.thumbnail.save(
            thumbnail_filename,
            ContentFile(thumbnail_output.getvalue(), name=thumbnail_filename),
        )

        pdf_page.save()

        page_ids.append(pdf_page.id)

    return page_ids


def process_pages_util(page_ids: list):
    """
    Processes a list of pages using specified parameters.

    Args:
        page_ids (list): The list of page IDs.
    """

    for page_id in page_ids:
        process_page(page_id)
        token_filter(page_id)
        gpt_token_processing(page_id)



def render_pdf_to_images(page_ids: list):
    image_urls = []
    for page_id in page_ids:
        page = PDFPage.objects.get(id=page_id)
        pdf = pdfium.PdfDocument(page.file.path)

        # Render the page to a bitmap
        bitmap = pdfium.PdfPage.render(pdf.get_page(0), scale = 4)

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

        # Close the PDF document
        pdf.close()

        image_urls.append(page.high_res_image.url)

    return image_urls

