import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
//import Header from "./components/Header";
import OperatorPanel from "./pages/OperatorPanel";
import WaitingRoom from "./pages/WaitingRoom";
import AtendidosPanel from "./pages/AtendidosPanel";
import { CallProvider } from "./context/CallContext";
import logo from "./assets/LOGO_TIC.jpeg";
import logohgco from "./assets/logo_HGCO.jpeg";
import "./App.css";

function AppContent() {
  const location = useLocation();

  // Ocultar encabezado y pie en la sala de espera
  const hideHeaderAndFooter = location.pathname === "/sala-espera";

  return (
    <>
      {/* ====== ENCABEZADO ====== */}
      {!hideHeaderAndFooter && (
        <header className="app-header">
          <div className="header-content">
            {/* Logo TIC */}
            <div className="header-left">
              <img src={logo} alt="Logo TIC" className="logo-tic" />
            </div>

            {/* Navegación centrada */}
            <nav className="header-nav">
              <Link to="/" className="nav-link">
                🩺 Panel Operador
              </Link>
              <Link to="/historial" className="nav-link">
                📚 Historial de Atendidos
              </Link>
              <a
                href="/sala-espera"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link special"
              >
                📺 Sala de Espera
              </a>
            </nav>

            {/* Logo HGCO */}
            <div className="header-right">
              <img src={logohgco} alt="HGCO" className="logo-hgco" />
            </div>
          </div>
        </header>
      )}

      {/* ====== CONTENIDO PRINCIPAL ====== */}
      <main
        className="main-content"
        style={{
          marginTop: hideHeaderAndFooter ? "0" : "80px", // quita espacio superior cuando no hay header
          minHeight: hideHeaderAndFooter ? "100vh" : "calc(100vh - 140px)", // ocupa toda la pantalla sin header/footer
        }}
      >
        <Routes>
          <Route path="/" element={<OperatorPanel />} />
          <Route path="/historial" element={<AtendidosPanel />} />
          <Route path="/sala-espera" element={<WaitingRoom />} />
        </Routes>
      </main>

      {/* ====== PIE DE PÁGINA ====== */}
      {!hideHeaderAndFooter && (
        <footer className="app-footer">
          <p>© 2025 HOSPITAL GENERAL CORONEL OVIEDO — Área TIC</p>
        </footer>
      )}
    </>
  );
}

export default function App() {
  return (
    <CallProvider>
      <Router>
        <AppContent />
      </Router>
    </CallProvider>
  );
}
