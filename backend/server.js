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

  // 3. 🟢 CORRECCIÓN: Crear tabla de último llamado aquí al iniciar
  //    Simplificamos la tabla para solo guardar el ID del paciente llamado.
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

// 📌 Llamar paciente
app.post("/llamar", async (req, res) => {
  const db = await dbPromise;
  const { id } = req.body; // id del paciente

  // Obtener los datos del paciente (de la tabla 'pacientes')
  const paciente = await db.get("SELECT * FROM pacientes WHERE id = ?", [id]);

  if (!paciente) {
    return res.status(404).json({ error: "Paciente no encontrado" });
  }

  // 🟢 CORRECCIÓN: Limpiar registro anterior e insertar el ID del nuevo paciente
  await db.run("DELETE FROM llamado_actual");
  // 🟢 CORRECCIÓN: Insertar el 'paciente_id' en la tabla 'llamado_actual'
  await db.run("INSERT INTO llamado_actual (paciente_id) VALUES (?)", [paciente.id]);

  // Guardar el paciente llamado en la tabla de atendidos (historial)
  const fecha = new Date().toISOString();
  await db.run(
    `
    INSERT INTO pacientes_atendidos (paciente_id, cinro, nombre, apellido, fecha_llamado, estado)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [paciente.id, paciente.cinro, paciente.nombre, paciente.apellido, fecha, "LLAMADO"]
  );

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
app.get("/atendidos", async (req, res) => {
  const db = await dbPromise;
  const atendidos = await db.all(`
    SELECT * FROM pacientes_atendidos
    ORDER BY datetime(fecha_llamado) DESC
  `);
  res.json(atendidos);
});

// Iniciar servidor
app.listen(4000, () => {
  console.log("✅ Servidor backend corriendo en http://localhost:4000");
});