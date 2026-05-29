import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { SANITARY_DOCUMENTS } from '../constants/productor.constants'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import { requiresSanitaryInfo } from '../utils/productorRules'
import DocumentDropzone from './DocumentDropzone'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  setValue: UseFormSetValue<ProductorApplicationForm>
  watch: UseFormWatch<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
}

const StepSanitario = ({ register, setValue, watch, errors }: Props) => {
  const categories = watch('agriculturalInfo.productCategories')
  const applies = requiresSanitaryInfo(categories)
  const documents = watch('documentation.documents')

  if (!applies) {
    return (
      <section className="wizard-step-panel">
        <h2>Informacion sanitaria</h2>
        <div className="wizard-empty">
          Por las categorias seleccionadas, no se solicitan permisos sanitarios adicionales en esta pre-validacion.
        </div>
      </section>
    )
  }

  return (
    <section className="wizard-step-panel" aria-labelledby="sanitario-title">
      <h2 id="sanitario-title">Informacion sanitaria</h2>
      <div className="wizard-grid">
        <label className="toggle-row span-2">
          <input type="checkbox" {...register('sanitaryInfo.hasFoodHandlerCard')} />
          Cuenta con carne de manipulacion de alimentos
        </label>
        <label>Numero de carne
          <input {...register('sanitaryInfo.foodHandlerCardNumber')} />
        </label>
        <label>Emision
          <input type="date" {...register('sanitaryInfo.foodHandlerIssueDate')} />
        </label>
        <label>Vencimiento
          <input type="date" {...register('sanitaryInfo.foodHandlerExpiryDate')} />
          <span>{errors.sanitaryInfo?.foodHandlerExpiryDate?.message}</span>
        </label>
        <label>Permiso Ministerio de Salud
          <input {...register('sanitaryInfo.healthPermitNumber')} />
        </label>
        <label>Registro SENASA
          <input {...register('sanitaryInfo.senasaRegistration')} />
        </label>
        <label className="toggle-row">
          <input type="checkbox" {...register('sanitaryInfo.coldChainRequired')} />
          Requiere cadena de frio
        </label>
        <label className="span-2">Descripcion de cadena de frio
          <textarea {...register('sanitaryInfo.coldChainDescription')} rows={3} />
        </label>
      </div>
      <div className="document-grid">
        {SANITARY_DOCUMENTS.map((item) => (
          <DocumentDropzone
            key={item.key}
            docKey={item.key}
            label={`${item.label}${item.required ? ' *' : ''}`}
            documents={documents}
            onChange={(next) => setValue('documentation.documents', next, { shouldValidate: true, shouldDirty: true })}
          />
        ))}
      </div>
    </section>
  )
}

export default StepSanitario
