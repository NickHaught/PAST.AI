import React from "react";
import { GrDocumentPdf } from "react-icons/gr";
import { LuFileWarning } from "react-icons/lu";

interface Props {
  imagePath: string;
  text?: string;
  icon?: string;
}

const icons = {
  GrDocumentPdf,
  LuFileWarning
};

const ImageDisplay: React.FC<Props> = ({ imagePath, text, icon }) => {
  const Icon = icons[icon as keyof typeof icons];
  return (
    <div className="relative h-full flex flex-col justify-center items-center">
      <img
        src={imagePath}
        alt="Document Page"
        className="w-full h-auto mb-1 opacity-0"
      />
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center">
        <div className="flex flex-col text-white items-center">
          {Icon && <Icon className="text-6xl text-gray-400 mb-2" />}
          <span className="text-gray-500">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default ImageDisplay;
