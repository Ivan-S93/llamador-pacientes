import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"; // 👈 Importar Link
import { useState } from "react";
import OperatorPanel from "./pages/OperatorPanel";
import WaitingRoom from "./pages/WaitingRoom";
import { CallProvider } from "./context/CallContext";
import AtendidosPanel from "./pages/AtendidosPanel";

function App() {
  // El estado 'view' ya no es necesario si usas React Router para la navegación
  // const [view, setView] = useState("operator"); 

  return (
    <CallProvider>
      <Router>
        {/* Barra de Navegación centralizada */}
        <nav style={{ 
          padding: '1rem', 
          background: '#003366', // Un color más corporativo
          color: 'white',
          display: 'flex',
          justifyContent: 'center', // Centrar los enlaces
          gap: '30px' 
        }}>
          {/* 1. Enlace al Panel del Operador (Ruta /) */}
          <Link 
            to="/" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            🩺 Panel Operador
          </Link>
          
          {/* 2. Enlace al Historial de Atendidos (Nueva Ruta) */}
          <Link 
            to="/historial" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            📚 Historial de Atendidos
          </Link>
          
          {/* 3. Enlace a la Sala de Espera (mantenemos el <a> para abrir en nueva pestaña) */}
          <a 
            href="/sala-espera" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#ffc107', // Color que destaque
              textDecoration: 'none', 
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            📺 Sala de Espera
          </a>
        </nav>

        <div style={{ padding: "1rem" }}>
          <Routes>
            {/* Ruta principal: Panel del Operador */}
            <Route path="/" element={<OperatorPanel />} />
            
            {/* Nueva Ruta: Panel de Historial Atendido */}
            <Route path="/historial" element={<AtendidosPanel />} /> 
            
            {/* Ruta de Sala de Espera */}
            <Route path="/sala-espera" element={<WaitingRoom />} />
          </Routes>
        </div>
      </Router>
    </CallProvider>
  );
}

export default App;