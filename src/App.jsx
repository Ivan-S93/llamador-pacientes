import { useState } from "react";
import OperatorPanel from "./pages/OperatorPanel";
import WaitingRoom from "./pages/WaitingRoom";
import { CallProvider } from "./context/CallContext";

function App() {
  const [view, setView] = useState("operator");

  return (
    <CallProvider>
      <div style={{ textAlign: "center", margin: "1rem"}}>
        <button onClick={() => setView("operador")}>Panel Operador</button>
        <button onClick={() => setView("waiting")}>Sala de Espera</button>
      </div>

      {view === "operador" ? <OperatorPanel /> : <WaitingRoom />}
    </CallProvider>
  )
}

export default App
