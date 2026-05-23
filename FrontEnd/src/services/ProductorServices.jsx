// ─────────────────────────────────────────────────────────────────
// ProductorServices.jsx
// Servicio CRUD para productos y ferias usando json-server.
//
// PARA EJECUTAR:
//   1. npm install json-server --save-dev
//   2. En una terminal:  npx json-server --watch db.json --port 3002
//   3. En otra terminal: npm run dev
//
//   O con el script combinado:
//   npm run dev:full   (requiere: npm install concurrently --save-dev)
// ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3002'

// ─── HELPERS ─────────────────────────────────────────────────────

const handleResponse = async (res) => {
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg || `Error HTTP ${res.status}`)
  }
  // DELETE devuelve 200 con cuerpo vacío en json-server
  const text = await res.text()
  const parsed = text ? JSON.parse(text) : null
  if (parsed && parsed.success !== undefined) {
    return parsed.data;
  }
  return parsed;
}

// ─── PRODUCTOS ───────────────────────────────────────────────────

/**
 * Obtiene todos los productos.
 * @returns {Promise<Array>}
 */
export const getProductos = async () => {
  const res = await fetch(`${BASE_URL}/productos`)
  return handleResponse(res)
}

/**
 * Obtiene un producto por ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getProductoById = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`)
  return handleResponse(res)
}

/**
 * Crea un nuevo producto.
 * @param {Object} producto - { nombre, emoji, descripcion, categoria, precios }
 * @returns {Promise<Object>} producto creado con su nuevo id
 */
export const createProducto = async (producto) => {
  const res = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })
  return handleResponse(res)
}

/**
 * Actualiza un producto existente (reemplaza todos sus campos).
 * @param {number|string} id
 * @param {Object} producto - objeto completo actualizado
 * @returns {Promise<Object>} producto actualizado
 */
export const updateProducto = async (id, producto) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })
  return handleResponse(res)
}

/**
 * Actualiza parcialmente un producto (solo los campos enviados).
 * @param {number|string} id
 * @param {Object} campos - campos a actualizar, ej: { nombre: "Tomate" }
 * @returns {Promise<Object>} producto actualizado
 */
export const patchProducto = async (id, campos) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(campos),
  })
  return handleResponse(res)
}

/**
 * Elimina un producto por ID.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export const deleteProducto = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}

// ─── FERIAS ───────────────────────────────────────────────────────

/**
 * Obtiene todas las ferias.
 * @returns {Promise<Array>}
 */
export const getFerias = async () => {
  const res = await fetch(`${BASE_URL}/ferias`)
  const data = await handleResponse(res)
  if (!data) return []
  return data.map(f => {
    const rawProv = f.direccion?.provincia?.nombre || f.provincia || f.province || "Otras";
    let provincia = rawProv;
    if (!rawProv || rawProv === 'Otras') {
      const nombreFeria = f.nombre || f.name || '';
      const PROVINCIAS_CR = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
      const match = PROVINCIAS_CR.find(p => nombreFeria.toLowerCase().includes(p.toLowerCase()));
      if (match) provincia = match;
    }
    return {
      ...f,
      nombre: f.nombre || f.name || "Feria sin nombre",
      provincia,
      direccion: f.direccion?.distrito?.nombre || f.direccion || f.location || "Ubicación no especificada",
      horario: f.horario || f.schedule || "Horario no disponible"
    };
  })
}

/**
 * Obtiene una feria por ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getFeriaById = async (id) => {
  const res = await fetch(`${BASE_URL}/ferias/${id}`)
  const f = await handleResponse(res)
  if (!f) return null
  const rawProv = f.direccion?.provincia?.nombre || f.provincia || f.province || "Otras";
  let provincia = rawProv;
  if (!rawProv || rawProv === 'Otras') {
    const nombreFeria = f.nombre || f.name || '';
    const PROVINCIAS_CR = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón"];
    const match = PROVINCIAS_CR.find(p => nombreFeria.toLowerCase().includes(p.toLowerCase()));
    if (match) provincia = match;
  }
  return {
    ...f,
    nombre: f.nombre || f.name || "Feria sin nombre",
    provincia,
    direccion: f.direccion?.distrito?.nombre || f.direccion || f.location || "Ubicación no especificada",
    horario: f.horario || f.schedule || "Horario no disponible"
  }
}

/**
 * Crea una nueva feria.
 * @param {Object} feria - { nombre, ubicacion, provincia, horario, emoji, productCount }
 * @returns {Promise<Object>} feria creada
 */
export const createFeria = async (feria) => {
  const res = await fetch(`${BASE_URL}/ferias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feria),
  })
  return handleResponse(res)
}

/**
 * Actualiza una feria existente.
 * @param {number|string} id
 * @param {Object} feria - objeto completo actualizado
 * @returns {Promise<Object>} feria actualizada
 */
export const updateFeria = async (id, feria) => {
  const res = await fetch(`${BASE_URL}/ferias/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feria),
  })
  return handleResponse(res)
}

/**
 * Elimina una feria por ID.
 * @param {number|string} id
 * @returns {Promise<null>}
 */
export const deleteFeria = async (id) => {
  const res = await fetch(`${BASE_URL}/ferias/${id}`, {
    method: 'DELETE',
  })
  return handleResponse(res)
}

// ─── PUESTOS ─────────────────────────────────────────────────────

/**
 * Obtiene el puesto de un productor por su ID de usuario.
 * @param {number|string} userId
 * @returns {Promise<Object>} puesto encontrado o null
 */
export const getPuestoByUserId = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/puestos?usuarioId=${userId}`)
    const posts = await handleResponse(res)
    // Devolvemos el último para que coincida con RegistroProductor (último registro ingresado/actualizado)
    return posts.length > 0 ? posts[posts.length - 1] : null
  } catch (error) {
    console.error('Error fetching puesto:', error)
    return null
  }
}

/**
 * Actualiza la información de un puesto.
 * @param {number|string} id
 * @param {Object} puestoData
 * @returns {Promise<Object>} puesto actualizado
 */
export const updatePuesto = async (id, puestoData) => {
  const res = await fetch(`${BASE_URL}/puestos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(puestoData),
  })
  return handleResponse(res)
}
