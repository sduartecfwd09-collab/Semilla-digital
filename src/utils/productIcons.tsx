/**
 * productIcons.tsx
 * Mapea los emojis del DB a íconos vectoriales de lucide-react.
 * Compatible con los valores existentes en db.json — sin migración necesaria.
 */

import React from 'react'
import {
  Leaf,
  Apple,
  Wheat,
  Package,
  Sprout,
  Egg,
  Grape,
  Cherry,
  Banana,
  Droplets,
  ShoppingBasket,
  GlassWater,
  Carrot,
  type LucideIcon,
} from 'lucide-react'

export interface IconDef {
  Icon: LucideIcon
  label: string
  color: string
  bg: string
}

/**
 * Mapeo emoji → ícono + colores temáticos.
 * Clave: el emoji tal como se almacena en db.json.
 */
export const EMOJI_ICON_MAP: Record<string, IconDef> = {
  // ── Verduras ──────────────────────────────────────────────
  '🥬': { Icon: Leaf,    label: 'Lechuga',    color: '#2e7d32', bg: '#e8f5e9' },
  '🥦': { Icon: Sprout,  label: 'Brócoli',    color: '#388e3c', bg: '#e8f5e9' },
  '🥕': { Icon: Carrot,  label: 'Zanahoria',  color: '#e65100', bg: '#fff3e0' },
  '🍅': { Icon: Apple,   label: 'Tomate',     color: '#c62828', bg: '#ffebee' },
  '🌽': { Icon: Wheat,   label: 'Maíz',       color: '#f9a825', bg: '#fffde7' },
  '🫑': { Icon: Leaf,    label: 'Chile',      color: '#43a047', bg: '#f1f8e9' },
  '🥒': { Icon: Sprout,  label: 'Pepino',     color: '#2e7d32', bg: '#e8f5e9' },

  // ── Frutas ───────────────────────────────────────────────
  '🍎': { Icon: Apple,   label: 'Manzana',    color: '#c62828', bg: '#ffebee' },
  '🍊': { Icon: Apple,   label: 'Naranja',    color: '#e65100', bg: '#fff3e0' },
  '🍌': { Icon: Banana,  label: 'Banano',     color: '#f9a825', bg: '#fffde7' },
  '🍍': { Icon: Package, label: 'Piña',       color: '#f57f17', bg: '#fffde7' },
  '🥑': { Icon: Leaf,    label: 'Aguacate',   color: '#33691e', bg: '#f1f8e9' },
  '🍈': { Icon: Apple,   label: 'Melón',      color: '#7cb342', bg: '#f1f8e9' },
  '🍇': { Icon: Grape,   label: 'Uvas',       color: '#6a1b9a', bg: '#f3e5f5' },
  '🍓': { Icon: Cherry,  label: 'Fresa',      color: '#c62828', bg: '#ffebee' },
  '🥝': { Icon: Sprout,  label: 'Kiwi',       color: '#558b2f', bg: '#f1f8e9' },

  // ── Granos ───────────────────────────────────────────────
  '🌾': { Icon: Wheat,   label: 'Trigo',      color: '#e65100', bg: '#fff3e0' },
  '🫘': { Icon: Package, label: 'Frijoles',   color: '#6d4c41', bg: '#efebe9' },

  // ── Tubérculos ───────────────────────────────────────────
  '🥔': { Icon: Package, label: 'Papa',       color: '#795548', bg: '#efebe9' },
  '🍠': { Icon: Package, label: 'Camote',     color: '#bf360c', bg: '#fbe9e7' },

  // ── Hierbas ──────────────────────────────────────────────
  '🌿': { Icon: Leaf,    label: 'Hierba',     color: '#2e7d32', bg: '#e8f5e9' },
  '🌱': { Icon: Sprout,  label: 'Planta',     color: '#43a047', bg: '#e8f5e9' },

  // ── Lácteos ──────────────────────────────────────────────
  '🥛': { Icon: GlassWater, label: 'Leche',   color: '#1565c0', bg: '#e3f2fd' },
  '🧀': { Icon: Package, label: 'Queso',      color: '#f9a825', bg: '#fffde7' },

  // ── Otros ────────────────────────────────────────────────
  '🥚': { Icon: Egg,      label: 'Huevo',     color: '#ef6c00', bg: '#fff3e0' },
  '🍯': { Icon: Droplets, label: 'Miel',      color: '#ff8f00', bg: '#fff8e1' },
  '🫙': { Icon: ShoppingBasket, label: 'Frasco', color: '#546e7a', bg: '#eceff1' },
  '🥩': { Icon: Package, label: 'Proteína',   color: '#b71c1c', bg: '#ffebee' },
}

/**
 * Fallback por categoría cuando el emoji no está en el mapa.
 */
export const CATEGORY_ICON_MAP: Record<string, IconDef> = {
  'Verduras':   { Icon: Leaf,          label: 'Verduras',   color: '#2e7d32', bg: '#e8f5e9' },
  'Frutas':     { Icon: Apple,         label: 'Frutas',     color: '#c62828', bg: '#ffebee' },
  'Granos':     { Icon: Wheat,         label: 'Granos',     color: '#e65100', bg: '#fff3e0' },
  'Tubérculos': { Icon: Package,       label: 'Tubérculos', color: '#6d4c41', bg: '#efebe9' },
  'Hierbas':    { Icon: Sprout,        label: 'Hierbas',    color: '#2e7d32', bg: '#e0f2f1' },
  'Lácteos':    { Icon: GlassWater,    label: 'Lácteos',    color: '#1565c0', bg: '#e3f2fd' },
  'Proteínas':  { Icon: Package,       label: 'Proteínas',  color: '#b71c1c', bg: '#ffebee' },
  'Otros':      { Icon: ShoppingBasket, label: 'Otros',     color: '#546e7a', bg: '#eceff1' },
}

/** Resuelve la definición de ícono dado un emoji y/o categoría. */
export function resolveIcon(emoji?: string, categoria?: string): IconDef {
  if (emoji && EMOJI_ICON_MAP[emoji]) return EMOJI_ICON_MAP[emoji]
  if (categoria && CATEGORY_ICON_MAP[categoria]) return CATEGORY_ICON_MAP[categoria]
  return { Icon: ShoppingBasket, label: 'Producto', color: '#546e7a', bg: '#eceff1' }
}

// ─────────────────────────────────────────────────────────────
// Componente reutilizable
// ─────────────────────────────────────────────────────────────

interface ProductIconProps {
  emoji?: string
  categoria?: string
  /** Tamaño del ícono en px (default 22) */
  size?: number
  className?: string
  /** Muestra el ícono dentro de un círculo con fondo coloreado */
  showBg?: boolean
  /** Tamaño del contenedor cuando showBg=true (default size * 1.9) */
  containerSize?: number
}

const ProductIcon: React.FC<ProductIconProps> = ({
  emoji,
  categoria,
  size = 22,
  className = '',
  showBg = false,
  containerSize,
}) => {
  const { Icon, color, bg } = resolveIcon(emoji, categoria)

  if (showBg) {
    const box = containerSize ?? Math.round(size * 1.85)
    return (
      <span
        className={`product-icon-bg ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: box,
          height: box,
          borderRadius: '50%',
          background: bg,
          flexShrink: 0,
        }}
      >
        <Icon size={size} color={color} strokeWidth={1.8} />
      </span>
    )
  }

  return <Icon size={size} color={color} strokeWidth={1.8} className={className} />
}

export default ProductIcon
