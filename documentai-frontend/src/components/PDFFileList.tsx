import axios from "axios";

interface Props {
  files: File[]; // Now expecting an array of File objects
  uploadUrl: string;
  onUploadSuccess: (fileName: string) => void;
}

const PDFFileList: React.FC<Props> = ({
  files,
  uploadUrl,
  onUploadSuccess,
}) => {
  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        console.log(`${file.name} uploaded successfully`);
        onUploadSuccess(file.name); // Notify the parent component
      } else {
        console.error(`Upload failed for ${file.name}`);
      }
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
    }
  };

  return (
    <div
      className={"overflow-scroll overflow-x-hidden rounded-xl scrollbar-webkit overflow-auto max-h-[75vh]"}
    >
    <ul className="list-disc pl-5 overflow-auto overflow-x-hidden scrollbar-webkit">
      {files.map((file, index) => (
        <li
          key={index}
          className="cursor-pointer hover:text-blue-600"
          onClick={() => handleFileUpload(file)}
        >
          {file.name}
        </li>
      ))}
    </ul>
    </div>
  );
};

export default PDFFileList;
