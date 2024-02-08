import numpy as np
import cv2
from scipy.fft import fft2, ifft2, fftshift, ifftshift

# Correct the path to your image
image_path = 'HebronSign.pdf'
image = cv2.imread(image_path, 0)

# Check if the image was loaded correctly
if image is None:
    raise ValueError(f"Could not load the image. Check the file path: {image_path}")

# Apply Fourier Transform
f = fft2(image)
fshift = fftshift(f)

# Generate a mask for a low-pass filter
rows, cols = image.shape
crow, ccol = rows // 2, cols // 2
mask = np.zeros((rows, cols), np.uint8)
mask[crow-30:crow+30, ccol-30:ccol+30] = 1

# Apply mask to the frequency domain image
fshift = fshift * mask

# Inverse Fourier Transform
f_ishift = ifftshift(fshift)
img_back = ifft2(f_ishift)
img_back = np.abs(img_back)

# Normalize the image to display
img_back = cv2.normalize(img_back, None, 0, 255, cv2.NORM_MINMAX)

# Display the image
cv2.imshow('Filtered Image', img_back)
cv2.waitKey(0)
cv2.destroyAllWindows()
