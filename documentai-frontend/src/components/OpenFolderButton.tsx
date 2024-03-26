import { useRef, useState } from "react";
import { FaFolderClosed, FaFolderOpen } from "react-icons/fa6"; // Ensure correct import path
import { IoMdCloudUpload } from "react-icons/io";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { useFiles } from "../contexts/FilesContext";
import axios from "axios";
import { uploadFiles } from "../services/apiServices";

interface Props {
  className?: string;
}

const OpenFolderButton =  ({ className}: Props) => {
  const { setFiles } = useFiles();
  const [isHovered, setIsHovered] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const pdfFiles = files.filter(file => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      setFiles(pdfFiles); // Update the context with the selected PDF files
      try {
        const response = await uploadFiles(pdfFiles);
        if (response.status === 200) {
          setUploadStatus('Files uploaded successfully.');
        } else {
          // Handle any responses that didn't throw an error but aren't success status
          setUploadStatus('Upload completed with unexpected status.');
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Check if it's an AxiosError and has a response
          if (error.response.status === 400) {
            setUploadStatus('Bad request. Please check the files and try again.');
          } else {
            // Handle other errors
            setUploadStatus(`An error occurred: ${error.response.status}`);
          }
        } else {
          // Error is not from Axios or doesn't have a response
          setUploadStatus('An unexpected error occurred.');
        }
      }
    } else {
      console.error("No PDF files selected.");
      setUploadStatus('No PDF files were selected. Please select PDF files to upload.');
    }
  };

  return (
    <>
      <button
        className={`flex items-center space-x-2 bg-hover-gray hover:bg-hover-gray text-sm py-1 px-2 rounded-lg focus:outline-none hover:border-blue transition duration-150 ease-in-out ${className}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <FaArrowAltCircleUp />
        <span>Upload Folder</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory="true"
        accept="application/pdf"
        multiple
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default OpenFolderButton;



