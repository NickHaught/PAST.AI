import "../Auto.css";

interface PanelOverlayProps {
  onPrev: () => void; // Function to handle previous page action
  onNext: () => void;
  className: string;  // Function to handle next page action
}

const PanelOverlay = ({ onPrev, onNext, className }: PanelOverlayProps) => {
  return (
    <div className={`flex gap-12 p-4 pt-4 rounded-xl bg-gray ${className}`}>
      <div className="flex gap-2"><button
        onClick={onPrev}
        className="text-white text-sm bg-dark-dark-gray flex-none focus:outline-none hover:border-blue p-2"
      >
        &#8592;
      </button>
      <button
        onClick={onNext}
        className="text-white text-sm bg-dark-dark-gray flex-none focus:outline-none hover:border-blue p-2"
      >
        &#8594;
      </button></div>
      
      <div className="flex-auto text-center">
        <button className="flex-none glow-on-hover focus:outline-none text-sm">
          Auto
        </button>
      </div>
      <button className="text-white flex-none bg-blue focus:outline-none hover:border-blue hover:bg-dark-dark-gray transition duration-150 ease-in-out">
        Scan
      </button>
    </div>
  );
};

export default PanelOverlay;
