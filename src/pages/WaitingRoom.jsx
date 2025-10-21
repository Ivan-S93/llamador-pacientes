import { useEffect, useState } from "react";

export default function WaitingRoom() {
  const [paciente, setPaciente] = useState(null);

  const fetchLlamado = async () => {
    const res = await fetch("http://localhost:4000/llamado");
    const data = await res.json();
    setPaciente(data);
  };

  useEffect(() => {
    fetchLlamado(); // primera carga
    const interval = setInterval(fetchLlamado, 3000); // cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#003366",
        color: "white",
        fontSize: "2rem",
      }}
    >
      <h1>🩺 Sala de Espera a Pre-Consulta </h1>
      {paciente ? (
        <>
          <p>Paciente llamado:</p>
          <h2 style={{ fontSize: "3rem", color: "#00ffcc" }}>
            { paciente.nombre } { paciente.apellido }
          </h2>
          <h3>CI: {paciente.cinro}</h3>
        </>
      ) : (
        <p>Esperando próximo paciente...</p>
      )}
    </div>
  );
}
