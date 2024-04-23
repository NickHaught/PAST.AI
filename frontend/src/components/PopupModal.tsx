import { FC, useState } from "react";
import '../css/auto.css';

interface PopupModalProps {
  onClose: () => void;
}

const PopupModal: FC<PopupModalProps> = ({ onClose }) => {
    const [isActive, setIsActive] = useState(false);

    const handleStart = () => {
        setIsActive(true);
        // Simulate a backend call
        setTimeout(() => {
            console.log("Auto mode activated"); // Simulate backend response
            // You can handle state updates based on the response here
        }, 1000); // Simulate a delay
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
            <div className="popup-modal-glow">
          <div className={`bg-gray glow p-4 rounded-xl shadow-xl transition-opacity duration-300 ease-in-out animate-fadeIn p-10 ${isActive ? "border-animate" : ""}`}>
            <div className="text-center mb-4 text-white text-lg font-semibold">{isActive ? "Auto Mode Activated" : "Activate Auto Mode"}</div>
            <h2 className=" text-white text-center">All unscanned PDFs will be scanned in the database.</h2>
            <div className="text-sm text-gray-300 text-center mt-2">Estimated Time: ~3 minutes</div>
            <div className="flex justify-center space-x-4 mt-4">
              {!isActive && (
                <button className="bg-green-500 text-sm hover:bg-green-700 text-white py-2 px-4 rounded-lg" onClick={handleStart}>
                  Start
                </button>
              )}
              <button className="bg-red-500 text-sm hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
          </div>
        </div>
      );
};

export default PopupModal;


// const [isActive, setIsActive] = useState(false);

//     const handleStart = () => {
//         setIsActive(true);
//         setTimeout(() => {
//             console.log("Auto mode activated");
//         }, 1000);
//     };

//     return (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
//           <div className="popup-modal-glow">
//             <div className="text-white text-lg font-semibold">
//                 {isActive ? "Auto Mode Activated" : "Active Auto Mode"}
//             </div>
//             <div className="text-sm text-gray-300 mt-2">Estimated Time: ~3 minutes</div>
//             <div className="flex justify-center space-x-4 mt-4">
//               {!isActive && (
//                 <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleStart}>
//                   Start
//                 </button>
//               )}
//               <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={onClose}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       );
// };

// export default PopupModal;
