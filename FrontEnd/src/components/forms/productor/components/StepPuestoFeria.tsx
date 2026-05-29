import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ProductorApplicationForm } from '../types/productorApplication.types'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
  ferias: Array<any>
}

const StepPuestoFeria = ({ register, errors, ferias }: Props) => (
  <section className="wizard-step-panel" aria-labelledby="puesto-title">
    <h2 id="puesto-title">Puesto y feria</h2>
    <div className="wizard-grid">
      <label>Nombre del puesto *
        <input {...register('standInfo.standName')} />
        <span>{errors.standInfo?.standName?.message}</span>
      </label>
      <label>Feria solicitada *
        <select {...register('standInfo.fairId')}>
          <option value="">Seleccione feria</option>
          {ferias.map((feria) => (
            <option key={feria.id} value={feria.id}>
              {feria.nombre || feria.name} - {feria.provincia || feria.province || 'Provincia no indicada'}
            </option>
          ))}
        </select>
        <span>{errors.standInfo?.fairId?.message}</span>
      </label>
      <label className="span-2">Descripcion del puesto *
        <textarea {...register('standInfo.description')} rows={4} />
        <span>{errors.standInfo?.description?.message}</span>
      </label>
      <label className="toggle-row">
        <input type="checkbox" {...register('standInfo.requiresElectricity')} />
        Requiere electricidad
      </label>
      <label className="toggle-row">
        <input type="checkbox" {...register('standInfo.requiresWater')} />
        Requiere agua
      </label>
      <label className="span-2">Horarios o disponibilidad
        <textarea {...register('standInfo.scheduleNotes')} rows={3} />
      </label>
      <label className="span-2">Redes sociales
        <input {...register('standInfo.socialMedia')} placeholder="@mipuesto" />
      </label>
    </div>
  </section>
)

export default StepPuestoFeria
