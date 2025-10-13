import { useState, useEffect, useContext } from "react";
import { CallContext } from "../context/CallContext";
import { getPacientes, addPaciente } from "../services/api";

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

  const ocultarMensaje = () => {
    setTimeout(() => setMensaje(null), 3000); // se ocultan los mensajes despues de 3 segundos
  };

  const llamarPaciente = (nombre, apellido) => {
    const mensaje = `Paciente ${nombre} ${apellido} ,favor pasar a preconsulta. ` ;
    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-ES"; 
    voz.rate = 0.55;
    voz.pitch = 1 
    speechSynthesis.speak(voz);
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

      {/* Formulario */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="CI"
          value={form.cinro}
          onChange={(e) => setForm({ ...form, cinro: e.target.value })}
        />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />
        <input
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        />
        <button onClick={agregarPaciente}>Agregar</button>
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
              onClick={() => {
                callPatient(p);
                llamarPaciente(p.nombre, p.apellido);
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

