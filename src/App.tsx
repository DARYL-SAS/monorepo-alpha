import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar, {SidebarItem} from "./components/Sidebars";
import {LifeBuoy, Receipt, Boxes, Package, UserCircle, BarChart3, LayoutDashboard, Settings} from "lucide-react";
import ChatbotPage from "./pages/ChatbotPage";
import DocumentsPage from "pages/DocumentsPage";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>This is the home page.</p>
    </div>
  );
}

const App:React.FC = () => {
  return (
    <Router>
      <main className="App">
        <Sidebar>
          <SidebarItem to="/chatbot" icon={<LayoutDashboard size={20} />} text="Chatbot" alert={true} />
          <SidebarItem to="/document" icon={<BarChart3 size={20} />} text="Document" active />
        </Sidebar>

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/document" element={<DocumentsPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
          </Routes>
        </div>
      </main>
    </Router>
  );
};

export default App
