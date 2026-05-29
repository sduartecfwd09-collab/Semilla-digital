import { PRODUCT_CATEGORIES } from '../constants/productor.constants'
import type { DocumentKey, ProductCategory, ProductorApplicationForm } from '../types/productorApplication.types'

export const requiresSanitaryInfo = (categories: ProductCategory[]) =>
  categories.some((category) => PRODUCT_CATEGORIES.some((item) => item.value === category && item.sanitary))

export const requiresAdminReview = (form: ProductorApplicationForm) =>
  !form.agriculturalInfo.producesOwnProducts

export const getRequiredDocumentKeys = (form: ProductorApplicationForm) => {
  const required = new Set<DocumentKey>(['identificacion', 'foto_puesto'])
  if (form.documentation.hasMagRegistration) required.add('registro_mag')
  if (requiresSanitaryInfo(form.agriculturalInfo.productCategories)) required.add('manipulacion_alimentos')
  return required
}

export const sanitizeText = (value: string) =>
  value.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()

export const safeFileName = (name: string) => {
  const parts = name.split('.')
  const ext = parts.length > 1 ? `.${parts.pop()}` : ''
  const base = parts.join('.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return `${base.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60)}${ext.toLowerCase()}`
}
