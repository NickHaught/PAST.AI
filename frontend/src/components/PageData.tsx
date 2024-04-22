import React, { useState, useEffect } from "react";
import { PDFDetail } from "../services/fileTypes";
import InputLoader from "./InputLoader";  // Import the loader component

interface PageDataProps {
  pages: PDFDetail["pages"];
  onSave: (pageId: number, jsonOutput: any) => void;
  onEdit: (edits: { [key: number]: any }) => void;
  scanStatus: boolean;  // Assuming this is a global scan status, adjust if page-specific
}

const PageData: React.FC<PageDataProps> = ({ pages, onSave, onEdit, scanStatus }) => {
  const [editedPages, setEditedPages] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>("textarea.auto-resize");
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [pages]);

  useEffect(() => {
    onEdit(editedPages);
  }, [editedPages, onEdit]);

  const handleInputChange = (pageId: number, field: keyof any, value: string) => {
    setEditedPages(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [field]: value,
      },
    }));
  };

  const handleSavePageData = (pageId: number) => {
    if (editedPages[pageId]) {
      onSave(pageId, editedPages[pageId]);
    }
  };

  return (
    <div className="overflow-scroll text-white overflow-y-auto overflow-x-hidden scrollbar-webkit max-h-[75vh] pb-96 p-4">
      {pages.map((page) => (
        <div key={page.id} className="p-4 rounded-lg bg-lighter-gray mb-4">
          <div className="text-sm mb-4">Page {page.page_number}</div>
          {scanStatus ? (
            <InputLoader />  // Display the loading indicator when scanning
          ) : page.json_output ? (
            <>
              <div className="font-bold">Title:</div>
              <textarea
                rows={1}
                value={editedPages[page.id]?.title ?? page.json_output.title}
                className="bg-lightest-gray mt-2 px-3 py-2 rounded mb-3 w-full auto-resize overflow-y-auto overflow-x-hidden scrollbar-webkit overflow-scroll"
                onChange={(e) => handleInputChange(page.id, "title", e.target.value)}
              />
              <div className="font-bold">Body:</div>
              <textarea
                rows={1}
                value={editedPages[page.id]?.content ?? page.json_output.content}
                className="bg-lightest-gray mt-2 px-3 py-2 rounded w-full auto-resize overflow-y-auto overflow-x-hidden scrollbar-webkit overflow-scroll"
                onChange={(e) => handleInputChange(page.id, "content", e.target.value)}
              />
            </>
          ) : (
            <p className="text-red-500">Unscanned page.</p>  // Show "Unscanned page" if not scanned and not currently scanning
          )}
        </div>
      ))}
    </div>
  );
};

export default PageData;
