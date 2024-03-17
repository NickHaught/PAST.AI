
interface Props {
  imagePath: string;
}

const ImageDisplay = ({ imagePath }: Props) => {
  // Tailwind CSS classes for responsive images and fade-in effect

  return (
    <div
      className={"overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh]"}
    >
      <img src={imagePath} alt="Document Page"  className="w-full h-auto mb-1"/>
      <img src={imagePath} alt="Document Page"  className="w-full h-auto"/>
    </div>
  );
};

export default ImageDisplay;
