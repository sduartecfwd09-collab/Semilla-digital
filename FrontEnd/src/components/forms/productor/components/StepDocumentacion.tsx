import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { BASE_DOCUMENTS, MAG_DOCUMENTS } from '../constants/productor.constants'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import DocumentDropzone from './DocumentDropzone'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  setValue: UseFormSetValue<ProductorApplicationForm>
  watch: UseFormWatch<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
}

const StepDocumentacion = ({ register, setValue, watch, errors }: Props) => {
  const documents = watch('documentation.documents')
  const hasMag = watch('documentation.hasMagRegistration')

  return (
    <section className="wizard-step-panel" aria-labelledby="documentos-title">
      <h2 id="documentos-title">Documentacion y permisos</h2>
      <label className="toggle-row prominent">
        <input type="checkbox" {...register('documentation.hasMagRegistration')} />
        Cuenta con registro MAG o carnet feriante
      </label>
      {hasMag && (
        <div className="wizard-grid">
          <label>Numero de registro MAG
            <input {...register('documentation.magRegistrationNumber')} />
            <span>{errors.documentation?.magRegistrationNumber?.message}</span>
          </label>
          <label>Fecha de emision
            <input type="date" {...register('documentation.magIssueDate')} />
          </label>
          <label>Fecha de vencimiento
            <input type="date" {...register('documentation.magExpiryDate')} />
            <span>{errors.documentation?.magExpiryDate?.message}</span>
          </label>
        </div>
      )}
      <div className="document-grid">
        {[...BASE_DOCUMENTS, ...(hasMag ? MAG_DOCUMENTS : [])].map((item) => (
          <DocumentDropzone
            key={item.key}
            docKey={item.key}
            label={`${item.label}${item.required ? ' *' : ''}`}
            documents={documents}
            onChange={(next) => setValue('documentation.documents', next, { shouldValidate: true, shouldDirty: true })}
          />
        ))}
      </div>
      <span className="field-error">{errors.documentation?.documents?.message}</span>
    </section>
  )
}

export default StepDocumentacion
