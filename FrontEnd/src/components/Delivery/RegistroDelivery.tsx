import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './RegistroDelivery.css';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { ENDPOINTS, authFetch, authFormFetch } from '../../services/api.config';
import type { DocFile } from './CameraCapture';
import { validateEmail } from '../../utils/validation';
import CameraCapture from './CameraCapture';

/* ── Constants ── */
const VEHICLE_TYPES = [
  { value: 'Carro', label: 'Automóvil', emoji: '🚗' },
  { value: 'Moto', label: 'Motocicleta', emoji: '🏍️' },
  { value: 'BiciMoto', label: 'Bici-moto (Ciclomotor)', emoji: '🛵' },
  { value: 'Bicicleta', label: 'Bicicleta', emoji: '🚲' }
];

const CARRO_DOCUMENTS = [
  { key: 'cedula', label: 'Cédula de identidad', emoji: '🪪' },
  { key: 'hojaDelincuencia', label: 'Hoja de delincuencia actualizada', emoji: '📋' },
  { key: 'licenciaConducir', label: 'Licencia de conducir vigente', emoji: '🪪' },
  { key: 'revisionTecnica', label: 'Revisión técnica (Riteve/Dekra)', emoji: '🔧' },
  { key: 'marchamo', label: 'Comprobante de marchamo', emoji: '📄' },
];

const MOTO_DOCUMENTS = [
  { key: 'cedula', label: 'Cédula de identidad', emoji: '🪪' },
  { key: 'hojaDelincuencia', label: 'Hoja de delincuencia actualizada', emoji: '📋' },
  { key: 'licenciaMoto', label: 'Licencia de conducir', emoji: '🪪' },
  { key: 'tarjetaPropiedad', label: 'Credenciales / Tarjeta de propiedad', emoji: '📑' },
  { key: 'revisionTecnicaMoto', label: 'Revisión técnica (Riteve)', emoji: '🔧' },
  { key: 'marchamoMoto', label: 'Comprobante de marchamo', emoji: '📄' },
];

const BICIMOTO_DOCUMENTS = [
  { key: 'cedulaPasaporte', label: 'Cédula o pasaporte (con permiso de trabajo si aplica)', emoji: '🪪' },
  { key: 'hojaDelincuenciaBM', label: 'Hoja de delincuencia', emoji: '📋' },
  { key: 'licenciaBM', label: 'Licencia de conducir válida', emoji: '🪪' },
  { key: 'riteveBM', label: 'Revisión técnica (Riteve)', emoji: '🔧' },
  { key: 'marchamoBM', label: 'Comprobante de marchamo', emoji: '📄' },
];

const BICI_DOCUMENTS = [
  { key: 'cedulaBici', label: 'Cédula vigente', emoji: '🪪' },
  { key: 'antecedentesBici', label: 'Hoja de antecedentes penales', emoji: '📋' },
  { key: 'fotoBici', label: 'Foto de la bicicleta', emoji: '🚲' },
  { key: 'fotoBolsoBici', label: 'Foto del bolso oficial', emoji: '🎒' },
];

const CARRO_CONFIRMATIONS = [
  { key: 'cuatroPuertas', label: 'El vehículo tiene al menos 4 puertas', emoji: '🚪' },
  { key: 'maletero', label: 'El maletero es funcional y en buen estado', emoji: '📦' },
  { key: 'aireAcondicionado', label: 'El aire acondicionado está operativo', emoji: '❄️' },
  { key: 'buenEstado', label: 'El vehículo está en buen estado estético y mecánico', emoji: '✅' },
];

const BICIMOTO_CONFIRMATIONS = [
  { key: 'condicionesMecanicas', label: 'El vehículo está en perfectas condiciones mecánicas', emoji: '🔧' },
  { key: 'mochilaTermica', label: 'Poseo mochila térmica para entregas', emoji: '🎒' },
  { key: 'mochilaMarcaOficial', label: 'La mochila es de marca oficial', emoji: '✅' },
];

const BICI_CONFIRMATIONS = [
  { key: 'biciBuenEstado', label: 'La bicicleta está en buen estado', emoji: '🚲' },
  { key: 'biciMochilaTermica', label: 'Poseo mochila o bolsa térmica adecuada', emoji: '🎒' },
  { key: 'biciMochilaOficial', label: 'La mochila es de marca oficial', emoji: '✅' },
  { key: 'biciTelefonoInternet', label: 'Tengo teléfono inteligente con internet', emoji: '📱' },
];

interface DocumentUploaderProps {
  docKey: string;
  label: string;
  emoji: string;
  fileData: DocFile | null;
  onFileChange: (key: string, fileData: DocFile | null) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ docKey, label, emoji, fileData, onFileChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      onFileChange(docKey, { file: null, preview: '', status: 'error', errorMessage: 'Archivo excede los 5MB permitidos' });
      return;
    }
    const valid = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!valid.includes(file.type)) {
      onFileChange(docKey, { file: null, preview: '', status: 'error', errorMessage: 'Formato inválido. Solo JPG, PNG o PDF' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onFileChange(docKey, { file, preview: reader.result as string, status: 'loaded' });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  return (
    <div 
      className={`doc-upload-zone ${isDragOver ? 'drag-over' : ''} ${fileData?.status === 'loaded' ? 'loaded' : ''} ${fileData?.status === 'error' ? 'error' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={handleChange} id={`upload-${docKey}`} className="doc-file-input" />
      <label htmlFor={`upload-${docKey}`} className="doc-upload-content">
        {fileData?.status === 'loaded' ? (
          <div className="doc-loaded-state">
            {fileData.file?.type === 'application/pdf' ? (
              <div className="pdf-preview">📄 PDF</div>
            ) : (
               <img src={fileData.preview} alt="preview" className="doc-image-preview" />
            )}
            <div className="doc-meta">
              <span className="doc-filename">{fileData.file?.name}</span>
              <button type="button" onClick={(e) => { e.preventDefault(); onFileChange(docKey, null); }}>✕</button>
            </div>
          </div>
        ) : fileData?.status === 'error' ? (
          <div className="doc-error-state">
            <div className="emoji">⚠️</div>
            <div className="label">{label}</div>
            <div className="error-msg">{fileData.errorMessage}</div>
            <div className="hint">Clic o arrastrá para intentar de nuevo</div>
          </div>
        ) : (
          <div className="doc-pending-state">
            <div className="emoji">{emoji}</div>
            <div className="label">{label}</div>
            <div className="hint">Arrastrá aquí o hacé clic<br/>Máx: 5MB (JPG, PNG, PDF)</div>
          </div>
        )}
      </label>
    </div>
  );
};

const RegistroDelivery: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const isReset = new URLSearchParams(location.search).get('reset') === 'true';

  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [solicitudId, setSolicitudId] = useState('');

  /* Step control: 1 = vehicle selection, 2 = form */
  const [step, setStep] = useState(1);

  /* Common fields */
  const [vehicleType, setVehicleType] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');

  /* Carro-specific */
  const [anioVehiculo, setAnioVehiculo] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [documents, setDocuments] = useState<Record<string, DocFile | null>>({
    cedula: null, hojaDelincuencia: null, licenciaConducir: null,
    revisionTecnica: null, marchamo: null,
    licenciaMoto: null, tarjetaPropiedad: null,
    revisionTecnicaMoto: null, marchamoMoto: null,
    cedulaPasaporte: null, hojaDelincuenciaBM: null, licenciaBM: null,
    riteveBM: null, marchamoBM: null,
    cedulaBici: null, antecedentesBici: null, fotoBici: null, fotoBolsoBici: null,
  });
  const [confirmations, setConfirmations] = useState<Record<string, boolean>>({
    cuatroPuertas: false, maletero: false, aireAcondicionado: false, buenEstado: false,
    condicionesMecanicas: false, mochilaTermica: false, mochilaMarcaOficial: false,
    biciBuenEstado: false, biciMochilaTermica: false, biciMochilaOficial: false, biciTelefonoInternet: false,
  });
  const [confirmationEvidences, setConfirmationEvidences] = useState<Record<string, DocFile | null>>({});
  const [bolsoConfirm, setBolsoConfirm] = useState(false);
  const [bolsoFoto, setBolsoFoto] = useState<DocFile | null>(null);
  const [identitySelfie, setIdentitySelfie] = useState<DocFile | null>(null);

  /* Year validation helper */
  const currentYear = new Date().getFullYear();
  const anioValido = anioVehiculo !== '' && Number(anioVehiculo) >= 2000 && Number(anioVehiculo) <= currentYear;

  /* ── Load user & existing solicitud ── */
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { navigate('/auth'); return; }
    const cachedUser = JSON.parse(userStr);
    if (cachedUser.role !== 'Usuario' && cachedUser.role !== 'Repartidor') {
      navigate('/perfil'); return;
    }
    setRole(cachedUser.role);
    setUserId(cachedUser.id);
    setEmail(cachedUser.email || '');
    setNombre(cachedUser.name || cachedUser.nombre || '');

    const cargarDatos = async () => {
      try {
        setLoading(true);
        if (isReset) { setLoading(false); return; }
        const solRes = await authFetch(`${ENDPOINTS.solicitudesCambioRol}/usuario/${cachedUser.id}`);
        const raw = await solRes.json();
        const todas = raw.data || raw;
        const mias = todas.filter(
          (s: any) => String(s.usuario_id ?? s.usuarioId) === String(cachedUser.id) &&
            (s.rol_solicitado ?? s.rolSolicitado) === 'Repartidor' &&
            s.estado === 'Pendiente'
        );
        if (mias.length > 0) {
          const sol = mias[0];
          setSolicitudEnviada(true);
          setSolicitudId(sol.id);
          const vt = sol.vehicle_type ?? sol.vehicleType ?? '';
          setVehicleType(vt);
          setLicensePlate(sol.license_plate ?? sol.licensePlate ?? '');
          if (vt) setStep(2);
        }
      } catch (err) {
        console.error('Error al cargar datos de solicitud de delivery:', err);
      } finally { setLoading(false); }
    };
    cargarDatos();
  }, [navigate, isReset]);

  /* ── File handlers ── */
  const updateDocument = (key: string, fileData: DocFile | null) => {
    setDocuments(prev => ({ ...prev, [key]: fileData }));
  };

  const handleBolsoFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = ['image/jpeg', 'image/png', 'image/webp'];
    if (!valid.includes(file.type)) {
      Swal.fire({ icon: 'error', title: 'Formato no válido', text: 'Solo JPG, PNG o WebP.', confirmButtonColor: 'var(--verde-claro)' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setBolsoFoto({ file, preview: reader.result as string, status: 'loaded' });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ── Step 1 → Step 2 ── */
  const handleContinue = () => {
    if (!vehicleType) {
      Swal.fire({ icon: 'warning', title: 'Seleccioná un vehículo', text: 'Elegí el tipo de vehículo con el que harás entregas.', confirmButtonColor: 'var(--verde-claro)' });
      return;
    }
    setStep(2);
  };

  /* ── Validations for Carro ── */
  const validateCarroFields = (): boolean => {
    if (!licensePlate.trim()) {
      Swal.fire({ icon: 'warning', title: 'Placa requerida', text: 'Ingresá el número de placa del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!anioValido) {
      Swal.fire({ icon: 'warning', title: 'Año inválido', text: `El año debe ser entre 2000 y ${currentYear}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!marca.trim() || !modelo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Marca y modelo requeridos', text: 'Ingresá la marca y el modelo del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const missingDocs = CARRO_DOCUMENTS.filter(d => !documents[d.key] || documents[d.key]?.status === 'error');
    if (missingDocs.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Documentos incompletos', text: `Falta subir: ${missingDocs.map(d => d.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const unchecked = CARRO_CONFIRMATIONS.filter(c => !confirmations[c.key]);
    if (unchecked.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const missingEvidences = CARRO_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
    if (missingEvidences.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoConfirm) {
      Swal.fire({ icon: 'warning', title: 'Bolso oficial', text: 'Debés confirmar que contás con el bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoFoto) {
      Swal.fire({ icon: 'warning', title: 'Foto del bolso', text: 'Subí una foto del bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    return true;
  };

  /* ── Validations for Moto ── */
  const validateMotoFields = (): boolean => {
    if (!licensePlate.trim()) {
      Swal.fire({ icon: 'warning', title: 'Placa requerida', text: 'Ingresá el número de placa de la motocicleta.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!marca.trim() || !modelo.trim()) {
      Swal.fire({ icon: 'warning', title: 'Marca y modelo requeridos', text: 'Ingresá la marca y el modelo de la motocicleta.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const missingDocs = MOTO_DOCUMENTS.filter(d => !documents[d.key] || documents[d.key]?.status === 'error');
    if (missingDocs.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Documentos incompletos', text: `Falta subir: ${missingDocs.map(d => d.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoConfirm) {
      Swal.fire({ icon: 'warning', title: 'Bolso oficial', text: 'Debés confirmar que contás con el bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoFoto) {
      Swal.fire({ icon: 'warning', title: 'Foto del bolso', text: 'Subí una foto del bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    return true;
  };

  /* ── Validations for BiciMoto ── */
  const validateBiciMotoFields = (): boolean => {
    const missingDocs = BICIMOTO_DOCUMENTS.filter(d => !documents[d.key] || documents[d.key]?.status === 'error');
    if (missingDocs.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Documentos incompletos', text: `Falta subir: ${missingDocs.map(d => d.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const unchecked = BICIMOTO_CONFIRMATIONS.filter(c => !confirmations[c.key]);
    if (unchecked.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const missingEvidences = BICIMOTO_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
    if (missingEvidences.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoConfirm) {
      Swal.fire({ icon: 'warning', title: 'Bolso oficial', text: 'Debés confirmar que contás con el bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (!bolsoFoto) {
      Swal.fire({ icon: 'warning', title: 'Foto del bolso', text: 'Subí una foto del bolso oficial.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    return true;
  };

  /* ── Validations for Bicicleta ── */
  const validateBicicletaFields = (): boolean => {
    const missingDocs = BICI_DOCUMENTS.filter(d => !documents[d.key] || documents[d.key]?.status === 'error');
    if (missingDocs.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Documentos incompletos', text: `Falta subir: ${missingDocs.map(d => d.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const unchecked = BICI_CONFIRMATIONS.filter(c => !confirmations[c.key]);
    if (unchecked.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    const missingEvidences = BICI_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
    if (missingEvidences.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    return true;
  };

  /* ── Intermediate Step Validations ── */
  const validateStep1 = (): boolean => {
    if (!vehicleType) {
      Swal.fire({ icon: 'warning', title: 'Seleccioná un vehículo', text: 'Elegí el tipo de vehículo con el que harás entregas.', confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    if (vehicleType === 'Carro') {
      if (!licensePlate.trim()) {
        Swal.fire({ icon: 'warning', title: 'Placa requerida', text: 'Ingresá el número de placa del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      if (!anioValido) {
        Swal.fire({ icon: 'warning', title: 'Año inválido', text: `El año debe ser entre 2000 y ${currentYear}.`, confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      if (!marca.trim() || !modelo.trim()) {
        Swal.fire({ icon: 'warning', title: 'Marca y modelo requeridos', text: 'Ingresá la marca y el modelo del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      const unchecked = CARRO_CONFIRMATIONS.filter(c => !confirmations[c.key]);
      if (unchecked.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      const missingEvidences = CARRO_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
      if (missingEvidences.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
    }
    if (vehicleType === 'Moto') {
      if (!licensePlate.trim()) {
        Swal.fire({ icon: 'warning', title: 'Placa requerida', text: 'Ingresá el número de placa de la motocicleta.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      if (!marca.trim() || !modelo.trim()) {
        Swal.fire({ icon: 'warning', title: 'Marca y modelo requeridos', text: 'Ingresá la marca y el modelo de la motocicleta.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
    }
    if (vehicleType === 'BiciMoto') {
      const unchecked = BICIMOTO_CONFIRMATIONS.filter(c => !confirmations[c.key]);
      if (unchecked.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos del vehículo.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      const missingEvidences = BICIMOTO_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
      if (missingEvidences.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
    }
    if (vehicleType === 'Bicicleta') {
      const unchecked = BICI_CONFIRMATIONS.filter(c => !confirmations[c.key]);
      if (unchecked.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Confirmaciones pendientes', text: 'Debés confirmar todos los requisitos.', confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
      const missingEvidences = BICI_CONFIRMATIONS.filter(c => confirmations[c.key] && (!confirmationEvidences[c.key] || confirmationEvidences[c.key]?.status === 'error'));
      if (missingEvidences.length > 0) {
        Swal.fire({ icon: 'warning', title: 'Evidencia faltante', text: `Subí una foto de evidencia para: ${missingEvidences.map(c => c.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
        return false;
      }
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    let relevantDocs: { key: string; label: string; emoji: string }[] = [];
    if (vehicleType === 'Carro') relevantDocs = CARRO_DOCUMENTS;
    else if (vehicleType === 'Moto') relevantDocs = MOTO_DOCUMENTS;
    else if (vehicleType === 'BiciMoto') relevantDocs = BICIMOTO_DOCUMENTS;
    else if (vehicleType === 'Bicicleta') relevantDocs = BICI_DOCUMENTS;

    const missingDocs = relevantDocs.filter(d => !documents[d.key] || documents[d.key]?.status === 'error');
    if (missingDocs.length > 0) {
      Swal.fire({ icon: 'warning', title: 'Documentos incompletos', text: `Falta subir: ${missingDocs.map(d => d.label).join(', ')}.`, confirmButtonColor: 'var(--verde-claro)' });
      return false;
    }
    return true;
  };

  const handleGoToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleGoToStep3 = () => {
    if (validateStep2()) {
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType || !telefono.trim() || !nombre.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: 'Completá todos los campos obligatorios.', confirmButtonColor: 'var(--verde-claro)' });
      return;
    }
    if (telefono.trim().length !== 8) {
      Swal.fire({ icon: 'warning', title: 'Teléfono inválido', text: 'El número de teléfono debe tener exactamente 8 dígitos.', confirmButtonColor: 'var(--verde-claro)' });
      return;
    }
    const emailVal = validateEmail(email.trim());
    if (!emailVal.valid) {
      Swal.fire({ icon: 'error', title: 'Correo inválido', text: emailVal.message, confirmButtonColor: 'var(--verde-claro)' });
      return;
    }
    /* Vehicle-specific validations */
    if (vehicleType === 'Carro' && !validateCarroFields()) return;
    if (vehicleType === 'Moto' && !validateMotoFields()) return;
    if (vehicleType === 'BiciMoto' && !validateBiciMotoFields()) return;
    if (vehicleType === 'Bicicleta' && !validateBicicletaFields()) return;
    if (!identitySelfie?.file || identitySelfie.status !== 'loaded') {
      Swal.fire({ icon: 'warning', title: 'Verificación pendiente', text: 'Completá el escáner de identidad con prueba de vida.', confirmButtonColor: 'var(--verde-claro)' });
      return;
    }

    try {
      setSubmitting(true);
      const docsBase64: Record<string, string> = {};
      if (['Carro', 'Moto', 'BiciMoto', 'Bicicleta'].includes(vehicleType)) {
        const relevantKeys = vehicleType === 'Carro'
          ? CARRO_DOCUMENTS.map(d => d.key)
          : vehicleType === 'Moto'
            ? MOTO_DOCUMENTS.map(d => d.key)
            : vehicleType === 'BiciMoto'
              ? BICIMOTO_DOCUMENTS.map(d => d.key)
              : BICI_DOCUMENTS.map(d => d.key);
        Object.entries(documents).forEach(([k, v]) => { if (v && v.status === 'loaded' && relevantKeys.includes(k)) docsBase64[k] = v.preview; });
        if (bolsoFoto && vehicleType !== 'Bicicleta') docsBase64['bolsoFoto'] = bolsoFoto.preview;

        Object.entries(confirmationEvidences).forEach(([k, v]) => {
          if (v && v.status === 'loaded') docsBase64[`evidencia_${k}`] = v.preview;
        });
      }

      const solicitudData: Record<string, any> = {
        usuario_id: userId,
        nombre_usuario: nombre.trim(),
        correo_usuario: email.trim(),
        rol_solicitado: 'Repartidor',
        vehicle_type: vehicleType,
        license_plate: licensePlate.trim(),
        estado: 'Pendiente',
        fecha_solicitud: new Date().toISOString(),
      };

      if (vehicleType === 'Carro') {
        solicitudData.anio_vehiculo = Number(anioVehiculo);
        solicitudData.marca_vehiculo = marca.trim();
        solicitudData.modelo_vehiculo = modelo.trim();
        solicitudData.confirmaciones = confirmations;
        solicitudData.bolso_confirmado = bolsoConfirm;
        solicitudData.documentos_base64 = docsBase64;
      }

      if (vehicleType === 'Moto') {
        solicitudData.marca_vehiculo = marca.trim();
        solicitudData.modelo_vehiculo = modelo.trim();
        solicitudData.bolso_confirmado = bolsoConfirm;
        solicitudData.documentos_base64 = docsBase64;
      }

      if (vehicleType === 'BiciMoto') {
        solicitudData.license_plate = licensePlate.trim() || 'N/A';
        solicitudData.confirmaciones = {
          condicionesMecanicas: confirmations.condicionesMecanicas,
          mochilaTermica: confirmations.mochilaTermica,
          mochilaMarcaOficial: confirmations.mochilaMarcaOficial,
        };
        solicitudData.bolso_confirmado = bolsoConfirm;
        solicitudData.documentos_base64 = docsBase64;
      }

      if (vehicleType === 'Bicicleta') {
        solicitudData.confirmaciones = {
          biciBuenEstado: confirmations.biciBuenEstado,
          biciMochilaTermica: confirmations.biciMochilaTermica,
          biciMochilaOficial: confirmations.biciMochilaOficial,
          biciTelefonoInternet: confirmations.biciTelefonoInternet,
        };
        solicitudData.documentos_base64 = docsBase64;
      }

      const formData = new FormData();
      formData.append('selfie', identitySelfie.file);
      formData.append('usuario_id', String(userId));
      formData.append('data', JSON.stringify(solicitudData));

      const url = solicitudId
        ? `${ENDPOINTS.solicitudesCambioRol}/${solicitudId}`
        : ENDPOINTS.solicitudesCambioRol;
      const res = await authFormFetch(url, { method: solicitudId ? 'PATCH' : 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar solicitud');
      }
      const nuevo = await res.json();
      if (!solicitudId) setSolicitudId(nuevo.data ? nuevo.data.id : nuevo.id);

      setSolicitudEnviada(true);
      Swal.fire({
        icon: 'success',
        title: solicitudId ? '¡Solicitud actualizada!' : '¡Solicitud enviada!',
        text: 'Tu solicitud para ser Repartidor ha sido enviada y será revisada por un administrador.',
        confirmButtonColor: 'var(--verde-claro)',
      }).then(() => navigate('/perfil'));
    } catch (error) {
      console.error('Error al enviar solicitud de repartidor:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al procesar tu solicitud. Intentá de nuevo.', confirmButtonColor: 'var(--verde-claro)' });
    } finally { setSubmitting(false); }
  };

  /* ── Render helpers ── */
  const CheckSvg = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  if (loading) {
    return <div className="profile-page-loading"><p>Cargando formulario...</p></div>;
  }

  return (
    <div className="registro-delivery-page">
      <Navbar />
      <main className="registro-delivery-container">
        <div className="registro-delivery-card animate-fade">

          {/* Header */}
          <div className="profile-header">
            <div className="header-info">
              <h1>{role === 'Repartidor' ? 'Información de Repartidor' : 'Registro de Repartidor'}</h1>
              <p>Completá los datos de tu vehículo, documentos e información personal para que un administrador revise tu solicitud.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="delivery-stepper">
            <div className={`stepper-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="stepper-circle">{step > 1 ? '✓' : '1'}</div>
              <span className="stepper-label">Detalles del Vehículo</span>
            </div>
            <div className={`stepper-line ${step > 1 ? 'completed' : ''}`} />
            
            <div className={`stepper-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="stepper-circle">{step > 2 ? '✓' : '2'}</div>
              <span className="stepper-label">Documentos requeridos</span>
            </div>
            <div className={`stepper-line ${step > 2 ? 'completed' : ''}`} />
            
            <div className={`stepper-step ${step >= 3 ? 'active' : ''}`}>
              <div className="stepper-circle">3</div>
              <span className="stepper-label">Verificación y Contacto</span>
            </div>
          </div>

          {/* Banner */}
          {solicitudEnviada && (
            <div className="solicitud-status-banner pending">
              <span className="status-icon">⏳</span>
              <div>
                <strong>Solicitud pendiente de aprobación</strong>
                <p>Tu solicitud está siendo revisada por un administrador. Podés editar la información mientras tanto.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="registro-delivery-form">
            <div className="registro-delivery-grid">

              {/* ── STEP 1: Detalles del Vehículo (Paso 1/3) ── */}
              {step === 1 && (
                <>
                  <h3 className="form-section-title">
                    <span className="section-icon">🚗</span> Detalles del Vehículo (Paso 1/3)
                  </h3>

                  <div className="full-width vehicle-selection-subsection" style={{ marginBottom: '2rem', marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '1.25rem', textAlign: 'center' }}>
                      ¿Con qué vehículo realizarás las entregas?
                    </h4>
                    <div className="vehicle-cards-grid">
                      {VEHICLE_TYPES.map(vt => (
                        <div
                          key={vt.value}
                          className={`vehicle-card ${vehicleType === vt.value ? 'selected' : ''}`}
                          onClick={() => setVehicleType(vt.value)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="vehicle-card-check">✓</div>
                          <div className="vehicle-card-emoji">{vt.emoji}</div>
                          <div className="vehicle-card-label">{vt.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {vehicleType && (
                    <>
                      <h4 className="full-width" style={{ fontSize: '1rem', fontWeight: 600, color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem', marginTop: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span>📋</span> Especificaciones de {VEHICLE_TYPES.find(v => v.value === vehicleType)?.label}
                      </h4>


                    {/* Placa — for Carro & Moto */}
                    {(vehicleType === 'Carro' || vehicleType === 'Moto') && (
                      <div className="input-group">
                        <label>Número de Placa *</label>
                        <div className="input-box">
                          <span className="input-icon">🔢</span>
                          <input type="text" placeholder="Ej: ABC-123" value={licensePlate}
                            onChange={e => setLicensePlate(e.target.value.toUpperCase())} />
                        </div>
                      </div>
                    )}

                    {/* Placa — BiciMoto (optional) */}
                    {vehicleType === 'BiciMoto' && (
                      <div className="input-group full-width">
                        <label>Número de Placa (opcional, si aplica)</label>
                        <div className="input-box">
                          <span className="input-icon">🔢</span>
                          <input type="text" placeholder="Dejar vacío si no aplica" value={licensePlate}
                            onChange={e => setLicensePlate(e.target.value.toUpperCase())} />
                        </div>
                        <span className="input-hint">Si tu ciclomotor no requiere placa, podés dejar este campo vacío.</span>
                      </div>
                    )}

                    {/* Carro-specific fields */}
                    {vehicleType === 'Carro' && (
                      <>
                        <div className="input-group">
                          <label>Año del vehículo *</label>
                          <div className="input-box">
                            <span className="input-icon">📅</span>
                            <input type="number" placeholder="Ej: 2018" min={2000} max={currentYear}
                              value={anioVehiculo}
                              onChange={e => setAnioVehiculo(e.target.value.slice(0, 4))} />
                          </div>
                          {anioVehiculo && !anioValido && <span className="input-error">El año debe ser del 2000 en adelante y no mayor a {currentYear}.</span>}
                        </div>
                        <div className="input-group">
                          <label>Marca *</label>
                          <div className="input-box">
                            <span className="input-icon">🏭</span>
                            <input type="text" placeholder="Ej: Toyota" value={marca}
                              onChange={e => setMarca(e.target.value)} />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>Modelo *</label>
                          <div className="input-box">
                            <span className="input-icon">🚘</span>
                            <input type="text" placeholder="Ej: Corolla" value={modelo}
                              onChange={e => setModelo(e.target.value)} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Moto-specific fields */}
                    {vehicleType === 'Moto' && (
                      <>
                        <div className="input-group">
                          <label>Marca *</label>
                          <div className="input-box">
                            <span className="input-icon">🏭</span>
                            <input type="text" placeholder="Ej: Yamaha" value={marca}
                              onChange={e => setMarca(e.target.value)} />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>Modelo *</label>
                          <div className="input-box">
                            <span className="input-icon">🏍️</span>
                            <input type="text" placeholder="Ej: FZ 250" value={modelo}
                              onChange={e => setModelo(e.target.value)} />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Confirmaciones (Carro) */}
                    {vehicleType === 'Carro' && (
                      <>
                        <h3 className="form-section-title">
                          <span className="section-icon">✅</span> Confirmaciones del vehículo
                        </h3>
                        <div className="input-group full-width">
                          <div className="confirmations-grid">
                            {CARRO_CONFIRMATIONS.map(conf => (
                              <div key={conf.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label
                                  className={`confirmation-chip ${confirmations[conf.key] ? 'checked' : ''}`}>
                                  <input type="checkbox" checked={confirmations[conf.key]}
                                    onChange={() => setConfirmations(prev => ({ ...prev, [conf.key]: !prev[conf.key] }))} />
                                  <span className="confirm-check-box"><CheckSvg /></span>
                                  <span className="confirm-emoji">{conf.emoji}</span>
                                  <span className="confirm-label">{conf.label}</span>
                                </label>
                                {confirmations[conf.key] && (
                                  <div className="documents-upload-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                                    <DocumentUploader
                                      docKey={`evidencia_${conf.key}`}
                                      label={`Evidencia: ${conf.label}`}
                                      emoji="📸"
                                      fileData={confirmationEvidences[conf.key] || null}
                                      onFileChange={(k, v) => setConfirmationEvidences(prev => ({ ...prev, [conf.key]: v }))}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Confirmaciones (BiciMoto) */}
                    {vehicleType === 'BiciMoto' && (
                      <>
                        <h3 className="form-section-title">
                          <span className="section-icon">✅</span> Confirmaciones del vehículo
                        </h3>
                        <div className="input-group full-width">
                          <div className="confirmations-grid">
                            {BICIMOTO_CONFIRMATIONS.map(conf => (
                              <div key={conf.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label
                                  className={`confirmation-chip ${confirmations[conf.key] ? 'checked' : ''}`}>
                                  <input type="checkbox" checked={confirmations[conf.key]}
                                    onChange={() => setConfirmations(prev => ({ ...prev, [conf.key]: !prev[conf.key] }))} />
                                  <span className="confirm-check-box"><CheckSvg /></span>
                                  <span className="confirm-emoji">{conf.emoji}</span>
                                  <span className="confirm-label">{conf.label}</span>
                                </label>
                                {confirmations[conf.key] && (
                                  <div className="documents-upload-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                                    <DocumentUploader
                                      docKey={`evidencia_${conf.key}`}
                                      label={`Evidencia: ${conf.label}`}
                                      emoji="📸"
                                      fileData={confirmationEvidences[conf.key] || null}
                                      onFileChange={(k, v) => setConfirmationEvidences(prev => ({ ...prev, [conf.key]: v }))}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Confirmaciones (Bicicleta) */}
                    {vehicleType === 'Bicicleta' && (
                      <>
                        <h3 className="form-section-title">
                          <span className="section-icon">✅</span> Confirmaciones de la bicicleta
                        </h3>
                        <div className="input-group full-width">
                          <div className="confirmations-grid">
                            {BICI_CONFIRMATIONS.map(conf => (
                              <div key={conf.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label
                                  className={`confirmation-chip ${confirmations[conf.key] ? 'checked' : ''}`}>
                                  <input type="checkbox" checked={confirmations[conf.key]}
                                    onChange={() => setConfirmations(prev => ({ ...prev, [conf.key]: !prev[conf.key] }))} />
                                  <span className="confirm-check-box"><CheckSvg /></span>
                                  <span className="confirm-emoji">{conf.emoji}</span>
                                  <span className="confirm-label">{conf.label}</span>
                                </label>
                                {confirmations[conf.key] && (
                                  <div className="documents-upload-grid" style={{ gridTemplateColumns: '1fr', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                                    <DocumentUploader
                                      docKey={`evidencia_${conf.key}`}
                                      label={`Evidencia: ${conf.label}`}
                                      emoji="📸"
                                      fileData={confirmationEvidences[conf.key] || null}
                                      onFileChange={(k, v) => setConfirmationEvidences(prev => ({ ...prev, [conf.key]: v }))}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                    </>
                  )}
                  </>
                )}
                </>
              )}

                {/* ── STEP 2: Documentos Requeridos ── */}
                {step === 2 && (
                  <>
                    <h3 className="form-section-title">
                      <span className="section-icon">📂</span> Documentos Requeridos (Paso 2/3)
                    </h3>

                    {/* Documents (Carro) */}
                    {vehicleType === 'Carro' && (
                      <div className="input-group full-width">
                        <label>Subí cada documento en formato JPG, PNG, WebP o PDF</label>
                        <div className="documents-upload-grid">
                          {CARRO_DOCUMENTS.map(doc => (
                            <DocumentUploader
                              key={doc.key}
                              docKey={doc.key}
                              label={doc.label}
                              emoji={doc.emoji}
                              fileData={documents[doc.key]}
                              onFileChange={updateDocument}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents (Moto) */}
                    {vehicleType === 'Moto' && (
                      <div className="input-group full-width">
                        <label>Subí cada documento en formato JPG, PNG, WebP o PDF</label>
                        <div className="documents-upload-grid">
                          {MOTO_DOCUMENTS.map(doc => (
                            <DocumentUploader
                              key={doc.key}
                              docKey={doc.key}
                              label={doc.label}
                              emoji={doc.emoji}
                              fileData={documents[doc.key]}
                              onFileChange={updateDocument}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents (BiciMoto) */}
                    {vehicleType === 'BiciMoto' && (
                      <div className="input-group full-width">
                        <label>Subí cada documento en formato JPG, PNG, WebP o PDF</label>
                        <div className="documents-upload-grid">
                          {BICIMOTO_DOCUMENTS.map(doc => (
                            <DocumentUploader
                              key={doc.key}
                              docKey={doc.key}
                              label={doc.label}
                              emoji={doc.emoji}
                              fileData={documents[doc.key]}
                              onFileChange={updateDocument}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents (Bicicleta) */}
                    {vehicleType === 'Bicicleta' && (
                      <div className="input-group full-width">
                        <label>Subí cada documento en formato JPG, PNG, WebP o PDF</label>
                        <div className="documents-upload-grid">
                          {BICI_DOCUMENTS.map(doc => (
                            <DocumentUploader
                              key={doc.key}
                              docKey={doc.key}
                              label={doc.label}
                              emoji={doc.emoji}
                              fileData={documents[doc.key]}
                              onFileChange={updateDocument}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* ── STEP 3: Bolso, Identidad y Contacto ── */}
                {step === 3 && (
                  <>
                    <h3 className="form-section-title">
                      <span className="section-icon">🎒</span> Bolso oficial, Identidad y Contacto (Paso 3/3)
                    </h3>

                    {/* Bolso oficial (Carro, Moto & BiciMoto) */}
                    {(vehicleType === 'Carro' || vehicleType === 'Moto' || vehicleType === 'BiciMoto') && (
                      <div className="input-group full-width bolso-section">
                        <label className={`confirmation-chip ${bolsoConfirm ? 'checked' : ''}`}>
                          <input type="checkbox" checked={bolsoConfirm}
                            onChange={() => setBolsoConfirm(!bolsoConfirm)} />
                          <span className="confirm-check-box"><CheckSvg /></span>
                          <span className="confirm-emoji">🎒</span>
                          <span className="confirm-label">Confirmo que cuento con el bolso oficial para realizar entregas</span>
                        </label>

                        {bolsoConfirm && (
                          <div className="documents-upload-grid" style={{ marginTop: '1rem', gridTemplateColumns: '1fr' }}>
                            <DocumentUploader
                              docKey="bolsoFoto"
                              label="Foto del bolso oficial"
                              emoji="📷"
                              fileData={bolsoFoto}
                              onFileChange={(k, v) => setBolsoFoto(v)}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Identity verification */}
                    <div className="input-group full-width identity-selfie-section">
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Escanear tu Selfie de Identidad</h4>
                      <CameraCapture
                        label="Selfie de verificación"
                        fileData={identitySelfie}
                        onPhotoCaptured={setIdentitySelfie}
                      />
                    </div>

                    {/* Contact info */}
                    <h3 className="form-section-title">
                      <span className="section-icon">👤</span> Información de Contacto
                    </h3>

                    <div className="input-group">
                      <label>Nombre Completo *</label>
                      <div className="input-box">
                        <span className="input-icon">👤</span>
                        <input type="text" placeholder="Tu nombre" value={nombre}
                          onChange={e => setNombre(e.target.value)} />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Teléfono (8 dígitos) *</label>
                      <div className="input-box">
                        <span className="input-icon">📞</span>
                        <input type="tel" placeholder="Ej: 88888888" value={telefono}
                          onChange={e => setTelefono(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                          maxLength={8} />
                      </div>
                    </div>

                    <div className="input-group full-width">
                      <label>Correo Electrónico *</label>
                      <div className="input-box">
                        <span className="input-icon">✉️</span>
                        <input type="email" placeholder="tucorreo@ejemplo.com" value={email}
                          onChange={e => setEmail(e.target.value)} />
                      </div>
                    </div>
                  </>
                )}

              </div>

              {/* Actions */}
              <div className="registro-delivery-actions">
                {step === 1 && (
                  <>
                    <button type="button" className="save-btn" disabled={!vehicleType} onClick={handleGoToStep2}>
                      Continuar a Documentos →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <button type="button" className="back-step-btn" onClick={() => setStep(1)}>
                      ← Atrás (Detalles)
                    </button>
                    <button type="button" className="save-btn" onClick={handleGoToStep3}>
                      Continuar a Verificación →
                    </button>
                  </>
                )}

                {step === 3 && (
                  <>
                    <button type="button" className="back-step-btn" onClick={() => setStep(2)}>
                      ← Atrás (Documentos)
                    </button>
                    <button type="submit" className="save-btn" disabled={submitting}
                      style={submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                      {submitting ? 'Guardando...' : solicitudEnviada ? 'Actualizar solicitud' : 'Enviar solicitud de Repartidor'}
                    </button>
                  </>
                )}

                <button type="button" className="cancel-btn" onClick={() => navigate('/perfil')}>
                  Volver al perfil
                </button>
              </div>
            </form>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegistroDelivery;
