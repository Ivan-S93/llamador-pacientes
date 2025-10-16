import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// Ajustar rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Abrir la base de datos dentro de la carpeta backend
const dbPromise = open({
  filename: path.join(__dirname, "pacientes.db"),
  driver: sqlite3.Database,
});

// Crear tabla si no existe
(async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cinro INTEGER,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL
    );
  `);
})();

// Obtener todos los pacientes
app.get("/pacientes", async (req, res) => {
  const db = await dbPromise;
  const pacientes = await db.all("SELECT * FROM pacientes ORDER BY id DESC");
  res.json(pacientes);
});

// Agregar nuevo paciente
app.post("/pacientes", async (req, res) => {
  const db = await dbPromise;
  const { cinro, nombre, apellido } = req.body;
  const result = await db.run(
    "INSERT INTO pacientes (cinro, nombre, apellido) VALUES (?, ?, ?)",
    [cinro, nombre, apellido]
  );
  res.json({ id: result.lastID, cinro, nombre, apellido });
});

//Guardar el ultimo paciente llamado
app.post("/llamar", async (req, res) => {
  const db = await dbPromise;
  const { id } = req.body; 

  // se crea la tabla
  await db.exec(`
    CREATE TABLE IF NOT EXISTS llamado_actual (
    id_llamado INTEGER
    );
  `);
  
// Limpiamos el registro anterior y guardamos el nuevo
await db.run("DELETE FROM llamado_actual");
await db.run("INSERT INTO llamado_actual (id_llamado) VALUES (?)", [id]);

res.json({ success: true});
});

// Obtener el ultimo paciente llamado
app.get("/llamado", async (req, res) => {
  const db = await dbPromise;
  const row = await db.get(`
    SELECT p.*
    FROM pacientes p
    JOIN llamado_actual l ON l.id_llamado = p.id
    `);
    res.json(row || null);
})

app.listen(4000, () =>
  console.log("✅ Servidor backend corriendo en http://localhost:4000")
);
