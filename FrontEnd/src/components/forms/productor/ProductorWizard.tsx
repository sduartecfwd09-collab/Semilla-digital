import React, { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Navbar/Navbar'
import Footer from '../../Footer/Footer'
import { useFerias } from '../../../hooks/useFerias'
import { useDraftAutosave } from './hooks/useDraftAutosave'
import { useFormProgress } from './hooks/useFormProgress'
import { useRegistroProductor } from './hooks/useRegistroProductor'
import { PRODUCTOR_STEPS } from './constants/productor.constants'
import { submitProductorApplication } from './services/productorApplication.service'
import type { ProductorApplicationForm } from './types/productorApplication.types'
import StepPersonalInfo from './sections/PersonalSection'
import StepProduccion from './sections/ProduccionSection'
import StepPuestoFeria from './sections/FeriaSection'
import StepDocumentacion from './sections/FotosSection'
import StepSanitario from './sections/SanitarioSection'
import StepTributario from './sections/TributarioSection'
import StepConfirmacion from './sections/RevisionSection'
import './ProductorWizard.css'

const STEP_FIELDS: Array<Array<keyof ProductorApplicationForm>> = [
  ['personalInfo'],
  ['agriculturalInfo'],
  ['standInfo'],
  ['documentation'],
  ['sanitaryInfo'],
  ['taxInfo'],
  ['confirmation'],
]

const ProductorWizard: React.FC = () => {
  const navigate = useNavigate()
  const { allFerias, loading } = useFerias()
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])
  const [currentStep, setCurrentStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const form = useRegistroProductor(user)
  const { clearDraft } = useDraftAutosave(form, Boolean(user?.id))

  const { percent: progress } = useFormProgress(currentStep, PRODUCTOR_STEPS.length, form.formState.errors)
  const fairId = form.watch('standInfo.fairId')
  const fairName = useMemo(() => {
    const fair = (allFerias || []).find((item: any) => String(item.id) === String(fairId)) as any
    return fair?.nombre || fair?.name
  }, [allFerias, fairId])

  const goNext = async () => {
    const ok = await form.trigger(STEP_FIELDS[currentStep] as any, { shouldFocus: true })
    if (!ok) return
    setCurrentStep((step) => Math.min(step + 1, PRODUCTOR_STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goBack = () => {
    setCurrentStep((step) => Math.max(step - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const submit = form.handleSubmit(async (values) => {
    if (!user?.id) {
      navigate('/auth')
      return
    }
    try {
      setSubmitting(true)
      await submitProductorApplication(
        { ...values, status: 'pending' },
        {
          userId: String(user.id),
          userName: user.name || user.nombre || values.personalInfo.fullName,
          role: user.role,
          fairName,
        }
      )
      clearDraft()
      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada',
        text: 'La solicitud queda pendiente de revision administrativa.',
        confirmButtonColor: 'var(--verde-claro)',
      })
      navigate('/perfil')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: error instanceof Error ? error.message : 'Revise la informacion e intente nuevamente.',
        confirmButtonColor: 'var(--verde-claro)',
      })
    } finally {
      setSubmitting(false)
    }
  })

  const shared = {
    register: form.register,
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
  }

  if (loading) {
    return <div className="profile-page-loading"><p>Cargando...</p></div>
  }

  return (
    <div className="productor-wizard-page">
      <Navbar />
      <main className="productor-wizard">
        <header className="wizard-header">
          <div>
            <h1>Solicitud de productor agricola</h1>
            <p>Formulario dinamico de pre-validacion para ferias del agricultor.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={() => navigate('/perfil')}>Volver al perfil</button>
        </header>

        <form className="wizard-shell" onSubmit={submit}>
          <nav className="wizard-stepper" aria-label="Pasos de solicitud">
            {PRODUCTOR_STEPS.map((step, index) => (
              <button
                type="button"
                key={step.id}
                className={index === currentStep ? 'active' : ''}
                onClick={async () => {
                  if (index <= currentStep || await form.trigger(STEP_FIELDS[currentStep] as any)) {
                    setCurrentStep(index)
                  }
                }}
              >
                <strong>{index + 1}. {step.title}</strong>
                <small>{step.description}</small>
              </button>
            ))}
          </nav>
          <div className="progress-track"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>

          {currentStep === 0 && <StepPersonalInfo register={form.register} errors={form.formState.errors} />}
          {currentStep === 1 && <StepProduccion {...shared} />}
          {currentStep === 2 && <StepPuestoFeria register={form.register} errors={form.formState.errors} ferias={allFerias || []} />}
          {currentStep === 3 && <StepDocumentacion {...shared} />}
          {currentStep === 4 && <StepSanitario {...shared} />}
          {currentStep === 5 && <StepTributario {...shared} />}
          {currentStep === 6 && <StepConfirmacion register={form.register} watch={form.watch} errors={form.formState.errors} fairName={fairName} />}

          <div className="wizard-actions">
            <button type="button" className="btn-secondary" onClick={goBack} disabled={currentStep === 0}>Anterior</button>
            {currentStep < PRODUCTOR_STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={goNext}>Siguiente</button>
            ) : (
              <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar solicitud'}</button>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}

export default ProductorWizard
