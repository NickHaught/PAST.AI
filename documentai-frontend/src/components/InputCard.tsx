import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageTest from "./Document";
import OpenFolderButton from "./OpenFolderButton";
import PDFFileList from "./PDFFileList";
import { useState } from "react";
import { useContext } from "react";
import { uploadUrlContext } from "../contexts/Context"; // Import the context
import { useFiles } from "../contexts/FilesContext";

interface Props {
  width: number;
}

const InputCard = ({ width }: Props) => {
  const uploadUrl = useContext(uploadUrlContext);
  const { files } = useFiles();

  const [isVisibility, setIsVisibility] = useState<"document" | "pdfList">(
    "pdfList"
  );

  return (
    <div
      className="flex flex-col bg-primary-gray rounded-xl p-6"
      style={{ width: `${width}px` }}
    >
      <h1>Input</h1>
      <InnerNavbar navItems={["Home", "PDF"]} />
      <OpenFolderButton className="absolute top-20 right-10 z-10" />
      <InnerContainer>
        {isVisibility === "pdfList" ? (
          <PDFFileList
            files={files}
            uploadUrl={uploadUrl}
            onUploadSuccess={() => setIsVisibility("pdfList")}
          />
        ) : (
          <ImageTest imagePath={"/hebronsign.jpg"} />
        )}
      </InnerContainer>
    </div>
  );
};

export default InputCard;
