export type IdType = 'nacional' | 'dimex' | 'nite'
export type ProducerType = 'directo' | 'familiar' | 'cooperativa' | 'asociacion'
export type TaxRegime = 'no_inscrito' | 'simplificado' | 'tradicional'
export type ReviewStatus = 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected'

export type ProductCategory =
  | 'frutas'
  | 'verduras'
  | 'granos'
  | 'plantas'
  | 'lacteos'
  | 'carnes'
  | 'embutidos'
  | 'preparados'
  | 'conservas'
  | 'procesados'
  | 'otros'

export type DocumentKey =
  | 'identificacion'
  | 'registro_mag'
  | 'certificacion_productor'
  | 'permiso_salud'
  | 'senasa'
  | 'manipulacion_alimentos'
  | 'constancia_tributaria'
  | 'foto_puesto'

export interface UploadedDocument {
  id: string
  key: DocumentKey
  name: string
  safeName: string
  mimeType: string
  size: number
  secureUrl: string
  publicId: string
  resourceType: 'image' | 'raw' | 'video' | 'auto'
  format?: string
  bytes: number
  width?: number
  height?: number
  originalFilename: string
  uploadedAt: string
  status: 'success'
}

export interface ProductorApplicationForm {
  status: ReviewStatus
  personalInfo: {
    fullName: string
    idType: IdType
    identification: string
    birthDate: string
    phone: string
    secondaryPhone?: string
    email: string
    province: string
    canton?: string
    district?: string
    exactAddress: string
  }
  agriculturalInfo: {
    producerType: ProducerType
    producesOwnProducts: boolean
    farmName?: string
    farmAddress?: string
    farmSize?: string
    productionMethod?: string
    monthlyProduction?: string
    productCategories: ProductCategory[]
    mainProducts: string
  }
  standInfo: {
    standName: string
    description: string
    fairId: string
    requiresElectricity: boolean
    requiresWater: boolean
    scheduleNotes?: string
    socialMedia?: string
  }
  documentation: {
    hasMagRegistration: boolean
    magRegistrationNumber?: string
    magIssueDate?: string
    magExpiryDate?: string
    documents: UploadedDocument[]
  }
  sanitaryInfo: {
    hasFoodHandlerCard: boolean
    foodHandlerCardNumber?: string
    foodHandlerIssueDate?: string
    foodHandlerExpiryDate?: string
    healthPermitNumber?: string
    senasaRegistration?: string
    coldChainRequired: boolean
    coldChainDescription?: string
  }
  taxInfo: {
    regime: TaxRegime
    taxNumber?: string
  }
  confirmation: {
    swornDeclaration: boolean
    adminReviewRequired: boolean
    observations?: string
  }
}

export interface StepDefinition {
  id: string
  title: string
  description: string
}
