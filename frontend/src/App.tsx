import "./App.css";
import MainDocumentContainer from "./components/MainDocumentContainer";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { ScrollText, Database, LineChart, Settings } from "lucide-react";
import { uploadUrlContext } from "./contexts/Context";
import { useState } from "react";
import PopupModal from './components/PopupModal';

function App() {
  const [showPopup, setShowPopup] = useState(false);

  const handleToggleAuto = () => {
    setShowPopup(!showPopup);
  };


  return (
    <>
      <uploadUrlContext.Provider value="http://localhost:8000/api/upload/">
     
        <main className={`flex h-[96vh] space-x-4 p-6 transition-opacity duration-400 ease-in-out ${showPopup ? 'opacity-30' : 'opacity-100'}`}>
          <Sidebar>
            <SidebarItem
              icon={<ScrollText size={20} />}
              text="Scanner"
              active={true}
              alert={undefined}
            />
            <SidebarItem
              icon={<Database size={20} />}
              text="Database"
              active={undefined}
              alert={undefined}
            />
            <SidebarItem
              icon={<LineChart size={20} />}
              text="Analystics"
              active={undefined}
              alert={undefined}
            />
            <SidebarItem
              icon={<Settings size={20} />}
              text="Settings"
              active={undefined}
              alert={undefined}
            />
          </Sidebar>

          <MainDocumentContainer onToggleAuto={handleToggleAuto}/>
        </main>
        {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}
      </uploadUrlContext.Provider>
    </>
  );
}

export default App;
