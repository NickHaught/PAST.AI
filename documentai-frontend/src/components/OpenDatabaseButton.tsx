import { FaDatabase } from "react-icons/fa"; // Ensure correct import path
import { test_pdf } from "../services/apiServices"; // Correct the path as necessary

interface Props {
  className?: string;
}

const OpenDatabaseButton = ({ className }: Props) => {
  const handleButtonClick = async () => {
    console.log("Open Database Button Clicked");
    try {
      const response = await test_pdf();
      console.log("Test PDF response:", response);
    } catch (error) {
      console.error("Error testing PDF:", error);
    }
  };

  return (
    <>
      <button
        className={`text-white flex items-center bg-light-gray space-x-2 text-sm py-1 px-2 rounded-lg hover:border-blue focus:outline-none ${className}`}
        onClick={handleButtonClick}
      >
        <FaDatabase className="text-white" />
      </button>
    </>
  );
};

export default OpenDatabaseButton;
