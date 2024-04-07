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

interface Props {
  width: number;
}

type filename = string;

const InputCard = ({ width }: Props) => {
  const [view, setView] = useState<"list" | "viewer" | null>("list");
  const [fileNames, setFileNames] = useState<filename[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<filename | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null); // State for status message
  const [loading, setLoading] = useState<boolean>(false);


  const handleUploadComplete = (uploadedFileNames: string[]) => {
    setFileNames(uploadedFileNames);
    setLoading(false);
    setView("list");
  };

  const handlePDFSelect = (pdf: filename) => {
    setSelectedPDF(pdf);
    setView("viewer"); // Switch to the PDF viewer view
  };

  const clearStatusMessage = () => {
    setStatusMessage(null);
  };

  return (
    <div
      className="flex flex-col bg-gray rounded-xl p-6"
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
          onHomeClick={() => setView("list")}
          onPDFClick={() => selectedPDF && setView("viewer")}
          activeView={view}
        />
        <div className="flex">
          {" "}
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
