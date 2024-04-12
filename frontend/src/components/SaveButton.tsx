import { test_pdf } from "../services/apiServices"; // Correct the path as necessary
import { FaRegSave } from "react-icons/fa";

interface Props {
  className?: string;
}

const SaveButton = ({ className }: Props) => {
  const handleButtonClick = async () => {
    console.log("Save Button Clicked");
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
        className={`text-white flex items-center bg-light-gray space-x-2 text-lg py-1 px-2 rounded-lg hover:border-blue focus:outline-none ${className}`}
        onClick={handleButtonClick}
      >
        <FaRegSave className="text-green-500"/>
      </button>
    </>
  );
};

export default SaveButton;
