import "react-resizable/css/styles.css";
import InnerNavbar from "./InnerNavbar";
import InnerContainer from "./InnerContainer";
import ImageTest from "./Document";

const OutputCard = () => {
  return (
    <div className="flex flex-col bg-gray rounded-xl p-6">
      <h1>Output</h1>
      <InnerNavbar navItems={["PDF", "Editor"]} />

      <InnerContainer>
        <ImageTest imagePath={"/hebronsign.jpg"} />
      </InnerContainer>
    </div>
  );
};

export default OutputCard;
