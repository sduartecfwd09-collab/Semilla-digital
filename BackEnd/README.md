# ⚙️ AgroMap BackEnd - Configuración de Variables de Entorno

Este documento describe la justificación técnica de la configuración de entorno en el proyecto **AgroMap BackEnd** y detalla la función de cada variable definida en el archivo `.env`.

---

## 🛡️ Justificación Técnica (¿Por qué usar `.env`?)

El uso de un archivo `.env` para almacenar variables de entorno responde a estándares de seguridad y desarrollo profesional:

1. **Seguridad y Confidencialidad:** Evita exponer credenciales críticas (como contraseñas de bases de datos, firmas JWT, claves de Cloudinary y API Keys de Groq AI) en repositorios públicos o privados de Git.
2. **Separación de Entornos:** Permite cambiar la configuración del servidor entre desarrollo local (`development`) y producción (`production`) sin necesidad de alterar el código fuente de la aplicación.
3. **Fácil Configuración:** Simplifica el proceso de onboarding para nuevos desarrolladores, centralizando la configuración global de la aplicación.

---

## 🚀 Guía de Configuración Rápida

1. Ve a la carpeta `BackEnd/`.
2. Copia el archivo de plantilla `.env.example` y renómbralo a `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edita el archivo `.env` recién creado y completa los valores con tus credenciales reales.
   *(El archivo `.env` está en `.gitignore`, por lo que tus credenciales locales nunca se subirán al repositorio).*

---

## 📋 Diccionario de Variables de Entorno

A continuación, se detalla el propósito de cada variable requerida por el backend de **AgroMap**:

### ── Servidor y Base de Datos ───────────────────────────────

*   **`PORT`**: Puerto local en el cual se ejecutará la API REST del backend (por defecto, `3002`).
*   **`NODE_ENV`**: Define el entorno de ejecución actual (`development` para desarrollo local, `production` para despliegues reales).
*   **`DB_HOST`**: Dirección IP o host donde se hospeda la base de datos MySQL (usualmente `localhost` en desarrollo local).
*   **`DB_PORT`**: Puerto de escucha de la base de datos MySQL (por defecto, `3306`).
*   **`DB_USER`**: Usuario con privilegios de lectura/escritura en la base de datos (usualmente `root` en desarrollo local).
*   **`DB_PASSWORD`**: Contraseña correspondiente al usuario de la base de datos.
*   **`DB_NAME`**: Nombre de la base de datos SQL del proyecto (definida como `Agromap`).

### ── Seguridad y Autenticación (JWT) ─────────────────────────

*   **`JWT_SECRET`**: Cadena secreta utilizada para firmar digitalmente y verificar la validez de los JSON Web Tokens (JWT) que se emiten al autenticar usuarios. Debe ser una cadena larga y compleja.
*   **`JWT_EXPIRES_IN`**: Tiempo de vida del token de autenticación (ejemplo: `1h` para una hora de sesión activa antes de expirar).

### ── Servicio de Correo Electrónico (Gmail SMTP) ─────────────

*   **`SMTP_HOST`**: Servidor de salida SMTP para el envío de correos automatizados (ejemplo: `smtp.gmail.com`).
*   **`SMTP_PORT`**: Puerto seguro de SMTP para el envío cifrado (típicamente `465` con SSL o `587` con TLS).
*   **`SMTP_SECURE`**: Booleano (`true` o `false`) que indica si la conexión requiere cifrado SSL directo.
*   **`SMTP_USER`**: Dirección de correo electrónico emisora desde la cual se enviarán los correos automáticos del sistema (ejemplo: `agromapcorp@gmail.com`).
*   **`SMTP_PASS`**: Contraseña de aplicación de 16 caracteres generada desde la configuración de seguridad de Google (no la contraseña personal de acceso regular).
*   **`SMTP_FROM`**: Formato del remitente que verán los usuarios finales al recibir un correo (ejemplo: `AgroMap <agromapcorp@gmail.com>`).

### ── Inteligencia Artificial (Groq) ──────────────────────────

*   **`GROQ_API_KEY`**: Clave de API privada de Groq necesaria para comunicarse con los modelos de lenguaje (LLM). Permite procesar el análisis semántico y validación de solicitudes.
*   **`GROQ_MODEL`**: Modelo específico de lenguaje a utilizar para realizar las inferencias (por defecto, `llama-3.3-70b-versatile`).

### ── Auto-revisión de Solicitudes de Productor ─────────────

*   **`AI_AUTO_REVIEW_ENABLED`**: Variable booleana (`true` para activar la validación automática con Inteligencia Artificial y envío automatizado de correos; `false` para delegar la aprobación al flujo manual de administradores).
*   **`AI_FALLBACK_NOTIFY_EMAIL`**: Dirección de correo electrónico del administrador a la cual se enviará una alerta si la IA llega a fallar (timeout, límite de cuota superado, etc.), dejando la solicitud pendiente de revisión manual.

### ── Servicio de Imágenes (Cloudinary) ─────────────────────

*   **`CLOUDINARY_CLOUD_NAME`**: Nombre único de tu nube (Cloud Name) de Cloudinary para el almacenamiento de archivos multimedia.
*   **`CLOUDINARY_API_KEY`**: Llave de API pública asociada a tu cuenta de Cloudinary.
*   **`CLOUDINARY_API_SECRET`**: Clave secreta privada para autenticar de manera segura la subida y eliminación de imágenes (fotos de perfil, productos, puestos, etc.).
