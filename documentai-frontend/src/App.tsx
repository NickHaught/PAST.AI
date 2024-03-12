import { useState } from "react";
import "./App.css";
import MainDocumentContainer from "./components/MainDocumentContainer";
import HelloWorld from "./functions/HelloWorld";

function App() {
  return (
    <>
      <div>
        <HelloWorld />
      </div>
      <MainDocumentContainer
        inputImageUrl="./hebronsign.jpg"
        outputImageUrl="./hebronsign.jpg"
        className="relative flex justify-center items-center flex-shrink-0"
      />
    </>
  );
}

export default App;
