import { IoFolder } from "react-icons/io5";
import Button from "./Button";

interface Props {
  onClick: () => void;
}

const OpenFolderButton = ({ onClick }: Props) => {
  return (
    <Button
      className="flex items-center bg-button-gray hover:bg-gray-700 text-white py-1 px-4"
      onClick={onClick}
      position="center"
    >
      <IoFolder className="mr-2" />
      Open Folder
    </Button>
  );
};

export default OpenFolderButton;
