from ..models import PDFPage, Token, GPTResponse
import os
from pathlib import Path
from dotenv import load_dotenv
import tiktoken
import requests
import json


def generate_text(page_id: int):
    # Get the PDFPage instance from the database
    pdf_page = PDFPage.objects.get(id=page_id)

    # Get all Token objects related to this PDFPage instance
    tokens = pdf_page.tokens.all()

    lines = []
    line = ""
    for token in tokens:
        filtered = token.filtered
        if not filtered:
            token_info = token.get_token_info()
            
            text = token_info["text"]
            if text and "\n" in text:
                parts = text.split("\n")
                line += parts[0]
                lines.append(line)
                line = parts[1] if len(parts) > 1 else ""
            else:
                line += text if text else ""
    if line:
        lines.append(line)

    text = "\n".join(lines)

    print(text)

    return text


def process_gpt(text, instructions, format_response: str):

    # Build paths inside the project like this: BASE_DIR / 'subdir'.
    BASE_DIR = Path(__file__).resolve().parent.parent

    # Load environment variables from the .env file
    dotenv_path = os.path.join(BASE_DIR.parent, "project-setup", ".env")
    load_dotenv(dotenv_path)

    api_key = os.getenv("OPENAI_API_KEY")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }

    payload = {
        "model": "gpt-4-0125-preview",
        "response_format": { "type": format_response},
        "messages": [
            {"role": "system", "content": instructions},
            {"role": "user", "content": text},
        ],
        "max_tokens": 1000,
    }

    input_tokens = count_tokens(text) + count_tokens(instructions)

    response = requests.post(
        "https://api.openai.com/v1/chat/completions", headers=headers, json=payload
    )

    if response.status_code == 200:
        response_json = response.json()
        message_content = response_json["choices"][0]["message"]["content"]

        # Count tokens in the output text
        output_tokens = count_tokens(message_content)

        cost_per_input_token = 0.01 / 1000  # $0.01 per 1,000 tokens for input
        cost_per_output_token = 0.03 / 1000  # $0.03 per 1,000 tokens for output

        cost = (input_tokens * cost_per_input_token) + (
            output_tokens * cost_per_output_token
        )

        return message_content, cost
    else:
        print(f"Failed to get a successful response from the API: {response.text}")
        return None


def count_tokens(input_text):
    encoding = tiktoken.encoding_for_model("gpt-4-0125-preview")
    num_tokens = len(encoding.encode(input_text))
    return num_tokens


def gpt_token_processing(page_id: int):
    text1 = generate_text(page_id)
    instructions1 = "GPT-4, reformat the following text extracted from a PDF via OCR. Preserve all original words and their order. Add line breaks, paragraphs, or indentation as needed for readability. Do not add, remove, or change any words. Ensure logical flow and proper formatting of headings, subheadings, or lists if present. If listing text please use commas, do not make bullted lists."
    instructions2 = "GPT-4, reformat the following text into JSON format with three main sections: 'title', 'content', and 'source'. The 'title' section should contain the title of the text. The 'content' section should present the main body of the text as a single, cohesive block without breaking it down into subcategories. The 'source' section should include the source of the text. Ensure that the JSON structure is properly formatted and correct. The text should maintain its original meaning and detail, encapsulated within these sections."


    message_content, cost = process_gpt(text1, instructions1, "text")

    json_output, cost2 = process_gpt(message_content, instructions2, "json_object")
    json_output_dict = json.loads(json_output)
    json_output_dict = json.loads(json_output)

    # Create a new GPTResponse and save it to the database
    gpt_response = GPTResponse()
    gpt_response.page = PDFPage.objects.get(id=page_id)  # Set the page field
    gpt_response.json_response = json_output_dict  # Set the json_response field
    gpt_response.cost = cost + cost2  # Set the cost field
    gpt_response.save()