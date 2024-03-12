import HelloWorld from "../functions/HelloWorld";
import OpenFileButton from "./OpenFolderButton";

const InputButtonOverlay = () => {
  return <OpenFileButton onClick={() => HelloWorld()} />;
};

export default InputButtonOverlay;
