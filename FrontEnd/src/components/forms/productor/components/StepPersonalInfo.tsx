import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { CR_PROVINCES } from '../constants/productor.constants'
import type { ProductorApplicationForm } from '../types/productorApplication.types'

interface Props {
  register: UseFormRegister<ProductorApplicationForm>
  errors: FieldErrors<ProductorApplicationForm>
}

const StepPersonalInfo = ({ register, errors }: Props) => (
  <section className="wizard-step-panel" aria-labelledby="personal-title">
    <h2 id="personal-title">Informacion personal</h2>
    <div className="wizard-grid">
      <label>Nombre completo *
        <input {...register('personalInfo.fullName')} autoComplete="name" />
        <span>{errors.personalInfo?.fullName?.message}</span>
      </label>
      <label>Tipo de identificacion *
        <select {...register('personalInfo.idType')}>
          <option value="nacional">Cedula nacional</option>
          <option value="dimex">DIMEX</option>
          <option value="nite">NITE</option>
        </select>
      </label>
      <label>Numero de identificacion *
        <input {...register('personalInfo.identification')} inputMode="numeric" />
        <span>{errors.personalInfo?.identification?.message}</span>
      </label>
      <label>Fecha de nacimiento *
        <input type="date" {...register('personalInfo.birthDate')} />
        <span>{errors.personalInfo?.birthDate?.message}</span>
      </label>
      <label>Telefono *
        <input {...register('personalInfo.phone')} inputMode="numeric" maxLength={8} />
        <span>{errors.personalInfo?.phone?.message}</span>
      </label>
      <label>Telefono secundario
        <input {...register('personalInfo.secondaryPhone')} inputMode="numeric" maxLength={8} />
        <span>{errors.personalInfo?.secondaryPhone?.message}</span>
      </label>
      <label>Correo electronico *
        <input type="email" {...register('personalInfo.email')} autoComplete="email" />
        <span>{errors.personalInfo?.email?.message}</span>
      </label>
      <label>Provincia *
        <select {...register('personalInfo.province')}>
          <option value="">Seleccionar</option>
          {CR_PROVINCES.map((province) => <option key={province} value={province}>{province}</option>)}
        </select>
        <span>{errors.personalInfo?.province?.message}</span>
      </label>
      <label>Canton
        <input {...register('personalInfo.canton')} />
      </label>
      <label>Distrito
        <input {...register('personalInfo.district')} />
      </label>
      <label className="span-2">Direccion exacta *
        <textarea {...register('personalInfo.exactAddress')} rows={3} />
        <span>{errors.personalInfo?.exactAddress?.message}</span>
      </label>
    </div>
  </section>
)

export default StepPersonalInfo
