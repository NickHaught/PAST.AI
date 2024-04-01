import React, { useRef, useState, ChangeEvent } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { useFiles } from "../contexts/FilesContext";
import { uploadFiles } from "../services/apiServices";
import axios from "axios";

interface Props {
  onUploadComplete: (fileNames: string[]) => void;
}

<<<<<<< HEAD
interface CustomInputAttributes extends React.HTMLProps<HTMLInputElement> {
  webkitdirectory?: string;
}

// ! Issue when canceling an upload, current directory is reset

const OpenFolderButton = ({ onUploadComplete }: Props) => {
=======
const OpenFolderButton = ({ className }: Props) => {
>>>>>>> 80d94424b2e4be6569d26a21b70e88328690897c
  const { setFiles } = useFiles();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

<<<<<<< HEAD
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const formData = new FormData();

    for (let file of files) {
      formData.append("files", file, file.webkitRelativePath || file.name);
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/test_upload/",
        formData
      );
      console.log("Files uploaded successfully");
      onUploadComplete(response.data.pdfNames);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleFileChdange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const pdfFiles = Array.from(files);
      console.log(pdfFiles);
      setFiles(pdfFiles);
=======
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
>>>>>>> 80d94424b2e4be6569d26a21b70e88328690897c

      try {
        const response = await uploadFiles(pdfFiles);
        if (response.status === 200) {
          setUploadStatus("Files uploaded successfully.");
<<<<<<< HEAD
          onUploadComplete(response.data.pdfNames);
        } else {
          setUploadStatus("Upload failed with status: " + response.status);
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        setUploadStatus("An error occurred during upload.");
      }
    } else {
      console.error("No files selected.");
      setUploadStatus("No files were selected. Please select files to upload.");
=======
        } else {
          // Handle any responses that didn't throw an error but aren't success status
          setUploadStatus("Upload completed with unexpected status.");
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an AxiosError and has a response
          if (error.response.status === 400) {
            setUploadStatus(
              "Bad request. Please check the files and try again."
            );
          } else {
            // Handle other errors
            setUploadStatus(`An error occurred: ${error.response.status}`);
          }
        } else {
          // Error is not from Axios or doesn't have a response
          setUploadStatus("An unexpected error occurred.");
        }
      }
    } else {
      console.error("No PDF files selected.");
      setUploadStatus(
        "No PDF files were selected. Please select PDF files to upload."
      );
>>>>>>> 80d94424b2e4be6569d26a21b70e88328690897c
    }
  };

  return (
    <>
      <button
<<<<<<< HEAD
        className=" text-white flex items-center space-x-2 bg-light-gray hover:bg-light-gray text-sm py-1 px-2 rounded-lg mr-2 focus:outline-none hover:border-blue transition duration-150 ease-in-out"
=======
        className={`primary-text flex items-center space-x-2 bg-hover-gray hover:bg-hover-gray text-sm py-1 px-2 rounded-lg focus:outline-none hover:border-blue transition duration-150 ease-in-out ${className}`}
>>>>>>> 80d94424b2e4be6569d26a21b70e88328690897c
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
