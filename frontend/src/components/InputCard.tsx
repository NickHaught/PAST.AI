import { useCallback, useState } from "react";
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
import { fetchPDFDetails, fetchPDFs, processPages } from "../services/apiServices";

interface Props {
  width: number;
  onPDFSelect: (pdfDetail: PDFDetail) => void;
  clearSelectedPDF: () => void;
  onScan: (pageIds: number[]) => void;
}

const InputCard = ({ width, onPDFSelect, clearSelectedPDF, onScan }: Props) => {
  const [view, setView] = useState<"list" | "viewer" | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<FileData | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pdfDetail, setPdfDetail] = useState<PDFDetail | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);


  const handleUploadComplete = (input: FileData[] | { files: FileData[], next: string | null, prev: string | null }) => {
    let files, next, prev;
    if (Array.isArray(input)) {
      files = input;
      next = prev = null;
    } else {
      ({ files, next, prev } = input);
    }
    
    console.log("Files uploaded successfully:", files);
    setFiles(files);
    setNextPageUrl(next);
    setPrevPageUrl(prev);
    setLoading(false);
    setView("list");
  };

  const handlePDFChange = async (url: string) => {
    try {
      setLoading(true);
      const data = await fetchPDFs(url);
      setFiles(data.files);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.prev);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch PDFs:", error);
      setStatusMessage({ type: "error", message: "Failed to fetch PDFs." });
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (nextPageUrl) handlePDFChange(nextPageUrl);
  };

  const handlePrev = () => {
    if (prevPageUrl) handlePDFChange(prevPageUrl);
  };

  const handlePDFSelect = async (pdf: FileData) => {
    setLoading(true);
    try {
      const pdfDetails = await fetchPDFDetails(pdf.id);
      console.log("PDF details fetched successfully:", pdfDetails);
      onPDFSelect(pdfDetails);
      setSelectedPDF(pdf); // Store the selected PDF's basic info
      setPdfDetail(pdfDetails); // Store the fetched detailed info
      setView("viewer");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to fetch PDF details.",
      });
      setLoading(false);
    }
  };

  const handleScan = async (selectedPages: number[]) => {
    console.log("(INPUT) Selected pages for scanning:", selectedPages);
    const pdfDetails = await processPages(selectedPages);
    console.log("PDF details fetched successfully:", pdfDetails);
    
  };

  const handlePageSelection = (pageIds: number[]) => {
    console.log("Sending to Main", selectedPages);
    setSelectedPages(pageIds);
    onScan(pageIds);
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
          <OpenDatabaseButton
            onDocumentsFetched={handleUploadComplete} // Reuse existing handler or create a new one if needed
            setLoading={setLoading}
            setStatusMessage={setStatusMessage}
          />
        </div>
      </div>
      <InnerContainer loading={loading}>
        {view === "list" ? (
          <PDFList files={files} onSelectPDF={handlePDFSelect} />
        ) : selectedPDF ? (
          <PDFViewer
            pdfDetail={pdfDetail}
            onPDFSelect={onPDFSelect}
            onScan={handlePageSelection}
          />
        ) : null}
      </InnerContainer>
      <PanelOverlay
        onPrev={handlePrev}
        onNext={handleNext}
        className="absolute bottom-[40px] left-1/2 transform -translate-x-1/2"
        onScan={
          selectedPDF
            ? () => handleScan(selectedPages) //selectedPDF.pages.map((page) => page.id)
            : undefined
        }
      />
    </div>
  );
};

export default InputCard;
