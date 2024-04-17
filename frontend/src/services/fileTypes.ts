
// Interface for a file object after a successful upload request
export interface FileData {
  id: number;
  name: string;
  filePath: string;
  pages: number[];
  thumbnails: string[];
  error?: string;
}

// Interface for a page inside the `pages` array after fetching PDF details
export interface Page {
  high_res_image: string | undefined;
  id: number;
  page_number: number;
  file: string;
  thumbnail: string;
}

// Interface for a PDF object after fetching specific PDF details
export interface PDFDetail {
  id: number;
  name: string;
  pages: Array<{
    id: number;
    high_res_image: string;
    thumbnail: string;
    page_number: number;
    gpt_cost: number;
    documentAI_cost: number;
    processing_time: number;
    scanned: boolean;
    json_output: Array<{
      title: string;
      content: string;
      source: string;
    }>
  }>;
}

export interface JsonOutput {
  title: string;
  content: string;
}

export interface ProcessedPage {
  page_id: number;
  json_output: JsonOutput;
  cost: number;
}

export interface ProcessedPagesResponse {
  status: string;
  processed_pages: ProcessedPage[];
}