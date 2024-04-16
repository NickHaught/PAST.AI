import React, { useEffect, useState } from "react";
import { PDFDetail } from "../services/fileTypes";
import { fetchPDFDetails } from "../services/apiServices";
import { FaRegCircle, FaCheckCircle, FaSquare } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";

interface Props {
  pdfDetail: PDFDetail;
  onPDFSelect: (pdfDetail: PDFDetail) => void;
  onScan: (pageIds: number[]) => void;
}

const PDFViewer = ({ pdfDetail, onScan }: Props) => {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false);

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

  if (!pdfDetail || !pdfDetail.pages) {
    return <div>No PDF detail found</div>;
  }

  const displayedPages = isSelectMode
    ? pdfDetail.pages
    : pdfDetail.pages.filter((page) => selectedPages.includes(page.id));

  return (
    <div className="relative">
      <button
        onClick={() => setIsSelectMode(!isSelectMode)}
        className="absolute top-0 left-0 m-2 text-white bg-light-gray focus:outline-none rounded-lg text-lg p-1 z-10 transition duration-300"
      >
        <div className="transition duration-300 ease-in-out">
          {isSelectMode ? <IoGrid /> : <FaSquare />}
        </div>
      </button>

      <div
        className={`overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh] ${
          isSelectMode ? "grid grid-cols-2 gap-4" : ""
        } pb-96`}
      >
        {displayedPages && displayedPages.length > 0 ? (
          displayedPages.map((page) => (
            <div
              key={page.id}
              className={`relative ${
                isSelectMode ? "cursor-pointer p-2.5" : ""
              } ${selectedPages.includes(page.id) ? "bg-blue-200" : ""} `}
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
              <img
                src={page.thumbnail}
                alt={`Page ${page.thumbnail}`}
                className="w-full h-auto rounded-lg"
              />
              <div className="text-center bg-light-gray pb-4 pt-1">{`Page ${page.page_number}`}</div>
            </div>
          ))
        ) : (
          <div className="text-center p-5">No pages selected.</div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
