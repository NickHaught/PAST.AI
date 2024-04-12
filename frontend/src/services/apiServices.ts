import axios, { AxiosResponse } from "axios";
import { FileData,PDFDetail, ProcessedPagesResponse } from "./fileTypes";

const apiClient = axios.create({
  baseURL: "http://localhost:8000/api",
  
});


// * API CALL: pdfs
export const uploadFiles = async (filePaths: string[]): Promise<FileData[]> => {
  const data = {
    name: "TEST",
    file: filePaths,
  };
  try {
    const response = await apiClient.post<FileData[]>("/pdfs/", data);
    console.log("File paths uploaded successfully");
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
      return response.data;  // Return the data for further processing
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      throw error;  // Rethrow the error to handle it in the component
    }
  };


// * API CALL: getProcessedInfo/{id}
export const getProcessedInfo = async (Id: number): Promise<ProcessedPagesResponse> => {
  try {
    const response = await apiClient.get(`/processed_pages/${Id}/`);
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
