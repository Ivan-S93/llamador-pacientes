import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import OperatorPanel from "./pages/OperatorPanel";
import WaitingRoom from "./pages/WaitingRoom";
import { CallProvider } from "./context/CallContext";

function App() {
  const [view, setView] = useState("operator");

  return (
        <CallProvider>
      <Router>
        <div style={{ textAlign: "center", margin: "1rem" }}>
          <a href="/" style={{ marginRight: "1rem" }}>Panel Operador</a>
          <a href="/sala-espera" target="_blank" rel="noopener noreferrer">
            Sala de Espera
          </a>
        </div>

        <Routes>
          <Route path="/" element={<OperatorPanel />} />
          <Route path="/sala-espera" element={<WaitingRoom />} />
        </Routes>
      </Router>
    </CallProvider>
  );
}

export default App;
