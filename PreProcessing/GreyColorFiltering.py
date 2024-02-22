import cv2
import numpy as np
import img2pdf
from PIL import Image

# Load the image
image_path = 'images/hebronsign.jpg'
image = cv2.imread(image_path)

# Convert to grayscale to identify text areas
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Threshold to identify text regions; adjust the threshold value as needed
_, thresh_image = cv2.threshold(gray_image, 180, 255, cv2.THRESH_BINARY_INV)

# Convert to HSV for easier color manipulation
hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

background_lower = np.array([0, 0, 200])  # HSV low range for "white" background
background_upper = np.array([255, 55, 255])  # HSV high range to exclude text colors

# Create a mask to identify background
background_mask = cv2.inRange(hsv_image, background_lower, background_upper)

# Invert mask to identify non-background (colorful text and elements)
color_text_mask = cv2.bitwise_not(background_mask)

colorful_elements_mask = cv2.bitwise_and(color_text_mask, thresh_image)

colorful_elements_image = cv2.bitwise_and(image, image, mask=colorful_elements_mask)
rest_background = cv2.bitwise_and(np.full_like(image, fill_value=[255, 255, 255]), np.full_like(image, fill_value=[255, 255, 255]), mask=cv2.bitwise_not(colorful_elements_mask))
final_colorful_elements_image = cv2.add(colorful_elements_image, rest_background)

# Save the image with colorful, non-text elements
cv2.imwrite('filteredImages/page_elements.jpg', final_colorful_elements_image)

image_path = 'filteredImages/page_elements.jpg'

# The path for the new PDF file
pdf_path = 'pdf/page_elements.pdf'

image = Image.open(image_path)

pdf_bytes = img2pdf.convert(image.filename)

file = open(pdf_path, "wb")

file.write(pdf_bytes)

image.close()

file.close()


print(f"PDF saved to {pdf_path}")