import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from "./pages/HomePage";
import ChatbotPage from "./pages/ChatbotPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Hello, World!</div>} />
        <Route path="/chatbot" element={<ChatbotPage />} />
      </Routes>
    </Router>
  )
}

export default App
