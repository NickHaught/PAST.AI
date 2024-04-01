import { FaCircle } from 'react-icons/fa';

interface Props {
  navItems: string[];
  onHomeClick?: () => void;
  onPDFClick?: () => void;
  activeView: "list" | "viewer";
}

const InnerNavbar = ({ navItems, onHomeClick, onPDFClick, activeView }: Props) => {
  return (
    <div className="flex items-center space-x-4">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (item === "Home") {
              onHomeClick?.();
            } else if (item === "PDF") {
              onPDFClick?.();
            }
          }}
          className="flex items-center bg-transparent border-none focus:outline-none pb-5"
        >
          <FaCircle
            className={`mr-2 ${
              (item === "Home" && activeView === "list") || (item === "PDF" && activeView === "viewer")
                ? "text-blue"
                : "text-light-gray"
            }`}
            style={{ fontSize: '0.5rem' }}
          />
          <span className="text-white transition-opacity duration-200 hover:opacity-30">
            {item}
          </span>
        </button>
      ))}
    </div>
  );
};

export default InnerNavbar;



