import "../css/loadUtil.css";

interface StatusMessageProps {
  status: "success" | "warning" | "error";
  message: string;
  onClose: () => void;
}

const StatusMessage = ({ status, message, onClose }: StatusMessageProps) => {
  const styleClasses = {
    success: { textColor: "text-green-500", borderColor: "border-green-500" },
    warning: { textColor: "text-yellow-500", borderColor: "border-yellow-500" },
    error: { textColor: "text-red-500", borderColor: "border-red-500" },
  }[status];

  return (
    <div
      className={`${styleClasses.textColor} border ${styleClasses.borderColor} rounded-lg px-4 py-2 fade-in`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-sm font-semibold bg-transparent hover:bg-transparent focus:outline-none focus:ring-0 hover:border-transparent p-1 ml-2"
      >
        &times;
      </button>
    </div>
  );
};

export default StatusMessage;
