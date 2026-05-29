import { API_BASE_URL } from './api.config'

export interface CloudinaryAssetMetadata {
  secureUrl: string
  publicId: string
  resourceType: 'image' | 'raw' | 'video' | 'auto'
  format?: string
  bytes: number
  width?: number
  height?: number
  originalFilename: string
  mimeType: string
}

interface UploadOptions {
  signal?: AbortSignal
  onProgress?: (progress: number) => void
  folder?: string
}

const uploadAsset = (file: File, type: 'image' | 'document', options: UploadOptions = {}) =>
  new Promise<CloudinaryAssetMetadata>((resolve, reject) => {
    const formData = new FormData()
    if (options.folder) formData.append('folder', options.folder)
    formData.append('file', file)
    formData.append('assetType', type)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/puestos/uploads`)
    xhr.withCredentials = true

    const token = localStorage.getItem('token')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) options.onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      const payload = JSON.parse(xhr.responseText || '{}')
      if (xhr.status >= 200 && xhr.status < 300 && payload.success) resolve(payload.data)
      else reject(new Error(payload.message || 'No se pudo subir el archivo.'))
    }
    xhr.onerror = () => reject(new Error('Error de red durante la subida.'))
    xhr.onabort = () => reject(new DOMException('Subida cancelada.', 'AbortError'))
    options.signal?.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.send(formData)
  })

export const uploadImage = (file: File, options?: UploadOptions) => uploadAsset(file, 'image', options)
export const uploadDocument = (file: File, options?: UploadOptions) => uploadAsset(file, 'document', options)

export const retryUpload = (file: File, type: 'image' | 'document', options?: UploadOptions) =>
  uploadAsset(file, type, options)

export const deleteAsset = async (publicId: string, resourceType: string) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`${API_BASE_URL}/puestos/uploads`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ publicId, resourceType }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'No se pudo eliminar el archivo.')
}
