from ..models import PDFPage, Token
import numpy as np

def token_filter(page_id: int):
    """
    Filters tokens based on specified criteria.

    Args:
        page_id (int): The ID of the PDFPage instance.

    Returns:
        None
    """

    settings = {
        "color_filter" : True,
        "color_similarity_threshold": 0.6,
        "handwritten_filter" : True,
        "unicode_filter" : True,
        "confidence_filter" : 0.7,
        "font_size_filter" : 3,
    }
    
    # Get the PDFPage instance from the database
    pdf_page = PDFPage.objects.get(id=page_id)

    # Get all Token objects related to this PDFPage instance
    tokens = pdf_page.tokens.all()

    avg_color = average_color(tokens)
    for token in tokens:
        token_info = token.get_token_info()

        # Update the color for the current token
        color = token_info["style_info"]["text_color"]
        color = np.array([color["red"], color["green"], color["blue"]])

        # Check if the token's color is similar to the average color
        if settings["color_filter"]:
            color_distance = np.linalg.norm(color - avg_color)
            if color_distance > settings["color_similarity_threshold"]:
                token.filtered = True
                token.save()

        # Check if the token is handwritten
        if settings["handwritten_filter"] and token_info["style_info"]["handwritten"]:
            token.filtered = True
            token.save()

        # Check if the token contains unicode character
        if settings["unicode_filter"] and any(ord(char) > 127 for char in token_info["text"]):
            token.filtered = True
            token.save()

        # Check if the token's confidence is less than the threshold
        if settings["confidence_filter"] and token_info["layout"]["confidence"] < settings["confidence_filter"]:
            token.filtered = True
            token.save()


def average_color(tokens):
    """
    Calculates the average color of a list of tokens.

    Args:
        tokens (list): A list of tokens.

    Returns:
        numpy.ndarray: The average color as a numpy array with shape (3,).

    """
    colors = []
    for token in tokens:
        token_info = token.get_token_info()
        color = token_info["style_info"]["text_color"]
        colors.append([color["red"], color["green"], color["blue"]])
    average_color = np.mean(colors, axis=0)

    return average_color
        