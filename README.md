# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




#  AgroMap – Semilla Digital

##  Descripción

**AgroMap – Semilla Digital** es una aplicación web desarrollada con **React y Vite** que permite gestionar y visualizar información relacionada con el sector agrícola. El proyecto integra una API simulada mediante **json-server**, facilitando el manejo de datos de forma sencilla durante el desarrollo.

El objetivo principal es ofrecer una plataforma interactiva y eficiente para la administración y consulta de información agrícola.

Actualmente incluye:
- Sistema de autenticación (login).
- Funcionalidad de comparación de productos/semillas.
- Estructura modular con páginas y componentes reutilizables.
- Backend simulado con `db.json` (ideal para desarrollo y pruebas).

---

##  Tecnologías utilizadas

*  React 19
*  Vite
*  React Router DOM
*  React Icons / Lucide React
*  SweetAlert2
*  JSON Server (API simulada)
*  ESLint

---

## Estructura del proyecto

Semilla-digital/
├── public/             # Archivos estáticos públicos
├── src/
│   ├── assets/         # Imágenes, fuentes, etc.
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Vistas/páginas principales
│   ├── routes/         # Configuración de rutas
│   ├── servers/        # Lógica de servicios o mocks
│   ├── App.jsx         # Componente raíz
│   ├── main.jsx        # Punto de entrada
│   └── ...
├── db.json             # Base de datos mock (semillas, productos, etc.)
├── vite.config.js      # Configuración de Vite
├── package.json
└── README.md

---

## Instalación

Sigue estos pasos para ejecutar el proyecto localmente:

```bash
# 1. Clonar el repositorio
git clone <https://github.com/sduartecfwd09-collab/Semilla-digital.git>

# 2. Entrar al proyecto
cd Semilla-digital

# 3. Instalar dependencias
npm install
```

---

## Ejecución del proyecto

### 1. Iniciar el frontend


npm run dev


### 2. Iniciar la API (json-server)


npm run server


* Frontend: http://localhost:5173
* API: http://localhost:3002

---

## Uso

1. Ejecuta el frontend y el servidor
2. Accede desde el navegador
3. Interactúa con la interfaz para visualizar o gestionar datos

Este proyecto está diseñado para ser intuitivo y fácil de usar.

---

## Scripts disponibles

```bash
npm run dev       # Ejecuta la app en modo desarrollo
npm run build     # Construye la aplicación para producción
npm run preview   # Previsualiza la build
npm run server    # Ejecuta la API local con json-server
npm run lint      # Analiza el código con ESLint
```

---

## Buenas prácticas implementadas

* Uso de **componentes reutilizables en React**
* Separación entre frontend y API simulada
* Uso de **ESLint** para calidad de código
* Estructura modular y escalable
* Uso de **Markdown** para documentación clara

---

## Contribución

Las contribuciones son bienvenidas. Para colaborar:

1. Haz un fork del proyecto
2. Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios
4. Haz commit (`git commit -m "Agrega nueva funcionalidad"`)
5. Haz push (`git push origin feature/nueva-funcionalidad`)
6. Abre un Pull Request

---

## Licencia

Puedes usarlo, modificarlo y distribuirlo libremente.

---

## Autor

Desarrollado por: *Yerik Samir García González* *Saraí Duarte Centeno* *Mariel Lefebre López*

---

## Notas adicionales

* Este proyecto utiliza una API simulada, por lo que no requiere backend real
* Ideal para aprendizaje, prototipos o pruebas de concepto
* Puede escalarse fácilmente a un backend real (Node.js, Firebase, etc.)

---

# Estado del proyecto

En desarrollo activo. Últimas mejoras incluyen estructura de carpetas, implementación de servidores agrícolas y funcionalidad de comparación.
¿Ideas, bugs o sugerencias? ¡Abre un issue!

# ¡Gracias por visitar AgroMap!
