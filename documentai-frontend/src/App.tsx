import "./App.css";
import MainDocumentContainer from "./components/MainDocumentContainer";
import Sidebar, { SidebarItem } from "./components/Sidebar";
import { ScrollText, Database , LineChart, Settings} from "lucide-react";


function App() {
  return (
    <>
      <main className="flex h-[96vh] space-x-4 p-6">
        <Sidebar>
          <SidebarItem icon={<ScrollText size={20} />} text="Scanner" active={true} alert={undefined} />
          <SidebarItem icon={<Database size={20} />} text="Database" active={undefined} alert={undefined} />
          <SidebarItem icon={<LineChart size={20} />} text="Analystics" active={undefined} alert={undefined} />
          <SidebarItem icon={<Settings size={20} />} text="Settings" active={undefined} alert={undefined} />
        </Sidebar>
        <MainDocumentContainer />
      </main>
    </>
  );
}

export default App;
