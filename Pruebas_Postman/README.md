# AgroMap API — Suite de Pruebas Postman

Colección de pruebas automatizadas (QA) para la API de **AgroMap** (Node.js + Express + Sequelize/MySQL).

Esta carpeta contiene una colección de Postman lista para ejecutarse con el **Collection Runner** o con **Newman** (CLI/CI), con encadenamiento dinámico de tokens e IDs, asserts globales y pruebas negativas.

---

## 📁 Archivos

| Archivo                            | Descripción                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `AgroMap.postman_collection.json`  | Colección (esquema v2.1.0). 9 carpetas, 50 requests.                                             |
| `AgroMap.postman_environment.json` | Entorno "AgroMap - Local" con `baseUrl`, credenciales por rol y placeholders para IDs dinámicos. |
| `README.md`                        | Este documento.                                                                                  |

---

## 🔧 Requisitos previos

1. **Backend levantado** en `http://localhost:3002`:
   ```bash
   cd Semilla-digital/BackEnd
   npm install
   npm run dev
   ```
2. **Base de datos sembrada** (seeders) para tener los 3 usuarios de prueba y datos base:
   ```bash
   npx sequelize-cli db:migrate
   npx sequelize-cli db:seed:all
   ```
3. **Postman** (app de escritorio) o **Newman** (`npm i -g newman`) para CI.

> El puerto por defecto es **3002** (`PORT || 3002` en `src/app.js`). Las rutas se montan en la **raíz**, sin prefijo `/api`.

---

## 🔐 Autenticación

El backend emite un **JWT** de dos formas simultáneas:

- **Cookie httpOnly** `agromap_token` (se setea en el login).
- **Header** `Authorization: Bearer <token>` (aceptado por `authMiddleware`).

Los scripts de login capturan el token de forma robusta, en este orden:

1. `data.token` del body (solo presente cuando `NODE_ENV=test`).
2. La cookie `agromap_token` del cookie jar de Postman.
3. El header `Set-Cookie` (regex de respaldo).

El token se guarda por rol en el entorno: `adminToken`, `productorToken`, `usuarioToken`. Si ninguna captura tiene éxito, Postman reenvía automáticamente la cookie httpOnly como respaldo (mismo host).

### Usuarios de prueba (seed)

| Rol               | Email                | Password    |
| ----------------- | -------------------- | ----------- |
| Administrador     | `admin@agromap.com`  | `secret123` |
| Productor         | `juan@productor.com` | `secret123` |
| Usuario (cliente) | `maria@usuario.com`  | `secret123` |

Definidos en `src/seeders/006-seed-usuarios.js`. Si cambiaste las credenciales, edita las variables del entorno.

---

## 🚀 Cómo ejecutar

### Opción A — Postman (Collection Runner)

1. **Importa** ambos archivos (`Import` → arrastra los `.json`).
2. Selecciona el entorno **AgroMap - Local** (esquina superior derecha).
3. Abre la colección → **Run collection**.
4. Mantén el **orden de las carpetas** (00 → 08). El encadenamiento depende de ese orden.
5. Ejecuta. Verás los asserts (`pm.test`) por cada request en el panel de resultados.

### Opción B — Newman (CLI / CI)

```bash
newman run AgroMap.postman_collection.json \
  -e AgroMap.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export newman-report.html
```

---

## 🗂️ Estructura de la colección

Las carpetas están **numeradas** para reflejar el orden de ejecución recomendado:

| Carpeta                             | Contenido                                                   | Requests |
| ----------------------------------- | ----------------------------------------------------------- | -------- |
| `00 - Health`                       | Estado del servidor (`GET /`)                               | 1        |
| `01 - Autenticación`                | Login por rol, register, `me`, logout + negativas (401/400) | 9        |
| `02 - Ferias`                       | CRUD ferias + negativa RBAC (403)                           | 6        |
| `03 - Productos`                    | CRUD + filtros + toggle + negativas (401/400)               | 9        |
| `04 - Recetas`                      | CRUD recetas (Admin) + negativa (400)                       | 6        |
| `05 - Geografía`                    | Provincias / Cantones / Distritos (lectura)                 | 4        |
| `06 - Usuarios`                     | Listar/perfil/get/update + negativa RBAC (403)              | 5        |
| `07 - Mensajes de Contacto`         | Crear/listar/buzón/responder + negativa (400)               | 5        |
| `08 - Solicitudes de Cambio de Rol` | Crear/listar/pendientes/rechazar + negativa (400)           | 5        |

**Total: 50 requests.**

---

## ✅ Asserts globales

Definidos a nivel de **colección** (se ejecutan tras _cada_ request):

- **Pre-request global**: si `baseUrl` no existe, la inicializa a `http://localhost:3002`.
- **Test global 1**: `responseTime < 5000 ms`.
- **Test global 2**: si la respuesta tiene body, `Content-Type` incluye `application/json`.

Además, cada request tiene asserts específicos: status code estricto (`200/201/204/400/401/403`), forma `{ success, data }`, y verificación de claves/tipos (arrays, `id`, `nombre`, `role`, `estado`, booleanos, ausencia de `password`, etc.).

---

## 🔗 Encadenamiento dinámico de variables

No hace falta editar IDs ni tokens a mano. El flujo guarda y reutiliza variables de entorno:

| Variable                                         | Se establece en                  | Se consume en                             |
| ------------------------------------------------ | -------------------------------- | ----------------------------------------- |
| `adminToken` / `productorToken` / `usuarioToken` | Logins de cada rol               | Todas las requests protegidas             |
| `adminId` / `productorId` / `usuarioId`          | Logins                           | `GET/PUT /usuarios/:id`, crear solicitud  |
| `feriaId`                                        | `GET /ferias` (primer resultado) | `GET /ferias/:id`                         |
| `createdFeriaId`                                 | `POST /ferias`                   | `PUT` / `DELETE /ferias/:id`              |
| `productoId`                                     | `GET /productos`                 | `GET /productos/:id`                      |
| `createdProductoId`                              | `POST /productos`                | `PUT` / `PATCH` / `DELETE /productos/:id` |
| `recetaId`                                       | `GET /recetas`                   | `GET /recetas/:id`                        |
| `createdRecetaId`                                | `POST /recetas`                  | `PUT` / `DELETE /recetas/:id`             |
| `provinciaId`                                    | `GET /provincias`                | `GET /provincias/:id`                     |
| `createdMensajeId`                               | `POST /mensajes`                 | `PATCH /mensajes/:id/responder`           |
| `createdSolicitudId`                             | `POST /solicitudes`              | `PATCH /solicitudes/:id/rechazar`         |

---

## 🧪 Pruebas negativas incluidas

| Caso                             | Endpoint             | Esperado |
| -------------------------------- | -------------------- | -------- |
| Credenciales inválidas           | `POST /auth/login`   | `401`    |
| Campos faltantes (sin password)  | `POST /auth/login`   | `400`    |
| Ruta protegida sin token         | `GET /usuarios`      | `401`    |
| Crear producto sin token         | `POST /productos`    | `401`    |
| Categoría fuera del enum         | `POST /productos`    | `400`    |
| Receta sin campos requeridos     | `POST /recetas`      | `400`    |
| Mensaje sin correo/mensaje       | `POST /mensajes`     | `400`    |
| `rol_solicitado` faltante        | `POST /solicitudes`  | `400`    |
| Usuario borrando feria (RBAC)    | `DELETE /ferias/:id` | `403`    |
| Usuario listando usuarios (RBAC) | `GET /usuarios`      | `403`    |

---

## 📋 Variables del entorno

| Variable                                                                                                                                               | Valor por defecto                  | Tipo             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- | ---------------- |
| `baseUrl`                                                                                                                                              | `http://localhost:3002`            | default          |
| `adminEmail` / `adminPassword`                                                                                                                         | `admin@agromap.com` / `secret123`  | default / secret |
| `productorEmail` / `productorPassword`                                                                                                                 | `juan@productor.com` / `secret123` | default / secret |
| `usuarioEmail` / `usuarioPassword`                                                                                                                     | `maria@usuario.com` / `secret123`  | default / secret |
| `adminToken` / `productorToken` / `usuarioToken`                                                                                                       | _(vacío, se llena en runtime)_     | secret           |
| `adminId` / `productorId` / `usuarioId`                                                                                                                | _(vacío)_                          | default          |
| `feriaId`, `createdFeriaId`, `productoId`, `createdProductoId`, `recetaId`, `createdRecetaId`, `provinciaId`, `createdMensajeId`, `createdSolicitudId` | _(vacío)_                          | default          |

---

## ⚠️ Notas y consideraciones

- **Orden obligatorio**: ejecuta la colección de arriba a abajo. Los IDs dinámicos se generan en requests previas.
- **Rate limiting**: `POST /auth/login` y `/auth/register` tienen `express-rate-limit`. En desarrollo (`NODE_ENV != production`) el límite es alto (100/50), pero si corres la colección muchas veces seguidas podrías toparlo (15 min de ventana para login).
- **Recetas sin imagen**: el `POST /recetas` se envía sin imagen a propósito; el backend rechaza URLs que no sean de Cloudinary o del fallback local.
- **Modo test**: si levantas el backend con `NODE_ENV=test`, las respuestas devuelven `data` crudo (sin envoltorio `{ success, data }`) y el login incluye `token` en el body. Los scripts manejan ambos casos, pero los asserts asumen el formato normal (`{ success, data }`).
- **Solicitud — campos camelCase**: la respuesta de crear solicitud devuelve `rolSolicitado` (camelCase), no `rol_solicitado`. Los asserts ya lo contemplan.

---

## 🔄 Extensiones posibles

La API tiene más módulos no cubiertos aún (podrían añadirse como carpetas `09`–`16`):

`delivery`, `proformas`, `ofertas`, `ventas`/ganancias, `permisos`, `auditoria`, `platform-settings`, `liquidaciones`, `puestos`, `productores`, `direcciones`.
