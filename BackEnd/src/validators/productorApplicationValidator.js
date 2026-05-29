const SANITARY_CATEGORIES = new Set(['lacteos', 'carnes', 'embutidos', 'preparados', 'conservas', 'procesados']);
const VALID_STATUSES = new Set(['draft', 'pending', 'under_review', 'approved', 'rejected']);
const VALID_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const clean = (value) => String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
const hasSanitaryRisk = (categories = []) => categories.some((category) => SANITARY_CATEGORIES.has(category));

const validateId = (type, id) => {
  if (type === 'nacional') return /^\d{9}$/.test(id);
  if (type === 'dimex') return /^\d{11,12}$/.test(id);
  if (type === 'nite') return /^\d{10}$/.test(id);
  return false;
};

const calculateAge = (birthDate) => {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
};

const validateDocument = (doc) => {
  if (!isObject(doc)) return 'Documento invalido';
  if (!VALID_MIME.has(doc.mimeType)) return `Tipo MIME no permitido: ${doc.mimeType || 'desconocido'}`;
  if (Number(doc.bytes || doc.size) > MAX_FILE_SIZE) return `Archivo excede 5MB: ${doc.name || doc.key}`;
  if (!/^https:\/\/res\.cloudinary\.com\//.test(String(doc.secureUrl || ''))) {
    return `URL Cloudinary invalida: ${doc.name || doc.key}`;
  }
  if (!clean(doc.publicId)) return `Public ID requerido: ${doc.name || doc.key}`;
  return null;
};

const validateProductorApplication = (datosExtendidos) => {
  if (!isObject(datosExtendidos) || datosExtendidos.schemaVersion !== 2) return [];

  const errors = [];
  const personal = datosExtendidos.personalInfo || {};
  const agricultural = datosExtendidos.agriculturalInfo || {};
  const stand = datosExtendidos.standInfo || {};
  const docs = datosExtendidos.documentation || {};
  const sanitary = datosExtendidos.sanitaryInfo || {};
  const tax = datosExtendidos.taxInfo || {};
  const confirmation = datosExtendidos.confirmation || {};
  const documents = Array.isArray(docs.documents) ? docs.documents : [];
  const categories = Array.isArray(agricultural.productCategories) ? agricultural.productCategories : [];

  if (!VALID_STATUSES.has(datosExtendidos.reviewStatus || 'pending')) errors.push('Estado de revision invalido');
  if (!clean(personal.fullName)) errors.push('Nombre completo requerido');
  if (!validateId(personal.idType, clean(personal.identification))) errors.push('Identificacion invalida');
  if (calculateAge(personal.birthDate) < 18) errors.push('El productor debe ser mayor de edad');
  if (!/^\d{8}$/.test(clean(personal.phone))) errors.push('Telefono invalido');
  if (personal.secondaryPhone && !/^\d{8}$/.test(clean(personal.secondaryPhone))) errors.push('Telefono secundario invalido');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(personal.email))) errors.push('Correo invalido');
  if (!clean(personal.exactAddress)) errors.push('Direccion exacta requerida');

  if (!['directo', 'familiar', 'cooperativa', 'asociacion'].includes(agricultural.producerType)) errors.push('Tipo de productor invalido');
  if (categories.length === 0) errors.push('Debe seleccionar categorias de producto');
  if (!clean(agricultural.mainProducts)) errors.push('Productos principales requeridos');

  if (!clean(stand.standName)) errors.push('Nombre del puesto requerido');
  if (!clean(stand.description)) errors.push('Descripcion del puesto requerida');
  if (!clean(stand.fairId)) errors.push('Feria requerida');

  const requiredDocs = new Set(['identificacion', 'foto_puesto']);
  if (docs.hasMagRegistration) requiredDocs.add('registro_mag');
  if (hasSanitaryRisk(categories)) requiredDocs.add('manipulacion_alimentos');
  const present = new Set(documents.map((doc) => doc.key));
  requiredDocs.forEach((key) => {
    if (!present.has(key)) errors.push(`Documento requerido faltante: ${key}`);
  });
  documents.forEach((doc) => {
    const error = validateDocument(doc);
    if (error) errors.push(error);
  });

  if (docs.hasMagRegistration) {
    if (!clean(docs.magRegistrationNumber)) errors.push('Numero de registro MAG requerido');
    if (docs.magIssueDate && docs.magExpiryDate && new Date(docs.magExpiryDate) <= new Date(docs.magIssueDate)) {
      errors.push('Vencimiento MAG debe ser posterior a emision');
    }
  }

  if (hasSanitaryRisk(categories)) {
    if (!sanitary.hasFoodHandlerCard) errors.push('Carne de manipulacion requerido por categoria');
    if (sanitary.foodHandlerIssueDate && sanitary.foodHandlerExpiryDate && new Date(sanitary.foodHandlerExpiryDate) <= new Date(sanitary.foodHandlerIssueDate)) {
      errors.push('Vencimiento sanitario debe ser posterior a emision');
    }
  }

  if (tax.regime && tax.regime !== 'no_inscrito' && !clean(tax.taxNumber)) errors.push('Numero tributario requerido');
  if (!confirmation.swornDeclaration) errors.push('Declaracion jurada requerida');

  return errors;
};

module.exports = { validateProductorApplication };
