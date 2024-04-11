import React, { useState, useEffect } from "react";
import { ProcessedPage, JsonOutput } from "../services/fileTypes";

interface PageDataProps {
  processedPages: ProcessedPage[];
  onSave: (updatedPageData: ProcessedPage, updatedJsonOutput: JsonOutput) => void;
}

const PageData: React.FC<PageDataProps> = ({ processedPages, onSave }) => {
  const [editedPages, setEditedPages] = useState<{ [key: number]: ProcessedPage }>({});

  useEffect(() => {
    // Set initial height of text areas based on content
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea.auto-resize');
    textareas.forEach((textarea) => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    });
  }, [processedPages]);

  const handleInputChange = (pageId: number, field: keyof JsonOutput, value: string) => {
    setEditedPages((prevEditedPages) => ({
      ...prevEditedPages,
      [pageId]: {
        ...prevEditedPages[pageId],
        json_output: {
          ...prevEditedPages[pageId]?.json_output,
          [field]: value
        }
      }
    }));
  };

  const handleSavePageData = () => {
    Object.keys(editedPages).forEach((pageId) => {
      const updatedPageData = editedPages[parseInt(pageId)];
      onSave(updatedPageData, updatedPageData.json_output);
    });
  };

  return (
    <div className="overflow-scroll overflow-y-auto overflow-x-hidden scrollbar-webkit max-h-[75vh] pb-96 p-4">
      {processedPages.map((processedPage) => (
        <div key={processedPage.page_id} className="p-4 rounded-lg bg-lighter-gray mb-4">
          <div className="text-sm mb-4">Page {processedPage.page_id}</div>
          <div className="font-bold">Title:</div>
          <textarea
            rows={1}
            value={editedPages[processedPage.page_id]?.json_output.title ?? processedPage.json_output.title}
            className="bg-lightest-gray mt-2 px-3 py-2 rounded mb-3 w-full auto-resize"
            onChange={(e) => handleInputChange(processedPage.page_id, "title", e.target.value)}
          />
          <div className="font-bold">Body:</div>
          <textarea
            rows={1}
            value={editedPages[processedPage.page_id]?.json_output.content ?? processedPage.json_output.content}
            className="bg-lightest-gray mt-2 px-3 py-2 rounded w-full auto-resize"
            onChange={(e) => handleInputChange(processedPage.page_id, "content", e.target.value)}
          />
        </div>
      ))}
      <button 
        onClick={handleSavePageData} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
      >
        Save
      </button>
    </div>
  );
};

export default PageData;










