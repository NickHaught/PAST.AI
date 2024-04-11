import React, { useEffect, useState } from "react";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import {
  PDFDetail,
  ProcessedPagesResponse,
  ProcessedPage,
  JsonOutput,
} from "../services/fileTypes";
import { getProcessedInfo } from "../services/apiServices";
import ImageDisplay from "./Document";
import PageData from "./PageData";
import SaveButton from "./SaveButton";

interface OutputCardProps {
  selectedPDF: PDFDetail | null;
}

const OutputCard: React.FC<OutputCardProps> = ({ selectedPDF }) => {
  const [processedData, setProcessedData] =
    useState<ProcessedPagesResponse | null>(null);

  useEffect(() => {
    if (selectedPDF?.id) {
      getProcessedInfo(selectedPDF.id)
        .then(setProcessedData)
        .catch((error: any) =>
          console.error("Failed to fetch processed pages data", error)
        );
    }
  }, [selectedPDF]);

  const handleSavePageData = (
    updatedPageData: ProcessedPage,
    updatedJsonOutput: JsonOutput
  ) => {
    console.log("Saving page data:", updatedJsonOutput);
  };

  return (
    <div className="flex flex-col bg-gray rounded-xl p-6">
      <h1>Output</h1>
      <div className="flex justify-between items-center"><InnerNavbar navItems={["PDF", "Editor"]} activeView="list"/>
      <SaveButton/></div>
      
      <InnerContainer loading={false}>
        {selectedPDF && processedData ? (
          processedData.status === 'unscanned' ? (
            <ImageDisplay
            imagePath="Test_page_1_thumbnail.png"
            text="Unscanned PDF"
            icon="LuFileWarning"
          />
          ) : (
            <>
              <PageData
                processedPages={processedData.processed_pages}
                onSave={handleSavePageData}
              />
              <ImageDisplay imagePath="Test_page_1_thumbnail.png" />
            </>
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

