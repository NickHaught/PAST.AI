import DocumentCard from "./DocumentCard";
import InputButtonOverlay from "./InputButtonOverlay";

interface Props {
  imageUrl: string;
  className: string;
}

const InputContainer = ({ imageUrl, className }: Props) => {
  return (
    <div className={className}>
      <div className="absolute">
        <InputButtonOverlay />
      </div>

      <DocumentCard imageUrl={imageUrl} />
    </div>
  );
};

export default InputContainer;
