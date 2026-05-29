import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { PRODUCT_CATEGORIES } from '../constants/productor.constants'
import type { ProductCategory, ProductorApplicationForm } from '../types/productorApplication.types'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  setValue: UseFormSetValue<ProductorApplicationForm>
  watch: UseFormWatch<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
}

const StepProduccion = ({ register, setValue, watch, errors }: Props) => {
  const selected = watch('agriculturalInfo.productCategories')
  const producesOwn = watch('agriculturalInfo.producesOwnProducts')

  const toggleCategory = (category: ProductCategory) => {
    setValue(
      'agriculturalInfo.productCategories',
      selected.includes(category) ? selected.filter((item) => item !== category) : [...selected, category],
      { shouldValidate: true, shouldDirty: true }
    )
  }

  return (
    <section className="wizard-step-panel" aria-labelledby="produccion-title">
      <h2 id="produccion-title">Informacion agricola</h2>
      <div className="wizard-grid">
        <label>Tipo de productor *
          <select {...register('agriculturalInfo.producerType')}>
            <option value="directo">Productor directo</option>
            <option value="familiar">Produccion familiar</option>
            <option value="cooperativa">Cooperativa</option>
            <option value="asociacion">Asociacion</option>
          </select>
        </label>
        <label className="toggle-row">
          <input type="checkbox" {...register('agriculturalInfo.producesOwnProducts')} />
          Produce usted mismo los productos
        </label>
        {!producesOwn && (
          <div className="wizard-warning span-2" role="alert">
            Esta solicitud sera marcada para revision administrativa porque los productos no son producidos directamente por la persona solicitante.
          </div>
        )}
        <label>Nombre de finca o proyecto
          <input {...register('agriculturalInfo.farmName')} />
        </label>
        <label>Tamano de finca
          <input {...register('agriculturalInfo.farmSize')} placeholder="Ej: 2 hectareas" />
        </label>
        <label className="span-2">Direccion de finca
          <input {...register('agriculturalInfo.farmAddress')} />
        </label>
        <label>Produccion mensual estimada
          <input {...register('agriculturalInfo.monthlyProduction')} />
        </label>
        <label>Metodo de produccion
          <input {...register('agriculturalInfo.productionMethod')} />
        </label>
        <div className="span-2">
          <p className="field-label">Categorias de productos *</p>
          <div className="category-grid">
            {PRODUCT_CATEGORIES.map((item) => (
              <button
                type="button"
                key={item.value}
                className={selected.includes(item.value) ? 'category-chip selected' : 'category-chip'}
                onClick={() => toggleCategory(item.value)}
                aria-pressed={selected.includes(item.value)}
              >
                {item.label}
                {item.sanitary && <small>Sanitario</small>}
              </button>
            ))}
          </div>
          <span className="field-error">{errors.agriculturalInfo?.productCategories?.message}</span>
        </div>
        <label className="span-2">Productos principales *
          <textarea {...register('agriculturalInfo.mainProducts')} rows={3} />
          <span>{errors.agriculturalInfo?.mainProducts?.message}</span>
        </label>
      </div>
    </section>
  )
}

export default StepProduccion
