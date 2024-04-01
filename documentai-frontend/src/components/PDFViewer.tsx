import React from "react";

interface Props {
  pdf: string;
}

const PDFViewer = ({ pdf }: Props) => {
  return (
    <div className="text-off-white">
      Viewing PDF: {pdf}
    </div>
  );
};

export default PDFViewer;
