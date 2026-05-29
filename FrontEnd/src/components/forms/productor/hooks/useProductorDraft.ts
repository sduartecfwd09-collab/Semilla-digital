import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { PRODUCTOR_DRAFT_KEY } from '../constants/productor.constants'
import type { ProductorApplicationForm } from '../types/productorApplication.types'

export const useProductorDraft = (
  form: UseFormReturn<ProductorApplicationForm>,
  enabled: boolean
) => {
  useEffect(() => {
    if (!enabled) return
    const raw = localStorage.getItem(PRODUCTOR_DRAFT_KEY)
    if (!raw) return
    try {
      form.reset({ ...form.getValues(), ...JSON.parse(raw) })
    } catch {
      localStorage.removeItem(PRODUCTOR_DRAFT_KEY)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    const subscription = form.watch((value) => {
      localStorage.setItem(PRODUCTOR_DRAFT_KEY, JSON.stringify(value))
    })
    return () => subscription.unsubscribe()
  }, [enabled, form])

  const clearDraft = () => localStorage.removeItem(PRODUCTOR_DRAFT_KEY)

  return { clearDraft }
}
