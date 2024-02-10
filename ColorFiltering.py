import cv2
import numpy as np

# Load the original image
image_path = 'images/hebronsign.jpg'
image = cv2.imread(image_path)

# Convert the image to HSV color space
hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

# Define hue ranges for red and blue colors
# Note: Red wraps around the hue spectrum, so it needs two ranges
red_lower1 = np.array([0, 50, 50])
red_upper1 = np.array([10, 255, 255])
red_lower2 = np.array([170, 50, 50])
red_upper2 = np.array([180, 255, 255])

blue_lower = np.array([110, 50, 50])
blue_upper = np.array([130, 255, 255])

# Create masks for red and blue
mask_red1 = cv2.inRange(hsv_image, red_lower1, red_upper1)
mask_red2 = cv2.inRange(hsv_image, red_lower2, red_upper2)
mask_blue = cv2.inRange(hsv_image, blue_lower, blue_upper)

# Combine masks for red and blue
mask_combined = cv2.bitwise_or(mask_red1, mask_red2)
mask_combined = cv2.bitwise_or(mask_combined, mask_blue)

# Invert mask to change colors other than red and blue
mask_inverted = cv2.bitwise_not(mask_combined)

# Create an output image where red and blue are altered
# Option 1: Change red and blue pixels to background color (e.g., white)
background_color = np.array([255, 255, 255], dtype=np.uint8)
background_image = np.full_like(image, background_color)
color_filtered_part = cv2.bitwise_and(background_image, background_image, mask=mask_combined)

# Option 2: Simply reduce saturation of red and blue to "gray out" without changing to background color
# This desaturates the identified red and blue pixels, effectively "graying" them out without altering other colors
hsv_image[mask_combined>0, 1] = 0  # Reduce saturation to 0 for masked pixels
color_filtered_part = cv2.cvtColor(hsv_image, cv2.COLOR_HSV2BGR)

# Combine the altered red and blue parts with the rest of the image
final_image = cv2.bitwise_and(image, image, mask=mask_inverted)
final_image = cv2.add(final_image, color_filtered_part)

# Save or display the final image
cv2.imwrite('reds_blues_filtered_image.jpg', final_image)
# cv2.imshow('Final Image', final_image)
# cv2.waitKey(0)
# cv2.destroyAllWindows()
