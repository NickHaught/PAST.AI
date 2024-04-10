import { useState, useEffect, SyntheticEvent } from "react";
import "react-resizable/css/styles.css";
import InputCard from "./InputCard";
import OutputCard from "./OutputCard";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { FaArrowsAltH } from 'react-icons/fa';
import { PDFDetail } from "../services/fileTypes";

const MainDocumentContainer = () => {
  const initialWidth = window.innerWidth * 0.70; 
  const [width, setWidth] = useState(initialWidth);
  const [minConstraints, setMinConstraints] = useState<[number, number]>([
    400, 300,
  ]);
  const [maxConstraints, setMaxConstraints] = useState<[number, number]>([
    window.innerWidth * 0.60,
    300,
  ]); 
  const [selectedPDF, setSelectedPDF] = useState<PDFDetail | null>(null);

  const clearSelectedPDF = () => {
    setSelectedPDF(null);
  };

  useEffect(() => {
    const updateWidthAndConstraints = () => {
      const dynamicMinWidth = window.innerWidth * 0.30;
      const dynamicMaxWidth = Math.min(
        window.innerWidth * 0.60
      ); 

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

  return (
    <div className="flex">
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
          <InputCard width={width} onPDFSelect={setSelectedPDF} clearSelectedPDF={clearSelectedPDF}/>
        </div>
      </Resizable>

      <div className="flex">
        <OutputCard selectedPDF={selectedPDF}/>
      </div>
    </div>
  );
};

export default MainDocumentContainer;