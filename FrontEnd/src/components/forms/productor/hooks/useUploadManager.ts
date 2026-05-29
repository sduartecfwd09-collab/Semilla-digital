import { useCallback, useRef, useState } from 'react'
import { deleteAsset, uploadDocument, uploadImage } from '../../../../services/cloudinary.service'
import type { DocumentKey, UploadedDocument } from '../types/productorApplication.types'
import { compressImageFile, validateFile } from '../utils/fileUtils'
import { safeFileName } from '../utils/productorRules'

export interface UploadState {
  id: string
  name: string
  progress: number
  status: 'uploading' | 'success' | 'failed' | 'cancelled'
  error?: string
}

export const useUploadManager = () => {
  const controllers = useRef(new Map<string, AbortController>())
  const [uploads, setUploads] = useState<Record<string, UploadState>>({})

  const upload = useCallback(async (key: DocumentKey, file: File, existing: UploadedDocument[]) => {
    const validationError = await validateFile(file, existing)
    if (validationError) throw new Error(validationError)

    const id = crypto.randomUUID()
    const controller = new AbortController()
    controllers.current.set(id, controller)
    setUploads((state) => ({ ...state, [id]: { id, name: file.name, progress: 0, status: 'uploading' } }))

    try {
      const optimized = file.type.startsWith('image/') ? await compressImageFile(file) : file
      const metadata = file.type.startsWith('image/')
        ? await uploadImage(optimized, {
            signal: controller.signal,
            onProgress: (progress) => setUploads((state) => ({ ...state, [id]: { ...state[id], progress } })),
          })
        : await uploadDocument(optimized, {
            signal: controller.signal,
            onProgress: (progress) => setUploads((state) => ({ ...state, [id]: { ...state[id], progress } })),
          })

      const document: UploadedDocument = {
        id,
        key,
        name: file.name,
        safeName: safeFileName(file.name),
        mimeType: metadata.mimeType,
        size: metadata.bytes,
        secureUrl: metadata.secureUrl,
        publicId: metadata.publicId,
        resourceType: metadata.resourceType,
        format: metadata.format,
        bytes: metadata.bytes,
        width: metadata.width,
        height: metadata.height,
        originalFilename: metadata.originalFilename,
        uploadedAt: new Date().toISOString(),
        status: 'success',
      }
      setUploads((state) => ({ ...state, [id]: { ...state[id], progress: 100, status: 'success' } }))
      return document
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError'
      setUploads((state) => ({
        ...state,
        [id]: {
          ...state[id],
          status: cancelled ? 'cancelled' : 'failed',
          error: error instanceof Error ? error.message : 'No se pudo subir el archivo.',
        },
      }))
      throw error
    } finally {
      controllers.current.delete(id)
    }
  }, [])

  const cancelUpload = useCallback((id: string) => {
    controllers.current.get(id)?.abort()
  }, [])

  const remove = useCallback(async (document: UploadedDocument) => {
    await deleteAsset(document.publicId, document.resourceType)
  }, [])

  return { uploads, upload, cancelUpload, remove }
}
