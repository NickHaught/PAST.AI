// InnerContainer.jsx
import React from "react";

interface Props {
  children: React.ReactNode;
}

const InnerContainer = ({ children }: Props) => {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="scrollbar-webkit  overflow-auto">{children}</div>
    </div>
  );
};

export default InnerContainer;
