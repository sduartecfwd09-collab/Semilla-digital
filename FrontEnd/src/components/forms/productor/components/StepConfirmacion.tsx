import type { FieldErrors, UseFormRegister, UseFormWatch } from 'react-hook-form'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import { requiresAdminReview, requiresSanitaryInfo } from '../utils/productorRules'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  watch: UseFormWatch<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
  fairName?: string
}

const StepConfirmacion = ({ register, watch, errors, fairName }: Props) => {
  const form = watch()
  const sanitary = requiresSanitaryInfo(form.agriculturalInfo.productCategories)
  const review = requiresAdminReview(form)

  return (
    <section className="wizard-step-panel" aria-labelledby="confirmacion-title">
      <h2 id="confirmacion-title">Confirmacion y declaracion jurada</h2>
      <div className="summary-grid">
        <article><strong>Solicitante</strong><span>{form.personalInfo.fullName}</span></article>
        <article><strong>Identificacion</strong><span>{form.personalInfo.identification}</span></article>
        <article><strong>Puesto</strong><span>{form.standInfo.standName}</span></article>
        <article><strong>Feria</strong><span>{fairName || 'No seleccionada'}</span></article>
        <article><strong>Categorias</strong><span>{form.agriculturalInfo.productCategories.join(', ')}</span></article>
        <article><strong>Sanitario</strong><span>{sanitary ? 'Requiere revision sanitaria' : 'No aplica por categoria'}</span></article>
        <article><strong>Revision</strong><span>{review ? 'Revision administrativa requerida' : 'Revision ordinaria'}</span></article>
        <article><strong>Documentos</strong><span>{form.documentation.documents.length} archivo(s)</span></article>
      </div>
      <label className="span-2">Observaciones
        <textarea {...register('confirmation.observations')} rows={3} />
      </label>
      <label className="sworn-box">
        <input type="checkbox" {...register('confirmation.swornDeclaration')} />
        <span>Declaro que la informacion suministrada es veridica y autorizo su validacion por parte de la administracion de la feria.</span>
      </label>
      <span className="field-error">{errors.confirmation?.swornDeclaration?.message}</span>
    </section>
  )
}

export default StepConfirmacion
