import { useEffect, useState } from "react";
import InfoTooltip from "./InfoToolTip";
import StatusMessage from "./StatusMessage";
import Loader from "./Loader";
import DynamicInput from "./DynamicInput";

function SettingsPage() {
  const [currentSelection, setCurrentSelection] = useState("Document AI & GPT");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate a save operation
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating a network request
    setIsLoading(false);
    // Check if any required field is empty
    const isEmpty = Object.values(formData).some((x) => x === "");
    if (isEmpty) {
      setStatusMessage({
        type: "error", // Correct from statusMessage to type
        message: "All fields must be filled out.",
      });
    } else {
      console.log("Current form data:", formData);
      setStatusMessage({
        type: "success", // Set status to success when save is successful
        message: "Save successful.",
      });
    }
  };

  interface FormData {
    gpt_api_key: string;
    google_credentials: string;
    compute_style_info: boolean;
    enable_native_pdf_parsing: boolean;
    enable_image_quality_scores: boolean;
    enable_symbol: boolean;
    location: string;
    project_id: string;
    processor_id: string;
    processor_version: string;
    mime_type: string;
    color_filter: boolean;
    color_similarity_threshold: number;
    handwritten_filter: boolean;
    unicode_filter: boolean;
    confidence_filter: number;
    font_size_filter: number;
    gpt_max_tokens: number;
    gpt_model: string;
    gpt_general_prompt: string;
    gpt_auto_prompt: string;
    ai_config: string;
    cost_limit: number;
  }

  const [formData, setFormData] = useState<FormData>({
    gpt_api_key: "",
    google_credentials: "",
    compute_style_info: false,
    enable_native_pdf_parsing: false,
    enable_image_quality_scores: false,
    enable_symbol: false,
    location: "",
    project_id: "",
    processor_id: "",
    processor_version: "",
    mime_type: "",
    color_filter: false,
    color_similarity_threshold: 0,
    handwritten_filter: false,
    unicode_filter: false,
    confidence_filter: 0,
    font_size_filter: 0,
    gpt_max_tokens: 0,
    gpt_model: "",
    gpt_general_prompt: "",
    gpt_auto_prompt: "",
    ai_config: "",
    cost_limit: 0,
  });

  interface FieldConfig {
    label: string;
    type: string;
    id?: string;
    name: keyof FormData;
    tooltipMessage?: string;
    inputWidth?: string;
    step?: string;
    min?: string;
  }

  const gpt_fields: FieldConfig[] = [
    { label: "GPT Max Tokens", name: "gpt_max_tokens", type: "number" },
    { label: "GPT Model", name: "gpt_model", type: "text" },
  ];

  const documentAI_major_fields: FieldConfig[] = [
    { label: "Project ID", name: "project_id", type: "text" },
    { label: "Processor ID", name: "processor_id", type: "text" },
    { label: "Processor Version", name: "processor_version", type: "text" },
    { label: "Location", name: "location", type: "text" },
  ];

  const documentAI_custom_fields: FieldConfig[] = [
    { label: "Mime Type", name: "mime_type", type: "text" },
    {
      label: "Color Similarity Threshold",
      name: "color_similarity_threshold",
      type: "number",
    },
    { label: "Confidence Filter", name: "confidence_filter", type: "number" },
    { label: "Font Size Filter", name: "font_size_filter", type: "number" },
  ];

  const documentAI_toggle_fields: FieldConfig[] = [
    {
      label: "Compute Style Info",
      name: "compute_style_info",
      type: "checkbox",
    },
    {
      label: "Enable Native PDF Parsing",
      name: "enable_native_pdf_parsing",
      type: "checkbox",
    },
    {
      label: "Enable Image Quality Scores",
      name: "enable_image_quality_scores",
      type: "checkbox",
    },
    { label: "Enable Symbol", name: "enable_symbol", type: "checkbox" },
    { label: "Color Filter", name: "color_filter", type: "checkbox" },
    {
      label: "Handwritten Filter",
      name: "handwritten_filter",
      type: "checkbox",
    },
    { label: "Unicode Filter", name: "unicode_filter", type: "checkbox" },
  ];

  useEffect(() => {
    const mockData = {
      gpt_api_key: "sample-gpt-api-key",
      google_credentials: "sample-google-credentials",
      compute_style_info: true,
      enable_native_pdf_parsing: true,
      enable_image_quality_scores: true,
      enable_symbol: true,
      location: "USA",
      project_id: "ss-capstone-project",
      processor_id: "processor-123",
      processor_version: "2023-01-version",
      mime_type: "application/pdf",
      color_filter: true,
      color_similarity_threshold: 0,
      handwritten_filter: false,
      unicode_filter: true,
      confidence_filter: 0.85,
      font_size_filter: 12,
      gpt_max_tokens: 500,
      gpt_model: "gpt-3.5",
      gpt_general_prompt: "Provide a general response based on input.",
      gpt_auto_prompt: "Automatically generate a prompt.",
      ai_config: "Document AI & GPT",
      cost_limit: 100,
    };

    // Update state with mock data
    setFormData(mockData);
    setCurrentSelection(mockData.ai_config || "Document AI & GPT");
  }, []);

  const handleSelection = (choice: string) => {
    setCurrentSelection(choice);
    setFormData({ ...formData, ai_config: choice });
  };

  const handleChange = (e: {
    target: { name?: any; value?: any; type?: any; checked?: any };
  }) => {
    const { name, value, type, checked } = e.target;
    // Check if the value is empty
    const sanitizedValue =
      value === "" ? "" : type === "number" ? Number(value) : value;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : sanitizedValue,
    }));
  };

  const textAreaClass = (value: any) => {
    return `mt-1 p-2 w-full rounded-lg resize-none text-white bg-light-gray focus:ring-2 transition duration-300 ease-in-out scrollbar-webkit ${
      !value
        ? "border-red-600 focus:ring-red-600 hover:border-red-600 focus:border-red-600"
        : "hover:border-blue focus:ring-blue focus:border-blue border-lightest-gray"
    }`;
  };

  return (
    <div className="flex flex-col bg-gray rounded-xl p-8 fade-in relative w-full">
      <div className="overflow-y-auto scrollbar-webkit p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-white leading-tight">Settings</h1>
          <div className="flex items-center space-x-4">
            {statusMessage && (
              <StatusMessage
                status={statusMessage.type} // Map `type` to `status`
                message={statusMessage.message}
                onClose={() => setStatusMessage(null)}
              />
            )}
            <button
              onClick={handleSave}
              className="py-2 px-4 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 hover:border-none focus:outline-none transition duration-300 ease-in-out"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader /> // Assuming Loader is the name of your loading component
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        <p className="-mt-5 text-base text-white-gray leading-snug">
          Manage your account settings and preferences.
        </p>
        <hr className="w-full my-8 h-0.5 bg-lightest-gray mx-auto border-none" />
        <h2 className="text-lg font-semibold text-white">General & Account</h2>
        <div className="flex flex-wrap justify-start items-end">
          <div className="mr-4 mt-4">
            <DynamicInput
              label="GPT API Key"
              id="gpt_api_key"
              name="gpt_api_key"
              value={formData?.gpt_api_key}
              handleChange={handleChange}
              tooltipLink="https://openai.com/blog/openai-api"
              tooltipMessage="The GPT API key provides authorized access to OpenAI's powerful language models. Use it to query GPT for responses based on your input."
            />
          </div>
          <div className="mr-4 mt-4">
            <DynamicInput
              label="Document AI Credentials"
              type="text"
              id="google_credentials"
              name="google_credentials"
              value={formData.google_credentials}
              handleChange={handleChange}
              tooltipMessage="Credentials required to authenticate and access Document AI services for enhanced document processing capabilities."
            />
          </div>
          <div className="mr-4 mt-4">
            <DynamicInput
              label="Cost Limit ($)"
              type="number"
              id="cost_limit"
              name="cost_limit"
              value={formData.cost_limit}
              handleChange={handleChange}
              tooltipMessage="Set a maximum spending limit to control overall expenses. This limit ensures that your usage does not exceed your budgetary constraints."
              inputWidth="max-w-32"
              step="1"
              min="1"
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="aiUtility"
              className="block text-sm font-medium text-white mb-1"
            >
              AI Configuration
              <InfoTooltip message="Utilize Document AI and GPT's power to extract highly accurate information from scanned documents or, optionally, use only GPT for less accuracy but less cost." />
            </label>
            <div className="hs-dropdown hs-dropdown-example relative inline-flex">
              <button
                id="hs-dropdown-example"
                type="button"
                className="hover:border-blue border-lightest-gray focus:ring-blue focus:outline-none focus:border-blue focus:ring-2 transition duration-300 ease-in-out hs-dropdown-toggle py-2 px-4 inline-flex items-center gap-x-2 text font-medium rounded-lg bg-light-gray text-white shadow-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                {currentSelection}
                <svg
                  className="hs-dropdown-open:rotate-180 size-4 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </button>

              <div
                className="hs-dropdown-menu transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 w-56 hidden z-10 mt-2 min-w-60 bg-light-gray shadow-md rounded-lg p-2"
                aria-labelledby="hs-dropdown-example"
              >
                <a
                  className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-white hover:bg-gray hover:text-white focus:outline-none focus:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelection("Document AI & GPT")}
                >
                  Document AI & GPT
                </a>
                <a
                  className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm text-white hover:bg-gray hover:text-white focus:outline-none focus:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelection("GPT Only")}
                >
                  GPT Only
                </a>
              </div>
            </div>
          </div>
        </div>
        <hr className="w-full my-10 h-0.5 bg-lightest-gray mx-auto border-none" />
        <h2 className="text-lg font-semibold mb-4 text-white">
          GPT Processing
        </h2>
        <div className="flex w-full justify-start items-end space-x-4">
          <div className="w-1/2">
            <label
              htmlFor="gpt_general_prompt"
              className="block text-sm font-medium text-white"
            >
              General Prompt
            </label>

            <textarea
              id="gpt_general_prompt"
              name="gpt_general_prompt"
              className={
                textAreaClass(formData.gpt_general_prompt) + " min-h-28"
              }
              value={formData.gpt_general_prompt}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/2">
            <label
              htmlFor="gpt_auto_prompt"
              className="block text-sm font-medium text-white"
            >
              Auto Mode Prompt
            </label>
            <textarea
              id="gpt_auto_prompt"
              name="gpt_auto_prompt"
              className={textAreaClass(formData.gpt_auto_prompt) + " min-h-28"}
              value={formData.gpt_auto_prompt}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-start items-end">
          {gpt_fields.map((field) => (
            <div key={field.name} className="mr-4 mt-4">
              {" "}
              {/* Ensure key is unique and at the top-level element in map */}
              <DynamicInput
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                handleChange={handleChange}
              />
            </div>
          ))}
        </div>
        <hr className="w-full my-10 h-0.5 bg-lightest-gray mx-auto border-none" />
        <h2 className="text-lg font-semibold mb-4 text-white">
          Document AI Processing
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          <div className="justify-start items-end w-3/4">
            {documentAI_major_fields.map((field) => (
              <div key={field.name} className="mr-4">
                {" "}
                {/* Ensure key is unique and at the top-level element in map */}
                <DynamicInput
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  handleChange={handleChange}
                />
              </div>
            ))}
          </div>

          <div className="justify-start items-end w-3/4">
            {documentAI_custom_fields.map((field) => (
              <div key={field.name} className="mr-4">
                {" "}
                {/* Ensure key is unique and at the top-level element in map */}
                <DynamicInput
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  handleChange={handleChange}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-start items-end w-1/2 mt-5">
            {documentAI_toggle_fields.map((field) => (
              <div key={field.name} className="mr-4 flex items-center">
                {/* Fixed width for the label */}
                <label
                  htmlFor={field.name}
                  className="w-40 text-sm text-white mr-3"
                >
                  {field.label}
                </label>
                <DynamicInput
                  label=""
                  name={field.name}
                  type="checkbox"
                  value={formData[field.name]}
                  handleChange={handleChange}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Other inputs */}

        {/* Additional content */}
      </div>
    </div>
  );
}

export default SettingsPage;
