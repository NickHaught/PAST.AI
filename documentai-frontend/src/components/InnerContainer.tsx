// InnerContainer.jsx
import React from "react";

interface Props {
  children: React.ReactNode;
}

const InnerContainer = ({ children }: Props) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-hover-gray">
      <div className=" bg-hover-gray">{children}</div>
    </div>
  );
};

export default InnerContainer;
