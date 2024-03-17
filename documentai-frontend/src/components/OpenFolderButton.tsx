import React, { useRef, useState } from "react";
import { FaFolderClosed, FaFolderOpen } from "react-icons/fa6"; // Ensure correct import path
import { useFiles } from "../contexts/FilesContext";

interface Props {
  className?: string;
}

const OpenFolderButton: React.FC<Props> = ({ className = "" }) => {
  const { setFiles } = useFiles();
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const pdfFiles = files.filter(file => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      setFiles(pdfFiles); // Update the context with the selected PDF files
    } else {
      console.error("No PDF files selected.");
    }
  };

  return (
    <>
      <button
        className={`flex items-center space-x-2 bg-hover-gray hover:bg-hover-gray text-sm py-1 px-2 rounded-lg focus:outline-none hover:border-blue transition duration-150 ease-in-out ${className}`}
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isHovered ? <FaFolderOpen className="text-blue" /> : <FaFolderClosed />}
        <span>Open Folder</span>
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



