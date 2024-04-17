import React, { useEffect, useState } from "react";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import { PDFDetail } from "../services/fileTypes";
import { getProcessedInfo } from "../services/apiServices";
import ImageDisplay from "./Document";
import PageData from "./PageData";
import SaveButton from "./SaveButton";

interface OutputCardProps {
  selectedPDF: PDFDetail | null;
  selectedPageIds: number[];
}

const OutputCard = ({ selectedPDF, selectedPageIds }: OutputCardProps) => {
  const [processedData, setProcessedData] =
    useState<ProcessedPagesResponse | null>(null);

  const handleSavePageData = (pageId: number, jsonOutput: any) => {
    console.log("Saving page data for Page ID:", pageId, "Data:", jsonOutput);
  };

  console.log("Page Ids", selectedPageIds);

  return (
    <div className="flex flex-col bg-gray rounded-xl p-6">
      <h1>Output</h1>
      <div className="flex justify-between items-center">
        <InnerNavbar navItems={["Editor"]} />
        <SaveButton />
      </div>

      <InnerContainer>
        {selectedPDF ? (
          selectedPageIds.length > 0 ? (
            <>
              <PageData
                pages={selectedPDF.pages.filter((page) =>
                  selectedPageIds.includes(page.id)
                )}
                onSave={handleSavePageData}
              />
              <ImageDisplay imagePath="Test_page_1_thumbnail.png" />
            </>
          ) : (
            <ImageDisplay
              imagePath="Test_page_1_thumbnail.png"
              text="No pages selected."
              icon="LuFileWarning"
            />
          )
        ) : (
          <ImageDisplay
            imagePath="Test_page_1_thumbnail.png"
            text="No PDF selected."
            icon="GrDocumentPdf"
          />
        )}
      </InnerContainer>
    </div>
  );
};

export default OutputCard;
