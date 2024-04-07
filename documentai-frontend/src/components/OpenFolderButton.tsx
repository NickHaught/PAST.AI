import React, { useRef, useState, ChangeEvent } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { useFiles } from "../contexts/FilesContext";
import { uploadFiles } from "../services/apiServices";
import { prepareFormData } from "../services/fileUtils";
import axios from "axios";

interface Props {
  onUploadComplete: (fileNames: string[]) => void;
  setStatusMessage: (
    statusMessage: {
      type: "success" | "warning" | "error";
      message: string;
    } | null
  ) => void;
  setLoading: (loading: boolean) => void;
}

interface CustomInputAttributes extends React.HTMLProps<HTMLInputElement> {
  webkitdirectory?: string;
}

const OpenFolderButton = ({ onUploadComplete, setStatusMessage, setLoading }: Props) => {
  const { setFiles } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setLoading(true);

    const allFiles = Array.from(event.target.files);
    const pdfFiles = allFiles.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length === 0) {
      setStatusMessage({
        type: "error",
        message: "No PDF files found in the selected directory.",
      });
      return;
    }

    const formData = prepareFormData(pdfFiles);

    try {
      const response = await uploadFiles(formData);
      console.log("Files uploaded successfully");

      // Only set success or warning messages if files were actually processed

      if (pdfFiles.length !== allFiles.length) {
        setStatusMessage({
          type: "warning",
          message: "Non-PDF files excluded. Only PDFs uploaded.",
        });
      } else {
        setStatusMessage({
          type: "success",
          message: "PDF files uploaded successfully.",
        });
      }
      onUploadComplete(response.data.pdfNames);
    } catch (error: unknown) {
      console.error("Error uploading files:", error);

      // Check if error is an instance of an Error object and has a response property
      if (axios.isAxiosError(error)) {
        // Now we can safely access error.response, error.message, etc.
        if (!error.response) {
          setStatusMessage({
            type: "error",
            message: "No connection to the server.",
          });
        } else if (error.response.status === 500) {
          setStatusMessage({
            type: "error",
            message: "Server error during upload",
          });
        } else {
          setStatusMessage({
            type: "error",
            message: "Axios error during upload",
          });
        }
      } else {
        // Handle cases where the error is not an AxiosError (e.g., a programming error)
        setStatusMessage({
          type: "error",
          message: "Unexpected error occurred.",
        });
      }
    }
  };

  return (
    <>
      <button
        className="text-white flex items-center space-x-2 bg-light-gray hover:bg-light-gray text-sm py-1 px-2 rounded-lg mr-2 focus:outline-none hover:border-blue transition duration-150 ease-in-out"
        onClick={() => fileInputRef.current?.click()}
      >
        <FaArrowAltCircleUp />
        <span>Upload Folder</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
        {...({ webkitdirectory: "true" } as CustomInputAttributes)}
      />
    </>
  );
};

export default OpenFolderButton;
