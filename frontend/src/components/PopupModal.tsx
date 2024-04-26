import { FC, useEffect, useState } from "react";
import { BsFillInfoSquareFill } from "react-icons/bs";
import "../css/auto.css";

interface PopupModalProps {
  onClose: () => void;
}

const PopupModal: FC<PopupModalProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);

  const handleStart = () => {
    setIsActive(true);
    setShowInfo(false);
    setTimeout(() => {
      setStatusMessage("Database accessed!");
      setShowDetails(true);
      setTimeout(() => {
        setStatusMessage("✔ Database accessed!");
      }, 2000);
    }, 1000);
  };

  const handleClose = () => {
    setAnimateOut(true);
  };

  useEffect(() => {
    if (animateOut) {
      const timer = setTimeout(onClose, 100); // Ensure the timer matches the animation duration
      return () => clearTimeout(timer);
    }
  }, [animateOut, onClose]);

  return (
    <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out ${animateOut ? 'scale-out' : ''}`}>
      <div className="popup-modal-glow relative fade-in-scale-up">
        <div className={`bg-gray glow p-10 rounded-xl shadow-xl transition-opacity duration-300 ease-in-out overflow-auto max-h-[80vh]`}>
          {!isActive && (
            <span className="absolute top-3 right-3 text-blue-500 hover:text-blue-700 cursor-pointer z-50" onClick={() => setShowInfo(!showInfo)} title="Info">
              <BsFillInfoSquareFill size={16} />
            </span>
          )}
          <div className="text-center mb-4 text-blue text-lg font-semibold">
            {isActive ? "Auto Mode Activated" : "Activate Auto Mode"}
          </div>
          {!isActive && (
            <h2 className="text-white text-center">
              All unscanned PDFs will be scanned in the database.
            </h2>
          )}
          {showDetails && (
            <>
              <h3 className="text-lg text-blue-400 text-center">Total Unscanned Documents</h3>
              <div className="text-sm text-gray-300 text-center">Estimated Time: ~3 minutes</div>
            </>
          )}
          <div className="text-white text-center">{statusMessage}</div>
          <div className="flex justify-center space-x-4 mt-4">
            {!isActive && (
              <button className="bg-green-500 text-sm hover:bg-green-700 text-white py-2 px-4 rounded-lg" onClick={handleStart}>
                Start
              </button>
            )}
            <button className="bg-red-500 text-sm hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" onClick={handleClose}>
              Cancel
            </button>
          </div>
          {showInfo && (
            <div className="mt-4 p-4 bg-white text-black rounded">
              Detailed information about the auto scanning process.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;

