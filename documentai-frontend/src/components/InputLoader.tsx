const InputLoader = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
      width="18"
      height="18"
      style={{
        shapeRendering: "auto",
        display: "block",
        background: "transparent",
      }}
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <g>
        <circle
          cx="50"
          cy="50"
          fill="none"
          stroke="#faf9f6"
          strokeWidth="11"
          r="36"
          strokeDasharray="169.64600329384882 58.548667764616276"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="0.3115264797507788s"
            values="0 50 50;360 50 50"
            keyTimes="0;1"
          ></animateTransform>
        </circle>
        <g></g>
      </g>
    </svg>
  );
};

export default InputLoader;
