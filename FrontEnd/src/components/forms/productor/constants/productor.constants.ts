import type { DocumentKey, ProductCategory, StepDefinition } from '../types/productorApplication.types'

export const PRODUCTOR_DRAFT_KEY = 'agromap_productor_application_draft'

export const PRODUCTOR_STEPS: StepDefinition[] = [
  { id: 'personal', title: 'Informacion personal', description: 'Identidad y contacto' },
  { id: 'produccion', title: 'Produccion agricola', description: 'Origen y categorias' },
  { id: 'puesto', title: 'Puesto y feria', description: 'Ubicacion comercial' },
  { id: 'documentos', title: 'Documentacion', description: 'Permisos configurables' },
  { id: 'sanitario', title: 'Sanitario', description: 'Solo si aplica' },
  { id: 'tributario', title: 'Tributario', description: 'Opcional' },
  { id: 'confirmacion', title: 'Confirmacion', description: 'Declaracion jurada' },
]

export const PRODUCT_CATEGORIES: Array<{ value: ProductCategory; label: string; sanitary: boolean }> = [
  { value: 'frutas', label: 'Frutas frescas', sanitary: false },
  { value: 'verduras', label: 'Verduras y hortalizas', sanitary: false },
  { value: 'granos', label: 'Granos y semillas', sanitary: false },
  { value: 'plantas', label: 'Plantas y ornamentales', sanitary: false },
  { value: 'lacteos', label: 'Lacteos', sanitary: true },
  { value: 'carnes', label: 'Carnes', sanitary: true },
  { value: 'embutidos', label: 'Embutidos', sanitary: true },
  { value: 'preparados', label: 'Comidas preparadas', sanitary: true },
  { value: 'conservas', label: 'Conservas', sanitary: true },
  { value: 'procesados', label: 'Productos procesados', sanitary: true },
  { value: 'otros', label: 'Otros', sanitary: false },
]

export const PRODUCT_CATEGORY_VALUES = [
  'frutas',
  'verduras',
  'granos',
  'plantas',
  'lacteos',
  'carnes',
  'embutidos',
  'preparados',
  'conservas',
  'procesados',
  'otros',
] as const

export const DOCUMENT_KEY_VALUES = [
  'identificacion',
  'registro_mag',
  'certificacion_productor',
  'permiso_salud',
  'senasa',
  'manipulacion_alimentos',
  'constancia_tributaria',
  'foto_puesto',
] as const

export const CR_PROVINCES = [
  'San Jose',
  'Alajuela',
  'Cartago',
  'Heredia',
  'Guanacaste',
  'Puntarenas',
  'Limon',
]

export const BASE_DOCUMENTS: Array<{ key: DocumentKey; label: string; required: boolean }> = [
  { key: 'identificacion', label: 'Documento de identificacion', required: true },
  { key: 'certificacion_productor', label: 'Certificacion o evidencia de productor', required: false },
  { key: 'foto_puesto', label: 'Fotografia del puesto o productos', required: true },
]

export const MAG_DOCUMENTS: Array<{ key: DocumentKey; label: string; required: boolean }> = [
  { key: 'registro_mag', label: 'Registro MAG o carnet feriante', required: true },
]

export const SANITARY_DOCUMENTS: Array<{ key: DocumentKey; label: string; required: boolean }> = [
  { key: 'manipulacion_alimentos', label: 'Carne de manipulacion de alimentos', required: true },
  { key: 'permiso_salud', label: 'Permiso del Ministerio de Salud', required: false },
  { key: 'senasa', label: 'Registro SENASA', required: false },
]

export const TAX_DOCUMENTS: Array<{ key: DocumentKey; label: string; required: boolean }> = [
  { key: 'constancia_tributaria', label: 'Constancia tributaria', required: false },
]
