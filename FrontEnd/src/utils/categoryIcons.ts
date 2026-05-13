// ─────────────────────────────────────────────────────────────────
// categoryIcons.ts
// Mapeo de iconos SVG por categoría de producto
// Cada categoría tiene un icono SVG específico y un color asociado
// ─────────────────────────────────────────────────────────────────

export interface CategoryIcon {
  svg: string;
  color: string;
  bgColor: string;
  label: string;
}

/**
 * Iconos SVG por categoría de producto.
 * Cada categoría tiene un icono representativo:
 * - Verduras: Zanahoria
 * - Frutas: Manzana
 * - Granos: Espiga de trigo
 * - Tubérculos: Papa/Raíz
 * - Hierbas: Hoja de hierba
 * - Lácteos: Vaso de leche
 * - Proteína: Huevo
 * - Otros: Caja/paquete
 */
export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  'Verduras': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22c1.25-.987 2.27-1.975 3.9-2.2a5.56 5.56 0 0 1 3.8 1.5 4 4 0 0 0 6.187-2.353 3.5 3.5 0 0 0 3.69-5.116A3.5 3.5 0 0 0 20.95 8 3.5 3.5 0 1 0 16 3.05a3.5 3.5 0 0 0-5.831 1.373 3.5 3.5 0 0 0-5.116 3.69 4 4 0 0 0-2.348 6.155C3.499 15.42 4.409 16.712 4.2 18.1 3.975 19.73 2.987 20.75 2 22"/><path d="M2 22 17 7"/></svg>`,
    color: '#16a34a',
    bgColor: '#f0fdf4',
    label: 'Verduras'
  },
  'Frutas': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/></svg>`,
    color: '#dc2626',
    bgColor: '#fef2f2',
    label: 'Frutas'
  },
  'Granos': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M15.47 13.47 17 15l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="M19.47 9.47 21 11l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L13 11l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/></svg>`,
    color: '#ca8a04',
    bgColor: '#fefce8',
    label: 'Granos'
  },
  'Tubérculos': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 11c.3-1 .7-1.6 1.2-2.4C19.4 6.6 21 5.8 21 4c0-1.1-.9-2-2-2-1.8 0-2.6 1.6-4.6 2.8C13.6 5.3 13 5.7 12 6c-1-.3-1.6-.7-2.4-1.2C7.6 3.6 6.8 2 5 2 3.9 2 3 2.9 3 4c0 1.8 1.6 2.6 2.8 4.6.4.8.9 1.4 1.2 2.4"/><path d="M12 6v15"/><path d="M6 12c-1.5 0-3 1-3 3.5S6 20 7.5 20c2 0 3-1 4.5-1s2.5 1 4.5 1c1.5 0 4.5-1 4.5-4.5S18 12 16.5 12c-2 0-3.5 1.5-4.5 1.5S8 12 6 12Z"/></svg>`,
    color: '#a16207',
    bgColor: '#fffbeb',
    label: 'Tubérculos'
  },
  'Hierbas': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-7l-2-2"/><path d="M17 8v.8A6 6 0 0 1 13.8 20v0H10v0A6.5 6.5 0 0 1 7 8h0a5 5 0 0 1 10 0Z"/><path d="m14 14-2 2"/></svg>`,
    color: '#15803d',
    bgColor: '#f0fdf4',
    label: 'Hierbas'
  },
  'Lácteos': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15h10"/></svg>`,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    label: 'Lácteos'
  },
  'Proteína': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="14" rx="8" ry="8"/><path d="M18 9.5V4a2 2 0 0 0-4 0"/><path d="M10 4a2 2 0 0 0-4 0v5.5"/></svg>`,
    color: '#ea580c',
    bgColor: '#fff7ed',
    label: 'Proteína'
  },
  'Otros': {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    color: '#6b7280',
    bgColor: '#f9fafb',
    label: 'Otros'
  }
};

/**
 * Obtiene el icono SVG correspondiente a una categoría.
 * Si la categoría no existe, devuelve el icono de "Otros".
 */
export const getCategoryIcon = (categoria: string): CategoryIcon => {
  return CATEGORY_ICONS[categoria] || CATEGORY_ICONS['Otros'];
};

/**
 * Genera un identificador único para el icono basado en la categoría.
 * Usado internamente para evitar conflictos en el DOM.
 */
export const getCategoryIconId = (categoria: string): string => {
  return `cat-icon-${categoria.toLowerCase().replace(/[^a-z]/g, '')}`;
};
