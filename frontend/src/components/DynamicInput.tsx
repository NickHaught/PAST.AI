import React, { ChangeEvent } from "react";
import InfoTooltip from "./InfoToolTip";

interface DynamicInputProps {
  label: string;
  type?: string; // Include 'checkbox' as a potential type
  id?: string;
  name: string;
  value: string | number | boolean; // Adjust to include boolean for checkboxes
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  tooltipLink?: string;
  tooltipMessage?: string;
  step?: string;
  min?: string;
  inputWidth?: string;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  label,
  type = "text",
  id,
  name,
  value,
  handleChange,
  tooltipLink,
  tooltipMessage,
  step,
  min,
  inputWidth,
}) => {
  const inputClass = (value: string | number) => {
    return `mt-1 p-2 w-full rounded-lg text-white bg-light-gray focus:ring-2 transition duration-300 ease-in-out ${
      !value
        ? "border-red-600 focus:ring-red-600 hover:border-red-600 focus:border-red-600"
        : "hover:border-blue focus:ring-blue focus:border-blue border-lightest-gray"
    }`;
  };

  if (type === "checkbox") {
    return (
        <div className="flex items-center">
      <label
        htmlFor={"hs-xs-switch"}
        className={"text-sm text-white ms-3 p-2"}
      >
        {label}
        </label>
        {tooltipMessage ? (
            <InfoTooltip message={tooltipMessage} link={tooltipLink} />
          ) : (
            ""
          )}
        <input
          type="checkbox"
          id={"hs-xs-switch"}
          name={name}
          checked={!!value} // Convert value to boolean for checked attribute
          onChange={handleChange}
          className="relative w-[35px] h-[21px] bg-lightest-gray border-transparent text-transparent rounded-full cursor-pointer transition-colors transition-shadow ease-in-out duration-300 focus:ring-2 focus:ring-gray focus:ring-opacity-0 focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue checked:border-gray
  before:inline-block before:size-4 before:bg-white checked:before:bg-white before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:transition before:ease-in-out before:duration-200"
        />
        </div>
      
    );
  }

  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-sm font-medium text-white">
        {label}
        {tooltipMessage ? (
          <InfoTooltip message={tooltipMessage} link={tooltipLink} />
        ) : (
          ""
        )}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        className={inputClass(value) + " " + inputWidth}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};


export default DynamicInput;
