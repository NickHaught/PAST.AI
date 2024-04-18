import { ReactNode } from "react";
import InputLoader from "./InputLoader";
import { IoMdCloudUpload } from "react-icons/io"; // Import the icon

interface Props {
  children: ReactNode;
  loading: boolean;
}

const InnerContainer = ({ children, loading }: Props) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-light-gray relative flex items-center justify-center">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-10">
          <InputLoader />
          <div className="ml-2 text-white">Uploading...</div>
        </div>
      ) : children ? (
        <div className="bg-light-gray w-full h-full">{children}</div>
      ) : (
        <div className="text-center text-white flex flex-col items-center">
          <IoMdCloudUpload className="text-6xl text-gray-400" />{" "}
          {/* Icon with styling */}
          <span>Please upload a folder containing PDFs.</span>
        </div>
      )}
    </div>
  );
};

export default InnerContainer;
