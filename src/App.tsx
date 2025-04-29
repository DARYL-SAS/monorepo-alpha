import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import {BookText, BotMessageSquare} from "lucide-react";
import ChatbotPage from "./pages/ChatbotPage";
import DocumentsPage from "./pages/DocumentsPage";

/* Components */
import Topbar from "@components/Topbar";
import Sidebar, {SidebarItem} from "@components/Sidebars";

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
      <main className="flex h-screen">
        <Sidebar>
          <SidebarItem to="/chatbot" icon={<BotMessageSquare size={20} />} text="Chatbot" alert={true} />
          <SidebarItem to="/document" icon={<BookText size={20} />} text="Document" active />
        </Sidebar>
        <div className="flex-1 relative">
          <Topbar />
        
          <div className="mt-16 px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/document" element={<DocumentsPage />} />
              <Route path="/chatbot" element={<ChatbotPage />} />
            </Routes>
          </div>
        </div>
      </main>
    </Router>
  );
};

export default App
