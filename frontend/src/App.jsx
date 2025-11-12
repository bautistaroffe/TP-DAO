import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/Home";
import PredioPage from "./pages/Predio";
import CanchasPage from "./pages/CanchasPage";
import ReportesPage from "./pages/Reportes";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/pages.css";
import "./App.css"
import TurnosPage from "./pages/TurnosPage.jsx";
import UsuariosPage from "./pages/UsuariosPage.jsx";
import PagosPage from "./pages/PagosPage.jsx";
import ReservasPage from "./pages/ReservasPage.jsx";
import TorneosPage from "./pages/TorneosPage.jsx";


export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/predio" element={<PredioPage />} />
            <Route path="/predio/canchas" element={<CanchasPage />} />
           <Route path="/predio/turnos" element={<TurnosPage />} />
            <Route path="/predio/usuarios" element={<UsuariosPage />} />
            <Route path="/predio/pagos" element={<PagosPage />} />
            <Route path="/predio/reservas" element={<ReservasPage />} />
            <Route path="/predio/torneos" element={<TorneosPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
