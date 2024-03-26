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
    files.forEach((file, index) => {
        formData.append(`file${index}`, file, file.name);
    });

    try {
        const response = await apiClient.post("/upload/", formData, {
            headers: {
            },
        });
        console.log("Files uploaded successfully");
        return response;
    } catch (error) {
        console.error("Error uploading files:", error);
        throw error; // Rethrow the error for further handling in the component
    }
};

// * API CALL: upload 