from ..models import PDFPage, Token

def token_filter(page_id: int)
    
    # Get the PDFPage instance from the database
    pdf_page = PDFPage.objects.get(id=page_id)

    # Get all Token objects related to this PDFPage instance
    tokens = pdf_page.tokens.all()

    for token in tokens:
        pass
        