# AgroMap

AgroMap es una plataforma para descubrir y comparar precios en las ferias del productor de Costa Rica. Permite a los **usuarios** ver productos, comparar precios entre ferias y generar proformas; a los **productores** gestionar su puesto, productos y ganancias; y a los **administradores** gestionar usuarios, ferias, recetas, mensajes y solicitudes de cambio de rol.

Stack: **Node.js + Express + Sequelize + MySQL** en el backend, **React + TypeScript + Vite** en el frontend.

## Requisitos previos

- **Node.js** ≥ 18 (probado con 24.x)
- **MySQL** ≥ 8.x corriendo localmente
- **npm** (viene con Node)

## Estructura del repositorio

```
Semilla-digital/             ← raíz del repo
├── README.md                ← este archivo
├── .gitignore
├── BackEnd/                 ← API REST (Express + Sequelize)
│   ├── src/
│   │   ├── app.js
│   │   ├── config/          ← config Sequelize (no usado; ver Config/)
│   │   ├── controllers/     ← un controller por recurso
│   │   ├── middlewares/     ← authMiddleware, roleMiddleware, etc.
│   │   ├── models/          ← modelos Sequelize + associations
│   │   ├── routes/          ← routers de Express
│   │   ├── seeders/         ← datos demo
│   │   ├── services/        ← lógica de negocio
│   │   └── tests/           ← Jest + supertest (87 tests)
│   ├── Config/config.js     ← config Sequelize-CLI (esta es la que se usa)
│   ├── Migrations/          ← migraciones Sequelize
│   ├── scripts/             ← utilidades fuera del flujo normal
│   │   ├── check_db.js
│   │   └── reset-password.js
│   ├── .env                 ← (no committeado) credenciales y JWT_SECRET
│   └── package.json
└── FrontEnd/                ← SPA (React + TypeScript + Vite)
    ├── src/
    │   ├── App.tsx, main.tsx
    │   ├── components/      ← UI por dominio
    │   │   ├── admin/          ← panel administrador
    │   │   ├── adminProductor/ ← panel productor
    │   │   ├── auth/
    │   │   ├── context/     ← AuthContext, CartContext
    │   │   ├── Cart/, Compare/, ContactUs/, Footer/, HeroSection/,
    │   │   │   Map/, Navbar/, ProductModal/, Profile/, Proforma/,
    │   │   │   Recipes/, RegistroProductor/, Productor/, ...
    │   ├── hooks/           ← useFerias, useGroupedFerias
    │   ├── pages/           ← rutas top-level (Home, Comparar, ...)
    │   ├── routes/          ← Routing.tsx, ProtectedRoute
    │   ├── services/        ← api.config, api, AuthService,
    │   │                       ProductService, ProductorServices,
    │   │                       geocoding, googleMaps
    │   ├── types/, utils/
    ├── .env                 ← (no committeado) VITE_API_URL, VITE_GOOGLE_MAPS_KEY
    └── package.json
```

## Variables de entorno

### Backend (`BackEnd/.env`)

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=AgroMap
JWT_SECRET=usa_un_string_aleatorio_largo_de_64+_bytes
PORT=3002
NODE_ENV=development

# Opcional: orígenes permitidos por CORS (lista CSV).
# Default: http://localhost:5173,http://localhost:3000,http://localhost:4173
# CORS_ORIGINS=http://localhost:5173
```

Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Frontend (`FrontEnd/.env`)

```ini
VITE_API_URL=http://localhost:3002
# Si vas a usar Google Places en vez del modo mock:
# VITE_GOOGLE_MAPS_KEY=tu_api_key
```

## Setup inicial

### 1. Crear la base de datos vacía

```bash
mysql -u root -p -e "CREATE DATABASE AgroMap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Backend

```bash
cd BackEnd
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev          # arranca con nodemon en :3002
```

### 3. Frontend (en otra terminal)

```bash
cd FrontEnd
npm install
npm run dev          # Vite en :5173
```

Abre http://localhost:5173.

### Credenciales de seed

| Rol         | Email                 | Password   |
| ----------- | --------------------- | ---------- |
| Administrador | `admin@agromap.com`  | `secret123` |
| Productor     | `juan@productor.com` | `secret123` |
| Usuario       | `maria@usuario.com`  | `secret123` |

> ⚠️ Cambiá estas contraseñas si vas a tener la app expuesta. Usá el script `scripts/reset-password.js`:
>
> ```bash
> ADMIN_EMAIL=admin@agromap.com NEW_PASSWORD='NuevaPasswordFuerte' \
>   node scripts/reset-password.js
> ```

## Scripts útiles

### Backend

| Comando                | Qué hace                                       |
| ---------------------- | ---------------------------------------------- |
| `npm start`            | Arranca con `node` (sin auto-reload)           |
| `npm run dev`          | Arranca con `nodemon` (auto-reload en cambios) |
| `npm test`             | Corre los 87 tests Jest + supertest            |
| `npm run test:coverage`| Tests con reporte de cobertura                 |
| `npm run seed`         | Re-ejecuta los seeders                         |
| `node scripts/check_db.js` | Verifica conexión y muestra usuarios/provincias |

### Frontend

| Comando         | Qué hace                                                |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | Vite dev server con HMR en :5173                        |
| `npm run build` | Build de producción a `dist/`                           |
| `npm run preview` | Sirve el build de producción para probarlo localmente |
| `npm run lint`  | ESLint                                                  |

## Cómo está organizada la autenticación

- **JWT en cookie `httpOnly`**: el backend setea la cookie `agromap_token` al hacer login/register. El navegador la envía automáticamente con cada request (`credentials: 'include'` en `authFetch`).
- **No se guarda el JWT en `localStorage`** del frontend — esa es la mitigación contra XSS. Solo se guarda info no sensible del usuario (`user`) para hidratar la UI al recargar.
- **Logout** llama a `POST /auth/logout`, que limpia la cookie del lado del cliente.
- El header `Authorization: Bearer <token>` sigue siendo aceptado por el backend, útil para Postman/curl/tests.

## Tests

Backend: 87 tests en 10 suites cubriendo controllers, middlewares y servicios.

```bash
cd BackEnd
npm test
```

Frontend: sin tests automatizados todavía.

## Despliegue (notas)

- En producción configurar `NODE_ENV=production` activa `secure: true` en las cookies → **requiere HTTPS obligatorio**.
- Si frontend y backend están en dominios distintos (ej. `agromap.com` y `api.agromap.com`), cambiar en `authController.js` el `sameSite: 'lax'` a `'none'` y mantener `secure: true`.
- Setear `CORS_ORIGINS` en el `.env` de producción con el dominio real del frontend.

## Stack y librerías relevantes

**Backend**

- Express 4
- Sequelize 6 + sequelize-cli (MySQL 8 con mysql2)
- jsonwebtoken (JWT) + bcrypt
- cookie-parser, cors, morgan
- Jest + supertest

**Frontend**

- React 19 + TypeScript
- Vite 7
- React Router 7
- Leaflet + react-leaflet (mapas)
- SweetAlert2
- echarts + echarts-for-react (gráficos)
- jsPDF + jspdf-autotable (exportar proformas)
- lucide-react, react-icons (iconos)

## Licencia

Proyecto educativo / no especificada.
