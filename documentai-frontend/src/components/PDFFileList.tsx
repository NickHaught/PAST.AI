import axios from "axios";
import { useState } from "react";
import { IoDocumentText } from "react-icons/io5";

interface Props {
  files: File[]; // Now expecting an array of File objects
  uploadUrl: string;
  onUploadSuccess: (fileName: string) => void;
}

const PDFFileList = ({ files, uploadUrl, onUploadSuccess }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        console.log(`${file.name} uploaded successfully`);
        onUploadSuccess(file.name); // Notify the parent component
      } else {
        console.error(`Upload failed for ${file.name}`);
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
    }
  };

  return (
    <div className="overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh]">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 p-5">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex flex-col items-center hover:bg-hover-light-gray p-2 rounded cursor-pointer transition duration-150 ease-in-out"
            title={file.name}
            onClick={() => handleFileUpload(file)}
            onMouseEnter={() => setHoveredIndex(index)} // Set this item as hovered
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <IoDocumentText
              className={`w-16 h-16 transition duration-150 ease-in-out ${
                hoveredIndex === index ? "text-blue" : "text-current"
              }`}
            />
            <span className="text-sm text-center truncate w-full mt-2">
              {file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFFileList;
