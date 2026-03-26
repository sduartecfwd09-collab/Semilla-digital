// ─────────────────────────────────────────────────────────────────
// productCatalog.ts
// Catálogo centralizado de productos válidos para la plataforma.
// Se utiliza en el formulario de productos para que el agricultor
// seleccione de una lista predefinida y evitar duplicados por
// errores ortográficos.
// ─────────────────────────────────────────────────────────────────

export interface ProductoCatalogo {
  nombre: string
  emoji: string
  categoria: string
}

/**
 * Lista completa de productos disponibles en la plataforma,
 * organizados por categoría. Este es el catálogo «fuente de verdad».
 *
 * Para agregar un producto nuevo basta con añadir una entrada aquí
 * y automáticamente aparecerá en todos los formularios de creación.
 */
export const PRODUCTOS_CATALOGO: ProductoCatalogo[] = [
  // ── Verduras ──────────────────────────────────────────────────
  { nombre: 'Aguacate Hass', emoji: '🥑', categoria: 'Verduras' },
  { nombre: 'Aguacate Criollo', emoji: '🥑', categoria: 'Verduras' },
  { nombre: 'Brócoli', emoji: '🥦', categoria: 'Verduras' },
  { nombre: 'Cebolla Seca', emoji: '🧅', categoria: 'Verduras' },
  { nombre: 'Chile Dulce', emoji: '🫑', categoria: 'Verduras' },
  { nombre: 'Elote', emoji: '🌽', categoria: 'Verduras' },
  { nombre: 'Lechuga Americana', emoji: '🥬', categoria: 'Verduras' },
  { nombre: 'Papa Blanca', emoji: '🥔', categoria: 'Verduras' },
  { nombre: 'Pepino', emoji: '🥒', categoria: 'Verduras' },
  { nombre: 'Repollo Verde', emoji: '🥬', categoria: 'Verduras' },
  { nombre: 'Tomate', emoji: '🍅', categoria: 'Verduras' },
  { nombre: 'Zanahoria', emoji: '🥕', categoria: 'Verduras' },
  { nombre: 'Ayote', emoji: '🎃', categoria: 'Verduras' },
  { nombre: 'Chayote', emoji: '🥒', categoria: 'Verduras' },
  { nombre: 'Coliflor', emoji: '🥦', categoria: 'Verduras' },
  { nombre: 'Espinaca', emoji: '🥬', categoria: 'Verduras' },
  { nombre: 'Remolacha', emoji: '🟣', categoria: 'Verduras' },
  { nombre: 'Vainica', emoji: '🫛', categoria: 'Verduras' },
  { nombre: 'Apio', emoji: '🥬', categoria: 'Verduras' },

  // ── Frutas ────────────────────────────────────────────────────
  { nombre: 'Banano', emoji: '🍌', categoria: 'Frutas' },
  { nombre: 'Fresa', emoji: '🍓', categoria: 'Frutas' },
  { nombre: 'Limón', emoji: '🍋', categoria: 'Frutas' },
  { nombre: 'Manzana', emoji: '🍎', categoria: 'Frutas' },
  { nombre: 'Naranja', emoji: '🍊', categoria: 'Frutas' },
  { nombre: 'Papaya', emoji: '🥭', categoria: 'Frutas' },
  { nombre: 'Piña', emoji: '🍍', categoria: 'Frutas' },
  { nombre: 'Plátano', emoji: '🍌', categoria: 'Frutas' },
  { nombre: 'Sandía', emoji: '🍉', categoria: 'Frutas' },
  { nombre: 'Mango', emoji: '🥭', categoria: 'Frutas' },
  { nombre: 'Melón', emoji: '🍈', categoria: 'Frutas' },
  { nombre: 'Mora', emoji: '🫐', categoria: 'Frutas' },
  { nombre: 'Guanábana', emoji: '🍈', categoria: 'Frutas' },
  { nombre: 'Cas', emoji: '🍈', categoria: 'Frutas' },
  { nombre: 'Mandarina', emoji: '🍊', categoria: 'Frutas' },
  { nombre: 'Uva', emoji: '🍇', categoria: 'Frutas' },
  { nombre: 'Maracuyá', emoji: '🍈', categoria: 'Frutas' },

  // ── Granos ────────────────────────────────────────────────────
  { nombre: 'Frijoles', emoji: '🫘', categoria: 'Granos' },
  { nombre: 'Arroz', emoji: '🌾', categoria: 'Granos' },
  { nombre: 'Maíz', emoji: '🌽', categoria: 'Granos' },
  { nombre: 'Lentejas', emoji: '🫘', categoria: 'Granos' },
  { nombre: 'Garbanzos', emoji: '🫘', categoria: 'Granos' },

  // ── Tubérculos ────────────────────────────────────────────────
  { nombre: 'Yuca', emoji: '🥔', categoria: 'Tubérculos' },
  { nombre: 'Camote', emoji: '🍠', categoria: 'Tubérculos' },
  { nombre: 'Ñampí', emoji: '🥔', categoria: 'Tubérculos' },
  { nombre: 'Tiquisque', emoji: '🥔', categoria: 'Tubérculos' },

  // ── Hierbas ───────────────────────────────────────────────────
  { nombre: 'Culantro Castilla', emoji: '🌿', categoria: 'Hierbas' },
  { nombre: 'Culantro Coyote', emoji: '🌿', categoria: 'Hierbas' },
  { nombre: 'Albahaca', emoji: '🌿', categoria: 'Hierbas' },
  { nombre: 'Romero', emoji: '🌱', categoria: 'Hierbas' },
  { nombre: 'Orégano', emoji: '🌿', categoria: 'Hierbas' },
  { nombre: 'Tomillo', emoji: '🌱', categoria: 'Hierbas' },
  { nombre: 'Hierba Buena', emoji: '🌿', categoria: 'Hierbas' },

  // ── Lácteos ───────────────────────────────────────────────────
  { nombre: 'Queso Fresco', emoji: '🧀', categoria: 'Lácteos' },
  { nombre: 'Queso Palmito', emoji: '🧀', categoria: 'Lácteos' },
  { nombre: 'Natilla', emoji: '🥛', categoria: 'Lácteos' },
  { nombre: 'Leche', emoji: '🥛', categoria: 'Lácteos' },

  // ── Proteína ──────────────────────────────────────────────────
  { nombre: 'Huevos', emoji: '🥚', categoria: 'Proteína' },
  { nombre: 'Pollo', emoji: '🍗', categoria: 'Proteína' },
  { nombre: 'Pescado', emoji: '🐟', categoria: 'Proteína' },

  // ── Otros ─────────────────────────────────────────────────────
  { nombre: 'Miel de Abeja', emoji: '🍯', categoria: 'Otros' },
  { nombre: 'Tortillas', emoji: '🫓', categoria: 'Otros' },
  { nombre: 'Pan Casero', emoji: '🍞', categoria: 'Otros' },
  { nombre: 'Café', emoji: '☕', categoria: 'Otros' },
]

/**
 * Obtener productos del catálogo filtrados por categoría.
 */
export const getProductosPorCategoria = (categoria: string): ProductoCatalogo[] =>
  PRODUCTOS_CATALOGO.filter(p => p.categoria === categoria)

/**
 * Obtener un array con las categorías únicas del catálogo.
 */
export const getCategoriasDelCatalogo = (): string[] =>
  [...new Set(PRODUCTOS_CATALOGO.map(p => p.categoria))]

/**
 * Normaliza un nombre de producto para comparación:
 * minúsculas, sin acentos, sin espacios extras, sin "s"/"es" finales.
 */
export const normalizeProductName = (name: string): string => {
  let normalized = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos

  // Remover plural simple: trailing "es" o "s"
  if (normalized.endsWith('es') && normalized.length > 3) {
    normalized = normalized.slice(0, -2)
  } else if (normalized.endsWith('s') && normalized.length > 2) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

/**
 * Busca el nombre canónico (del catálogo) para un nombre dado.
 * Retorna el nombre del catálogo si hay match, o el nombre original
 * con la primera letra en mayúscula si no lo encuentra.
 */
export const getCanonicalName = (name: string): string => {
  const normalized = normalizeProductName(name)

  for (const product of PRODUCTOS_CATALOGO) {
    if (normalizeProductName(product.nombre) === normalized) {
      return product.nombre
    }
  }

  // Si no está en catálogo, capitalizar primera letra de cada palabra
  return name
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Busca la info del catálogo para un nombre dado.
 */
export const findInCatalog = (name: string): ProductoCatalogo | undefined => {
  const normalized = normalizeProductName(name)
  return PRODUCTOS_CATALOGO.find(
    p => normalizeProductName(p.nombre) === normalized
  )
}
