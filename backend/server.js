import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// Configurar rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Abrir la base de datos SQLite
const dbPromise = open({
  filename: path.join(__dirname, "pacientes.db"),
  driver: sqlite3.Database,
});

// Crear las tablas si no existen
(async () => {
  const db = await dbPromise;

  // 1. Tabla de pacientes
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cinro INTEGER,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL
    );
  `);

  // 2. Tabla de pacientes atendidos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes_atendidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER,
      cinro INTEGER,
      nombre TEXT,
      apellido TEXT,
      fecha_llamado TEXT,
      estado TEXT DEFAULT 'LLAMADO'
    );
  `);

  // 3. Crear tabla de último llamado
  await db.exec(`
    CREATE TABLE IF NOT EXISTS llamado_actual (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER
    );
  `);

  console.log("✅ Tablas verificadas y listas.");
})();

// 📌 Obtener todos los pacientes 
app.get("/pacientes", async (req, res) => {
  const db = await dbPromise;
  const pacientes = await db.all("SELECT * FROM pacientes ORDER BY id DESC");
  res.json(pacientes);
});

// 📌 Agregar nuevo paciente
app.post("/pacientes", async (req, res) => {
  const db = await dbPromise;
  const { cinro, nombre, apellido } = req.body;
  const result = await db.run(
    "INSERT INTO pacientes (cinro, nombre, apellido) VALUES (?, ?, ?)",
    [cinro, nombre, apellido]
  );
  res.json({ id: result.lastID, cinro, nombre, apellido });
});

// =========================================================
//  Llamar paciente (Solo registro temporal)
// =========================================================
app.post("/llamar", async (req, res) => {
  const db = await dbPromise;
  const { id } = req.body; // id del paciente

  const paciente = await db.get("SELECT * FROM pacientes WHERE id = ?", [id]);

  if (!paciente) {
    return res.status(404).json({ error: "Paciente no encontrado" });
  }

  // Limpiar registro anterior e insertar el ID del paciente llamado
  await db.run("DELETE FROM llamado_actual");
  await db.run("INSERT INTO llamado_actual (paciente_id) VALUES (?)", [paciente.id]);
  
  // 🚫 IMPORTANTE: Ya NO insertamos en pacientes_atendidos aquí.

  res.json({ success: true, paciente });
});


// =========================================================
// ➕ NUEVA RUTA: Marcar como Atendido y mover a historial
// =========================================================
app.post("/atender", async (req, res) => {
  const db = await dbPromise;
  const { pacienteId } = req.body;

  // 1. Obtener los datos completos del paciente
  const paciente = await db.get("SELECT * FROM pacientes WHERE id = ?", [pacienteId]);

  if (!paciente) {
    return res.status(404).json({ error: "Paciente no encontrado en lista de espera" });
  }

  // 2. Insertar en la tabla de atendidos (Historial)
  const fecha = new Date().toISOString();
  await db.run(
    `
    INSERT INTO pacientes_atendidos (paciente_id, cinro, nombre, apellido, fecha_llamado, estado)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [paciente.id, paciente.cinro, paciente.nombre, paciente.apellido, fecha, "ATENDIDO"]
  );

  // 3. Eliminar al paciente de la lista de espera (tabla 'pacientes')
  await db.run("DELETE FROM pacientes WHERE id = ?", [pacienteId]);
  
  // 4. Limpiar el registro de llamado actual (opcional, pero recomendable)
  await db.run("DELETE FROM llamado_actual WHERE paciente_id = ?", [pacienteId]);

  res.json({ success: true, paciente });
});

// 📌 Obtener el último paciente llamado 
app.get("/llamado", async (req, res) => {
  const db = await dbPromise;
  const row = await db.get(`
    SELECT p.*
    FROM pacientes p
    JOIN llamado_actual l ON l.paciente_id = p.id
  `);
  res.json(row || null);
});

// 📌 Obtener todos los pacientes atendidos 
// 📌 Obtener pacientes atendidos (con filtro de rango de fechas)
app.get("/atendidos", async (req, res) => {
  const db = await dbPromise;
  
  // Obtener parámetros de la query. Ejemplo: ?inicio=2025-10-20&fin=2025-10-21
  const { inicio, fin } = req.query;
  
  let query = `
    SELECT * FROM pacientes_atendidos
    ORDER BY datetime(fecha_llamado) DESC
  `;
  let params = [];
  
  // Si se proporcionan las fechas, filtramos por el rango
  if (inicio && fin) {
    // Añadimos el filtro. Usamos fecha_llamado con GLOB para incluir el día completo
    query = `
      SELECT * FROM pacientes_atendidos
      WHERE date(fecha_llamado) BETWEEN ? AND ?
      ORDER BY datetime(fecha_llamado) DESC
    `;
    params = [inicio, fin];
  }
  
  // Si no se proporcionan fechas, devuelve todos o podrías optar por devolver solo los de hoy:
  // (Si quieres devolver solo los de hoy si no hay filtros, descomenta las líneas anteriores)
  
  try {
    const atendidos = await db.all(query, params);
    res.json(atendidos);
  } catch (error) {
    console.error("Error al consultar atendidos:", error);
    res.status(500).json({ error: "Error interno del servidor al consultar historial." });
  }
});

// Iniciar servidor
app.listen(4000, () => {
  console.log("✅ Servidor backend corriendo en http://localhost:4000");
});