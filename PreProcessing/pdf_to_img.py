import pypdfium2 as pdfium
from PIL import Image
from pathlib import Path

current_directory = Path.cwd()

pdf_directory = current_directory / 'pdf'
image_directory = current_directory / 'images'

print(pdf_directory)
for entry in pdf_directory.iterdir():
    print(entry)
    pdf = pdfium.PdfDocument(entry)

    # Access the first page (index 0)
    print(f"Current {entry.name}")
    userInput = input("Enter page: ")
    if userInput == 'exit':
        break
    page = pdf.get_page(int(userInput))


    # Render the page to a bitmap
    bitmap = pdfium.PdfPage.render(page, scale = 4)

    # Convert the bitmap to a PIL image
    pil_image = Image.frombytes("RGB", (bitmap.width, bitmap.height), bitmap.buffer)

   # Save the PIL image in the 'images' folder
    image_path = image_directory  / f"{entry.stem}_order.jpg"
    pil_image.save(image_path)

    # Close the PDF document
    pdf.close()