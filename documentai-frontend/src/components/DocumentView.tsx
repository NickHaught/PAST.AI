import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  file: string;
  width: number;
}

const DocumentView = ({ file, width }: Props) => {
  return (
      <Document file={file}>
        <Page pageNumber={1} width={width}/>
      </Document>
  );
};

export default DocumentView;
