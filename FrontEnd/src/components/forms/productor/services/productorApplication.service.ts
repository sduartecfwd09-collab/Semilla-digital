import { ENDPOINTS, authFetch } from '../../../../services/api.config'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import { requiresAdminReview, sanitizeText } from '../utils/productorRules'

interface SubmitContext {
  userId: string
  userName: string
  existingPuestoId?: string
  existingSolicitudId?: string
  role?: string
  fairName?: string
}

export const mapApplicationToLegacyPayload = (
  form: ProductorApplicationForm,
  context: SubmitContext
) => ({
  usuario_id: context.userId,
  nombre_puesto: sanitizeText(form.standInfo.standName),
  descripcion: sanitizeText(form.standInfo.description),
  ubicacion: context.fairName ? [context.fairName] : [],
  feria_id: form.standInfo.fairId,
  tipos_producto: form.agriculturalInfo.productCategories,
  fotos_nombres: form.documentation.documents.filter((doc) => doc.key === 'foto_puesto').map((doc) => doc.safeName),
  telefono: form.personalInfo.phone,
  email: form.personalInfo.email,
  horarios: form.standInfo.scheduleNotes || '',
  horarios_list: [],
  metodos_cultivo: form.agriculturalInfo.productionMethod || '',
  redes_sociales: form.standInfo.socialMedia || '',
  fecha_registro: new Date().toISOString(),
  datos_extendidos: {
    schemaVersion: 2,
    reviewStatus: form.status,
    adminReviewRequired: requiresAdminReview(form),
    personalInfo: form.personalInfo,
    agriculturalInfo: form.agriculturalInfo,
    standInfo: form.standInfo,
    documentation: form.documentation,
    sanitaryInfo: form.sanitaryInfo,
    taxInfo: form.taxInfo,
    confirmation: form.confirmation,
  },
})

export const submitProductorApplication = async (
  form: ProductorApplicationForm,
  context: SubmitContext
) => {
  const puestoPayload = mapApplicationToLegacyPayload(form, context)
  const puestoRes = context.existingPuestoId
    ? await authFetch(`${ENDPOINTS.puestosProductor}/${context.existingPuestoId}`, {
        method: 'PUT',
        body: JSON.stringify(puestoPayload),
      })
    : await authFetch(ENDPOINTS.puestosProductor, {
        method: 'POST',
        body: JSON.stringify(puestoPayload),
      })

  const puestoJson = await puestoRes.json().catch(() => ({}))
  if (!puestoRes.ok) throw new Error(puestoJson.message || 'No se pudo guardar el puesto.')
  const puesto = puestoJson.success ? puestoJson.data : puestoJson

  if (context.role === 'Productor') {
    return { puesto, solicitud: null }
  }

  const solicitudPayload = {
    usuarioId: context.userId,
    nombreUsuario: context.userName,
    nombreDelPuesto: form.standInfo.standName,
    correoUsuario: form.personalInfo.email,
    rolSolicitado: 'Productor',
    estado: 'Pendiente',
    revision_estado: requiresAdminReview(form) ? 'under_review' : 'pending',
    motivo_respuesta: '',
    fecha_solicitud: new Date().toISOString(),
  }

  const solicitudRes = context.existingSolicitudId
    ? await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${context.existingSolicitudId}`, {
        method: 'PATCH',
        body: JSON.stringify(solicitudPayload),
      })
    : await authFetch(ENDPOINTS.solicitudesCambioRol, {
        method: 'POST',
        body: JSON.stringify(solicitudPayload),
      })

  const solicitudJson = await solicitudRes.json().catch(() => ({}))
  if (!solicitudRes.ok) throw new Error(solicitudJson.message || 'No se pudo crear la solicitud.')
  return { puesto, solicitud: solicitudJson.success ? solicitudJson.data : solicitudJson }
}
