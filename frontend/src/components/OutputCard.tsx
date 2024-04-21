import React, { useEffect, useState } from "react";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageDisplay from "./Document";
import PageData from "./PageData";
import SaveButton from "./SaveButton";
import { PDFDetail, ProcessedPagesResponse } from "../services/fileTypes";
import { mergeScanResultsIntoPDFDetail } from "../services/merge";

interface OutputCardProps {
  selectedPDF: PDFDetail | null;
  selectedPageIds: number[];
  scanResults: ProcessedPagesResponse | null;
}

const OutputCard = ({
  selectedPDF,
  selectedPageIds,
  scanResults,
}: OutputCardProps) => {
  const [processedData, setProcessedData] = useState<PDFDetail | null>(null);
  const [allEdits, setAllEdits] = useState<{ [key: number]: any }>({});

  // Update processedData anytime the selectedPDF changes
  useEffect(() => {
    setProcessedData(selectedPDF); // Always reflect the currently selected PDF
  }, [selectedPDF]);

  // Apply scan results to processedData only when scanResults update
  useEffect(() => {
    if (scanResults && selectedPDF) {
      const updatedPDFDetail = mergeScanResultsIntoPDFDetail(
        selectedPDF,
        scanResults
      );
      console.log("Updated PDF Detail with scan results:", updatedPDFDetail);
      setProcessedData(updatedPDFDetail);
    }
  }, [scanResults]); // Only react to changes in scanResults

  const handleEdit = (edits: { [key: number]: any }) => {
    setAllEdits(edits);
  };

  const handleSaveAllPages = () => {
    console.log("Button clicked to save all pages.", allEdits);
  };

  return (
    <div className="flex flex-col bg-gray rounded-xl p-6">
      <h1>Output</h1>
      <div className="flex justify-between items-center">
        <InnerNavbar navItems={["Editor"]} />
        <SaveButton onSave={handleSaveAllPages} />
      </div>

      <InnerContainer>
        {processedData ? (
          selectedPageIds.length > 0 ? (
            <>
              <PageData
                pages={processedData.pages.filter((page) =>
                  selectedPageIds.includes(page.id)
                )}
                onSave={handleSaveAllPages}
                onEdit={handleEdit}
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
