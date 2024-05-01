import "./App.css";
import MainDocumentContainer from "./components/ScannerPage";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { ScrollText, Database, LineChart, Settings } from "lucide-react";
import { useState } from "react";
import PopupModal from './components/PopupModal';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import SettingsPage from "./components/SettingsPage";


function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeItem, setActiveItem] = useState('scanner');

  const handleToggleAuto = () => {
    setShowPopup(!showPopup);
  };


  return (
    <Router>
      
     
        <main className={`flex h-[96vh] w-screen space-x-4 p-6 transition-opacity duration-400 ease-in-out ${showPopup ? 'opacity-30' : 'opacity-100'}`}>
          <Sidebar>
          <NavLink to="/scanner" >
            <SidebarItem
              icon={<ScrollText size={20} />}
              text="Scanner"
              active={activeItem === 'scanner'}
              onClick={() => setActiveItem('scanner')}
            />
            </NavLink>
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
              <NavLink to="/settings" ><SidebarItem
              icon={<Settings size={20} />}
              text="Settings"
              active={activeItem === 'settings'}
              onClick={() => setActiveItem('settings')}
            /></NavLink>
            
          </Sidebar>
          <Routes>
          <Route/>
            <Route path="/scanner" element={<MainDocumentContainer onToggleAuto={handleToggleAuto}/>} />
            <Route path="/database" element={<div>Database Page</div>} />
            <Route path="/analytics" element={<div>Analytics Page</div>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>

          
        </main>
        {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}
     
    </Router>
  );
}

export default App;
