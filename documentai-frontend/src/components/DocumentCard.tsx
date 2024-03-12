import { ReactNode } from "react";

interface Props {
  imageUrl: string;
  children?: ReactNode;
}

const DocumentCard = ({ imageUrl }: Props) => {
  return (
    <div className="max-w-2xl rounded overflow-hidden shadow-lg">
      <img
        className="w-full h-auto max-w-full"
        src={imageUrl}
        alt="Sunset in the mountains"
      />
    </div>
  );
};

export default DocumentCard;
