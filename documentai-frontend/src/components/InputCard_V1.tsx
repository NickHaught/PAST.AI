import React, { useContext, useState } from "react";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import InputButtonOverlay from "./InputButtonOverlay";
import ImageTest from "./Document";
import OpenFolderButton from "./OpenFolderButton";

// Your defined interface
interface ResizeCallbackData {
  node: HTMLElement;
  size: {
    width: number;
    height: number;
  };
}

const InputCard = () => {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);

  // Using the defined interface to type the function parameter
  const handleResize = (
    event: React.SyntheticEvent,
    data: ResizeCallbackData
  ) => {
    setWidth(data.size.width);
    setHeight(data.size.height);
  };

  return (
    <Resizable
      className="flex flex-col bg-primary-gray rounded-xl p-6"
      width={width}
      height={height}
      onResize={handleResize}
      resizeHandles={["e"]}
    >
      <div>
        <h1>Input</h1>
        <InnerNavbar navItems={["Home", "PDF"]} />

        <InnerContainer>
          <ImageTest imagePath={"/hebronsign.jpg"} width={width} />
        </InnerContainer>
      </div>
    </Resizable>
  );
};

export default InputCard;
