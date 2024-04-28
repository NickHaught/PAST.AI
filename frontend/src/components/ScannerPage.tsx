import { useState, useEffect, SyntheticEvent } from "react";
import "react-resizable/css/styles.css";
import InputCard from "./InputCard";
import OutputCard from "./OutputCard";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { FaArrowsAltH } from "react-icons/fa";
import { PDFDetail, ProcessedPagesResponse } from "../services/fileTypes";
import "../css/transitions.css";

interface MainDocumentContainerProps {
  onToggleAuto: () => void;
}

const MainDocumentContainer = ({ onToggleAuto }:MainDocumentContainerProps) => {
  const [scanResults, setScanResults] = useState<ProcessedPagesResponse | null>(
    null
  );
  const initialWidth = window.innerWidth * 0.7;
  const [width, setWidth] = useState(initialWidth);
  const [minConstraints, setMinConstraints] = useState<[number, number]>([
    400, 300,
  ]);
  const [maxConstraints, setMaxConstraints] = useState<[number, number]>([
    window.innerWidth * 0.6,
    300,
  ]);
  const [selectedPDF, setSelectedPDF] = useState<PDFDetail | null>(null);
  const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);
  const [status, setScanStatus] = useState<boolean>(false);

  const handlePageSelection = (pageIds: number[]) => {
    console.log("Selected page IDs:", pageIds);
    setSelectedPageIds(pageIds);
  };

  const clearSelectedPDF = () => {
    setSelectedPDF(null);
  };

  useEffect(() => {
    const updateWidthAndConstraints = () => {
      const dynamicMinWidth = window.innerWidth * 0.3;
      const dynamicMaxWidth = Math.min(window.innerWidth * 0.6);

      setMinConstraints([dynamicMinWidth, 300]);
      setMaxConstraints([dynamicMaxWidth, 300]);

      const adjustedWidth = Math.min(window.innerWidth * 0.45, dynamicMaxWidth);
      setWidth(adjustedWidth);
    };

    window.addEventListener("resize", updateWidthAndConstraints);
    updateWidthAndConstraints(); // Update on mount to apply initial constraints

    return () => {
      window.removeEventListener("resize", updateWidthAndConstraints);
    };
  }, []); // No dependencies to avoid re-triggering by width changes

  const handleResize = (_e: SyntheticEvent, data: ResizeCallbackData) => {
    setWidth(data.size.width);
  };

  const updateScanResults = (results: ProcessedPagesResponse | null) => {
    setScanResults(results);
    console.log("Scan results received and updated in parent:", results);
  };

  const updateScanStatus = (status: boolean) => {
    setScanStatus(status);
    console.log("Scan status updated in parent:", status);
  }

  return (
    <div className="flex animate-fadeIn">
      <Resizable
        width={width}
        height={300}
        onResize={handleResize}
        resizeHandles={["e"]}
        className="flex"
        minConstraints={minConstraints}
        maxConstraints={maxConstraints}
      >
        <div className="mr-4">
          <InputCard
            onToggleAuto={onToggleAuto}
            width={width}
            onPDFSelect={setSelectedPDF}
            clearSelectedPDF={clearSelectedPDF}
            onScan={handlePageSelection}
            updateScanResults={updateScanResults}
            updateScanStatus={updateScanStatus}
          />
        </div>
      </Resizable>

      <div className="flex">
        <OutputCard
          selectedPDF={selectedPDF}
          selectedPageIds={selectedPageIds}
          scanResults={scanResults}
          scanStatus={status}
        />
      </div>
    </div>
  );
};

export default MainDocumentContainer; //<OutputCard selectedPDF={selectedPDF}/>
