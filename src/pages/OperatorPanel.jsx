import { useState, useEffect, useContext } from "react";
import { CallContext } from "../context/CallContext";
import { getPacientes, addPaciente } from "../services/api";

// Estilos base para los inputs más grandes y uniformes
const inputStyle = {
  padding: '10px 15px', // Aumentar el padding para hacerlos más altos
  marginRight: '10px', // Espacio entre los inputs
  border: '1px solid #ccc',
  borderRadius: '5px',
  fontSize: '16px', // Opcional: aumentar un poco el tamaño de la fuente
  width: '180px', // Fijar un ancho para que sean uniformes
};

// Estilos para el botón de Agregar (para que coincida con el tamaño)
const buttonStyle = {
  padding: '10px 15px',
  border: 'none',
  borderRadius: '5px',
  backgroundColor: '#4CAF50',
  color: 'white',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
};

export default function OperatorPanel() {
  const { callPatient } = useContext(CallContext);
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({ cinro: "", nombre: "", apellido: "" });
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    const data = await getPacientes();
    setPacientes(data);
  };

  const ocultarMensaje = () => {
    setTimeout(() => setMensaje(null), 3000);
  };

  const agregarPaciente = async () => {
    if (!form.cinro || !form.nombre || !form.apellido) {
      setMensaje({ tipo: "error", texto: "⚠️ Completa todos los campos" });
      ocultarMensaje();
      return;
    }

    try {
      const nuevo = await addPaciente(form);
      setPacientes([nuevo, ...pacientes]);
      setForm({ cinro: "", nombre: "", apellido: "" });
      setMensaje({ tipo: "exito", texto: "✅ Paciente agregado correctamente" });
      ocultarMensaje();
    } catch (error) {
      setMensaje({ tipo: "error", texto: "❌ Error al agregar paciente" });
      ocultarMensaje();
    }
  };

  const llamarPaciente = async (paciente) => {
    try {
      await fetch("http://localhost:4000/llamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paciente.id }),
      });

      setMensaje({
        tipo: "exito",
        texto: `📢 Llamando a ${paciente.nombre} ${paciente.apellido}`,
      });
      ocultarMensaje();
      
      const mensajeVoz = `Paciente ${paciente.nombre} ${paciente.apellido}, favor pasar a preconsulta.`;
      const voz = new SpeechSynthesisUtterance(mensajeVoz);
      voz.lang = "es-ES";
      voz.rate = 0.55;
      voz.pitch = 1;
      speechSynthesis.speak(voz);
      
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: `❌ Error al llamar a ${paciente.nombre} ${paciente.apellido}`,
      });
      ocultarMensaje();
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>🩺 Panel del Operador</h2>

      {/* Mensaje visual */}
      {mensaje && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            backgroundColor:
              mensaje.tipo === "exito" ? "rgba(0, 255, 100, 0.15)" : "rgba(255, 80, 80, 0.15)",
            color: mensaje.tipo === "exito" ? "#4CAF50" : "#f44336",
            transition: "opacity 0.3s ease",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario CON INPUTS MÁS GRANDES */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="CI"
          value={form.cinro}
          onChange={(e) => setForm({ ...form, cinro: e.target.value })}
          style={inputStyle} // 👈 Aplicando el estilo aquí
        />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          style={inputStyle} // 👈 Aplicando el estilo aquí
        />
        <input
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          style={inputStyle} // 👈 Aplicando el estilo aquí
        />
        <button onClick={agregarPaciente} style={buttonStyle}>
          Agregar
        </button>
      </div>

      {/* Contador de pacientes */}
      <h3 style={{ marginBottom: "1rem", color: "#ccc" }}>
        🕒 Pacientes en sala de espera:{" "}
        <span style={{ color: "#4CAF50", fontWeight: "bold" }}>{pacientes.length}</span>
      </h3>

      {/* Lista */}
      <ul>
        {pacientes.map((p) => (
          <li key={p.id} style={{ margin: "8px 0" }}>
            {p.cinro} - {p.nombre} {p.apellido}{" "}
            <button
              onClick={() => llamarPaciente(p)}
              style={{
                // Estilo para el botón Llamar (lo puedes ajustar también)
                padding: '8px 15px',
                backgroundColor: '#ff3300ff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Llamar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}