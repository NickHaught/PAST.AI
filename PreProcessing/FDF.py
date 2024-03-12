import numpy as np
import cv2
from scipy.fft import fft2, ifft2, fftshift, ifftshift

# Correct the path to your image
image_path = 'images/hebronsign.jpg'
image = cv2.imread(image_path, 0)

# Check if the image was loaded correctly
if image is None:
    raise ValueError(f"Could not load the image. Check the file path: {image_path}")

# Apply Fourier Transform
f = fft2(image)
fshift = fftshift(f)

# Frequency domain filtering (e.g., low-pass filter)
rows, cols = image.shape
crow, ccol = rows//2, cols//2
fshift[crow-30:crow+30, ccol-30:ccol+30] = 0

# Inverse Fourier Transform
f_ishift = ifftshift(fshift)
img_back = ifft2(f_ishift)
img_back = np.abs(img_back)

# Normalize the image to display
img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX)

# Save the image to disk
save_path = 'images/hebronsign_filtered.jpg'
cv2.imwrite(save_path, img_back)
print(f"Filtered image saved to {save_path}")
