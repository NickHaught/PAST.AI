import React, { useEffect, useState } from "react";
import { PDFDetail } from "../services/fileTypes";
import { FaRegCircle, FaCheckCircle, FaSquare, FaTrash } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";

interface Props {
  pdfDetail: PDFDetail;
  onPDFSelect: (pdfDetail: PDFDetail) => void;
  onScan: (pageIds: number[]) => void;
}

const PDFViewer = ({ pdfDetail, onScan }: Props) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // State to manage dropdown visibility

  useEffect(() => {
    if (pdfDetail && pdfDetail.pages && pdfDetail.pages.length > 1) {
      setSelectedPages([pdfDetail.pages[1].id]);
    }
  }, [pdfDetail]);

  const togglePageSelection = (pageId: number) => {
    setSelectedPages((prev) => {
      const newSelectedPages = prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId];
      return newSelectedPages;
    });
  };

  useEffect(() => {
    onScan(selectedPages);
  }, [selectedPages, onScan]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  if (!pdfDetail || !pdfDetail.pages) {
    return <div>No PDF detail found</div>;
  }

  const displayedPages = isSelectMode
    ? pdfDetail.pages
    : pdfDetail.pages.filter((page) => selectedPages.includes(page.id));

  return (
    <div className="relative text-white">
      <button
        onClick={() => setIsSelectMode(!isSelectMode)}
        className="absolute top-0 left-0 m-2 text-white bg-light-gray hover:border-blue focus:outline-none rounded-lg text-lg p-1 z-10 transition duration-300"
      >
        {isSelectMode ?  <FaSquare />: <IoGrid />}
      </button>
      <button
        onClick={toggleDropdown}
        className="absolute top-0 right-3 text-white bg-light-gray text-sm hover:border-blue focus:outline-none rounded-lg mt-2 p-1 px-2 mr-10 z-10"
      >
        Details
      </button>
      <button
        className="absolute top-0 right-3 text-red-500 bg-light-gray hover:border-blue focus:outline-none rounded-lg mt-2 p-1.5 px-2 z-10"
        onClick={() => console.log("Delete functionality here")} // Placeholder for delete functionality
      >
        <FaTrash />
        </button>
      {isDropdownOpen && (
        <div className="absolute top-10 right-3 text-white bg-light-gray rounded-lg p-2 text-sm z-20">
          <p><strong>Name:</strong> {pdfDetail.name}</p>
          <p><strong>Pages:</strong> {pdfDetail.pages.length}</p>
          <p><strong>Validated:</strong> True</p>
          
        </div>
      )}
      
      <div
        className={`overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh] ${
          isSelectMode ? "grid grid-cols-2 p-8" : ""
        } pb-96`}
      >
        {displayedPages.map((page) => (
          <div
            key={page.id}
            className={`relative ${isSelectMode ? "cursor-pointer p-2.5" : ""}`}
            onClick={() => isSelectMode && togglePageSelection(page.id)}
          >
            {isSelectMode && (
              <div className="absolute top-1 right-1 p-2.5">
                {selectedPages.includes(page.id) ? (
                  <FaCheckCircle className="text-blue" />
                ) : (
                  <FaRegCircle className="text-blue" />
                )}
              </div>
            )}
            {page.scanned && isSelectMode && (
              <div className="absolute top-4 left-4 bg-green-500 text-xs rounded-lg text-white p-1">Scanned</div>
            )}
            <img
              src={page.high_res_image}
              alt={`Page ${page.thumbnail}`}
              className="w-full h-auto rounded-lg"
            />
            <div className="text-center bg-light-gray pb-4 pt-1">{`Page ${page.page_number}`}</div>
          </div>
        ))}
        {displayedPages.length === 0 && (
          <div className="text-center p-5 text-white">No pages selected.</div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;







