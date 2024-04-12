import { useState, useContext } from "react";
import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageTest from "./Document";
import OpenFolderButton from "./OpenFolderButton";
import PDFFileList from "./PDFFileList";
import { uploadUrlContext } from "../contexts/Context";
import { useFiles } from "../contexts/FilesContext";
import OpenDatabaseButton from "./OpenDatabaseButton";
import PanelOverlay from "./PanelOverlay";

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
      className="flex flex-col bg-gray rounded-xl p-6"
      style={{ width: `${width}px` }}
    >
      <h1>Input</h1>
      <div className="flex justify-between items-center">
        <InnerNavbar navItems={["Home", "PDF"]} />
        <div className="flex">
          {" "}
          {/* This ensures buttons are next to each other */}
          <OpenFolderButton className="mr-2" /> {/* Right margin for spacing */}
          <OpenDatabaseButton />
        </div>
      </div>
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
      <PanelOverlay />
    </div>
  );
};

export default InputCard;
