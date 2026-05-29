import { Upload, X } from 'lucide-react'
import Swal from 'sweetalert2'
import type { DocumentKey, UploadedDocument } from '../types/productorApplication.types'
import { useUploadManager } from '../hooks/useUploadManager'

interface Props {
  docKey: DocumentKey
  label: string
  documents: UploadedDocument[]
  onChange: (documents: UploadedDocument[]) => void
}

const DocumentDropzone = ({ docKey, label, documents, onChange }: Props) => {
  const current = documents.filter((doc) => doc.key === docKey)
  const { uploads, upload, remove } = useUploadManager()

  const addFiles = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      try {
        const doc = await upload(docKey, file, documents)
        onChange([...documents, doc])
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        Swal.fire({
          icon: 'error',
          title: 'Archivo no valido',
          text: error instanceof Error ? error.message : 'No se pudo procesar el archivo.',
          confirmButtonColor: 'var(--verde-claro)',
        })
      }
    }
  }

  return (
    <div
      className="document-dropzone"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        addFiles(event.dataTransfer.files)
      }}
    >
      <label>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files)
            event.target.value = ''
          }}
        />
          <Upload size={18} />
          <span>{label}</span>
        <small>Arrastre o seleccione JPG, PNG, WebP o PDF. Max 5MB.</small>
      </label>
      {Object.values(uploads).map((item) => (
        <div className="upload-progress" key={item.id} aria-live="polite">
          <strong>{item.name}</strong>
          <div><span style={{ width: `${item.progress}%` }} /></div>
          <small>{item.status === 'failed' ? item.error : `${item.progress}%`}</small>
        </div>
      ))}
      {current.map((doc) => (
        <div className="document-preview" key={doc.id}>
          {doc.mimeType.startsWith('image/') ? <img src={doc.secureUrl} alt={doc.name} /> : <a href={doc.secureUrl} target="_blank" rel="noreferrer">PDF</a>}
          <strong>{doc.name}</strong>
          <button
            type="button"
            onClick={async () => {
              try {
                await remove(doc)
              } finally {
                onChange(documents.filter((item) => item.id !== doc.id))
              }
            }}
            aria-label={`Eliminar ${doc.name}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default DocumentDropzone
