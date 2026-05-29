import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type Resolver } from 'react-hook-form'
import { createDefaultProductorApplication } from '../constants/productor.defaults'
import type { ProductorApplicationForm } from '../types/productorApplication.types'
import { productorApplicationSchema } from '../validators/productorApplication.schema'

interface DraftUser {
  name?: string
  nombre?: string
  email?: string
}

export const useRegistroProductor = (user?: DraftUser) =>
  useForm<ProductorApplicationForm>({
    resolver: zodResolver(productorApplicationSchema) as Resolver<ProductorApplicationForm>,
    mode: 'onBlur',
    defaultValues: createDefaultProductorApplication(user),
  })
