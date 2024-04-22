import { test_pdf } from "../services/apiServices"; // Correct the path as necessary
import { FaRegSave } from "react-icons/fa";

interface Props {
  className?: string;
  onSave: () => void;  // Function to execute on save
}

const SaveButton = ({ className, onSave }: Props) => {
  return (
    <>
      <button
        className={`text-white flex items-center bg-light-gray space-x-2 text-lg py-1 px-2 rounded-lg hover:border-blue focus:outline-none ${className}`}
        onClick={onSave}  // Use onSave passed from the parent component
        title={"Save/Validate Data"}
      >
        <FaRegSave className="text-green-500" />
      </button>
    </>
  );
};

export default SaveButton;
