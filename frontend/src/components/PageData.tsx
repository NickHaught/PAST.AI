import React, { useState, useEffect } from "react";
import { PDFDetail } from "../services/fileTypes";

interface PageDataProps {
  pages: PDFDetail["pages"]; // Referencing directly from PDFDetail type
  onSave: (pageId: number, jsonOutput: any) => void; // Updated to pass relevant data only
}

const PageData: React.FC<PageDataProps> = ({ pages, onSave }) => {
  const [editedPages, setEditedPages] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    // Initialize text areas with proper height
    const textareas = document.querySelectorAll<HTMLTextAreaElement>(
      "textarea.auto-resize"
    );
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    });
  }, [pages]);

  const handleInputChange = (
    pageId: number,
    field: keyof any,
    value: string
  ) => {
    setEditedPages((prev) => ({
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
          {page.json_output ? (
            <>
              <div className="font-bold">Title:</div>
              <textarea
                rows={1}
                value={editedPages[page.id]?.title || page.json_output.title}
                className="bg-lightest-gray mt-2 px-3 py-2 rounded mb-3 w-full auto-resize"
                onChange={(e) =>
                  handleInputChange(page.id, "title", e.target.value)
                }
              />
              <div className="font-bold">Body:</div>
              <textarea
                rows={1}
                value={
                  editedPages[page.id]?.content || page.json_output.content
                }
                className="bg-lightest-gray mt-2 px-3 py-2 rounded w-full auto-resize"
                onChange={(e) =>
                  handleInputChange(page.id, "content", e.target.value)
                }
              />
              <button
                onClick={() => handleSavePageData(page.id)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              >
                Save
              </button>
            </>
          ) : (
            <p className="text-red-500">Unscanned page.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PageData;
