import React from "react";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageDisplay from "./Document";
import PageData from "./PageData";
import SaveButton from "./SaveButton";
import { PDFDetail } from "../services/fileTypes";

interface OutputCardProps {
  selectedPDF: PDFDetail | null;
  selectedPageIds: number[];
}

const OutputCard: React.FC<OutputCardProps> = ({
  selectedPDF,
  selectedPageIds,
}) => {
  const handleSavePageData = (pageId: number, jsonOutput: any) => {
    console.log("Saving page data for Page ID:", pageId, "Data:", jsonOutput);
  };

  console.log("Page Ids", selectedPageIds);

  return (
    <div className="flex flex-col bg-gray rounded-xl p-6">
      <h1>Output</h1>
      <div className="flex justify-between items-center">
        <InnerNavbar navItems={["PDF", "Editor"]} />
        <SaveButton />
      </div>

      <InnerContainer>
        {selectedPDF ? (
          selectedPDF.pages.length > 0 ? (
            <>
              <PageData
                pages={selectedPDF.pages.filter((page) =>
                  selectedPageIds.includes(page.id)
                )}
                onSave={handleSavePageData}
              />
              {selectedPDF.pages.map((page) => (
                <ImageDisplay
                  key={page.id}
                  imagePath={page.high_res_image}
                  text={`Page ${page.page_number}`}
                />
              ))}
            </>
          ) : (
            <ImageDisplay
              imagePath="Test_page_1_thumbnail.png"
              text="This PDF contains no pages."
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
