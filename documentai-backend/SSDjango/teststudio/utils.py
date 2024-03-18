# utils.py

import io
from PIL import Image
import fitz  # PyMuPDF
from django.core.files.base import ContentFile
from .models import PDFPage


class NamedBytesIO(io.BytesIO):
    def __init__(self, buffer, name=None):
        self._name = name
        super().__init__(buffer)

    @property
    def name(self):
        return self._name


def split_pdf(pdf_file):
    file_path = pdf_file.file.path

    doc = fitz.open(file_path)

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
