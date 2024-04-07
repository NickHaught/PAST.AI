import axios, { AxiosResponse } from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// * API CALL: upload 
export const uploadFiles = async (formData: FormData): Promise<AxiosResponse<any>> => {
    try {
        const response = await apiClient.post("/test_upload/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log("Files uploaded successfully");
        return response;  // Return the response for further processing
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error;  // Rethrow the error to handle it in the calling component
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