// ─────────────────────────────────────────────────────────────────
// ProductService.ts
// Servicio para gestión de productos por usuario administrador
// ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001'

export interface Producto {
  id?: number
  userId: number
  nombre: string
  emoji: string
  descripcion: string
  categoria: string
  imagen: string
  disponible: boolean
  precios: {
    feriaId: number
    feriaNombre: string
    provincia: string
    precio: number
  }[]
}

/**
 * Obtiene todos los productos de un usuario específico
 */
export const getProductosByUser = async (userId: number): Promise<Producto[]> => {
  const response = await fetch(`${BASE_URL}/productos?userId=${userId}`)
  if (!response.ok) {
    throw new Error('Error al obtener productos')
  }
  return response.json()
}

/**
 * Crea un nuevo producto para un usuario
 */
export const createProducto = async (producto: Producto): Promise<Producto> => {
  const response = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })

  if (!response.ok) {
    throw new Error('Error al crear producto')
  }

  return response.json()
}

/**
 * Actualiza un producto existente
 */
export const updateProducto = async (id: number, producto: Producto): Promise<Producto> => {
  const response = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(producto),
  })

  if (!response.ok) {
    throw new Error('Error al actualizar producto')
  }

  return response.json()
}

/**
 * Actualiza parcialmente un producto
 */
export const patchProducto = async (id: number, updates: Partial<Producto>): Promise<Producto> => {
  const response = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Error al actualizar producto')
  }

  return response.json()
}

/**
 * Elimina un producto
 */
export const deleteProducto = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Error al eliminar producto')
  }
}

/**
 * Obtiene un producto por ID
 */
export const getProductoById = async (id: number): Promise<Producto> => {
  const response = await fetch(`${BASE_URL}/productos/${id}`)
  
  if (!response.ok) {
    throw new Error('Producto no encontrado')
  }

  return response.json()
}

/**
 * Categorías disponibles
 */
export const CATEGORIAS = [
  'Verduras',
  'Frutas',
  'Granos',
  'Tubérculos',
  'Hierbas',
  'Lácteos',
  'Otros',
]

/**
 * Emojis sugeridos por categoría
 */
export const EMOJIS_POR_CATEGORIA: Record<string, string[]> = {
  'Verduras': ['🥬', '🥦', '🥕', '🍅', '🌽', '🫑', '🥒'],
  'Frutas': ['🍎', '🍊', '🍌', '🍍', '🥑', '🍈', '🍇', '🍓', '🥝'],
  'Granos': ['🌾', '🌽', '🫘'],
  'Tubérculos': ['🥔', '🍠'],
  'Hierbas': ['🌿', '🌱'],
  'Lácteos': ['🥛', '🧀'],
  'Otros': ['🥚', '🍯', '🫙'],
}
