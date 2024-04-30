import { MoreVertical, ChevronLast, ChevronFirst } from "lucide-react";
import { useContext, createContext, useState, ReactNode } from "react";

const SidebarContext = createContext<any>(null);

interface SidebarProps {
  children: ReactNode;
}

// TODO: Change color of detail popups

export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <nav className="h-full flex flex-col bg-gray rounded-xl z-50 p-2">
      <div className="p-4 pb-8 flex justify-between items-center ">
        <img
          src="/PASTAI.svg"
          className={`overflow-hidden transition-all ${
            expanded ? "w-32" : "w-0"
          }`}
          alt=""
        />
        <button
          onClick={() => setExpanded((curr) => !curr)}
          className="text-off-white p-1.5 rounded-lg bg-light-gray hover:bg-light-gray focus:outline-none hover:border-blue"
        >
          {expanded ? <ChevronFirst /> : <ChevronLast />}
        </button>
      </div>

      <SidebarContext.Provider value={{ expanded }}>
        <ul className="flex-1 px-3">{children}</ul>
      </SidebarContext.Provider>

      <div className=" text-off-white border-t flex p-2 m-2">
        <img
          src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
          alt=""
          className="w-10 h-10 rounded-xl transition-all overflow-hidden"
        />
        <div
          className={`
              text-off-white flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
          `}
        >
          <div className="text-off-white leading-4">
            <h4 className="font-semibold">Sewah Studios</h4>
            <span className="text-xs">admin@sewahstudios.com</span>
          </div>
          <MoreVertical size={20} />
        </div>
      </div>
    </nav>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode; // Use React.ReactNode for more accurate typing of React elements
  text: string;
  active: boolean; // It's better to explicitly type this as boolean if it's used as such
  alert?: boolean; // Optional prop should be typed appropriately
  onClick: () => void; // Function that does not take any arguments and returns nothing
}

export function SidebarItem({
  icon,
  text,
  active,
  alert,
  onClick,
}: SidebarItemProps) {
  const { expanded } = useContext(SidebarContext);

  return (
    <li
      className={`
        relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group 
        ${
          active
            ? " bg-light-gray text-blue"
            : "hover:bg-light-gray text-off-white"
        }
    `}
      onClick={onClick}
    >
      {icon}
      <span
        className={`overflow-hidden  ${
          expanded ? " w-52 ml-3" : "w-0"
        }`}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
            expanded ? "" : "top-2"
          }`}
        />
      )}

      {!expanded && (
        <div
          className={`
           absolute left-full rounded-md px-2 py-1 ml-6
          bg-indigo-100 text-indigo-800 text-sm
          invisible opacity-20 -translate-x-3 transition-all
          group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
      `} 
        >
          {text}
        </div>
      )}
    </li>
  );
}
