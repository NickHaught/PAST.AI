import React, { useRef, useState, ChangeEvent } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { useFiles } from "../contexts/FilesContext";
import { uploadFiles } from "../services/apiServices";
import axios from "axios";

interface Props {
  onUploadComplete: (fileNames: string[]) => void;
}

interface CustomInputAttributes extends React.HTMLProps<HTMLInputElement> {
  webkitdirectory?: string;
}

const OpenFolderButton = ({ onUploadComplete }: Props) => {
  const { setFiles } = useFiles();
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

