export const TIPOS_PRODUCTO = [
  'Verduras',
  'Frutas',
  'Hierbas',
  'Tubérculos',
  'Granos',
  'Proteína',
  'Lácteos',
  'Café',
  'Flores',
  'Plantas',
  'Huevos',
  'Carnes',
  'Mariscos',
  'Embutidos',
  'Miel',
  'Productos procesados',
  'Otros',
] as const;

export const TIPOS_SANITARIO_EXTRA = [
  'Lácteos',
  'Carnes',
  'Mariscos',
  'Embutidos',
  'Miel',
  'Productos procesados',
] as const;

export const PROVINCIAS_CR = [
  'San José',
  'Alajuela',
  'Cartago',
  'Heredia',
  'Guanacaste',
  'Puntarenas',
  'Limón',
];

export const REGIMENES_TRIBUTARIOS = [
  'Régimen Simplificado',
  'Régimen Especial Agropecuario',
  'Otro',
];

export const GENEROS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];

export const DOC_KEYS = [
  'foto_carnet_mag',
  'dictamen_tecnico',
  'certificacion_productor',
  'carnet_manipulacion',
  'constancia_tributaria',
  'certificacion_romana',
] as const;

export type DocKey = (typeof DOC_KEYS)[number];

export interface DocPreview {
  file: File;
  preview: string;
}

export interface PersonalData {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  cedula: string;
  fechaNacimiento: string;
  genero: string;
  nacionalidad: string;
  telefonoSecundario: string;
  provincia: string;
  canton: string;
  distrito: string;
  direccionExacta: string;
}

export interface ProduccionData {
  nombreFinca: string;
  tamanoFinca: string;
  direccionFinca: string;
  temporadasCosecha: string;
  produccionMensual: string;
  produccionOrganica: boolean;
  descripcionAgricola: string;
}

export interface MagData {
  numeroRegistroMag: string;
  carnetFeriante: string;
  fechaEmisionMag: string;
  fechaVencimientoMag: string;
  comiteFeriaAsociada: string;
}

export interface SanitarioData {
  tieneManipulacionAlimentos: boolean;
  numeroCarnetManipulacion: string;
  fechaEmisionManipulacion: string;
  fechaVencimientoManipulacion: string;
  institucionEmisora: string;
  permisoMinisterioSalud: string;
  registroSenasa: string;
  tieneRefrigeracion: boolean;
  tipoRefrigeracion: string;
}

export interface TributarioData {
  numeroTributario: string;
  regimenTributario: string;
}

export interface SolicitudFeriaData {
  comiteAdministrador: string;
  tipoPuesto: string;
  dimensionesPuesto: string;
  requiereElectricidad: boolean;
  requiereAgua: boolean;
  aceptaReglamento: boolean;
  aceptaDerechoPiso: boolean;
}

export interface CalidadData {
  productoFresco: boolean;
  productoLimpio: boolean;
  librePlagas: boolean;
  empaqueAdecuado: boolean;
  etiquetadoCorrecto: boolean;
}

export interface DatosExtendidos {
  personal: PersonalData;
  produccion: ProduccionData;
  mag: MagData;
  sanitario: SanitarioData;
  tributario: TributarioData;
  solicitudFeria: SolicitudFeriaData;
  calidad: CalidadData;
  documentos?: Record<string, string>;
  documentosNombres?: Record<string, string>;
}

export const emptyDatosExtendidos = (): DatosExtendidos => ({
  personal: {
    nombre: '',
    primerApellido: '',
    segundoApellido: '',
    cedula: '',
    fechaNacimiento: '',
    genero: '',
    nacionalidad: 'Costarricense',
    telefonoSecundario: '',
    provincia: '',
    canton: '',
    distrito: '',
    direccionExacta: '',
  },
  produccion: {
    nombreFinca: '',
    tamanoFinca: '',
    direccionFinca: '',
    temporadasCosecha: '',
    produccionMensual: '',
    produccionOrganica: false,
    descripcionAgricola: '',
  },
  mag: {
    numeroRegistroMag: '',
    carnetFeriante: '',
    fechaEmisionMag: '',
    fechaVencimientoMag: '',
    comiteFeriaAsociada: '',
  },
  sanitario: {
    tieneManipulacionAlimentos: false,
    numeroCarnetManipulacion: '',
    fechaEmisionManipulacion: '',
    fechaVencimientoManipulacion: '',
    institucionEmisora: '',
    permisoMinisterioSalud: '',
    registroSenasa: '',
    tieneRefrigeracion: false,
    tipoRefrigeracion: '',
  },
  tributario: {
    numeroTributario: '',
    regimenTributario: '',
  },
  solicitudFeria: {
    comiteAdministrador: '',
    tipoPuesto: '',
    dimensionesPuesto: '',
    requiereElectricidad: false,
    requiereAgua: false,
    aceptaReglamento: false,
    aceptaDerechoPiso: false,
  },
  calidad: {
    productoFresco: false,
    productoLimpio: false,
    librePlagas: false,
    empaqueAdecuado: false,
    etiquetadoCorrecto: false,
  },
  documentos: {},
  documentosNombres: {},
});

export const calcularEdad = (fechaNacimiento: string): number | null => {
  if (!fechaNacimiento) return null;
  const nac = new Date(fechaNacimiento);
  if (Number.isNaN(nac.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
  return edad >= 0 ? edad : null;
};

const soloLetras = (v: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v.trim());

export const requiereSanitarioExtra = (tipos: string[]) =>
  tipos.some((t) => TIPOS_SANITARIO_EXTRA.includes(t as (typeof TIPOS_SANITARIO_EXTRA)[number]));

export const hydrateDatosExtendidos = (raw: unknown): DatosExtendidos => {
  const base = emptyDatosExtendidos();
  if (!raw || typeof raw !== 'object') return base;
  const d = raw as Partial<DatosExtendidos>;
  return {
    personal: { ...base.personal, ...(d.personal || {}) },
    produccion: { ...base.produccion, ...(d.produccion || {}) },
    mag: { ...base.mag, ...(d.mag || {}) },
    sanitario: { ...base.sanitario, ...(d.sanitario || {}) },
    tributario: { ...base.tributario, ...(d.tributario || {}) },
    solicitudFeria: { ...base.solicitudFeria, ...(d.solicitudFeria || {}) },
    calidad: { ...base.calidad, ...(d.calidad || {}) },
    documentos: { ...(d.documentos || {}) },
    documentosNombres: { ...(d.documentosNombres || {}) },
  };
};

export const buildDocumentosPayload = (
  docs: Partial<Record<DocKey, DocPreview | null>>,
  existentes: Partial<Record<DocKey, string>>,
  prev: DatosExtendidos
) => {
  const documentos: Record<string, string> = { ...(prev.documentos || {}) };
  const documentosNombres: Record<string, string> = { ...(prev.documentosNombres || {}) };
  DOC_KEYS.forEach((key) => {
    const upload = docs[key];
    if (upload?.preview) {
      documentos[key] = upload.preview;
      documentosNombres[key] = upload.file.name;
    } else if (!existentes[key]) {
      delete documentos[key];
      delete documentosNombres[key];
    }
  });
  return { documentos, documentosNombres };
};

export interface ValidateContext {
  nombrePuesto: string;
  selectedFeriaId: string;
  descripcion: string;
  tiposProducto: string[];
  fotosCount: number;
  telefono: string;
  email: string;
  datos: DatosExtendidos;
  tiposSanitarioExtra: boolean;
}

export const validateRegistroProductor = (ctx: ValidateContext): string[] => {
  const faltantes: string[] = [];
  const { personal: p, solicitudFeria: sf } = ctx.datos;

  if (!p.nombre.trim()) faltantes.push('Nombre');
  if (!p.primerApellido.trim()) faltantes.push('Primer apellido');
  if (!p.cedula.trim()) faltantes.push('Cédula');
  if (!p.fechaNacimiento) faltantes.push('Fecha de nacimiento');
  if (!p.provincia.trim()) faltantes.push('Provincia');
  if (!p.direccionExacta.trim()) faltantes.push('Dirección exacta');

  if (p.nombre.trim() && !soloLetras(p.nombre)) faltantes.push('Nombre (solo letras)');
  if (p.primerApellido.trim() && !soloLetras(p.primerApellido)) faltantes.push('Primer apellido (solo letras)');
  if (p.segundoApellido.trim() && !soloLetras(p.segundoApellido)) faltantes.push('Segundo apellido (solo letras)');

  if (!ctx.nombrePuesto.trim()) faltantes.push('Nombre del puesto');
  if (!ctx.selectedFeriaId) faltantes.push('Feria');
  if (!ctx.descripcion.trim()) faltantes.push('Descripción');
  if (ctx.tiposProducto.length === 0) faltantes.push('Tipo de productos');
  if (ctx.fotosCount === 0) faltantes.push('Fotos del puesto');
  if (!ctx.telefono.trim()) faltantes.push('Teléfono');
  if (!sf.aceptaReglamento) faltantes.push('Aceptación de reglamento');
  if (!sf.aceptaDerechoPiso) faltantes.push('Aceptación de derecho de piso');

  return faltantes;
};
