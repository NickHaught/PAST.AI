# utils.py

import fitz  # PyMuPDF
from .models import PDFPage
from django.core.files.base import ContentFile
import io


def split_pdf(pdf_file):
    try:
        file_path = pdf_file.file.path
        print(f"File path: {file_path}")

        doc = fitz.open(file_path)

        for page_number in range(len(doc)):
            output = io.BytesIO()
            page = doc[page_number]
            sub_doc = fitz.open()  # create a new PDF
            sub_doc.insert_pdf(doc, from_page=page_number, to_page=page_number)
            sub_doc.save(
                output, garbage=4, deflate=True
            )  # save the single page PDF to the BytesIO object

            page_filename = f"{pdf_file.name}_page_{page_number + 1}.pdf"
            pdf_page = PDFPage(pdf_file=pdf_file, page_number=page_number + 1)
            output.seek(0)
            pdf_page.file.save(page_filename, ContentFile(output.read()))
            pdf_page.save()

            print(f"Saved page {page_number + 1}")
    except Exception as e:
        print(f"An error occurred: {e}")
