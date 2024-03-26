
import { FaDatabase } from "react-icons/fa6"; // Ensure correct import path

interface Props {
  className?: string;
}

const OpenFolderButton = ({ className }: Props) => {
 

  // Simplified button click handler that just triggers the file input click
  const handleButtonClick = () => {
    console.log("Open Database Button Clicked");
  }


  return (
    <>
      <button
        className={`flex items-center bg-hover-gray space-x-2 text-sm py-1 px-2 rounded-lg hover:border-blue focus:outline-none ${className}`}
        onClick={handleButtonClick}
      >
        <FaDatabase />
      </button>
    </>
  );
};

export default OpenFolderButton;




