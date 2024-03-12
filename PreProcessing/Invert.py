import cv2

# Load the image in grayscale
image_path = 'images/hebronsign_filtered.jpg'
gray_image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

# Invert the image
inverted_gray_image = 255 - gray_image

# Save or display the inverted image
cv2.imwrite('inverted_gray_image.jpg', inverted_gray_image)