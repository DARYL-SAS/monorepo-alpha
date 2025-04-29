import { useLocation } from "react-router-dom";
import { SidebarContext } from "./Sidebars";
import { useContext } from "react";
import {LogOut} from "lucide-react";

export default function Topbar() {
  const location = useLocation();
  const context = useContext(SidebarContext);
  const expanded = context?.expanded;

  // Titre dynamique en fonction du chemin
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/document":
        return "Gestion des documents";
      case "/chatbot":
        return "Assistant intelligent";
      case "/":
        return "Accueil";
      default:
        return "Tableau de bord";
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-16 z-10 bg-white border-b shadow-sm flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800">{getPageTitle()}</h1>
      <button
        className=" hover:text-gray-900 text-gray-400 font-semibold py-2 px-4 rounded transition flex items-center space-x-2"
      >
        <LogOut size={20} className="h-4 w-4" />
        <span>Déconnexion</span>
      </button>
    </header>
  );
}
