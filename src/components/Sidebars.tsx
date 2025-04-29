import { ChevronLast, ChevronFirst} from "lucide-react";
import { useContext, createContext, useState } from "react";
import {NavLink} from "react-router-dom";

interface SidebarContextType {
  expanded: boolean;
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className="h-screen overflow-hidden z-20 relative">
      <nav className={`h-full inline-flex flex-col bg-white border-r shadow-sm transition-all duration-300 ${expanded ? "w-52" : "w-16"}`}>

        {/* Logo and toggle button for sidebar expansion */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <img
            src="./logo_horizontale.png"
            className={`overflow-hidden transition-all ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
            alt=""
          />
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        {/* Sidebar items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 overflow-y-auto overflow-x-hidden">
            {children}
          </ul>
        </SidebarContext.Provider>

        {/* User profile and settings */}
        <div className={`w-full flex items-center border-t p-3 bg-white transition-all duration-300 ${expanded ? "flex-row" : "flex-col items-center"}`}>
          <img
            src="https://ui-avatars.com/api/?background=c7d2fe&color=3730a3&bold=true"
            alt=""
            className="w-10 h-10 rounded-md"
          />
          {expanded && (
            <div className="flex flex-col justify-center ml-3 overflow-hidden max-w-[9rem]">
              <h4 className="font-semibold text-sm truncate">John Doe</h4>
              <span className="text-xs text-gray-600 truncate">johndoe@gmail.com</span>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
}

export function SidebarItem({ to, icon, text, active, alert }: SidebarItemProps) {
  const context = useContext(SidebarContext);

  if (!context) {
    throw new Error("SidebarItem must be used within a Sidebar");
  }
  const { expanded } = context;

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center py-2 px-3 my-1
        font-medium rounded-md cursor-pointer
        transition-colors group
        ${
          isActive
            ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
            : "hover:bg-indigo-50 text-gray-600"
        }`
      }
    >
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      
      <span
        className={`overflow-hidden transition-all ${
          expanded ? "w-52 ml-3" : "w-0"
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
    </NavLink>
  );
}
