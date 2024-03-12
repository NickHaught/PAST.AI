import DocumentCard from "./DocumentCard";
import OutputButtonOverlay from "./OutputButtonOverlay";

interface Props {
  imageUrl: string;
  className: string;
}

const OutputContainer = ({ imageUrl, className }: Props) => {
  return (
    <div className={className}>
      <div className="absolute">
        <OutputButtonOverlay />
      </div>

      <DocumentCard imageUrl={imageUrl} />
    </div>
  );
};

export default OutputContainer;
