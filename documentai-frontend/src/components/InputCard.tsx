import { useState } from "react";
import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import OpenFolderButton from "./OpenFolderButton";
import OpenDatabaseButton from "./OpenDatabaseButton";
import PanelOverlay from "./PanelOverlay";
import PDFList from "./PDFList";
import PDFViewer from "./PDFViewer";
import StatusMessage from "./StatusMessage";
import { FileData, PDFDetail } from "../services/fileTypes";

interface Props {
  width: number;
  onPDFSelect: (pdfDetail: PDFDetail) => void;
  clearSelectedPDF: () => void;
}

const InputCard = ({ width, onPDFSelect, clearSelectedPDF }: Props) => {
  const [view, setView] = useState<"list" | "viewer" | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<FileData | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUploadComplete = (uploadedFiles: FileData[]) => {
    setFiles(uploadedFiles);
    setLoading(false);
    setView("list");
  };

  const handlePDFSelect = (pdf: FileData) => {
    setSelectedPDF(pdf);
    setView("viewer");
  };

  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <div
      className="relative flex flex-col bg-gray rounded-xl p-6"
      style={{ width: `${width}px` }}
    >
      <div className="flex justify-between items-center">
        <h1>Input</h1>
        {statusMessage && (
          <StatusMessage
            status={statusMessage.type}
            message={statusMessage.message}
            onClose={clearStatusMessage}
          />
        )}
      </div>
      <div className="flex justify-between items-center">
        <InnerNavbar
          navItems={["Home", "PDF"]}
          onHomeClick={() => {
            setView("list");
            clearSelectedPDF();
          }}
          onPDFClick={() => selectedPDF && setView("viewer")}
          activeView={view}
        />
        <div className="flex">
          <OpenFolderButton
            onUploadComplete={handleUploadComplete}
            setStatusMessage={setStatusMessage}
            setLoading={setLoading}
          />
          <OpenDatabaseButton />
        </div>
      </div>
      <InnerContainer loading={loading}>
        {view === "list" ? (
          <PDFList files={files} onSelectPDF={handlePDFSelect} />
        ) : selectedPDF ? (
          <PDFViewer file={selectedPDF} onPDFSelect={onPDFSelect} />
        ) : null}
      </InnerContainer>
      <PanelOverlay className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2" />
    </div>
  );
};

export default InputCard;
