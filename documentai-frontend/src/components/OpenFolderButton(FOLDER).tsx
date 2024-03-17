import React, { useRef, useState } from "react";
import axios from "axios";
import { FaFolderClosed, FaFolderOpen } from "react-icons/fa6";

declare module 'react' {
    interface InputHTMLAttributes<T> {
      webkitdirectory?: string;
    }
  }

interface Props {
  className?: string;
}

const OpenFolderButton = ({ className = "" }: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Specify the type of ref

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const formData = new FormData();

    if (files) {
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      try {
        const response = await axios.post(
          "http://localhost:8000/api/upload/",
          formData
        );
        if (response.status === 200) {
          console.log("Files uploaded successfully");
        } else {
          console.error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      }
    }
  };

  return (
    <>
      <button
        className={`flex items-center bg-hover-gray hover:bg-hover-gray text-sm py-1 px-2 focus:outline-none hover:border-blue transition-all ${className}`}
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isHovered ? (
          <FaFolderOpen className="mr-2 text-blue text-sm" /> // Add text-blue class to change the icon color
        ) : (
          <FaFolderClosed className="mr-2 text-sm" />
        )}
        Open Folder
      </button>
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory=""
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple
      />
    </>
  );
};

export default OpenFolderButton;
