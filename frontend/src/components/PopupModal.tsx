import { FC, useEffect, useState } from "react";
import { BsFillInfoSquareFill } from "react-icons/bs";
import "../css/transitions.css";
import Lottie from "react-lottie";
import animationData from "../lotties/scan.json";
import Loader from "./Loader";

interface PopupModalProps {
  onClose: () => void;
}

const PopupModal: FC<PopupModalProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [animInfo, setAnimInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: "500px",
    height: "208px",
  }); // Example initial dimensions
  const [access, setAccess] = useState(false);
  const [loader, setLoader] = useState(false);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const handleStart = () => {
    setIsActive(true);
    setShowInfo(false);
    setLoader(true);

    setDimensions({ width: "300px", height: "208px" });
    setTimeout(() => {
      setLoader(false);
      setStatusMessage("Database accessed!");
      setDimensions({ width: "600px", height: "550px" });
      setAccess(true);
      setShowDetails(true);
    }, 1000);
  };

  const handleClose = () => {
    setAnimateOut(true);
  };

  useEffect(() => {
    if (animateOut) {
      const timer = setTimeout(onClose, 200); // Ensure the timer matches the animation duration
      return () => clearTimeout(timer);
    }
  }, [animateOut, onClose]);

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center z-50 ${
        animateOut ? "scale-out" : ""
      }`}
    >
      <div className=" relative scale-in">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue to-purple opacity-75"></div>
        <div
          style={{
            width: dimensions.width,
            height: dimensions.height,
            transition: "width 300ms ease-in-out, height 300ms ease-in-out",
          }}
          className={`relative bg-gray p-10 rounded-xl overflow-hidden`}
        >
          {!isActive && (
            <span
              className="absolute top-3 right-3 text-white hover:text-blue-700 cursor-pointer z-50"
              onClick={() => {
                if (showInfo) {
                  // Start the scale-out animation
                  setAnimInfo(false);
                  setDimensions({ width: "500px", height: "208px" });

                  // Delay hiding the panel to allow animation to complete
                  setTimeout(() => {
                    setShowInfo(false);
                  }, 100); // This duration should match your scale-out animation duration
                } else {
                  // Immediately show the panel and start scale-in animation
                  setShowInfo(true);
                  setDimensions({ width: "500px", height: "432px" });
                  setAnimInfo(true);
                }
              }}
              title="Info"
            >
              <BsFillInfoSquareFill size={16} />
            </span>
          )}
          <div className="relative">
            <div className="text-center mb-2 text-blue text-lg font-semibold">
              {isActive ? "Auto Mode Activated" : "Auto Mode"}
            </div>
            {!isActive && (
              <h2 className="text-white text-center">
                All unscanned PDFs will be scanned in the database.
              </h2>
            )}
            {showDetails && (
              <div className="flex  justify-center space-x-5">
                {/* Animations and Scanning Status in One Column */}
                <div className="flex flex-col items-center">
                  {" "}
                  {/* This column centers its children vertically and horizontally */}
                  <div className="relative">
                  <div style={{ pointerEvents: "none", marginTop: "-100px"}}>
                    <Lottie options={defaultOptions} height={530} width={250} />
                  </div>
                  <div className="flex items-center mt-[-100px] pl-20 pb-2">
                    {" "}
                    {/* Additional margin-top to separate the Lottie and the loader/text */}
                    <Loader />
                    <div className="ml-2 text-white">Scanning</div>
                    </div>
                  </div>
                </div>

                {/* Text Indicators on the Right */}
                <div className="flex flex-col items-start pt-6 pr-2">
                  <div className="text text-white">Total Unscanned</div>
                  <div className="text-5xl text-white font-bold">
                    43,821
                  </div>{" "}
                  {/* Example number for unscanned */}
                  <div className=" text-white mt-4">Total Scanned</div>
                  <div className="text-5xl text-white font-bold">456</div>{" "}
                  {/* Example number for scanned */}

                  <div className=" text-white mt-4">Cummulative Cost</div>
                  <div className=" text-white">$20.0</div>{" "}

                  <div className=" text-white mt-4">Esimated Time</div>
                  <div className=" text-white">~ 3 hours</div>{" "}

                  
                </div>
              </div>
            )}
          </div>

          <>
            {loader ? (
              <div className="flex items-center justify-center">
                <Loader />
                <div className="ml-2 text-white">Connecting to Server...</div>
              </div>
            ) : null}
          </>
          <div className="flex justify-center space-x-4 my-6">
            {!isActive && (
              <button
                className="bg-green-500 text-sm hover:bg-green-700 text-white py-2 px-4 rounded-lg"
                onClick={() => {
                  handleStart();
                }}
              >
                Start
              </button>
            )}
            <button
              className="bg-red-500 text-sm hover:bg-red-700 text-white py-2 px-4 rounded-lg"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>

          <div
            className={`flex justify-center items-center bg-white rounded-lg ${
              animInfo ? "scale-in" : "scale-out"
            }`}
          >
            {" "}
            {showInfo && (
              <div
                className={`my-4 p-4 rounded text-black max-w-96 overflow-auto space-y-4 max-h-48 scrollbar-webkit`}
              >
                <h2 className="font-bold">Auto Mode Functionality</h2>
                <p>
                  <strong>Page Selection:</strong> GPT-4 reviews the content of
                  each page, selecting those with critical information pertinent
                  to your needs.
                </p>
                <p>
                  <strong>Scanning and Saving:</strong> After selection, these
                  pages are automatically scanned and saved, streamlining your
                  document management workflow.
                </p>

                <h2 className="font-bold">Cost Information</h2>
                <p>
                  Please be aware that this automated service costs an average
                  of <strong>$0.15 per scan</strong>, due to the sophisticated
                  technology and processing involved.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
