# 🏥 Proyecto Llamador de Pacientes

> Sistema de gestión de flujo de pacientes para salas de espera y boxes de atención.  
> Controla el ciclo de atención, con histórico y llamado por voz automática.

---

## 🚀 Arquitectura y Tecnologías

| Componente | Descripción | Tecnologías Clave |
| :--- | :--- | :--- |
| **Frontend** | Interfaz del operador, sala de espera y panel de historial | React (Vite), React Router DOM, Web Speech API |
| **Backend** | API REST para gestión de pacientes y estado de llamado | Node.js, Express, SQLite (`sqlite`), CORS |
| **Base de Datos** | Almacenamiento local de pacientes en espera, atendidos y llamado actual | SQLite (`pacientes.db`) |

---

## 📋 Pre-requisitos

> ⚠️ **Importante:** Instala antes de comenzar

- ✅ Node.js ≥ 18.x  
- ✅ Git  
## 🛠️ Instalación de Node.js y Git

Antes de poder ejecutar el proyecto, necesitas tener instalados **Node.js** y **Git** en tu computadora.

---

### 1️⃣ Instalar Node.js

**Node.js** es necesario para ejecutar el backend y compilar el frontend.

#### Windows / macOS

1. Visita la página oficial: [https://nodejs.org/](https://nodejs.org/)  
2. Descarga la versión **LTS** (recomendada)  
3. Ejecuta el instalador y sigue los pasos predeterminados  
4. Verifica la instalación abriendo la terminal y ejecutando:

```bash
node -v
npm -v

2️⃣ Instalar Git

Git es necesario para clonar el repositorio del proyecto.

Windows / macOS

Visita https://git-scm.com/downloads

Descarga el instalador y sigue los pasos predeterminados

Verifica la instalación:

    git --version
---

# ⚡ Pasos Detallados para Despliegue

> Sigue los pasos **en orden** para evitar errores.  

---

### 🟣 Paso 1 – Clonar Repositorio e Instalar Dependencias

```bash
# Clonar repositorio
git clone https://github.com/Ivan-S93/llamador-pacientes.git
cd <nombre-del-directorio-del-proyecto>

# Instalar dependencias
npm install
💡 Tip: Si hay errores, verifica la versión de Node.js y npm.

🟢 Verificación:

Todas las dependencias instaladas correctamente ✅

Listo para iniciar backend y frontend

🟠 Paso 2 – Iniciar el Backend (API)
        bash

        # Ejecutar backend
        node server.js
        ⚠️ Nota: El backend debe ejecutarse antes del frontend.

        🟢 Verificación:

        URL backend: 👉 http://localhost:4000

Se crea automáticamente pacientes.db si no existía ✅

🔵 Paso 3 – Iniciar el Frontend (React/Vite)
        bash

        npm run dev
        🟢 Verificación:

        URL frontend: 👉 http://localhost:5173

        Abrir en navegador para acceder a la interfaz

💡 Tip: Puedes abrir /sala-espera en una pantalla grande o TV para mostrar pacientes llamados.

🗺️ Rutas Principales
        URL	Propósito	Acción
        /	Panel del Operador	Agregar, llamar y finalizar pacientes
        /historial	Historial de Atendidos	Consultar pacientes atendidos
        /sala-espera	Sala de Espera (Pantalla Pública)	Mostrar pacientes llamados en tiempo real

🔄 Flujo de Atención
        Estado	Descripción	Acción del Operador
        🟡 EN ESPERA	Paciente visible en lista	Agregar mediante formulario o listado
        🔵 LLAMADO	Paciente actualmente llamado	Clic en "Llamar" → Se anuncia con voz y pasa a flotante
        🟢 ATENDIDO	Paciente que finalizó atención	Clic en "Marcar como ATENDIDO" → Se mueve a pacientes_atendidos

🧠 Estructura de Tablas SQLite
🩺 Tabla pacientes
        sql
        CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cinro INTEGER,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL
        );
📞 Tabla llamado_actual (Temporal)
        sql
        CREATE TEMP TABLE IF NOT EXISTS llamado_actual (
        id_llamado INTEGER
);
🗂️ Tabla pacientes_atendidos
sql
        CREATE TABLE IF NOT EXISTS pacientes_atendidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        paciente_id INTEGER,
        cinro INTEGER,
        nombre TEXT,
        apellido TEXT,
        fecha_llamado TEXT,
        estado TEXT DEFAULT 'LLAMADO'
        );

💡 Tip: La tabla llamado_actual se limpia automáticamente al llamar a un nuevo paciente.


🗣️ Funcionalidades Clave
        ✅ Llamado por voz automática (Web Speech API)

        ✅ Sincronización en tiempo real entre operador y sala de espera

        ✅ Historial persistente de pacientes atendidos

        ✅ Base de datos local (SQLite)

        ✅ API REST simple y extensible

🧩 Endpoints Backend
        Método	Ruta	Descripción
        GET	/pacientes	Lista pacientes en espera
        POST	/pacientes	Agregar paciente
        POST	/llamar	Marcar paciente como llamado y actualizar llamado_actual
        GET	/llamado	Obtener paciente actualmente llamado
        GET	/atendidos	Listar todos los pacientes atendidos

🧱 Estructura del Proyecto
text
Copiar código
📦 proyecto-llamador-pacientes
├── 📁 src
│   ├── 📁 components
│   ├── 📁 pages
│   └── App.jsx
├── server.js
├── package.json
├── pacientes.db
└── README.md

💬 Créditos
    👨‍💻 Desarrollador: Iván Samudio – Especialista en Oracle APEX, React y desarrollo de soluciones empresariales
    📅 Versión: 1.0
    📍 Base de datos: SQLite
    🖥️ Entorno: Node.js + React (Vite)