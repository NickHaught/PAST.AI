import { FaCircle } from 'react-icons/fa';

interface Props {
  navItems: string[];
  onHomeClick?: () => void;
  onPDFClick?: () => void;
  onEditorClick?: () => void; // New handler for the Editor button
  activeView: "list" | "viewer" | "editor";
  disableHome?: boolean;
  disablePDF?: boolean;
  disableEditor?: boolean; // New prop to disable the Editor button
}

const InnerNavbar = ({ navItems, onHomeClick, onPDFClick, onEditorClick, activeView, disableHome, disablePDF, disableEditor }: Props) => {
  return (
    <div className="flex items-center space-x-4">
      {navItems.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            if (item === "Home" && onHomeClick && !disableHome) {
              onHomeClick();
            } else if (item === "PDF" && onPDFClick && !disablePDF) {
              onPDFClick();
            } else if (item === "Editor" && onEditorClick && !disableEditor) {
              onEditorClick();
            }
          }}
          className={`flex items-center bg-transparent border-none focus:outline-none pb-5 ${
            ((disableHome && item === 'Home') || (disablePDF && item === 'PDF') || (disableEditor && item === 'Editor')) ? 'opacity-50 cursor-not-allowed' : ''}`
          }
          disabled={(disableHome && item === 'Home') || (disablePDF && item === 'PDF') || (disableEditor && item === 'Editor')}
        >
          <FaCircle
            className={`mr-2 ${
              ((item === "Home" && activeView === "list" && !disableHome) ||
               (item === "PDF" && activeView === "viewer" && !disablePDF) ||
               (item === "Editor" && activeView === "editor" && !disableEditor))
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






