import fitz  # Import PyMuPDF
from PIL import Image

def remove_specific_colors(pdf_path, output_pdf_path, colors_to_remove):
    doc = fitz.open(pdf_path)
    for page_number in range(len(doc)):
        page = doc.load_page(page_number)  # Load the current page
        pix = page.get_pixmap()  # Render page to an image (pixmap)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        # Convert image to RGBA (for transparency support)
        img = img.convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Removing pixels within the specified color ranges
            if any(all(c >= remove_color_range[0][i] and c <= remove_color_range[1][i] for i, c in enumerate(item[:3])) for remove_color_range in colors_to_remove):
                # Replace the color with a transparent pixel
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)

        img.putdata(newData)
        
        # Save the processed image temporarily
        temp_img_path = f"temp_processed_{page_number}.png"
        img.save(temp_img_path)
        
        # Replace the original page with the processed image
        doc[page_number].insert_image(doc[page_number].rect, filename=temp_img_path)

    # Save the modified PDF
    doc.save(output_pdf_path)
    doc.close()

# Define color ranges to remove (as tuples of RGB low-high ranges)
# Example: To remove red and blue, define their approximate ranges
colors_to_remove = [
    ((150, 0, 0), (255, 100, 100)),  # Red range
    ((0, 0, 150), (100, 100, 255))   # Blue range
]

# Usage
pdf_path = "HebronSign.pdf"
output_pdf_path = "HebronSign_POST.pdf"
remove_specific_colors(pdf_path, output_pdf_path, colors_to_remove)
