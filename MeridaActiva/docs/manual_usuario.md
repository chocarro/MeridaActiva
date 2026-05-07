# 📖 Manual de Usuario — MéridaActiva

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Aplicación:** MéridaActiva — Eventos, Turismo y Rutas con IA en Mérida  
**URL:** [meridaactiva.vercel.app](https://meridaactiva.vercel.app)

---

## Índice

1. [Introducción](#1-introducción)
2. [Acceso a la plataforma](#2-acceso-a-la-plataforma)
3. [Registro de usuario](#3-registro-de-usuario)
4. [Inicio de sesión](#4-inicio-de-sesión)
5. [Página de inicio (Home)](#5-página-de-inicio-home)
6. [Agenda de eventos](#6-agenda-de-eventos)
7. [Lugares y monumentos](#7-lugares-y-monumentos)
8. [Mapa interactivo](#8-mapa-interactivo)
9. [Rutas inteligentes con IA](#9-rutas-inteligentes-con-ia)
10. [Chat IA](#10-chat-ia)
11. [Calendario personal](#11-calendario-personal)
12. [Mis favoritos](#12-mis-favoritos)
13. [Mi perfil](#13-mi-perfil)
14. [Contacto](#14-contacto)
15. [Funciones del Administrador](#15-funciones-del-administrador)
16. [Preguntas frecuentes y solución de problemas](#16-preguntas-frecuentes-y-solución-de-problemas)

---

## 1. Introducción

**MéridaActiva** es una plataforma web diseñada para descubrir, organizar y disfrutar todo lo que Mérida (Extremadura, España) ofrece: eventos culturales, monumentos romanos, rutas personalizadas generadas por inteligencia artificial y mucho más.

### ¿Qué puedes hacer?

| Función | Acceso requerido |
|---|---|
| Ver eventos y lugares | Público (sin registro) |
| Explorar el mapa interactivo | Público |
| Leer reseñas de otros usuarios | Público |
| Generar rutas con IA | **Registro obligatorio** |
| Usar el Chat IA | **Registro obligatorio** |
| Guardar favoritos | **Registro obligatorio** |
| Gestionar tu calendario | **Registro obligatorio** |
| Escribir reseñas | **Registro obligatorio** |
| Administrar la plataforma | **Rol Administrador / Gestor** |

---

## 2. Acceso a la plataforma

Abre tu navegador web y visita:

```
https://meridaactiva.vercel.app
```

La aplicación funciona en cualquier navegador moderno (Chrome, Firefox, Safari, Edge). También está disponible como **Progressive Web App (PWA)**: puedes instalarla en tu móvil o escritorio pulsando el botón de instalación que aparece en la barra de direcciones del navegador.

> **Modo offline:** Gracias a la PWA, podrás consultar eventos y lugares ya visitados aunque no tengas conexión a internet.

---

## 3. Registro de usuario

Para acceder a las funciones completas de MéridaActiva necesitas crear una cuenta gratuita.

### Pasos para registrarse

1. Haz clic en el botón **"Regístrate"** del menú superior, o accede directamente a `/registro`.
2. Rellena el formulario:
   - **Nombre**: tu nombre o apodo (mínimo 2 caracteres).
   - **Email**: dirección de correo electrónico válida.
   - **Contraseña**: mínimo 6 caracteres. Se muestra el nivel de seguridad.
   - **Confirmar contraseña**: repite la misma contraseña.
3. Acepta los **Términos y Condiciones** y la **Política de Privacidad** (casilla obligatoria).
4. Pulsa **"Crear cuenta"**.
5. Recibirás un **email de confirmación**. Haz clic en el enlace que contiene para activar tu cuenta.

> ⚠️ **Importante:** Revisa también la carpeta de **spam** si no recibes el email en unos minutos. La cuenta no estará activa hasta que confirmes el email.

### Reglas de contraseña

La barra de progreso indica la fortaleza de tu contraseña:
- 🔴 Débil: menos de 6 caracteres o muy predecible.
- 🟡 Media: longitud suficiente pero sin variedad.
- 🟢 Fuerte: mezcla de mayúsculas, minúsculas, números y símbolos.

---

## 4. Inicio de sesión

1. Haz clic en **"Iniciar sesión"** en el menú o accede a `/login`.
2. Introduce tu **email** y **contraseña**.
3. Pulsa **"Entrar ahora"**.

### Recuperar contraseña

Si has olvidado tu contraseña:
1. En la pantalla de login, haz clic en **"¿Olvidaste la contraseña?"**.
2. Introduce tu email y pulsa **"Enviar enlace de recuperación"**.
3. Recibirás un email con un enlace para crear una nueva contraseña.
4. Pulsa el enlace del email y escribe tu nueva contraseña (mínimo 6 caracteres).

### Sesión bloqueada

Si la sesión queda bloqueada (el sistema no responde al cargar), puedes:
- Pulsar **"Reiniciar sesión bloqueada"** (enlace discreto en la parte inferior de la pantalla de login).
- O acceder a `/recuperar-sesion` para limpiar el almacenamiento del navegador.

---

## 5. Página de inicio (Home)

La página principal (`/`) es el punto de partida de la plataforma.

### Secciones principales

| Sección | Descripción |
|---|---|
| **Hero** | Banner principal con acceso directo a la agenda, rutas IA y Chat IA. |
| **Ticker de imágenes** | Carrusel animado de imágenes de Mérida. |
| **Mérida [adjetivo rotativo]** | Sección de presentación con texto dinámico. |
| **Estadísticas** | Datos clave: fundación romana, eventos al año, monumentos UNESCO, etc. |
| **Rutas IA + Chat IA** | Acceso directo a las funciones premium con IA. |
| **Categorías** | Tarjetas de exploración: Cultural, Música, Teatro, Patrimonio. |
| **CTA Rutas IA** | Banner oscuro con acceso destacado al generador de rutas. |
| **Reseñas** | Opiniones reales de otros usuarios de la plataforma. |
| **FluidGlass / Formas animadas** | Sección decorativa interactiva. |

---

## 6. Agenda de eventos

Accede desde el menú **"Eventos"** o la URL `/eventos`.

### Filtros disponibles

- **Categoría**: Teatro, Música, Cultural, Deporte, Gastronomía, Turismo, Gratis, Otro.
- **Búsqueda**: Escribe el nombre o descripción del evento.
- **Precio**: filtra por eventos gratuitos o de pago.
- **Fecha**: filtra por fecha concreta o rango.

### Ver detalle de un evento

Haz clic sobre cualquier tarjeta de evento para ver:
- Título, descripción completa, fecha y hora.
- Ubicación (lugar).
- Precio (o "Gratuito").
- Enlace externo (si hay entradas o más información).
- **Galería de imágenes**.
- Indicador de si se permiten animales.
- **Mapa** con la ubicación exacta.
- **Reseñas y valoraciones** de otros usuarios.
- **Botón para añadir a favoritos** (requiere login).
- **Formulario para escribir una reseña** (requiere login).

### Compartir una ruta

Dentro del detalle de un evento encontrarás el botón **"Compartir ruta"** que genera un enlace único para compartir la ubicación con otras personas.

---

## 7. Lugares y monumentos

Accede desde el menú **"Lugares"** o la URL `/lugares`.

Explora el patrimonio romano y los lugares de interés de Mérida:
- Teatro Romano
- Anfiteatro
- Museo Nacional de Arte Romano (MNAR)
- Acueducto de los Milagros
- Circo Romano
- Puente Romano
- Y muchos más…

### Ver detalle de un lugar

Haz clic sobre un lugar para ver:
- Descripción completa.
- Horarios de visita.
- Precios de entrada.
- Mapa con localización.
- Galería de imágenes.
- **Reseñas de usuarios**.
- Botón de **favoritos** (requiere login).

---

## 8. Mapa interactivo

Accede desde el menú **"Mapa"** o la URL `/mapa`.

El mapa muestra todos los eventos y lugares de Mérida sobre un mapa interactivo (basado en Leaflet / OpenStreetMap).

### Cómo usarlo

- **Zoom**: usa la rueda del ratón o los botones +/− del mapa.
- **Mover**: arrastra el mapa con el ratón.
- **Ver detalles**: haz clic sobre cualquier marcador para ver el nombre, categoría y un enlace al detalle completo.
- **Filtros**: puedes filtrar por tipo de elemento (eventos, lugares) o por categoría.

---

## 9. Rutas inteligentes con IA

> ⚠️ **Requiere registro e inicio de sesión.**

Accede desde el menú o la URL `/rutas`.

El generador de rutas usa **Google Gemini AI** para crear un itinerario personalizado por Mérida en segundos.

### Cómo generar tu ruta

El proceso se divide en 3 pasos sencillos (wizard):

**Paso 1 — Tiempo disponible**
- Media jornada (3–4 horas)
- 1 día completo (9h–18h)
- Fin de semana (2 días)

**Paso 2 — ¿Con quién vienes?**
- En pareja
- Con familia (niños incluidos)
- Solo
- Con amigos

**Paso 3 — Tu ritmo de viaje**
- Relax (sin prisas, disfrutar cada rincón)
- Non-stop (máximo contenido en el menor tiempo)

Tras seleccionar las tres opciones, pulsa **"Generar Ruta Perfecta"**. En unos segundos tendrás tu itinerario.

### Ver el resultado

La ruta generada incluye:
- **Lista de paradas** con nombre, categoría, hora de inicio y fin, duración y descripción.
- **Vista en mapa** con marcadores numerados y traza de la ruta a pie (usando OSRM).
- **Barra de progreso** que muestra la línea temporal de la visita.

### Acciones disponibles sobre la ruta

| Botón | Acción |
|---|---|
| **Guardar en Mi Agenda** | Añade todas las paradas a tu calendario personal. |
| **Ver en Mi Agenda** | (tras guardar) Redirige al calendario. |
| **Copiar Ruta** | Copia el itinerario al portapapeles en formato texto. |
| **PDF** | Descarga el itinerario completo en formato PDF. |
| **Nueva Ruta** | Reinicia el wizard para generar otro itinerario. |

---

## 10. Chat IA

> ⚠️ **Requiere registro e inicio de sesión.**

Accede desde el menú **"Chat IA"** o la URL `/faq`.

El asistente de inteligencia artificial responde a cualquier pregunta sobre Mérida:
- Horarios de monumentos.
- Historia romana de la ciudad.
- Restaurantes recomendados.
- Qué hacer con niños.
- Rutas a pie.
- Eventos especiales.
- Y cualquier otra duda turística.

### Cómo usarlo

1. Escribe tu pregunta en el campo de texto inferior.
2. Pulsa **Enter** o el botón de enviar.
3. El asistente responderá en segundos.
4. Puedes continuar la conversación de forma natural.

> 💡 **Consejo:** El chat recuerda el contexto de la conversación. Puedes hacer preguntas de seguimiento como "¿Y cuánto cuesta la entrada?" sin repetir el monumento.

---

## 11. Calendario personal

> ⚠️ **Requiere registro e inicio de sesión.**

Accede desde el menú **"Mi Agenda"** o la URL `/calendario`.

El calendario muestra dos tipos de eventos:
- 🔵 **Eventos de la plataforma**: eventos oficiales de MéridaActiva.
- 🟣 **Eventos personales**: eventos que tú mismo has añadido o guardado de rutas IA.

### Vistas disponibles

- **Vista mensual**: calendario clásico con los días del mes.
- **Vista semanal**: semana actual con los eventos del día.
- **Vista de lista**: lista ordenada de próximos eventos.

### Añadir un evento personal

1. Haz clic en un día vacío del calendario.
2. Rellena el formulario: título, fecha, hora (opcional), nota y color.
3. Pulsa **"Guardar"**.

### Editar o eliminar un evento personal

Haz clic sobre el evento en el calendario y usa los botones de editar (✏️) o eliminar (🗑️).

> Los eventos de la plataforma no se pueden editar ni eliminar desde el calendario personal.

---

## 12. Mis favoritos

> ⚠️ **Requiere registro e inicio de sesión.**

Accede desde el menú de usuario o la URL `/favoritos`.

Guarda los eventos y lugares que más te interesan para acceder a ellos rápidamente.

### Añadir a favoritos

- En el detalle de cualquier evento o lugar, haz clic en el icono ❤️ (corazón).
- El icono cambia a relleno indicando que está guardado.

### Ver y gestionar favoritos

- Accede a `/favoritos` para ver toda tu lista.
- La lista se divide en **Eventos** y **Lugares**.
- Para eliminar un favorito, haz clic de nuevo en el corazón en cualquier detalle o usa el botón de eliminar en la página de favoritos.

---

## 13. Mi perfil

> ⚠️ **Requiere registro e inicio de sesión.**

Accede desde el menú de usuario o la URL `/perfil`.

### Información que puedes gestionar

| Campo | Editable |
|---|---|
| Nombre | ✅ Sí |
| Bio / descripción | ✅ Sí |
| Avatar (foto de perfil) | ✅ Sí (URL de imagen) |
| Email | ❌ No (se gestiona en la autenticación) |

### Mis reseñas

En la página de perfil también puedes ver todas las reseñas que has escrito en la plataforma.

### Eliminar cuenta

En la sección inferior de tu perfil encontrarás la opción **"Eliminar cuenta"**. Esta acción es **irreversible** y borrará todos tus datos (perfil, favoritos, agenda personal y reseñas).

---

## 14. Contacto

Accede desde el menú **"Contacto"** o la URL `/contacto`.

Puedes enviar un mensaje al equipo de MéridaActiva a través del formulario de contacto. Rellena tu nombre, email, asunto y mensaje, y pulsa **"Enviar mensaje"**.

---

## 15. Funciones del Administrador

> Solo disponible para usuarios con rol **Administrador** o **Gestor (Editor)**.

### Dashboard (`/dashboard`)

Panel de control con:
- Estadísticas en tiempo real: eventos activos, usuarios registrados, reseñas totales, alertas del sistema.
- Accesos directos a las secciones de gestión.

### Gestión de eventos (`/admin/eventos`)

- **Ver** la lista completa de eventos.
- **Crear** nuevos eventos con todos sus campos (título, descripción, fecha, hora, categoría, precio, imagen, coordenadas, etc.).
- **Editar** cualquier evento existente.
- **Eliminar** eventos (acción irreversible).
- **Búsqueda y filtros** para localizar eventos rápidamente.

### Gestión de usuarios (`/admin/usuarios`)

> Solo para **Administradores**.

- Ver la lista de todos los usuarios registrados.
- Cambiar el **rol** de un usuario (Usuario, Gestor, Administrador).
- Ver la fecha de registro y el email de cada usuario.

### Moderación de reseñas (`/admin/resenas`)

- Ver todas las reseñas de la plataforma.
- **Eliminar** reseñas inapropiadas.
- Filtrar por puntuación o usuario.

---

## 16. Preguntas frecuentes y solución de problemas

### No recibo el email de confirmación de registro
- Revisa la carpeta de **spam** o **correo no deseado**.
- Asegúrate de haber escrito el email correctamente.
- Si pasados 5 minutos no llega, intenta registrarte de nuevo.

### No puedo iniciar sesión aunque el email y contraseña son correctos
- Asegúrate de haber **confirmado tu email** (enlace enviado al registrarte).
- Prueba a recuperar la contraseña desde el enlace **"¿Olvidaste la contraseña?"**.

### La pantalla de carga no termina (loading infinito)
- Espera 12 segundos: aparecerá un enlace **"Recuperar sesión"**.
- O accede directamente a `/recuperar-sesion`.
- Como último recurso, pulsa **"Reiniciar sesión bloqueada"** en la página de login.

### El mapa no carga
- Comprueba tu conexión a internet.
- Desactiva extensiones del navegador que puedan bloquear mapas (ad-blockers).
- Recarga la página.

### La IA no genera la ruta o el chat no responde
- La IA puede estar saturada en momentos de alta demanda. Espera unos segundos y vuelve a intentarlo.
- El botón de la ruta mostrará el mensaje de error correspondiente con instrucciones.

### La aplicación muestra un banner "Sin conexión"
- La aplicación detecta que no tienes conexión a internet.
- Puedes seguir viendo contenido ya cargado, pero no podrás acceder a nuevos datos ni usar la IA.

---

*Manual de Usuario — MéridaActiva v1.0 — Mayo 2026*
