from ..models import PDFPage, GPTResponse, AppKeys, Settings
import tiktoken
import requests
import json
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger("django")


def generate_text(page_id: int):
    """
    Generates text from tokens that are not filtered out from a specific PDFPage.

    Args:
        page_id (int): The ID of the PDFPage instance.

    Returns:
        str: The combined text of all unfiltered tokens.

    Raises:
        PDFPage.DoesNotExist: If no PDFPage with the given ID exists.
        ValueError: For any issues related to data integrity or processing.
        Exception: For any other unexpected issues.
    """
    logger.info(f"Generating text for page {page_id}...")
    try:
        # Get the PDFPage instance from the database
        try:
            pdf_page = PDFPage.objects.get(id=page_id)
        except PDFPage.DoesNotExist:
            logger.error(f"PDFPage with ID {page_id} does not exist.")
            raise PDFPage.DoesNotExist(f"PDFPage with ID {page_id} does not exist.")

        # Get all Token objects related to this PDFPage instance
        tokens = pdf_page.tokens.all()

        if tokens is None or len(tokens) == 0:
            logger.error(f"No tokens available for page {page_id}.")
            raise ValueError("No tokens available for this page.")

        lines = []
        line = ""
        for token in tokens:
            filtered = token.filtered
            if not filtered:
                try:
                    token_info = token.get_token_info()  # Assume this method is properly defined
                    text = token_info["text"]

                    # Process text with potential newlines
                    if text:
                        if "\n" in text:
                            parts = text.split("\n")
                            line += parts[0]
                            lines.append(line)
                            line = parts[1] if len(parts) > 1 else ""
                        else:
                            line += text
                except KeyError as e:
                    logger.error(f"Token data is incomplete or invalid: {e}")
                    raise ValueError(f"Token data is incomplete or invalid: {e}")
        if line:
            lines.append(line)

        combined_text = "\n".join(lines)
        return combined_text

    except Exception as e:
        logger.error(f"Failed to generate text for page {page_id}: {e}")
        # General exception for any other issues that are not caught by specific exceptions
        raise Exception(f"Failed to generate text for page {page_id}: {e}")


def process_gpt(text, instructions, format_response: str, max_tokens: int, model: str):
    """
    Calls the OpenAI API to process text using specified instructions and format.

    Args:
        text (str): The text to be processed.
        instructions (str): Instructions for the text processing.
        format_response (str): The format of the response.

    Returns:
        tuple: A tuple containing the processed message and its cost, or (None, None) on failure.

    Raises:
        EnvironmentError: If necessary environment variables are missing or incorrect.
        ConnectionError: If there is a problem with the network or reaching the API.
        RuntimeError: For any other issues with API interaction.
    """
    logger.info("Processing text with GPT...")
    try:
        # Fetch the OpenAI API key from the database
        app_keys = AppKeys.objects.first()  # Replace with your query
        if not app_keys:
            raise ObjectDoesNotExist("API key does not exist.")
        
        api_key = app_keys.openai_api_key

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }

        payload = {
            "model": model,
            "response_format": {"type": format_response},
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": text},
            ],
            "max_tokens": max_tokens,
        }

        input_tokens = count_tokens(text, model) + count_tokens(instructions, model)

        response = requests.post(
            "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
        )

        if response.status_code == 200:
            response_json = response.json()
            message_content = response_json["choices"][0]["message"]["content"]

            # Count tokens in the output text
            output_tokens = count_tokens(message_content, model)

            cost_per_input_token = 0.01 / 1000  # $0.01 per 1,000 tokens for input
            cost_per_output_token = 0.03 / 1000  # $0.03 per 1,000 tokens for output

            cost = (input_tokens * cost_per_input_token) + (
                output_tokens * cost_per_output_token
            )

            return message_content, cost
        else:
            logger.error(f"API error: {response.status_code} - {response.text}")
            raise RuntimeError(f"API error: {response.status_code} - {response.text}")

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to OpenAI API: {e}")
        raise ConnectionError(f"Failed to connect to OpenAI API: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        raise RuntimeError(f"An unexpected error occurred: {e}")


def count_tokens(input_text, model):
    """
    Counts the number of tokens in the given text using a specific model's encoding.

    Args:
        input_text (str): The text to encode.

    Returns:
        int: The number of tokens.

    Raises:
        ValueError: If the input text is not a valid string.
        RuntimeError: For issues related to the encoding process.
    """
    logger.info("Counting tokens...")
    if not isinstance(input_text, str):
        logger.error("Input text must be a string.")
        raise ValueError("Input text must be a string.")

    try:
        # Assume 'tiktoken' is a hypothetical module and 'encoding_for_model' is a method that retrieves a model-specific encoder
        encoding = tiktoken.encoding_for_model(model)
        if encoding is None:
            raise RuntimeError("Failed to retrieve the encoder for the model.")

        num_tokens = len(encoding.encode(input_text))
        return num_tokens

    except AttributeError:
        logger.error("The encoding object does not have an 'encode' method.")
        raise RuntimeError("The encoding object does not have an 'encode' method.")
    except Exception as e:
        logger.error(f"An unexpected error occurred during token counting: {e}")
        raise RuntimeError(f"An unexpected error occurred during token counting: {e}")


def gpt_token_processing(page_id: int):
    """
    Processes text extracted from a PDF page by reformating it using GPT-4 and saving the response.

    Args:
        page_id (int): The ID of the PDFPage instance.

    Raises:
        ObjectDoesNotExist: If no PDFPage with the given ID exists.
        ValueError: For issues with processing or JSON formatting.
        Exception: For other unexpected issues.
    """
    logger.info(f"Processing GPT token for page {page_id}...")

    # Get settings from the database
    try:
        settings_obj = Settings.objects.first()
        if settings_obj:
            settings = {
                "gpt_instructions": settings_obj.gpt_messages,
                "gpt_max_tokens": settings_obj.gpt_max_tokens,
                "gpt_model": settings_obj.gpt_model,
            }
    except Exception as e:
        logger.error(f"Error getting settings: {e}")
        raise ValueError(f"Error getting settings: {e}")


    documentAI_text = generate_text(page_id)

    print(documentAI_text)

    instructions1 = settings["gpt_instructions"][0]
    instructions2 = settings["gpt_instructions"][1]


    message_content, cost = process_gpt(documentAI_text, instructions1, "text", settings["gpt_max_tokens"], settings["gpt_model"])

    print('----------------------------------------------------------------------')
    print(message_content)

    json_output, cost2 = process_gpt(message_content, instructions2, "json_object", settings["gpt_max_tokens"], settings["gpt_model"])
    json_output_dict = json.loads(json_output)
    json_output_dict = json.loads(json_output)

    # Create a new GPTResponse and save it to the database
    gpt_response = GPTResponse()
    gpt_response.page = PDFPage.objects.get(id=page_id)  # Set the page field
    gpt_response.json_response = json_output_dict  # Set the json_response field
    gpt_response.cost = round(cost + cost2, 3)  # Set the cost field

    gpt_response.save()
