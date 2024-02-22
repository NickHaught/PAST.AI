from documentAI_v1 import *
from CUSTOM_Extractor import *

project_id = "ss-project-412900"
location = "us" # Format is "us" or "eu"
processor_id = "2fe7287c2d01d74d" # Create processor before running sample
processor_version = "rc" # Refer to https://cloud.google.com/document-ai/docs/manage-processor-versions for more information
file_path = "pdf/HebronSign.pdf"
mime_type = "application/pdf" # Refer to https://cloud.google.com/document-ai/docs/file-types for supported file types

# project_id="798705758042"
# location="us"
# processor_id="6af17e1fbec2dee4"
# file_path="pdf/HebronSign.pdf"
# mime_type = "application/pdf"

process_document_ocr_sample(project_id, location, processor_id, processor_version, file_path, mime_type)
#process_document_sample(project_id, location, processor_id, file_path, mime_type)