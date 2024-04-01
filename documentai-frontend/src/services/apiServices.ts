import axios, { AxiosResponse } from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// * API CALL: upload 
export const uploadFiles = async (files: File[]): Promise<AxiosResponse<any>> => {
    const formData = new FormData();
    files.forEach((file) => {
        console.log(`File name: ${file.name}, File type: ${file.type}, File size: ${file.size}`);
        formData.append('files', file, file.name);
    });

    try {
        const response = await apiClient.post("/test_upload/", formData);
        console.log("Files uploaded successfully");
        return response;
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error; // Rethrow the error for further handling in the component
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
}


// * API CALL: upload 