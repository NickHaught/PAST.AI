import { useState } from "react";
import { IoDocumentText } from "react-icons/io5";

interface Props {
  files: string[];
  onSelectPDF: (file: string) => void;
}

const PDFList = ({ files, onSelectPDF }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col justify-center items-center overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh]">
      {files.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-8 p-5 w-full">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex flex-col items-center hover:bg-hover-light-gray p-2 rounded cursor-pointer transition duration-150 ease-in-out"
              title={file}
              onClick={() => onSelectPDF(file)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <IoDocumentText
                className={`w-16 h-16 transition duration-150 ease-in-out ${
                  hoveredIndex === index ? "text-blue" : "text-off-white"
                }`}
              />
              <span className="text-off-white text-sm text-center truncate w-full mt-2">
                {file}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5">
          <p className="text-white">Please upload a folder containing PDFs.</p>
        </div>
      )}
    </div>
  );
};

export default PDFList;
