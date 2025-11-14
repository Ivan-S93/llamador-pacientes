import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/LOGO_TIC.jpeg";
import logohgco from "../assets/logo_HGCO.jpeg";

export default function WaitingRoom() {
  const [paciente, setPaciente] = useState(null);
  const [atendidos, setAtendidos] = useState([]); // ✅ inicializado vacío
  const [error, setError] = useState(null);

  // 🧠 Cargar paciente actual
  const fetchLlamado = async () => {
    try {
      const res = await fetch("http://localhost:4000/llamado");
      if (!res.ok) throw new Error("Error al obtener paciente actual");
      const data = await res.json();
      setPaciente(data);
    } catch (error) {
      console.error(error);
      setPaciente(null);
    }
  };

  // 🧠 Cargar pacientes atendidos
  const cargarAtendidos = async () => {
    try {
      const res = await fetch("http://localhost:4000/atendidos");
      if (!res.ok) throw new Error("Error al obtener atendidos");
      const data = await res.json();
      setAtendidos(Array.isArray(data) ? data : []); // ✅ seguridad extra
    } catch (error) {
      console.error(error);
      setAtendidos([]); // ✅ evita que falle el render
      setError("No se pudieron cargar los pacientes atendidos.");
    }
  };

  // 🔁 Actualización automática
  useEffect(() => {
    fetchLlamado();
    cargarAtendidos();

    const interval = setInterval(() => {
      fetchLlamado();
      cargarAtendidos();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filtrar solo los atendidos de hoy y ordenar por fecha_llamado descendente
  const atendidosHoy = atendidos
    .filter(
      (a) =>
        a.fecha_llamado &&
        new Date(a.fecha_llamado).toISOString().split("T")[0] ===
        new Date().toISOString().split("T")[0]
    )
    .sort((a, b) => new Date(b.fecha_llamado) - new Date(a.fecha_llamado)); // más recientes primero


  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, #edf0f3f1, #eaeef1ff)",
        //background: "linear-gradient(135deg, #8abbecff, #e0e5ebff)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "5rem 4rem",
      }}
    >
      {/* 🔹 Encabezado con logos */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {/* Logo TIC */}
        <div>
          <img
            src={logo}
            alt="Logo TIC"
            style={{
              height: "80px",
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
              opacity: 0.95,
              borderRadius: "12px",
            }}
          />
        </div>

        {/* Título principal */}
        <h1
          style={{
            fontSize: "2.8rem",
            textAlign: "center",
            color: "#004c8bff",
            textShadow: "0 0 10px rgba(0,0,0,0.3)",
          }}
        >
          🩺 Sala de Espera - RAC
        </h1>

        {/* Logo HGCO */}
        <div>
          <img
            src={logohgco}
            alt="Logo HGCO"
            style={{
              height: "80px",
              filter: "drop-shadow(0 0 6px rgba(255,255,255,0.5))",
              opacity: 0.95,
              borderRadius: "12px",
            }}
          />
        </div>
      </div>

      {/* 🔹 Contenido principal (paciente actual + atendidos) */}
      <div
        style={{
          width: "80%",
          height: "70vh", 
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: "1.5rem",
          flex: 1
        }}
      >
        {/* 🩺 Paciente actual */}
        <div
          style={{
            flex: 1,
            height:"65vh",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "0.5rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            textAlign: "center",
            minHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background:"#94b7daff"
          }}
        >
          <AnimatePresence mode="wait">
            {paciente ? (
              <motion.div
                key={paciente.id || paciente.cinro}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <p style={{ fontSize: "4rem", opacity: 0.9 , color: "#004c8bff" , fontWeight:"bold"}}>
                  Paciente llamado:
                </p>
                <h2
                  style={{
                    fontSize: "5rem",
                    color: "#004c8bff",
                    margin: "0.5rem 0",
                    textTransform: "uppercase",
                  }}
                >
                  {paciente.nombre} {paciente.apellido}
                </h2>
                <h3 style={{ color: "#4f8b00ff", marginTop: "0.5rem" , fontSize: "3rem" }}>
                  CI: {paciente.cinro}
                </h3>
              </motion.div>
            ) : (
              <motion.p
                key="espera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{ fontSize: "1.8rem", opacity: 0.8 , color:"#004c8bff"}}
              >
                Esperando próximo paciente...
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Pacientes atendidos */}
        <div
          style={{
            flex: 0.5,
            height:"60vh",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            overflowY: "auto",
            background:"#94b7daff"
          }}
        >
          <h2 style={{ marginBottom: "1rem", textAlign: "center", fontSize:"3rem" }}>
            ✅ Pacientes atendidos hoy
          </h2>
          <h3
            style={{
              fontSize: "2rem",
              color: "#004c8bff",
              fontWeight: "bold",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {atendidosHoy.length}
          </h3>

          {error && <p style={{ color: "#ff8080" }}>{error}</p>}

          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            <AnimatePresence>
              {atendidosHoy.length > 0 ? (
                atendidosHoy.map((a, index) => (
                  <motion.li
                    key={a.id || index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      padding: "0.8rem 1rem",
                      marginBottom: "0.6rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: "bold" , color:"#1a1717ad" }}>
                      {a.nombre} {a.apellido}
                    </span>
                    <span style={{ color: "#09425cff", fontSize: "0.9rem" }}>
                      {new Date(a.fecha_llamado).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.li>
                ))
              ) : (
                <motion.li
                  key="vacio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  style={{ opacity: 0.8, textAlign: "center" }}
                >
                  No hay pacientes atendidos hoy.
                </motion.li>
              )}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
}
