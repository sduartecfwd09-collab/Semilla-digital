import React, { useState, useCallback } from 'react';
import './CameraCapture.css';
import { useLivenessScanner } from './liveness/useLivenessScanner';

export interface DocFile {
  file: File | null;
  preview: string;
  status: 'pending' | 'loaded' | 'error';
  errorMessage?: string;
}

interface CameraCaptureProps {
  label: string;
  fileData: DocFile | null;
  onPhotoCaptured: (fileData: DocFile | null) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ label, fileData, onPhotoCaptured }) => {
  const [confirmed, setConfirmed] = useState(fileData?.status === 'loaded');
  const [preview, setPreview] = useState<string | null>(fileData?.preview ?? null);

  const onVerified = useCallback((r: { dataUrl: string; file: File }) => {
    setPreview(r.dataUrl);
    onPhotoCaptured({ file: r.file, preview: r.dataUrl, status: 'loaded' });
    setConfirmed(true);
  }, [onPhotoCaptured]);

  const { ready, phase, liveMsg, hint, progress, border, canScan, errorMsg, videoRef, captureRef, start, cancel, scanStep } =
    useLivenessScanner(onVerified);

  const busy = ['loading', 'active', 'verifying'].includes(phase);
  const display = preview || fileData?.preview;

  const handleStart = async () => {
    setConfirmed(false);
    onPhotoCaptured(null);
    setPreview(null);
    await start();
  };

  return (
    <div className="camera-capture-container identity-scanner">
      <div className="camera-capture-header">
        <span className="camera-capture-label">{label} *</span>
        <span className={`camera-status-badge border-${border}`}>
          {confirmed ? 'Verificado' : busy ? 'Verificando' : 'Pendiente'}
        </span>
      </div>
      <p className="camera-live-only-hint">Solo cámara en vivo — no galería ni archivos.</p>
      <canvas ref={captureRef} className="hidden-canvas" aria-hidden />

      {busy && !confirmed && (
        <>
          <p className="scanner-live-msg">{liveMsg}</p>
          {hint && <p className="scanner-hint-error">{hint}</p>}
          <div className="scanner-progress"><div className="scanner-progress-bar" style={{ width: `${progress}%` }} /></div>
          <div className="camera-streaming-box">
            <div className="video-wrapper">
              <video ref={videoRef} autoPlay playsInline muted className="live-video-preview" />
              <div className={`camera-overlay-frame oval-guide border-${border}`} />
            </div>
          </div>
          <div className="scanner-actions">
            <button type="button" className="camera-activate-btn scan-btn" onClick={scanStep} disabled={!canScan}>
              Escanear
            </button>
            <button type="button" className="camera-btn cancel-btn" onClick={cancel}>Cancelar</button>
          </div>
          {!canScan && <p className="scanner-hint-sub">Cuando el óvalo se ponga verde, tocá Escanear</p>}
        </>
      )}

      {confirmed && display && (
        <div className="camera-preview-captured">
          <img src={display} alt="Verificado" className="captured-image" />
          <div className="captured-success-badge verified-badge">✓ Identidad verificada</div>
          <button type="button" className="camera-btn secondary-btn" onClick={handleStart}>Repetir verificación</button>
        </div>
      )}

      {phase === 'idle' && !confirmed && (
        <div className="camera-placeholder-box">
          <p className="camera-placeholder-desc">Verificación biométrica con prueba de vida. Sigue las instrucciones en pantalla.</p>
          <button type="button" className="camera-activate-btn" onClick={handleStart} disabled={!ready}>
            {ready ? 'Iniciar verificación' : 'Cargando modelo facial…'}
          </button>
        </div>
      )}

      {phase === 'error' && errorMsg && (
        <div className="camera-error-box">
          <span>{errorMsg}</span>
          <button type="button" className="camera-btn retry-btn" onClick={handleStart}>Reintentar</button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
