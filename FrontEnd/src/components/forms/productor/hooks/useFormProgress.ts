import { useMemo } from 'react'
import type { FieldErrors } from 'react-hook-form'
import type { ProductorApplicationForm } from '../types/productorApplication.types'

export const useFormProgress = (currentStep: number, totalSteps: number, errors: FieldErrors<ProductorApplicationForm>) =>
  useMemo(() => ({
    percent: Math.round(((currentStep + 1) / totalSteps) * 100),
    hasErrors: Object.keys(errors).length > 0,
  }), [currentStep, totalSteps, errors])
