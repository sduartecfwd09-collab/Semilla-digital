import type { UploadedDocument } from '../types/productorApplication.types'
import { safeFileName } from './productorRules'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
const MAX_FILE_SIZE = 5 * 1024 * 1024
const MAX_TOTAL_SIZE = 25 * 1024 * 1024

export const validateFile = async (file: File, existing: UploadedDocument[]) => {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Solo se permiten JPG, PNG, WebP o PDF.'
  }
  if (file.size > MAX_FILE_SIZE) return 'El archivo no puede superar 5MB.'
  if (existing.reduce((total, doc) => total + doc.bytes, 0) + file.size > MAX_TOTAL_SIZE) {
    return 'El total de archivos no puede superar 25MB.'
  }
  if (existing.some((doc) => doc.safeName === safeFileName(file.name) && doc.size === file.size)) {
    return 'Este archivo ya fue agregado.'
  }
  if (file.type === 'application/pdf') return validatePdf(file)
  return validateImage(file)
}

const validatePdf = async (file: File) => {
  const header = await file.slice(0, 5).text()
  return header === '%PDF-' ? null : 'El PDF no parece ser valido.'
}

const validateImage = (file: File) =>
  new Promise<string | null>((resolve) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      if (image.width < 320 || image.height < 240) resolve('La imagen debe medir al menos 320x240 px.')
      else resolve(null)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve('La imagen parece estar corrupta.')
    }
    image.src = url
  })

export const compressImageFile = (file: File) =>
  new Promise<File>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      const max = 1600
      const ratio = Math.min(1, max / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * ratio)
      canvas.height = Math.round(image.height * ratio)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => resolve(blob ? new File([blob], safeFileName(file.name).replace(/\.\w+$/, '.webp'), { type: 'image/webp' }) : file),
        'image/webp',
        0.82
      )
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    image.src = url
  })
