import React, { useState, useEffect, useRef } from "react";
import { IoDocumentText, IoEye, IoEyeOff } from "react-icons/io5";
import { FileData } from "../services/fileTypes";
import { LuFileWarning } from "react-icons/lu";

interface Props {
  files: FileData[];
  onSelectPDF: (file: FileData) => void;
}

const PDFList = ({ files, onSelectPDF }: Props) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [columnsClass, setColumnsClass] = useState('grid-cols-2'); // Default grid
  const [showScanned, setShowScanned] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        if (width < 400) {
          setColumnsClass('grid-cols-2');
        } else if (width >= 400 && width < 600) {
          setColumnsClass('grid-cols-3');
        } else {
          setColumnsClass('grid-cols-4');
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const filteredFiles = files.filter(file => showScanned ? file.scanned : true);

  return (
    <div>
      <button 
        onClick={() => setShowScanned(!showScanned)}
        className="absolute top-0 left-0 m-2 text-white text-xl hover:border-blue bg-light-gray focus:outline-none rounded-lg text-lg p-1 z-10 transition duration-300"
        title={showScanned ? "Show All" : "Show Scanned Only"}>
        {showScanned ? <IoEyeOff /> : <IoEye />}
      </button>

      {filteredFiles.length > 0 ? (
        <div ref={containerRef} className={`grid ${columnsClass} gap-8 p-8 w-full pb-96 overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh]`}>
          {filteredFiles.map((file, index) => (
            <div
              key={index}
              className="flex flex-col items-center hover:bg-hover-light-gray p-2 rounded cursor-pointer transition duration-150 ease-in-out"
              title={file.name}
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
                {file.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-5 text-white">Nothing to display.</div>
      )}
    </div>
  );
};

export default PDFList;



