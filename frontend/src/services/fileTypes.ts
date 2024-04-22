
// Interface for a file object after a successful upload request
export interface FileData {
  id: number;
  name: string;
  filePath: string;
  pages: number[];
  thumbnails: string[];
  error?: string;
  scanned: boolean;
}

// Interface for a page inside the `pages` array after fetching PDF details
export interface JsonOutput {
  title: string;
  content: string;
  source: string;
}

// Interface for a single page in a PDF
export interface Page {
  id: number;
  high_res_image: string;
  thumbnail: string;
  page_number: number;
  gpt_cost: number;
  documentAI_cost: number;
  processing_time: number;
  scanned: boolean;
  json_output: JsonOutput; // Single JSON Output object, not an array
}

// Interface for a PDF object after fetching specific PDF details
export interface PDFDetail {
  id: number;
  name: string;
  pages: Page[]; // Array of Page objects
}

// Interface for a single processed page, typically returned from a scanning process
export interface ProcessedPage {
  page_id: number; // Ensure the type matches expected inputs (string vs number)
  json_output: JsonOutput;
  gpt_cost: number;
  documentAI_cost: number;
  processing_time: number;
  scanned: boolean;
}

// Interface for the response containing processed pages
export interface ProcessedPagesResponse {
  status: string;
  processed_pages: ProcessedPage[];
}