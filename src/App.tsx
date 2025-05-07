import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { BookText, BotMessageSquare } from "lucide-react";

/* Pages */
import ChatbotPage from "./pages/ChatbotPage";
import DocumentsPage from "./pages/DocumentsPage";

/* Components */
import Topbar from "@components/Topbar";
import Sidebar, {SidebarContext, SidebarItem} from "@components/Sidebars";
import SplashScreen from "@components/SplashScreen";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>This is the home page.</p>
    </div>
  );
};

const App: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Router>
      <SidebarContext.Provider value={{ expanded, setExpanded }}>
        <main className="flex h-screen">
          <Sidebar>
            <SidebarItem to="/" icon={<BotMessageSquare size={20} />} text="Chatbot" alert={false} />
            <SidebarItem to="/document" icon={<BookText size={20} />} text="Document" active />
          </Sidebar>

          <div className="flex-1 relative">
            <Topbar />

            <div
              className="pt-16 transition-all duration-300"
            >
              <Routes>
                <Route path="/" element={<ChatbotPage />} />
                <Route path="/document" element={<DocumentsPage />} />
              </Routes>
            </div>
          </div>
        </main>
      </SidebarContext.Provider>
    </Router>
  );
};

export default App;
