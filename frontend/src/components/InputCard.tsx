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
import {
  FileData,
  PDFDetail,
  ProcessedPagesResponse,
} from "../services/fileTypes";
import {
  fetchPDFDetails,
  fetchPDFs,
  processPages,
} from "../services/apiServices";

interface Props {
  onToggleAuto: () => void;
  width: number;
  onPDFSelect: (pdfDetail: PDFDetail) => void;
  clearSelectedPDF: () => void;
  onScan: (pageIds: number[]) => void;
  updateScanResults: (results: ProcessedPagesResponse | null) => void;
  updateScanStatus: (status: boolean) => void;
}

const InputCard = ({
  width,
  onPDFSelect,
  clearSelectedPDF,
  onScan,
  updateScanResults,
  updateScanStatus,
  onToggleAuto,
}: Props) => {
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
  const [status, setScanStatus] = useState<boolean>(false);

  const handleUploadComplete = (
    input:
      | FileData[]
      | { files: FileData[]; next: string | null; prev: string | null }
  ) => {
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
    setScanStatus(true);
    updateScanStatus(true);
    console.log("(INPUT) Selected pages for scanning:", selectedPages);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 5000 ms = 5 seconds delay

    try {
      const output = await processPages(selectedPages);
      console.log("PDF details fetched successfully:", output);
      setScanStatus(false);
      updateScanStatus(false);
      updateScanResults(output);
    } catch (error) {
      console.error("Error fetching PDF details:", error);
      setStatusMessage({
        type: "error",
        message: "Failed to fetch PDF details.",
      });
      setScanStatus(false);
      updateScanStatus(false);
    }
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
            if (files.length > 0) {
              // Ensure Home is only clickable when there are files
              setView("list");
              clearSelectedPDF();
            }
          }}
          onPDFClick={() => {
            if (selectedPDF) {
              setView("viewer");
              onPDFSelect(selectedPDF);
            }
          }}
          activeView={view}
          disableHome={files.length === 0} // Disable Home button when there are no files
          disablePDF={!selectedPDF} // Disable PDF button when there is no selected PDF
        />
        <div className="flex">
          <OpenFolderButton
            onUploadComplete={handleUploadComplete}
            setStatusMessage={setStatusMessage}
            setLoading={setLoading}
          />
          <OpenDatabaseButton
            onDocumentsFetched={(data) => {
              handleUploadComplete(data);
              clearSelectedPDF();
              setStatusMessage({
                type: "success",
                message: "PDFs fetched successfully from the database.",
              });
            }}
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
        onToggleAuto={onToggleAuto}
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
