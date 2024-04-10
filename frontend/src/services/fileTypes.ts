
// Interface for a file object after a successful upload request
export interface FileData {
  map(arg0: (item: FileData) => { id: number; name: string; filePath: string; pages: number[]; thumbnails: string[]; }): unknown;
  id: number;
  name: string;
  filePath: string;
  pages: number[];
  thumbnails: string[];
}

// Interface for a page inside the `pages` array after fetching PDF details
export interface Page {
  id: number;
  page_number: number;
  file: string;
  thumbnail: string;
}

// Interface for a PDF object after fetching specific PDF details
export interface PDFDetail {
  id: number;
  name: string;
  file: string;
  pages: Page[];
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