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
  // 🟢 Mantenemos un estado simple para el paciente que está "flotando" (llamado)
  const [pacienteLlamado, setPacienteLlamado] = useState(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    await cargarPacientes();
    await cargarAtendidos();
    // 📝 Al inicio, cargamos también el paciente que está actualmente siendo llamado
    await cargarLlamadoActual();
  };

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

  const cargarLlamadoActual = async () => {
    const res = await fetch("http://localhost:4000/llamado");
    const data = await res.json();
    // Si hay un llamado, lo guardamos en el estado local para mostrarlo
    if (data && data.id) {
      setPacienteLlamado(data);
    }
  };

  const ocultarMensaje = () => setTimeout(() => setMensaje(null), 3000);

  const agregarPaciente = async () => {
    // ... (Lógica de agregar paciente ) ...
    if (!form.cinro || !form.nombre || !form.apellido) {
      setMensaje({ tipo: "error", texto: "⚠️ Completa todos los campos" });
      ocultarMensaje();
      return;
    }

    try {
      // Asumiendo que addPaciente usa la ruta POST /pacientes
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
      // 🔹 Llamar paciente en backend (actualiza llamado_actual)
      await fetch("http://localhost:4000/llamar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paciente.id }),
      });

      // 🔹 Establecer como paciente flotante
      setPacienteLlamado(paciente);

      // 🔹 Remover al paciente de la lista de espera (porque ya fue llamado)
      setPacientes(pacientes.filter(p => p.id !== paciente.id));

      setMensaje({
        tipo: "exito",
        texto: `📢 Paciente ${paciente.nombre} ${paciente.apellido} llamado.`,
      });
      ocultarMensaje();

      // 🔊 Voz
      /*const mensajeVoz = `Paciente ${paciente.nombre} ${paciente.apellido}, favor pasar a preconsulta.`;
      const voz = new SpeechSynthesisUtterance(mensajeVoz);
      voz.lang = "es-ES";
      voz.rate = 0.55;
      voz.pitch = 1;
      speechSynthesis.speak(voz);*/

      const sonidoAviso = new Audio("/public/doorbell-329311.mp3");
      const mensajeVoz = `Paciente ${paciente.nombre} ${paciente.apellido}, favor pasar a preconsulta.`;

      // Funcion para reproducir el sonido antes del mensaje
      const reproducirAviso = () => {
        // Primero suena el ding
        sonidoAviso.play();
        // Después de 1 segundo empieza la voz
        setTimeout(() => {
          for (let i = 0; i < 2; i++) { // repetir 2 veces
            setTimeout(() => {
              const voz = new SpeechSynthesisUtterance(mensajeVoz);
              voz.lang = "es-ES";
              voz.rate = 0.45;
              voz.pitch = 1;
              speechSynthesis.speak(voz);
            }, i * 3000); // 3 segundos entre repeticiones
          }
        }, 1000);
      };
      // Llamada a la función
      reproducirAviso();


    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: `❌ Error al llamar a ${paciente.nombre} ${paciente.apellido}`,
      });
      ocultarMensaje();
    }
  };

  // ➕ NUEVA FUNCIÓN: Mover a Atendido (completa el ciclo)
  const marcarComoAtendido = async (paciente) => {
    try {
      // 🔹 Llamada al nuevo endpoint POST /atender
      await fetch("http://localhost:4000/atender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pacienteId: paciente.id }),
      });

      // 🔹 Limpiar el paciente flotante
      setPacienteLlamado(null);

      // 🔹 Recargar la lista de atendidos (o simplemente agregarlo al estado local)
      await cargarAtendidos();

      setMensaje({
        tipo: "exito",
        texto: `✅ Paciente ${paciente.nombre} atendido y registrado.`,
      });
      ocultarMensaje();

    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: `❌ Error al marcar a ${paciente.nombre} como atendido.`,
      });
      ocultarMensaje();
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "#2c7be5" }}>🩺 Panel del Operador</h2>
        <span style={{ fontSize: "1rem", color: "#444", fontWeight: "500" }}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>


      {/* ... (Mensaje visual se mantiene igual) ... */}
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

      {/* 🧾 Formulario  */}
      <div style={{ marginBottom: "2rem" }}>
        {/* ... inputs y botón Agregar ... */}
        <input
          placeholder="4111222"
          value={form.cinro}
          onChange={(e) => setForm({ ...form, cinro: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="JUAN"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="PEREZ"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          style={inputStyle}
        />
        <button onClick={agregarPaciente} style={buttonStyle}>
          Agregar
        </button>
      </div>

      {/* ========================================================= */}
      {/* 📞 ZONA DEL PACIENTE LLAMADO (FLOTANTE) - ACTUALIZADO */}
      {/* ========================================================= */}
      {pacienteLlamado && (
        <div style={{
          backgroundColor: '#fffbe0',
          border: '2px solid #ffc107',
          padding: '1.5rem', // Aumentamos el padding
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>
              Paciente Llamado (En Box):
            </h3>
            {/* 🟢 Mostrando el nombre y apellido grande y en negrita */}
            <p style={{
              margin: 0,
              fontWeight: 'bold',
              fontSize: '24px', // Tamaño de fuente más grande
              color: '#333'
            }}>
              {pacienteLlamado.nombre} {pacienteLlamado.apellido}
              <small style={{
                fontSize: '14px',
                color: '#888',
                marginLeft: '10px'
              }}>CI: {pacienteLlamado.cinro}</small>
            </p>
          </div>
          <button
            onClick={() => marcarComoAtendido(pacienteLlamado)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#00c853", // Verde para Atendido
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: 'bold',
              fontSize: '16px',
              marginLeft: '20px' // Espacio para separar del texto
            }}
          >
            Marcar como ATENDIDO
          </button>
        </div>
      )}

      {/* 🧱 Contenedor principal lado a lado */}
      <div style={{ display: "flex", gap: "2rem" }}>

        {/* 🕒 Columna izquierda - Sala de espera */}
        <div style={{ flex: 1 }}>
          <h3>
            🕒 En sala de espera:{" "}
            <span style={{ color: "#ff3300", fontWeight: "bold" }}>
              {pacientes.length}
            </span>
          </h3>
          <ul>
            {pacientes.map((p) => (
              <li key={p.id} style={{ margin: "8px 0", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {p.cinro} - {p.nombre} {p.apellido}{" "}
                </span>
                <button
                  onClick={() => llamarPaciente(p)}
                  // 📝 Botón 'Llamar' simple, sin condición de llamado actual
                  style={{
                    padding: "8px 15px",
                    backgroundColor: "#ff3300",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                >
                  Llamar
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
              {
                atendidos.filter(
                  (a) =>
                    new Date(a.fecha_llamado).toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0]
                ).length
              }
            </span>
          </h3>

          {/* Lista filtrada por la fecha actual */}
          <ul>
            {atendidos
              .filter(
                (a) =>
                  new Date(a.fecha_llamado).toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0]
              )
              .map((a) => (
                <li key={a.id} style={{ margin: "8px 0" }}>
                  {a.cinro} - {a.nombre} {a.apellido} <br />
                  <small style={{ color: "#888" }}>
                    ⏰ {new Date(a.fecha_llamado).toLocaleString("es-ES")}
                  </small>
                </li>
              ))}

            {/* Si no hay atendidos hoy */}
            {atendidos.filter(
              (a) =>
                new Date(a.fecha_llamado).toISOString().split("T")[0] ===
                new Date().toISOString().split("T")[0]
            ).length === 0 && (
                <p style={{ color: "#888" }}>Ningún paciente atendido aún hoy.</p>
              )}
          </ul>
        </div>
      </div>
    </div>
  );
}
