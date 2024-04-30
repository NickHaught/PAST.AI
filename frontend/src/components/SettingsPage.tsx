import { useEffect, useState } from "react";
import InfoTooltip from "./InfoToolTip";
import StatusMessage from "./StatusMessage";
import Loader from "./Loader";

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

  const [formData, setFormData] = useState({
    aiConfiguration: "Document AI & GPT",
    costLimit: "",
    GPTapiKey: "",
    googleCredentials: "",
    generalPrompt: "",
    autoPrompt: "",
    handWriting: false,
  });

  useEffect(() => {
    const mockData = {
      aiConfiguration: "Document AI & GPT", // Simulated fetched value
      costLimit: 2300, // Example value
      GPTapiKey: null, // Simulated undefined or null value
      googleCredentials: "Key=djjdjsdjjsdjsjd",
      generalPrompt: "This is a general prompt",
      autoPrompt: "This is an auto prompt",
      handWriting: true,
    };

    // Update state with mock data
    setFormData({
      aiConfiguration: mockData.aiConfiguration || "",
      costLimit: mockData.costLimit.toString() || "",
      GPTapiKey: mockData.GPTapiKey || "",
      googleCredentials: mockData.googleCredentials || "",
      generalPrompt: mockData.generalPrompt || "",
      autoPrompt: mockData.autoPrompt || "",
      handWriting: mockData.handWriting,
    });
    setCurrentSelection(mockData.aiConfiguration || "Document AI & GPT");
  }, []);

  const handleSelection = (choice: string) => {
    setCurrentSelection(choice);
    setFormData({ ...formData, aiConfiguration: choice });
  };

  const handleChange = (e: {
    target: { name?: any; value?: any; type?: any; checked?: any };
  }) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const inputClass = (value: any) => {
    return `mt-1 p-2 w-full rounded-lg text-white bg-light-gray shadow-lg focus:ring-2 transition duration-300 ease-in-out ${
      !value
        ? "border-red-600 focus:ring-red-600 hover:border-red-600 focus:border-red-600"
        : "hover:border-blue focus:ring-blue focus:border-blue border-lightest-gray"
    }`;
  };

  const textAreaClass = (value: any) => {
    return `mt-1 p-2 w-full rounded-lg resize-none text-white bg-light-gray shadow-lg focus:ring-2 transition duration-300 ease-in-out scrollbar-webkit ${
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
        <h2 className="text-lg font-semibold mb-4 text-white">
          General & Account
        </h2>
        <div className="flex justify-start items-end space-x-4">
          <div>
            <label
              htmlFor="costLimit"
              className="block text-sm font-medium text-white mb-1"
            >
              GPT API Key
              <InfoTooltip
                link="https://openai.com/blog/openai-api"
                message="The GPT API key provides authorized access to OpenAI's powerful language models. Use it to query GPT for responses based on your input."
              />
            </label>
            <input
              type="text"
              id="GPTapiKey"
              name="GPTapiKey"
              className={inputClass(formData.GPTapiKey)}
              value={formData.GPTapiKey}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="costLimit"
              className="block text-sm font-medium text-white mb-1"
            >
              Document AI Credentials
              <InfoTooltip
                link="https://cloud.google.com/document-ai/docs/setup"
                message="Credentials required to authenticate and access Document AI services for enhanced document processing capabilities."
              />
            </label>
            <input
              type="text"
              id="googleCredentials"
              name="googleCredentials"
              className={inputClass(formData.googleCredentials)}
              value={formData.googleCredentials}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="costLimit"
              className="block text-sm font-medium text-white mb-1"
            >
              Cost Limit ($)
              <InfoTooltip message="Set a maximum spending limit to control overall expenses. This limit ensures that your usage does not exceed your budgetary constraints." />
            </label>
            <input
              type="number"
              id="costLimit"
              name="costLimit"
              className={`${inputClass(formData.costLimit)} max-w-32`}
              value={formData.costLimit}
              onChange={handleChange}
              step="1"
              min="1"
            />
          </div>
          <div>
            <label
              htmlFor="aiUtility"
              className="block text-sm font-medium text-white mb-2"
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
        <h2 className="text-lg font-semibold mb-4 text-white">GPT Prompts</h2>
        <div className="flex w-full justify-start items-end space-x-4">
          <div className="w-1/2">
            <label
              htmlFor="field1"
              className="block text-sm font-medium text-white mb-1"
            >
              General Prompt
            </label>

            <textarea
              id="generalPrompt"
              name="generalPrompt"
              className={textAreaClass(formData.generalPrompt)}
              value={formData.generalPrompt}
              onChange={handleChange}
            />
          </div>
          <div className="w-1/2">
            <label
              htmlFor="field1"
              className="block text-sm font-medium text-white mb-1"
            >
              Auto Mode Prompt
            </label>
            <textarea
              id="autoPrompt"
              name="autoPrompt"
              className={textAreaClass(formData.autoPrompt)}
              value={formData.autoPrompt}
              onChange={handleChange}
            />
          </div>
        </div>
        <hr className="w-full my-10 h-0.5 bg-lightest-gray mx-auto border-none" />
        <h2 className="text-lg font-semibold mb-4 text-white">
          Document AI Processing
        </h2>
        <div className="grid grid-cols-2 gap-4 w-1/2">
          <div>
            <div>
              <label
                htmlFor="costLimit"
                className="block text-sm font-medium text-white mb-1"
              >
                Token
              </label>
              <input
                type="number"
                id="costLimit"
                name="costLimit"
                className="mt-1 p-2 max-w-32 rounded-lg text-white bg-light-gray border-gray-300 shadow-lg hover:border-blue focus:border-blue focus:ring-2 focus:ring-blue transition duration-300 ease-in-out"
                value={formData.costLimit}
                onChange={handleChange}
                step="1"
                min="0"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="hs-xs-switch"
              className="text-sm text-white ms-3 p-3"
            >
              Hand Writing
            </label>
            <input
              type="checkbox"
              id="hs-xs-switch"
              name="handWriting"
              className="relative w-[35px] h-[21px] bg-lightest-gray border-transparent text-transparent rounded-full cursor-pointer transition-colors transition-shadow ease-in-out duration-300 focus:ring-2 focus:ring-gray focus:ring-opacity-0 focus:ring-opacity-50 disabled:opacity-50 disabled:pointer-events-none checked:bg-none checked:text-blue checked:border-gray
  before:inline-block before:size-4 before:bg-white checked:before:bg-white before:translate-x-0 checked:before:translate-x-full before:rounded-full before:shadow before:transform before:transition before:ease-in-out before:duration-200"
              checked={formData.handWriting}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* Other inputs */}

        {/* Additional content */}
      </div>
    </div>
  );
}

export default SettingsPage;
