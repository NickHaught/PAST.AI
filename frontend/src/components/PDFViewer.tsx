import { useEffect, useState } from "react";
import { PDFDetail, Page } from "../services/fileTypes";
import { fetchPDFDetails } from "../services/apiServices";

interface Props {
  file: { id: number; name: string };
  onPDFSelect: (pdfDetail: PDFDetail) => void;
}

const PDFViewer = ({ file, onPDFSelect }: Props) => {
  const [pdfDetail, setPdfDetail] = useState<PDFDetail | null>(null);

  useEffect(() => {
    console.log("Fetching details for PDF with ID:", file.id);
    if (file.id) {
      fetchPDFDetails(file.id)
        .then((data: PDFDetail) => {
          console.log("Received PDF details:", data);
          setPdfDetail(data);
          onPDFSelect(data);
        })
        .catch((error) => {
          console.error("Error fetching high-res images:", error);
        });
    }
  }, [file.id, onPDFSelect]);

  if (!pdfDetail || !pdfDetail.pages) {
    return <div>No PDF detail found</div>;
  }

  return (
    <div className="overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh] pb-96">
      {pdfDetail.pages.map((page: Page) => (
        <div key={page.id}>
          <img
            src={page.thumbnail}
            alt={`Document Page ${page.page_number}`}
            className="w-full h-auto mb-1"
          />
        </div>
      ))}
    </div>
  );
};

export default PDFViewer;
