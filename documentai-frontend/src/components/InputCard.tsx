import { useState } from "react";
import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import OpenFolderButton from "./OpenFolderButton";
import OpenDatabaseButton from "./OpenDatabaseButton";
import PanelOverlay from "./PanelOverlay";
import PDFList from "./PDFList";
import PDFViewer from "./PDFViewer";

interface Props {
  width: number;
}

type filename = string;

const InputCard = ({ width }: Props) => {
  const [view, setView] = useState<"list" | "viewer" | null>("list");
  const [fileNames, setFileNames] = useState<filename[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<filename | null>(null);

  const handleUploadComplete = (uploadedFileNames: string[]) => {
    setFileNames(uploadedFileNames);
    setView("list");
  };

  const handlePDFSelect = (pdf: filename) => {
    setSelectedPDF(pdf);
    setView("viewer"); // Switch to the PDF viewer view
  };

  return (
    <div
      className="flex flex-col bg-gray rounded-xl p-6"
      style={{ width: `${width}px` }}
    >
      <h1>Input</h1>
      <div className="flex justify-between items-center">
        <InnerNavbar
          navItems={["Home", "PDF"]}
          onHomeClick={() => setView("list")}
          onPDFClick={() => selectedPDF && setView("viewer")}
          activeView={view}
        />
        <div className="flex">
          {" "}
          <OpenFolderButton onUploadComplete={handleUploadComplete} />
          <OpenDatabaseButton />
        </div>
      </div>
      <InnerContainer>
        {view === "list" ? (
          <PDFList files={fileNames} onSelectPDF={handlePDFSelect} />
        ) : selectedPDF ? (
          <PDFViewer pdf={selectedPDF} />
        ) : null}
      </InnerContainer>
      <PanelOverlay />
    </div>
  );
};

export default InputCard;
