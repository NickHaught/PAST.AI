import "../Auto.css";

const PanelOverlay = () => {
  return (
    <>
      <div className="flex gap-2 p-2 pt-4 bg-gray">
        <button className="text-white bg-dark-dark-gray flex-none focus:outline-none hover:border-blue">
          &#8592;
        </button>
        <button className="text-white bg-dark-dark-gray flex-none focus:outline-none hover:border-blue">
          &#8594;
        </button>
        <div className="flex-auto text-center ">
          <button className="flex-none glow-on-hover focus:outline-none text-sm">
            Auto
          </button>
        </div>
        <button className="text-white flex-none bg-blue focus:outline-none hover:border-blue hover:bg-dark-dark-gray transition duration-150 ease-in-out">
          Scan
        </button>
        <button className="text-white flex-none bg-blue focus:outline-none hover:border-blue hover:bg-dark-dark-gray transition duration-150 ease-in-out">
          Save
        </button>
      </div>
    </>
  );
};

export default PanelOverlay;
