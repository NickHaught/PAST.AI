import React, { useEffect, useState } from "react";
import "../css/loadUtil.css";

interface StatusMessageProps {
  status: "success" | "warning" | "error";
  message: string;
  onClose: () => void;
}

const StatusMessage = ({ status, message, onClose }: StatusMessageProps) => {
  const [show, setShow] = useState(true);
  const styleClasses = {
    success: { textColor: "text-green-500", borderColor: "border-green-500" },
    warning: { textColor: "text-yellow-500", borderColor: "border-yellow-500" },
    error: { textColor: "text-red-500", borderColor: "border-red-500" },
  }[status];

  useEffect(() => {
    // Only auto-dismiss if not an error
    if (status !== "error") {
      const timer = setTimeout(() => {
        setShow(false); // Start fading out
      }, 6000); // 4000 milliseconds before starting fade

      const fadeTimer = setTimeout(() => {
        onClose(); // Remove message after fade completes
      }, 7000); // Wait for fade to complete

      return () => {
        clearTimeout(timer);
        clearTimeout(fadeTimer);
      };
    }
  }, [status, message, onClose]);

  const handleInstantClose = () => {
    
      onClose(); // Close instantly for errors
    
  };

  return (
    <div
      className={`${styleClasses.textColor} border ${styleClasses.borderColor} rounded-lg px-4 py-2 ${show ? "fade-in" : "fade-out"}`}
    >
      <span>{message}</span>
      <button
        onClick={handleInstantClose}
        className="text-sm font-semibold bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 hover:border-transparent p-1 ml-2"
      >
        &times;
      </button>
    </div>
  );
};

export default StatusMessage;




