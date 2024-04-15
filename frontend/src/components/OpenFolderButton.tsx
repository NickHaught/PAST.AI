import React, { useRef, ChangeEvent } from "react";
import { FaArrowAltCircleUp } from "react-icons/fa";
import { uploadFiles } from "../services/apiServices";
import { FileData } from "../services/fileTypes";

interface Props {
  onUploadComplete: (uploadedFiles: FileData[]) => void;
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

const OpenFolderButton = ({
  onUploadComplete,
  setStatusMessage,
  setLoading,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setLoading(true);
    const allFiles = Array.from(event.target.files);

    try {
      const files = await uploadFiles(allFiles);
      console.log("File paths uploaded successfully");
      onUploadComplete(files);
      setStatusMessage({
        type: "success",
        message: "File paths uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading file paths:", error);
      setStatusMessage({
        type: "error",
        message: "Error uploading file paths",
      });
    } finally {
      setLoading(false);
      event.target.value = ""; // Reset the input to allow re-upload of the same files
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
