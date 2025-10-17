import { useState, useEffect, useContext } from "react";
import { CallContext } from "../context/CallContext";
import { addPaciente } from "../services/api";

const inputStyle = {
  padding: "10px 15px",
  marginRight: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
  width: "180px",
};

const buttonStyle = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#4CAF50",
  color: "white",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
  transition: "background-color 0.3s",
};

export default function OperatorPanel() {
  const { callPatient } = useContext(CallContext);
  const [pacientes, setPacientes] = useState([]);
  const [atendidos, setAtendidos] = useState([]);
  const [form, setForm] = useState({ cinro: "", nombre: "", apellido: "" });
  const [mensaje, setMensaje] = useState(null);
  const [pacienteLlamado, setPacienteLlamado] = useState(null);

  useEffect(() => {
    cargarPacientes();
    cargarAtendidos();
  }, []);

  const cargarPacientes = async () => {
    const res = await fetch("http://localhost:4000/pacientes");
    const data = await res.json();
    setPacientes(data);
  };

  const cargarAtendidos = async () => {
    const res = await fetch("http://localhost:4000/atendidos");
    const data = await res.json();
    setAtendidos(data);
  };

  const ocultarMensaje = () => setTimeout(() => setMensaje(null), 3000);

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
      // 🔹 Llamar paciente en backend
      await fetch("http://localhost:4000/llamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paciente.id }),
      });

      // 🔹 Guardar referencia local para cambiar color del botón
      setPacienteLlamado(paciente.id);

      setMensaje({
        tipo: "exito",
        texto: `📢 Llamando a ${paciente.nombre} ${paciente.apellido}`,
      });
      ocultarMensaje();

      // 🔊 Voz
      const mensajeVoz = `Paciente ${paciente.nombre} ${paciente.apellido}, favor pasar a preconsulta.`;
      const voz = new SpeechSynthesisUtterance(mensajeVoz);
      voz.lang = "es-ES";
      voz.rate = 0.55;
      voz.pitch = 1;
      speechSynthesis.speak(voz);

      // 🔄 Recargar lista de atendidos
      await cargarAtendidos();
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

      {mensaje && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            backgroundColor:
              mensaje.tipo === "exito"
                ? "rgba(0, 255, 100, 0.15)"
                : "rgba(255, 80, 80, 0.15)",
            color: mensaje.tipo === "exito" ? "#4CAF50" : "#f44336",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* 🧾 Formulario */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="CI"
          value={form.cinro}
          onChange={(e) => setForm({ ...form, cinro: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          style={inputStyle}
        />
        <button onClick={agregarPaciente} style={buttonStyle}>
          Agregar
        </button>
      </div>

      {/* 🧱 Contenedor principal lado a lado */}
      <div style={{ display: "flex", gap: "2rem" }}>
        {/* 🕒 Columna izquierda - Sala de espera */}
        <div style={{ flex: 1 }}>
          <h3>
            🕒 En sala de espera:{" "}
            <span style={{ color: "#4CAF50", fontWeight: "bold" }}>
              {pacientes.length}
            </span>
          </h3>
          <ul>
            {pacientes.map((p) => (
              <li key={p.id} style={{ margin: "8px 0" }}>
                {p.cinro} - {p.nombre} {p.apellido}{" "}
                <button
                  onClick={() => llamarPaciente(p)}
                  style={{
                    padding: "8px 15px",
                    backgroundColor:
                      pacienteLlamado === p.id ? "#2196f3" : "#ff3300",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                >
                  {pacienteLlamado === p.id ? "Atendido" : "Llamar"}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ Columna derecha - Atendidos */}
        <div style={{ flex: 1 }}>
          <h3>
            ✅ Pacientes atendidos hoy:{" "}
            <span style={{ color: "#2196f3", fontWeight: "bold" }}>
              {atendidos.length}
            </span>
          </h3>
          <ul>
            {atendidos.map((a) => (
              <li key={a.id} style={{ margin: "8px 0" }}>
                {a.cinro} - {a.nombre} {a.apellido} <br />
                <small style={{ color: "#888" }}>
                  ⏰ {new Date(a.fecha_llamado).toLocaleString("es-ES")}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
