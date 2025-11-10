import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/Home";
import PredioPage from "./pages/Predio";
import ReportesPage from "./pages/Reportes";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/pages.css";
import "./App.css"


export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predio" element={<PredioPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
