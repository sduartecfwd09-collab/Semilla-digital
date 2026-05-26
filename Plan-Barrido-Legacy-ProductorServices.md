# Plan de Implementación — Barrido del legacy `ProductorServices.jsx`

**Contexto:** la auditoría posterior a 3a/3b/3c detectó que `FrontEnd/src/services/ProductorServices.jsx` (apunta a `json-server` en `localhost:3002`) todavía tiene 4 imports activos en el codebase. Esto crea una divergencia silenciosa: el productor crea ofertas vía el backend real (con validación de `puesto_ferias`), pero `MisFerias.tsx` filtra productos vía la lógica vieja `user.feriaId`. Hay además uso de `getPuestoByUserId` y `getFerias` apuntando a un mock que probablemente nadie está corriendo en dev → el módulo rompe silenciosamente.

**Objetivo:** migrar los 4 consumidores al backend real (`authFetch` + endpoints existentes) y dejar `ProductorServices.jsx` sin imports. Si después del barrido el archivo queda huérfano, se borra.

---

## Orden de ejecución (priorizado por riesgo)

| # | Archivo | Severidad | Razón |
|---|---|---|---|
| 1 | `MisFerias.tsx` | 🔴 Alta | Divergencia activa con modelo 1:1:N. Filtra por `user.feriaId` (lógica vieja). |
| 2 | `Dashboard.tsx` | 🟡 Media | Solo usa `getPuestoByUserId` para display, sin lógica defectuosa, pero apunta a json-server. |
| 3 | `AdminProductForm.tsx` | 🟡 Media | Rama admin sigue usando `getFerias()` legacy. La rama productor ya usa `getMisFerias()` (correcto). |
| 4 | `RegisterForm.tsx` | 🟡 Media | Carga ferias en el flujo de registro vía json-server. |
| 5 | `productorService.ts` | — | Pre-requisito: agregar helpers compartidos antes de migrar consumidores. |
| 6 | `ProductorServices.jsx` | — | Limpieza final: borrar archivo o, si quedan exports sin usar, dejarlo deprecado. |

**Orden real de ejecución:** primero el Paso 5 (helpers), luego 1 → 2 → 3 → 4, luego 6.

---

## Paso 5 (pre-requisito) — Helpers compartidos en `productorService.ts`

**Archivo:** `FrontEnd/src/services/productorService.ts`

Hoy solo expone `getMisFerias()`. Agrego dos funciones que centralicen lo que hoy hace el legacy: obtener el puesto del usuario logueado y obtener todas las ferias (público, sin auth obligatoria).

### Código a agregar al final del archivo

```ts
// Devuelve el puesto del productor (modelo 1:1 — usuario_id es UNIQUE).
// Si el usuario aún no tiene puesto, el backend responde 404 → lo traducimos a null.
// Cualquier otro error sí se propaga.
export const getPuestoByUserId = async (userId: number | string) => {
  const res = await authFetch(`${ENDPOINTS.puestosProductor}/usuario/${userId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar puesto del productor`);
  }
  const json = await res.json();
  return json?.data ?? null;
};

// Lista completa de ferias. Ruta pública en el backend (no requiere token),
// por eso usa fetch plano: el flujo de registro la consume sin sesión activa.
// El shape devuelto incluye `direccion: { provincia, canton, distrito }`.
export const getFerias = async () => {
  const res = await fetch(ENDPOINTS.ferias);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al cargar ferias`);
  }
  const json = await res.json();
  return (json?.data ?? []) as FeriaAutorizada[];
};
```

**Verificación previa:** `ENDPOINTS.puestosProductor` ya existe (`api.config.ts:12`), `ENDPOINTS.ferias` ya existe (`api.config.ts:9`). No hace falta tocar `api.config.ts`.

**Por qué `fetch` plano y no `authFetch` para `getFerias`:** `RegisterForm` carga ferias antes de que el usuario tenga sesión. `authFetch` no falla con rutas públicas, pero si recibiera un 401 por otro motivo dispara redirección a `/auth` con SweetAlert — efecto colateral no deseado en pantalla de registro.

---

## Paso 1 — `MisFerias.tsx` (🔴 prioridad máxima)

**Archivo:** `FrontEnd/src/components/Productor/MisFerias/MisFerias.tsx`

### Diagnóstico exacto

- **Línea 8:** importa `getPuestoByUserId, getProductos` del legacy.
- **Líneas 30-32:** declara state `puesto` + `productosFeria` + `loading`.
- **Líneas 39-48:** `useEffect` que setea `puesto` y, si `user.feriaId` está definido, descarga **todos** los productos y filtra por feriaId.
- **JSX (líneas 62-164):** solo renderiza `puesto`. **`productosFeria` jamás aparece en el render.** Confirmado leyendo el archivo entero.

**Conclusión:** el bloque `if (user.feriaId) { ... setProductosFeria(...) }` es código muerto local que arrastra la lógica vieja de 1-feria-por-productor. Se elimina sin riesgo de UI.

### Cambios concretos

1. **Reemplazar import (línea 8):**
   ```ts
   // ANTES
   import { getPuestoByUserId, getProductos } from '../../../services/ProductorServices'
   // DESPUÉS
   import { getPuestoByUserId } from '../../../services/productorService'
   ```

2. **Eliminar el import de `Producto`** (línea 10) si ya no se usa tras el cleanup:
   ```ts
   // BORRAR si no queda otro uso de Producto en el archivo:
   import { Producto } from '../../../services/ProductService'
   ```

3. **Eliminar state muerto (línea 31):**
   ```ts
   // BORRAR
   const [productosFeria, setProductosFeria] = useState<Producto[]>([])
   ```

4. **Limpiar el `useEffect` (líneas 34-56):** queda solo el fetch del puesto.
   ```tsx
   useEffect(() => {
     const fetchData = async () => {
       if (!user) return
       try {
         setLoading(true)
         const dataPuesto = await getPuestoByUserId(user.id) as Puesto | null
         if (dataPuesto) setPuesto(dataPuesto)
       } catch (error) {
         console.error('Error al cargar datos:', error)
       } finally {
         setLoading(false)
       }
     }
     fetchData()
   }, [user])
   ```

### Riesgo y validación

- **Riesgo:** muy bajo. El JSX no toca `productosFeria`. La forma del `puesto` devuelta por el backend real coincide con la interfaz local `Puesto` gracias a `mapPuestoParaFrontend` en `puestoProductorService.js:16-72` (devuelve `nombrePuesto`, `descripcion`, `ubicacion`, `telefono`, `email`, `horarios`, `metodosCultivo`, `redesSociales`, `tiposProducto`, `fotosBase64`).
- **Validación manual:** logueado como Juan Pérez (productor con puesto), abrir `/productor/mis-ferias` y confirmar que se renderizan todos los campos del puesto sin errores en consola.

---

## Paso 2 — `Dashboard.tsx`

**Archivo:** `FrontEnd/src/components/Productor/Dashboard/Dashboard.tsx`

### Diagnóstico

- **Línea 12:** importa `getPuestoByUserId` del legacy.
- **Línea 77:** `const puestoData = await getPuestoByUserId(user.id) as PuestoData | null`. Solo display, sin lógica defectuosa.

### Cambios concretos

1. **Reemplazar import (línea 12):**
   ```ts
   // ANTES
   import { getPuestoByUserId } from '../../../services/ProductorServices'
   // DESPUÉS
   import { getPuestoByUserId } from '../../../services/productorService'
   ```

2. **No tocar nada más.** El uso en línea 77 es exactamente compatible: misma firma `(userId) => Promise<puesto | null>`.

### Riesgo y validación

- **Riesgo:** mínimo. Es swap directo.
- **Validación:** logueado como productor, abrir `/productor/dashboard` y confirmar que la sección "Mi Puesto" se llena (nombre, ubicación, teléfono, etc).

---

## Paso 3 — `AdminProductForm.tsx`

**Archivo:** `FrontEnd/src/components/adminProductor/ProductorProductForm/AdminProductForm.tsx`

### Diagnóstico

- **Línea 9:** `import { getFerias } from '../../../services/ProductorServices'`
- **Línea 10:** `import { getMisFerias } from '../../../services/productorService'` (ya correcto)
- **Líneas 66-68:** rama `user?.role === 'Productor' ? getMisFerias() : getFerias()`. La rama admin sigue tirando del legacy.

El helper `provinciaDe` (líneas 75-76) y el filtro de línea 200 ya aceptan ambos shapes (`direccion.provincia.nombre` o `provincia` plano), así que migrar a `GET /ferias` real es **transparente** para el filtro por provincia que solo usa la rama admin.

### Cambios concretos

1. **Unificar imports (líneas 9-10):**
   ```ts
   // ANTES
   import { getFerias } from '../../../services/ProductorServices'
   import { getMisFerias } from '../../../services/productorService'
   // DESPUÉS
   import { getFerias, getMisFerias } from '../../../services/productorService'
   ```

2. **No tocar nada más.** La rama `user?.role === 'Productor' ? getMisFerias() : getFerias()` queda igual, ahora ambas funciones vienen del mismo archivo.

### Riesgo y validación

- **Riesgo:** bajo. El shape del backend real ya viene siendo manejado por el form en otras ramas.
- **Validación:**
  - Como **Admin**, abrir el modal de "Nuevo Producto" en `/admin/productores`, elegir distintas provincias y confirmar que el dropdown "Feria" se filtra correctamente.
  - Como **Productor**, mismo flujo: el dropdown debe seguir mostrando solo las ferias autorizadas (sin regresión).

---

## Paso 4 — `RegisterForm.tsx`

**Archivo:** `FrontEnd/src/components/auth/RegisterFormProductor/RegisterForm.tsx`

### Diagnóstico

- **Línea 4:** `import { getFerias } from '../../../services/ProductorServices'`
- **Líneas 9-13:** interfaz local `Feria { id, nombre, ubicacion }` (string plano).
- **Línea 35:** `const data = await getFerias()` — el legacy devuelve `{ id, nombre, ubicacion: string, provincia: string, horario }` ya plano.
- **Línea 181:** `{feria.nombre} - {feria.ubicacion}` en el `<option>`.

El backend real devuelve `{ id, nombre, direccion: { provincia: {nombre}, canton: {nombre}, distrito: {nombre} }, ... }`. Hay que mapear `ubicacion` antes de setear el state, o ampliar la interfaz local.

### Cambios concretos

1. **Reemplazar import (línea 4):**
   ```ts
   // ANTES
   import { getFerias } from '../../../services/ProductorServices'
   // DESPUÉS
   import { getFerias } from '../../../services/productorService'
   ```

2. **Adaptar el efecto que carga ferias (líneas 32-42):**
   ```tsx
   useEffect(() => {
     const fetchFerias = async () => {
       try {
         const data = await getFerias()
         // El backend devuelve direccion como objeto anidado. Achatamos a un
         // string corto para el dropdown del registro.
         const mapped: Feria[] = data.map((f: any) => {
           const distrito = f.direccion?.distrito?.nombre
           const canton = f.direccion?.canton?.nombre
           const ubicacion = distrito && canton
             ? `${distrito}, ${canton}`
             : (typeof f.direccion === 'string' ? f.direccion : 'Ubicación no disponible')
           return { id: f.id, nombre: f.nombre, ubicacion }
         })
         setFerias(mapped)
       } catch (err) {
         console.error('Error al cargar ferias:', err)
       }
     }
     fetchFerias()
   }, [])
   ```

3. **No tocar el resto del componente.** La interfaz local `Feria` y el `<option>` siguen funcionando porque `ubicacion` queda como string.

### Riesgo y validación

- **Riesgo:** medio-bajo. El único punto frágil es el mapeo: si la `direccion` viene como string viejo (caso de ferias sembradas con shape antiguo) o como objeto incompleto, el fallback debe manejarlo. El código de arriba cubre ambos.
- **Validación:** desloguearse, ir a `/registro-productor`, confirmar que el dropdown "Feria Asignada" lista todas las ferias con formato `<nombre> - <ubicación>` y que se puede completar el registro sin errores.

---

## Paso 6 — Limpieza final: `ProductorServices.jsx`

### Acciones

1. **Verificar que no quedan imports activos:**
   ```
   Grep: from '.*ProductorServices'   (sin match esperado)
   Grep: require\(.*ProductorServices\)   (sin match esperado)
   ```

2. **Si el grep devuelve 0 matches → borrar el archivo:**
   - `FrontEnd/src/services/ProductorServices.jsx`

3. **Si quedan matches inesperados:** detener, listarlos y decidir caso por caso. No borrar.

### Riesgo y validación

- **Riesgo:** alto si se borra con consumidores vivos. **Cero** si se borra tras confirmar 0 imports.
- **Validación post-borrado:**
  - Compilar el frontend (`npm run build` o `tsc --noEmit`). Sin errores de módulo no encontrado.
  - Levantar el dev server y navegar por las 4 vistas afectadas: `/productor/mis-ferias`, `/productor/dashboard`, modal "Nuevo Producto" en `/admin/productores`, `/registro-productor`.

---

## Criterios de aceptación globales

- [ ] `ProductorServices.jsx` no es importado por ningún archivo del repo (grep limpio).
- [ ] `MisFerias.tsx` ya no contiene `productosFeria`, `setProductosFeria`, ni el filtro por `user.feriaId`.
- [ ] `Dashboard.tsx`, `AdminProductForm.tsx`, `RegisterForm.tsx` importan desde `services/productorService` (TypeScript) — no desde el `.jsx`.
- [ ] Las 4 vistas funcionan en runtime sin errores de consola con el backend real corriendo.
- [ ] No hay regresiones visuales en las 4 vistas comparadas con el estado anterior (loguearse como Juan Pérez y como Admin para cubrir ambas ramas).
- [ ] `npm run build` (o el equivalente) compila sin errores.

---

## Notas finales

- **No se toca el backend.** Todos los endpoints requeridos ya existen: `GET /api/ferias` (público), `GET /api/puestos/usuario/:usuarioId` (protegido).
- **No se introduce ningún endpoint nuevo.** El plan es estrictamente migrar la capa de servicios del frontend.
- **No se modifica `api.config.ts`.** Las constantes `ENDPOINTS.puestosProductor` y `ENDPOINTS.ferias` ya están.
- **Reversibilidad:** cada paso es un cambio de import + (en el caso 1) borrado de código muerto y (en el caso 4) mapeo de shape. Todo es reversible con `git checkout -- <archivo>` si algo falla en validación.
- **Lo que el plan NO hace** (deuda diferida, fuera de este barrido):
  - Documentar formalmente que `usuarios.feria_id` es solo "feria principal de display".
  - Agregar tests de 403 para `productoService.create` sin autorización.
  - Refactorizar el filtro `filteredFerias` + `selectedProvincia` en `AdminProductForm.tsx` cuando el rol es Productor (es redundante pero no roto).
