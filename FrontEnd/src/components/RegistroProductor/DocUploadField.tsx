import React from 'react';
import Swal from 'sweetalert2';
import type { DocKey, DocPreview } from './registroProductorExtend';

interface DocUploadFieldProps {
  docKey: DocKey;
  label: string;
  fileData: DocPreview | null;
  existingName?: string;
  onChange: (key: DocKey, data: DocPreview | null) => void;
  onRemoveExisting?: (key: DocKey) => void;
  compress: (file: File) => Promise<string>;
}

const DocUploadField: React.FC<DocUploadFieldProps> = ({
  docKey,
  label,
  fileData,
  existingName,
  onChange,
  onRemoveExisting,
  compress,
}) => {
  const handleFile = async (file: File) => {
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!valid.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Formato no válido',
        text: 'Solo JPG, PNG, WebP o PDF.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'Máximo 5MB.',
        confirmButtonColor: 'var(--verde-claro)',
      });
      return;
    }
    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = () =>
          onChange(docKey, {
            file,
            preview: reader.result as string,
          });
        reader.readAsDataURL(file);
      } else {
        const preview = await compress(file);
        onChange(docKey, { file, preview });
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar el archivo.',
        confirmButtonColor: 'var(--verde-claro)',
      });
    }
  };

  return (
    <div className="doc-upload-field">
      <label className="doc-upload-label">{label}</label>
      {existingName && !fileData && (
        <div className="foto-preview-item">
          <span className="foto-name">📄 {existingName}</span>
          {onRemoveExisting && (
            <button type="button" className="logo-remove-btn" onClick={() => onRemoveExisting(docKey)}>
              ✕
            </button>
          )}
        </div>
      )}
      {fileData && (
        <div className="foto-preview-item">
          {fileData.file.type === 'application/pdf' ? (
            <span className="foto-name">📄 {fileData.file.name}</span>
          ) : (
            <img src={fileData.preview} alt={label} />
          )}
          <button type="button" className="logo-remove-btn" onClick={() => onChange(docKey, null)}>
            ✕
          </button>
        </div>
      )}
      {!fileData && (
        <label className="logo-upload-area doc-upload-area">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = '';
            }}
          />
          <div className="logo-upload-icon">📎</div>
          <div className="logo-upload-text">
            <strong>Subir</strong> {label}
          </div>
          <div className="logo-upload-formats">JPG, PNG, WebP o PDF · Máx 5MB</div>
        </label>
      )}
    </div>
  );
};

export default DocUploadField;
