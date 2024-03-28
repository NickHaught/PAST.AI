from ..models import PDFPage, Token


def temp_name(page_id: int):
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
    
            



        




def process_text_and_gpt(document_id, instructions):
    """
    Processes the text of a document and uses GPT-3 to generate a response.

    Args:
        document_id (int): The ID of the document in the database.
        instructions (str): The instructions for the GPT-3 model.

    Returns:
        str: The response from the GPT-4 model.
    """

    try:
        document = Document.query.get(document_id)
        if document is None:
            print("Document not found")
            return None

        tokens = Tokens.query.filter_by(
            document_id=document_id, filtered_out=False
        ).all()
        tokens.sort(
            key=lambda token: token.token_info["layout"]["text_anchor"][
                "text_segments"
            ][0]["start_index"]
        )
    except Exception as e:
        print(f"Error in database queries: {e}")
        return None

    try:
        lines = []
        line = ""
        for token in tokens:
            text = token.token_info.get("text")
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
    except Exception as e:
        print(f"Error in token processing: {e}")
        return None

    try:
        api_key = os.getenv("OPENAI_API_KEY")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        }

        payload = {
            "model": "gpt-4-0125-preview",
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
    except Exception as e:
        print(f"Error in API request: {e}")
        return None

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