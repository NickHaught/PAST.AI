import { ReactNode } from "react";

interface Props {
  position: string;
  children: ReactNode;
  className: string;
  onClick: () => void;
}

const Button = ({ position = "left", children, className, onClick }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`${className} rounded ${position}`}
    >
      {children}
    </button>
  );
};

export default Button;
