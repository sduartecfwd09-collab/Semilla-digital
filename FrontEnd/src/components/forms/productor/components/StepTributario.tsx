import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { TAX_DOCUMENTS } from '../constants/productor.constants'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import DocumentDropzone from './DocumentDropzone'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  setValue: UseFormSetValue<ProductorApplicationForm>
  watch: UseFormWatch<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
}

const StepTributario = ({ register, setValue, watch, errors }: Props) => {
  const regime = watch('taxInfo.regime')
  const documents = watch('documentation.documents')

  return (
    <section className="wizard-step-panel" aria-labelledby="tributario-title">
      <h2 id="tributario-title">Informacion tributaria</h2>
      <p className="wizard-muted">Esta seccion es opcional para pre-validacion y puede variar por feria o comite.</p>
      <div className="wizard-grid">
        <label>Condicion tributaria
          <select {...register('taxInfo.regime')}>
            <option value="no_inscrito">No inscrito</option>
            <option value="simplificado">Regimen simplificado</option>
            <option value="tradicional">Regimen tradicional</option>
          </select>
        </label>
        {regime !== 'no_inscrito' && (
          <label>Numero tributario
            <input {...register('taxInfo.taxNumber')} />
            <span>{errors.taxInfo?.taxNumber?.message}</span>
          </label>
        )}
      </div>
      {regime !== 'no_inscrito' && (
        <div className="document-grid">
          {TAX_DOCUMENTS.map((item) => (
            <DocumentDropzone
              key={item.key}
              docKey={item.key}
              label={item.label}
              documents={documents}
              onChange={(next) => setValue('documentation.documents', next, { shouldValidate: true, shouldDirty: true })}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default StepTributario
