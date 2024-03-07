
import DocumentCard from "./DocumentCard"

interface MainDocumentContainerProps {
  inputImageUrl: string;
  outputImageUrl: string;
}

const MainDocumentContainer = ({inputImageUrl, outputImageUrl}: MainDocumentContainerProps) => {
  return (
    <div className="container mx-auto flex justify-center gap-x-4">
    <DocumentCard imageUrl={inputImageUrl}/>
    <DocumentCard imageUrl={outputImageUrl}/>
    </div>
  )
}

export default MainDocumentContainer