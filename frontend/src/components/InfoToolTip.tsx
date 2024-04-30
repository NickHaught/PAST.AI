
import { BsFillInfoSquareFill } from 'react-icons/bs';

interface InfoTooltipProps {
    message: string;
    link?: string;
    }

function InfoTooltip({ message, link }: InfoTooltipProps) {
  return (
    <div className="hs-tooltip inline-block ml-2">
      <button
        type="button"
        className="p-1 bg-transparent focus:outline-none hover:outline-none focus:ring-0 hover:text-blue hover:border-gray transition duration-300 ease-in-out"
        onClick={() => link && window.open(link)}
      >
        <BsFillInfoSquareFill size={12} />
        <span className="max-w-xs fade-in hs-tooltip-content hs-tooltip-shown:opacity-100 hs-tooltip-shown:visible opacity-0 transition-opacity inline-block absolute invisible z-10 py-2 px-3 bg-lighter-gray text-left text-sm text-white rounded-lg shadow-md" role="tooltip">
          {message}
        </span>
      </button>
    </div>
  );
}

export default InfoTooltip;

