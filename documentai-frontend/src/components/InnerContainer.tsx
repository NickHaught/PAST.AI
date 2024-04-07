import { ReactNode } from "react";
import InputLoader from "./InputLoader";

interface Props {
  children: ReactNode;
  loading: boolean; // Add loading prop
}

const InnerContainer = ({ children, loading }: Props) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-light-gray relative">
      {loading ? ( // Display loading indicator when loading is true
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-10">
          <InputLoader/>
          <div className="ml-2 text-white">Uploading...</div>{" "}
          {/* Text "Uploading" */}
        </div>
      ) : (
        <div className="bg-light-gray">{children}</div> // Display children when loading is false
      )}
    </div>
  );
};

export default InnerContainer;
