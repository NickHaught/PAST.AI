import InputContainer from "./InputContainer";
import OutputContainer from "./OutputContainer";

interface MainDocumentContainerProps {
  inputImageUrl: string;
  outputImageUrl: string;
  className: string;
}

const MainDocumentContainer = ({
  inputImageUrl,
  outputImageUrl,
  className,
}: MainDocumentContainerProps) => {
  return (
    <div className="container mx-auto flex flex-col lg:flex-row justify-center gap-4">
      <InputContainer imageUrl={inputImageUrl} className={className} />
      <OutputContainer imageUrl={outputImageUrl} className={className} />
    </div>
  );
};

export default MainDocumentContainer;
