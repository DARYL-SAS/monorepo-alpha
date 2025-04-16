import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatbotPage from "./pages/ChatbotPage";
import DocumentsPage from "./pages/DocumentsPage";
import Layout from "./layouts/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<div>Hello, World!</div>} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/document" element={<DocumentsPage />} />
          {/* D'autre route ici */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
