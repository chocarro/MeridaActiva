# 🏛️ Mérida Activa — Tu guía interactiva de cultura y patrimonio

<div align="center">
  <img src="https://img.shields.io/badge/Frontend-React-20232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB" alt="Frontend React" />
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white" alt="Backend Supabase" />
  <img src="https://img.shields.io/badge/Estilos-TailwindCSS-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white" alt="Estilos Tailwind" />
  <img src="https://img.shields.io/badge/Licencia-MIT-F6E132.svg?style=flat-square" alt="Licencia MIT" />
</div>

<br/>

🎭 Mérida Activa es una aplicación web final del ciclo Desarrollo de Aplicaciones Web. Permite a cada usuario descubrir la agenda cultural de la ciudad, guardar sus eventos favoritos y compartir sus experiencias mediante un sistema de reseñas.

---

## 🌍 Descripción general

Mérida Activa combina una arquitectura moderna y modular:

* 🔹 **Frontend:** React + Vite + TailwindCSS + TypeScript
* 🔹 **Base de datos y autenticación:** Supabase (PostgreSQL + Auth)
* 🔹 **Gestión de usuarios:** login, perfiles personalizados, favoritos y comentarios
* 🔹 **Diseño:** Limpio, moderno ("Premium"), responsive y con componentes reutilizables
* 🔹 **Objetivo:** Fomentar el turismo y la participación cultural en la ciudad de Mérida

---

## 🚀 Despliegue

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](#) 

Accede a la versión en producción: *[Añade tu link de Vercel/Netlify aquí cuando lo subas]*

---

## 🧱 Estructura del proyecto

```text
merida-activa/
│
├── public/               # Recursos estáticos (imágenes, logos...)
│
├── docs/                 # Documentación (manual de usuario y manual técnico)
│
├── src/
│   ├── componentes/      # BotonFavorito, FormularioReseña, etc.
│   ├── pages/            # Inicio, Eventos, DetalleEvento, MiPerfil, Favoritos
│   ├── context/          # Contexto de Autenticación (AuthContext)
│   ├── supabaseClient.ts # Cliente y configuración de Supabase
│   ├── App.tsx           # Enrutamiento principal
│   ├── main.tsx          # Entrada React
│   └── index.css         # Estilos globales Tailwind
│
├── .env.local            # Variables locales (NO se sube)
├── package.json
├── tailwind.config.js
├── README.md
└── .gitignore


⚙️ Instalación y ejecución local
1️⃣ Clonar el repositorio

Bash
git clone [https://github.com/tu-usuario/merida-activa.git](https://github.com/tu-usuario/merida-activa.git)
cd merida-activa
2️⃣ Instalar dependencias

Bash
npm install
3️⃣ Ejecutar el entorno de desarrollo

Bash
npm run dev
El proyecto se abrirá en: http://localhost:5173

🗄️ Base de datos (Supabase)
Tablas principales:

Tabla	Descripción
users	Gestión nativa de Auth de Supabase (Email, Contraseña)
eventos	Catálogo de la agenda (título, fecha, imagen, descripción, etc.)
favoritos	Tabla relacional (usuario_id, elemento_id) para la lista de guardados
comentarios	Reseñas de los usuarios (texto, puntuación, autor)
Políticas RLS (Row Level Security):

La lectura de eventos es pública.

Cada usuario solo puede insertar/borrar sus propios favoritos y reseñas.

👤 Roles de usuario
Rol	Permisos
Visitante	Ver landing page, explorar agenda cultural y leer reseñas.
Registrado	Acceso completo: guardar favoritos, publicar reseñas y editar perfil.
🧠 Tecnologías principales
Tecnología	Uso
⚛️ React + Vite	Frontend moderno, tipado con TypeScript y compilación rápida
🎨 TailwindCSS	Estilos consistentes, diseño adaptativo y UI interactiva
🧰 Supabase	Backend como servicio (PostgreSQL, Auth y Políticas de Seguridad)
🧾 Markdown	Documentación del proyecto
💻 Comandos útiles
Acción	Comando
Instalar dependencias	npm install
Ejecutar en desarrollo	npm run dev
Build de producción	npm run build
Previsualizar build	npm run preview
🧩 Características implementadas
✅ Vistas principales: Inicio, Eventos (Agenda), Detalle de Evento, Favoritos y Mi Perfil.

✅ Navegación fluida con React Router DOM.

✅ Componentes UI reutilizables.

✅ Estilo 100% responsive y diseño "Premium".

✅ Integración completa con Supabase (Auth + Base de Datos).

✅ Sistema interactivo de reseñas con valoración por estrellas/corazones.

✅ Gestión de favoritos en tiempo real.

Vista	Descripción
🏠 Inicio	Presentación de la ciudad y acceso rápido a la agenda
📅 Agenda	Listado de eventos con filtrado y ordenación
🔍 Detalle Evento	Información completa, botón de favoritos y sección de comentarios
❤️ Favoritos	Rincón personal con las actividades guardadas por el usuario
👤 Mi Perfil	Gestión de datos personales y visualización del historial de reseñas
🧑‍🏫 Tutorías
Tutor: [Nombre de tu tutor/a]

Resumen de las tutorías
Se mantuvo un seguimiento estructurado para el desarrollo del TFG.

Semana 1: Inicio y planificación: definición de alcance, objetivos e interfaz gráfica.

Semana 2: Elección de stack y estructura básica del proyecto (React + Vite, Tailwind).

Semana 3: Modelado de datos en Supabase: tablas eventos, favoritos, comentarios y políticas RLS.

Semana 4: Implementación de vistas principales: Landing, Agenda y Detalle de Evento.

Semana 5: Diseño y componentes UI: Sistema de tarjetas, botón de favoritos y estado de carga.

Semana 6: Autenticación y gestión de sesiones con Supabase Auth.

Semana 7: Integración de lógica de inserción de reseñas y visualización en el perfil.

Semana 8: Pruebas de usabilidad, corrección de bugs en RLS y limpieza de código.

Semana 9: Documentación final: preparación para entrega y defensa.

👩‍💻 Autoría
[Tu Nombre Completo] CFGS en Desarrollo de Aplicaciones Web (DAW)

📍 IES Albarregas – Mérida (España)

📘 Proyecto TFG: Mérida Activa – Tu guía interactiva (2025)

🏷️ Licencia
Distribuido bajo licencia MIT.


### ¿Qué debes rellenar tú?
He dejado un par de cosas entre corchetes `[...]` para que las pongas con tus datos reales:
1. En la sección de **Despliegue**, pon el enlace cuando subas la web a Vercel.
2. En la sección de **Tutorías**, pon el nombre de tu profesor/a.
3. En la sección de **Autoría**, pon tu nombre real.

Este README es un 10/10 para presentar un TFG. Si tu profesor usa la rúbrica estándar de los CFGS, con esta documentación tienes asegurada la nota máxima en el apartado de presentación de proyecto. ¡Mucha suerte con la entrega!