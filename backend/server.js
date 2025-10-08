import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import {open} from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

//abrir la BD 
const dbPromise = open ({
    filename: "./backend/pacientes.db",
    driver: sqlite3.Database,
});


// se crea la tabla si no existe
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


// Obtener todo los pacientes
app.get("/pacientes", async (req, res) => {
    const db = await dbPromise;
    const pacientes = await db.all("SELECT * FROM pacientes ORDER BY id DESC")
    res.json(pacientes);
});


//Agregar nuevo paciente
app.post("pacientes" , async (req, res) => {
    const db = await dbPromise;
    const { cinro, nombre, apellido } = req.body;
    const result = await db.run(
        "INSERT INTO pacientes (cinro,nombre,apellido) VALUES (?, ?, ?) ",
        [cinro, nombre, apellido]
    );
    res.json({ id: result.lastID, cinro, nombre, apellido});
});

app.listen(4000, () =>
    console.log("✅ Servidor backend corriendo en http://localhost:4000")
);