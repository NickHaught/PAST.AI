from ..models import PDFPage, Token
from django.core.exceptions import ObjectDoesNotExist
import numpy as np
import logging

logger = logging.getLogger("django")


def token_filter(page_id: int):
    """
    Filters tokens based on specified criteria.

    Args:
        page_id (int): The ID of the PDFPage instance.

    Raises:
        ObjectDoesNotExist: If the PDFPage instance does not exist.
        ValueError: For any problems with data handling and calculations.
        Exception: For any other unexpected issues.
    """
    logger.info(f"Filtering tokens for page {page_id}...")
    settings = {
        "color_filter": True,
        "color_similarity_threshold": 0.6,
        "handwritten_filter": True,
        "unicode_filter": True,
        "confidence_filter": 0.7,
        "font_size_filter": 3,
    }

    try:
        # Get the PDFPage instance from the database
        try:
            pdf_page = PDFPage.objects.get(id=page_id)
        except PDFPage.DoesNotExist:
            logger.error(f"PDFPage with ID {page_id} does not exist.")
            raise ObjectDoesNotExist(f"PDFPage with ID {page_id} does not exist.")

        # Get all Token objects related to this PDFPage instance
        tokens = pdf_page.tokens.all()

        # Calculate average color
        try:
            avg_color = average_color(tokens)  # Ensure this function is properly defined
        except Exception as e:
            logger.error(f"Error calculating average color: {e}")
            raise ValueError(f"Error calculating average color: {e}")

        for token in tokens:
            token_info = token.get_token_info()  # Assume this method is well-defined

            # Update the color for the current token
            try:
                color = np.array([
                    token_info["style_info"]["text_color"]["red"],
                    token_info["style_info"]["text_color"]["green"],
                    token_info["style_info"]["text_color"]["blue"]
                ])
            except KeyError as e:
                logger.error(f"Token information is incomplete: {e}")
                raise ValueError(f"Token information is incomplete: {e}")

            try:
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

                # Check if the token contains unicode characters
                if settings["unicode_filter"] and any(ord(char) > 127 for char in token_info["text"]):
                    token.filtered = True
                    token.save()

                # Check if the token's confidence is less than the threshold
                if settings["confidence_filter"] and token_info["layout"]["confidence"] < settings["confidence_filter"]:
                    token.filtered = True
                    token.save()
            except Exception as e:
                logger.error(f"Error processing token {token.id}: {e}")
                raise ValueError(f"Error processing token {token.id}: {e}")

    except Exception as e:
        logger.error(f"Failed to filter tokens for page {page_id}: {e}")
        # General exception for any other issues that are not caught by specific exceptions
        raise Exception(f"Failed to filter tokens for page {page_id}: {e}")


def average_color(tokens):
    """
    Calculates the average color of a list of tokens.

    Args:
        tokens (list): A list of tokens.

    Returns:
        numpy.ndarray: The average color as a numpy array with shape (3,).

    Raises:
        ValueError: If tokens are empty or color data is incomplete.
        Exception: For any other unexpected issues.
    """
    logger.info("Calculating average color...")
    try:
        if not tokens:
            raise ValueError("Token list is empty.")

        colors = []
        for token in tokens:
            try:
                token_info = token.get_token_info()  # Ensure this method is properly defined
                color = token_info["style_info"]["text_color"]
                colors.append([color["red"], color["green"], color["blue"]])
            except KeyError as e:
                logger.error(f"Missing color information in a token: {e}")
                raise ValueError(f"Missing color information in a token: {e}")

        if not colors:
            raise ValueError("No valid color data found in tokens.")

        try:
            average_color = np.mean(colors, axis=0)
        except TypeError as e:
            logger.error(f"Error calculating average due to data type issues: {e}")
            raise TypeError(f"Error calculating average due to data type issues: {e}")
        except Exception as e:
            logger.error(f"Error calculating average color: {e}")
            raise Exception(f"Error calculating average color: {e}")

        return average_color

    except Exception as e:
        logger.error(f"Failed to calculate average color: {e}")
        # General exception for any other issues that are not caught by specific exceptions
        raise Exception(f"Failed to calculate average color: {e}")
        