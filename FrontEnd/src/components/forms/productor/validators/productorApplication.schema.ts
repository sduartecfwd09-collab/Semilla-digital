import { z } from 'zod'
import { DOCUMENT_KEY_VALUES, PRODUCT_CATEGORY_VALUES } from '../constants/productor.constants'
import { getRequiredDocumentKeys, requiresAdminReview, requiresSanitaryInfo } from '../utils/productorRules'
import type { DocumentKey } from '../types/productorApplication.types'

const digits = (min: number, max = min) =>
  z.string().regex(new RegExp(`^\\d{${min},${max}}$`), `Debe contener entre ${min} y ${max} digitos.`)

const today = new Date()
today.setHours(0, 0, 0, 0)

const pastDate = z.string().min(1, 'Campo requerido.').refine((value) => {
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date <= today
}, 'La fecha no puede ser futura.')

const optionalDate = z.string().optional()

const emailSchema = z.string().trim().email('Correo electronico invalido.').max(200)

const documentSchema = z.object({
  id: z.string(),
  key: z.enum(DOCUMENT_KEY_VALUES),
  name: z.string(),
  safeName: z.string(),
  mimeType: z.string(),
  size: z.number().max(5 * 1024 * 1024),
  secureUrl: z.string().url(),
  publicId: z.string().min(1),
  resourceType: z.enum(['image', 'raw', 'video', 'auto']),
  format: z.string().optional(),
  bytes: z.number().max(5 * 1024 * 1024),
  width: z.number().optional(),
  height: z.number().optional(),
  originalFilename: z.string(),
  uploadedAt: z.string(),
  status: z.literal('success'),
})

export const productorApplicationSchema = z.object({
  status: z.enum(['draft', 'pending', 'under_review', 'approved', 'rejected']),
  personalInfo: z.object({
    fullName: z.string().trim().min(5, 'Ingrese nombre y apellidos.').max(160),
    idType: z.enum(['nacional', 'dimex', 'nite']),
    identification: z.string().trim(),
    birthDate: pastDate,
    phone: digits(8),
    secondaryPhone: z.string().optional(),
    email: emailSchema,
    province: z.string().min(1, 'Seleccione provincia.'),
    canton: z.string().optional(),
    district: z.string().optional(),
    exactAddress: z.string().trim().min(10, 'Ingrese una direccion exacta.').max(300),
  }),
  agriculturalInfo: z.object({
    producerType: z.enum(['directo', 'familiar', 'cooperativa', 'asociacion']),
    producesOwnProducts: z.boolean(),
    farmName: z.string().optional(),
    farmAddress: z.string().optional(),
    farmSize: z.string().optional(),
    productionMethod: z.string().optional(),
    monthlyProduction: z.string().optional(),
    productCategories: z.array(z.enum(PRODUCT_CATEGORY_VALUES)).min(1, 'Seleccione al menos una categoria.'),
    mainProducts: z.string().trim().min(3, 'Describa los productos principales.').max(400),
  }),
  standInfo: z.object({
    standName: z.string().trim().min(3, 'Ingrese nombre del puesto.').max(120),
    description: z.string().trim().min(20, 'Describa el puesto con mas detalle.').max(800),
    fairId: z.string().min(1, 'Seleccione una feria.'),
    requiresElectricity: z.boolean(),
    requiresWater: z.boolean(),
    scheduleNotes: z.string().optional(),
    socialMedia: z.string().optional(),
  }),
  documentation: z.object({
    hasMagRegistration: z.boolean(),
    magRegistrationNumber: z.string().optional(),
    magIssueDate: optionalDate,
    magExpiryDate: optionalDate,
    documents: z.array(documentSchema),
  }),
  sanitaryInfo: z.object({
    hasFoodHandlerCard: z.boolean(),
    foodHandlerCardNumber: z.string().optional(),
    foodHandlerIssueDate: optionalDate,
    foodHandlerExpiryDate: optionalDate,
    healthPermitNumber: z.string().optional(),
    senasaRegistration: z.string().optional(),
    coldChainRequired: z.boolean(),
    coldChainDescription: z.string().optional(),
  }),
  taxInfo: z.object({
    regime: z.enum(['no_inscrito', 'simplificado', 'tradicional']),
    taxNumber: z.string().optional(),
  }),
  confirmation: z.object({
    swornDeclaration: z.boolean(),
    adminReviewRequired: z.boolean(),
    observations: z.string().optional(),
  }),
}).superRefine((data, ctx) => {
  const id = data.personalInfo.identification
  if (data.personalInfo.idType === 'nacional' && !/^\d{9}$/.test(id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personalInfo', 'identification'], message: 'La cedula nacional debe tener 9 digitos.' })
  }
  if (data.personalInfo.idType === 'dimex' && !/^\d{11,12}$/.test(id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personalInfo', 'identification'], message: 'El DIMEX debe tener 11 o 12 digitos.' })
  }
  if (data.personalInfo.idType === 'nite' && !/^\d{10}$/.test(id)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personalInfo', 'identification'], message: 'El NITE debe tener 10 digitos.' })
  }

  const birth = new Date(data.personalInfo.birthDate)
  const age = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
  if (age < 18) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personalInfo', 'birthDate'], message: 'El productor debe ser mayor de edad.' })
  }

  const secondary = data.personalInfo.secondaryPhone?.trim()
  if (secondary && !/^\d{8}$/.test(secondary)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['personalInfo', 'secondaryPhone'], message: 'Debe tener 8 digitos.' })
  }

  data.confirmation.adminReviewRequired = requiresAdminReview(data)

  const requiredDocs = getRequiredDocumentKeys(data)
  const presentDocs = new Set<DocumentKey>(data.documentation.documents.map((doc) => doc.key))
  requiredDocs.forEach((key) => {
    if (!presentDocs.has(key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentation', 'documents'], message: `Documento requerido faltante: ${key}.` })
    }
  })

  if (data.documentation.hasMagRegistration) {
    if (!data.documentation.magRegistrationNumber?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentation', 'magRegistrationNumber'], message: 'Ingrese numero de registro MAG.' })
    }
    const issue = data.documentation.magIssueDate ? new Date(data.documentation.magIssueDate) : null
    const expiry = data.documentation.magExpiryDate ? new Date(data.documentation.magExpiryDate) : null
    if (issue && expiry && expiry <= issue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['documentation', 'magExpiryDate'], message: 'El vencimiento debe ser posterior a la emision.' })
    }
  }

  if (requiresSanitaryInfo(data.agriculturalInfo.productCategories)) {
    if (!data.sanitaryInfo.hasFoodHandlerCard) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sanitaryInfo', 'hasFoodHandlerCard'], message: 'Requerido para productos alimentarios procesados o de riesgo.' })
    }
    const issue = data.sanitaryInfo.foodHandlerIssueDate ? new Date(data.sanitaryInfo.foodHandlerIssueDate) : null
    const expiry = data.sanitaryInfo.foodHandlerExpiryDate ? new Date(data.sanitaryInfo.foodHandlerExpiryDate) : null
    if (issue && expiry && expiry <= issue) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sanitaryInfo', 'foodHandlerExpiryDate'], message: 'El vencimiento debe ser posterior a la emision.' })
    }
  }

  if (data.taxInfo.regime !== 'no_inscrito' && !data.taxInfo.taxNumber?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['taxInfo', 'taxNumber'], message: 'Ingrese numero tributario.' })
  }

  if (!data.confirmation.swornDeclaration) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmation', 'swornDeclaration'], message: 'Debe aceptar la declaracion jurada.' })
  }
})

export type ProductorApplicationSchema = z.infer<typeof productorApplicationSchema>
