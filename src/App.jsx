import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import OperatorPanel from "./pages/OperatorPanel";
import WaitingRoom from "./pages/WaitingRoom";
import AtendidosPanel from "./pages/AtendidosPanel";
import { CallProvider } from "./context/CallContext";
import logo from "./assets/logoTic.webp";
import "./App.css";

function App() {
  
  return (
    
    <CallProvider>
      <Router>
        {/*======= ENCABEZADO========*/}
        <header className="app-header">
          <div className="header-content">
            {/*logo tic */}
            <div className="header-left">
              <img src={logo} alt="Logo TIC" className="logo-hospital"/>
            </div>

              {/* Navegacion centrada */ }
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
          </div>
        </header>

        {/* ============ CONTENIDO PRINCIPAL ============= */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<OperatorPanel /> } />
            <Route path="/historial" element={<AtendidosPanel />} />
            <Route path="/sala-espera" element={<WaitingRoom />} />
          </Routes>
        </main>

        {/* ============ PIE DE PAGINA ===================*/}
        <footer className="app-footer">
          <p> © 2025 Sistema de Llamador de Pacientes — Área TIC </p>
        </footer>
      </Router>
    </CallProvider>
  );
}

export default App;