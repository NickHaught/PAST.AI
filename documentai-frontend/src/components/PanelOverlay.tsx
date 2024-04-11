import { ReactNode } from "react";
import "../Auto.css";

interface PanelOverlayProps {
  onPrev: () => void;
  onNext: () => void;
  onScan?: () => void;
  className: string;
}

const Button = ({
  onClick,
  children,
  additionalClasses = "",
}: {
  onClick?: () => void;
  children: ReactNode;
  additionalClasses?: string;
}) => (
  <button
    onClick={onClick}
    className={`text-white text-sm flex-none focus:outline-none transition duration-150 ease-in-out ${additionalClasses}`}
  >
    {children}
  </button>
);

const PanelOverlay = ({
  onPrev,
  onNext,
  onScan,
  className,
}: PanelOverlayProps) => {
  return (
    <div className={`flex gap-12 p-3 rounded-xl bg-gray ${className}`}>
      <div className="flex gap-1">
        <Button
          onClick={onPrev}
          additionalClasses="bg-dark-dark-gray hover:border-blue"
        >
          &#8592;
        </Button>
        <Button
          onClick={onNext}
          additionalClasses="bg-dark-dark-gray hover:border-blue"
        >
          &#8594;
        </Button>
      </div>

      <div className="flex-auto text-center">
        <Button additionalClasses="glow-on-hover">Auto</Button>
      </div>
      <Button
        onClick={() => onScan && onScan()}
        additionalClasses="bg-blue hover:border-blue hover:bg-dark-dark-gray"
      >
        Scan
      </Button>
    </div>
  );
};

export default PanelOverlay;
