import HelloWorld from "../functions/HelloWorld";
import OpenFileButton from "./OpenFolderButton";

const OutputButtonOverlay = () => {
  return <OpenFileButton onClick={() => HelloWorld()} />;
};

export default OutputButtonOverlay;
