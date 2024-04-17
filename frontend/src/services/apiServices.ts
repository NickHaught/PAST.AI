import axios, { AxiosResponse } from "axios";
import { FileData,PDFDetail, ProcessedPagesResponse } from "./fileTypes";
import { pdf } from "@react-pdf/renderer";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  
});


// * API CALL: documents
export const fetchDocuments = async (pageSize: number, scanned: boolean): Promise<FileData[]> => {
  const params = {
    page_size: pageSize,
  };
  console.log("Sending API request to fetch documents with params:", params);
  const response = await apiClient.get('/pdfs/', { params });
  return response.data;
};

export const fetchPDFs = async (url: string) => {
  try {
    const response = await apiClient.get(url);
    // Assuming the API returns data in the structure { results: [], links: { next: '', previous: '' } }
    return {
      files: response.data.results,
      next: response.data.links.next,
      prev: response.data.links.previous
    };
  } catch (error) {
    // Convert the error to a more manageable format or simply throw it
    console.error("Error fetching PDFs:", error);
    throw error; // Re-throw to handle it in the component
  }
};


// * API CALL: pdfs
export const uploadFiles = async (files: File[]): Promise<FileData[]> => {
  console.log("Uploading file:", files.length);
  const formData = new FormData();
  files.forEach(file => formData.append("file", file));
  formData.append("name", "test");
  try {
    const response = await apiClient.post<FileData[]>("/pdfs/", formData);
    console.log("File paths uploaded successfully", response.data);
    return response.data;
  } catch (error) {
    console.error("Error uploading file paths:", error);
    throw error;
  }
};


// * API CALL: pdfs/{id}
export const fetchPDFDetails = async (Id: number): Promise<PDFDetail> => {
    try {
      const response = await apiClient.get(`/pdfs/${Id}/`);  // Using apiClient for the request
      console.log("PDF details fetched successfully:", response.data);  // Log the response data to the console
      return response.data;  // Return the data for further processing
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      throw error;  // Rethrow the error to handle it in the component
    }
  };

export const processPages = async (selectedPages: number[]) => {
  const data = {
    page_ids: selectedPages
  }
  try {
    const response = await apiClient.post("/pages/process_pages/", data );
    console.log("Processed pages successfully:", response);
    return response.data;
  } catch (error) {
    console.error("Error processing pages:", error);
    throw error;
  }
};


// * API CALL: getProcessedInfo/{id}
export const getProcessedInfo = async (Id: number): Promise<ProcessedPagesResponse> => {
  try {
    const response = await apiClient.get(`/pages/process_pages/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching processed pages data:", error);
    throw error;
  }
};

export const test_pdf = async () => {
  try {
    const response = await apiClient.get("/test_pdf/");
    console.log("Test PDF response:", response);
    return response;
  } catch (error) {
    console.error("Error testing PDF:", error);
    throw error;
  }
};
