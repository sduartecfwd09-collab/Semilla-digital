import React, { useState, useEffect, useRef } from 'react';
import './CameraCapture.css';

interface DocFile { 
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

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const CameraCapture: React.FC<CameraCaptureProps> = ({ label, fileData, onPhotoCaptured }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync ref with state stream
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    setIsCameraActive(true);
    onPhotoCaptured(null); // Clear previous capture if any
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error al iniciar cámara frontal:", err);
      // Fallback
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (fallbackErr) {
        console.error("Error al iniciar cámara general:", fallbackErr);
        setErrorMsg('No se pudo acceder a la cámara. Asegurá que diste permisos en tu navegador.');
        setIsCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror the image horizontally if using frontal camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Reset transform to default
        context.setTransform(1, 0, 0, 1, 0, 0);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const file = dataURLtoFile(dataUrl, 'selfie_motociclista.jpg');
          
          stopCamera();
          onPhotoCaptured({
            file,
            preview: dataUrl,
            status: 'loaded'
          });
        } catch (e) {
          console.error("Error al capturar la foto:", e);
          setErrorMsg('Error al procesar la imagen capturada.');
        }
      }
    }
  };

  const handleRetake = () => {
    onPhotoCaptured(null);
    startCamera();
  };

  return (
    <div className="camera-capture-container">
      <div className="camera-capture-header">
        <span className="camera-capture-label">{label} *</span>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* State: Captured photo preview */}
      {fileData?.status === 'loaded' && (
        <div className="camera-preview-captured animate-fade">
          <img src={fileData.preview} alt="Selfie de verificación" className="captured-image" />
          <div className="captured-success-badge">
            <span className="badge-icon">✓</span> Foto capturada
          </div>
          <div className="camera-actions">
            <button type="button" className="camera-btn secondary-btn" onClick={handleRetake}>
              🔄 Tomar otra foto
            </button>
          </div>
        </div>
      )}

      {/* State: Camera active (live streaming) */}
      {isCameraActive && !fileData && (
        <div className="camera-streaming-box animate-fade">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="live-video-preview"
            />
            <div className="camera-overlay-frame" />
          </div>
          <div className="camera-actions">
            <button type="button" className="camera-btn capture-btn" onClick={capturePhoto}>
              📸 Tomar foto
            </button>
            <button type="button" className="camera-btn cancel-btn" onClick={stopCamera}>
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}

      {/* State: Initial (not active, no photo taken, no error) */}
      {!isCameraActive && !fileData && !errorMsg && (
        <div className="camera-placeholder-box" onClick={startCamera}>
          <div className="camera-placeholder-icon">🤳</div>
          <span className="camera-placeholder-title">Captura de foto en vivo</span>
          <span className="camera-placeholder-desc">Hacé clic para activar la cámara y tomar una foto de verificación.</span>
          <button type="button" className="camera-activate-btn">
            Activar Cámara
          </button>
        </div>
      )}

      {/* State: Error */}
      {errorMsg && (
        <div className="camera-error-box animate-fade">
          <div className="camera-error-icon">⚠️</div>
          <span className="camera-error-text">{errorMsg}</span>
          <div className="camera-actions">
            <button type="button" className="camera-btn retry-btn" onClick={startCamera}>
              Reintentar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
