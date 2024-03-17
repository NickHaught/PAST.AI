
import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageTest from "./ImageTest";

interface Props {
  width: number;
}

const InputCard = ({ width }: Props) => {
  return (
    <div className="flex flex-col bg-primary-gray rounded-xl p-6"  style={{ width: `${width}px` }}>
      <h1>Input</h1>
      <InnerNavbar navItems={["Home", "PDF"]} />

      <InnerContainer>
        <ImageTest imagePath={"/hebronsign.jpg"}/>
      </InnerContainer>
    </div>
  );
};

export default InputCard;
