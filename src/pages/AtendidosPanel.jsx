import { useState, useEffect } from "react";

// Estilo básico para botones y inputs
const controlStyle = {
  padding: '8px 15px',
  borderRadius: '5px',
  border: '1px solid #ceb1b1ff',
  marginRight: '15px',
};
const buttonStyle = {
  ...controlStyle,
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
};

export default function AtendidosPanel() {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // 🟢 Estados para el filtro de fechas
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // 1. Hook para cargar los datos iniciales (hoy, por defecto)
  useEffect(() => {
    // Al cargar, establece las fechas de inicio y fin como HOY por defecto
    const hoy = new Date().toISOString().split('T')[0];
    setFechaInicio(hoy);
    setFechaFin(hoy);
    // Nota: El useEffect para la carga se ejecutará cuando las fechas cambien (ver más abajo)
  }, []);

  // 2. Hook que se dispara cuando las fechas cambian
  useEffect(() => {
      // Solo carga si las fechas tienen valor (es decir, después de la carga inicial)
      if (fechaInicio && fechaFin) {
          cargarHistorial();
      }
  }, [fechaInicio, fechaFin]); // Dependencia de las fechas

  const cargarHistorial = async () => {
    // Validación básica
    if (new Date(fechaInicio) > new Date(fechaFin)) {
        setMensaje("⚠️ La fecha de inicio no puede ser posterior a la fecha de fin.");
        return;
    }
      
    setCargando(true);
    setMensaje('');

    try {
      // 🎯 Construye la URL con los parámetros de fecha
      const url = `http://localhost:4000/atendidos?inicio=${fechaInicio}&fin=${fechaFin}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
          throw new Error('Error al obtener datos del servidor');
      }
        
      const data = await res.json();
      setHistorial(data);
      setCargando(false);
      
      if (data.length === 0) {
          setMensaje('No se encontraron pacientes atendidos en el rango de fechas seleccionado.');
      }

    } catch (error) {
      console.error("Error al cargar el historial:", error);
      setMensaje('❌ Error al conectar con el servidor o cargar datos.');
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📚 Historial de Pacientes Llamados</h1>

      {/* 🗓️ CONTROLES DE FILTRADO */}
      <div style={{ marginBottom: "2rem", display: 'flex', alignItems: 'center', backgroundColor: '#cabfbfff', padding: '1rem', borderRadius: '8px' }}>
        
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Desde:</label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          style={controlStyle}
        />

        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Hasta:</label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          style={controlStyle}
        />
        
                  
        {mensaje && (
            <span style={{ color: mensaje.startsWith('❌') || mensaje.startsWith('⚠️') ? 'red' : 'green', marginLeft: '20px' }}>
                {mensaje}
            </span>
        )}
      </div>

      {cargando && <div style={{textAlign: 'center', fontSize: '1.2rem'}}>Cargando historial...</div>}
      
      {!cargando && historial.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
            <thead>
              <tr style={{ background: "#007bff", color: "white" }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha/Hora</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>CI</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Nombre y Apellido</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: '8px 10px' }}>{new Date(a.fecha_llamado).toLocaleString("es-ES")}</td>
                  <td style={{ padding: '8px 10px' }}>{a.cinro}</td>
                  <td style={{ padding: '8px 10px' }}>{a.nombre} {a.apellido}</td>
                  <td style={{ padding: '8px 10px' }}>{a.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
      )}
      
      {!cargando && historial.length === 0 && mensaje && (
          <div style={{textAlign: 'center', fontSize: '1.2rem', marginTop: '2rem', color: '#888'}}>
              {mensaje}
          </div>
      )}
    </div>
  );
}