// ─────────────────────────────────────────────────────────────────
// AgricultorServices.jsx
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

const BASE_URL = 'http://localhost:3001'

// ─── HELPERS ─────────────────────────────────────────────────────

const handleResponse = async (res) => {
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText)
    throw new Error(msg || `Error HTTP ${res.status}`)
  }
  // DELETE devuelve 200 con cuerpo vacío en json-server
  const text = await res.text()
  return text ? JSON.parse(text) : null
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
  return handleResponse(res)
}

/**
 * Obtiene una feria por ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const getFeriaById = async (id) => {
  const res = await fetch(`${BASE_URL}/ferias/${id}`)
  return handleResponse(res)
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
 * Obtiene el puesto de un agricultor por su ID de usuario.
 * @param {number|string} userId
 * @returns {Promise<Object>} puesto encontrado o null
 */
export const getPuestoByUserId = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL}/puestosAgricultor?usuarioId=${userId}`)
    const posts = await handleResponse(res)
    return posts.length > 0 ? posts[0] : null
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
  const res = await fetch(`${BASE_URL}/puestosAgricultor/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(puestoData),
  })
  return handleResponse(res)
}
