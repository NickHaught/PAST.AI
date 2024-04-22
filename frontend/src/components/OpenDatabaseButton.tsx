import { FaDatabase } from "react-icons/fa";
import { fetchDocuments } from "../services/apiServices";
import { FileData } from "../services/fileTypes";

interface Props {
  onDocumentsFetched: (documents: FileData[]) => void;
  setLoading: (loading: boolean) => void;
  setStatusMessage: (message: {
    type: "success" | "error";
    message: string;
  }) => void;
  className?: string;
}

const OpenDatabaseButton = ({
  className,
  onDocumentsFetched,
  setLoading,
  setStatusMessage,
}: Props) => {
  const handleButtonClick = async () => {
    console.log("Open Database Button Clicked");
    setLoading(true);
    try {
      const response = await fetchDocuments(40, false); // Default parameters are used here
      console.log("Documents fetched successfully:", response);
      if (response.results.length === 0) {
        setStatusMessage({
          type: "error",
          message: "No files found in the database."
        });
      } else {
         onDocumentsFetched({
        files: response.results,
        next: response.links.next,
        prev: response.links.previous,
      });
      setStatusMessage({
        type: "success",
        message: "PDFs fetched successfully.",
      });
      }
     
      
    } catch (error) {
      console.error("Error fetching documents:", error);
      setStatusMessage({ type: "error", message: "Error fetching documents." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`text-white flex items-center bg-light-gray space-x-2 text-sm py-1 px-2 rounded-lg hover:border-blue focus:outline-none ${className}`}
      title="Open Database"
      onClick={handleButtonClick}
    >
      <FaDatabase className="text-white" />
    </button>
  );
};

export default OpenDatabaseButton;
