/* eslint-disable no-console */
require('dotenv').config()

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')
const {
  sequelize,
  Role,
  Usuario,
  Feria,
  PuestoProductor,
  PuestoFeria,
  SolicitudCambioRol,
} = require('../src/models')
const { uploadFromPath, toAssetMetadata } = require('../src/services/cloudinaryService')
const { createMockProductorScenarios, qaEmails } = require('../src/utils/mockProductorFactory.ts')

type UploadedAsset = {
  key: string
  name: string
  safeName: string
  mimeType: string
  size: number
  secureUrl: string
  publicId: string
  resourceType: 'image' | 'raw' | 'video' | 'auto'
  format?: string
  bytes: number
  width?: number
  height?: number
  originalFilename: string
  uploadedAt: string
  status: 'success'
}

const ROOT = path.resolve(__dirname, '..')
const STORAGE_DIR = path.join(ROOT, 'storage', 'qa-assets')
const DOC_DIR = path.join(ROOT, 'mock-documents')
const IMG_DIR = path.join(ROOT, 'mock-images')
const PUBLIC_BASE = process.env.QA_ASSET_BASE_URL || `http://localhost:${process.env.PORT || 3002}/storage/qa-assets`
const PASSWORD = process.env.QA_SEED_PASSWORD || 'QaProductor2026!'

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.QA_UPLOAD_CLOUDINARY !== 'false'
)

const sanitizeName = (name: string) =>
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_.-]+/g, '_').slice(0, 90)

const ensureDirs = () => {
  for (const dir of [STORAGE_DIR, DOC_DIR, IMG_DIR]) fs.mkdirSync(dir, { recursive: true })
}

const createMockPdf = (filePath: string, text: string) => {
  const lines = text.split('\n')
  const stream = `BT /F1 18 Tf 72 740 Td (${escapePdf(lines[0])}) Tj ${lines.slice(1).map((line) => `0 -28 Td (${escapePdf(line)}) Tj`).join(' ')} ET`
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj) => {
    offsets.push(Buffer.byteLength(pdf))
    pdf += `${obj}\n`
  })
  const xref = Buffer.byteLength(pdf)
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  fs.writeFileSync(filePath, pdf)
}

const escapePdf = (value: string) => value.replace(/[()\\]/g, '\\$&')

const createMockPng = (filePath: string) => {
  const width = 600
  const height = 400
  const raw = Buffer.alloc((width * 3 + 1) * height)
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 3
      raw[offset] = 232
      raw[offset + 1] = x % 24 < 12 ? 245 : 238
      raw[offset + 2] = y % 24 < 12 ? 232 : 214
    }
  }
  fs.writeFileSync(filePath, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', Buffer.concat([u32(width), u32(height), Buffer.from([8, 2, 0, 0, 0])])),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]))
}

const u32 = (value: number) => {
  const buffer = Buffer.alloc(4)
  buffer.writeUInt32BE(value)
  return buffer
}

const pngChunk = (type: string, data: Buffer) => {
  const typeBuffer = Buffer.from(type)
  return Buffer.concat([u32(data.length), typeBuffer, data, u32(crc32(Buffer.concat([typeBuffer, data])))])
}

const crc32 = (buffer: Buffer) => {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1))
  }
  return (crc ^ 0xffffffff) >>> 0
}

const ensureAssetFile = (asset: { filename: string; mimeType: string; text: string }) => {
  const filename = sanitizeName(asset.filename)
  const targetDir = asset.mimeType === 'application/pdf' ? DOC_DIR : IMG_DIR
  const storagePath = path.join(STORAGE_DIR, filename)
  const mockPath = path.join(targetDir, filename)
  if (asset.mimeType === 'application/pdf') createMockPdf(mockPath, asset.text)
  else createMockPng(mockPath)
  fs.copyFileSync(mockPath, storagePath)
  return { filename, filePath: mockPath, storagePath }
}

const uploadOrFallback = async (asset: { key: string; filename: string; mimeType: string; text: string }): Promise<UploadedAsset> => {
  const { filename, filePath, storagePath } = ensureAssetFile(asset)
  const stat = fs.statSync(storagePath)

  if (hasCloudinary) {
    const result = await uploadFromPath(filePath, 'productores/qa', false)
    const metadata = toAssetMetadata(result, asset.mimeType)
    return normalizeAsset(asset.key, filename, asset.mimeType, stat.size, metadata)
  }

  return normalizeAsset(asset.key, filename, asset.mimeType, stat.size, {
    secureUrl: `${PUBLIC_BASE}/${filename}`,
    publicId: `local/qa-assets/${filename}`,
    resourceType: asset.mimeType === 'application/pdf' ? 'raw' : 'image',
    format: path.extname(filename).replace('.', ''),
    bytes: stat.size,
    width: asset.mimeType.startsWith('image/') ? 600 : undefined,
    height: asset.mimeType.startsWith('image/') ? 400 : undefined,
    originalFilename: filename,
    mimeType: asset.mimeType,
  })
}

const normalizeAsset = (
  key: string,
  filename: string,
  mimeType: string,
  size: number,
  metadata: any
): UploadedAsset => ({
  key,
  name: filename,
  safeName: filename,
  mimeType,
  size,
  secureUrl: metadata.secureUrl,
  publicId: metadata.publicId,
  resourceType: metadata.resourceType,
  format: metadata.format,
  bytes: metadata.bytes || size,
  width: metadata.width,
  height: metadata.height,
  originalFilename: metadata.originalFilename || filename,
  uploadedAt: new Date().toISOString(),
  status: 'success',
})

const buildDatosExtendidos = (scenario: any, documents: UploadedAsset[], fairId: number) => {
  const today = new Date()
  const issue = new Date(today)
  issue.setFullYear(issue.getFullYear() - 1)
  const expiry = new Date(today)
  expiry.setFullYear(expiry.getFullYear() + (scenario.magExpired ? -1 : 1))

  return {
    schemaVersion: 2,
    reviewStatus: scenario.reviewStatus,
    adminReviewRequired: scenario.reviewStatus === 'under_review',
    qaSeed: true,
    qaScenario: scenario.scenario,
    personalInfo: {
      fullName: scenario.fullName,
      idType: 'nacional',
      identification: scenario.cedula,
      birthDate: scenario.birthDate,
      gender: 'No especificado QA',
      nationality: 'Costarricense QA',
      phone: scenario.phone,
      secondaryPhone: `7${scenario.phone.slice(1)}`,
      email: scenario.email,
      province: scenario.province,
      canton: scenario.canton,
      district: scenario.district,
      exactAddress: `Direccion ficticia QA, ${scenario.district}, ${scenario.canton}`,
    },
    agriculturalInfo: {
      producerType: scenario.producerType,
      producesOwnProducts: scenario.scenario !== 'Artesanias',
      farmName: scenario.farmName,
      farmAddress: `Finca mock en ${scenario.canton}`,
      farmSize: scenario.farmSize,
      productionMethod: scenario.productionMethod,
      monthlyProduction: scenario.monthlyProduction,
      organic: scenario.scenario === 'Productor organico',
      harvest: 'Cosecha QA escalonada',
      productCategories: scenario.categories,
      mainProducts: scenario.mainProducts,
      agriculturalDescription: scenario.description,
    },
    standInfo: {
      standName: scenario.standName,
      description: scenario.description,
      fairId: String(fairId),
      standType: 'Mesa modular QA',
      dimensions: '3m x 2m',
      requiresElectricity: scenario.requiresElectricity,
      requiresWater: scenario.requiresWater,
      acceptsRules: true,
      floorFeeAccepted: true,
      scheduleNotes: 'Sabados 6:00 a.m. a 1:00 p.m.',
      socialMedia: `@${scenario.standName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    },
    documentation: {
      hasMagRegistration: scenario.hasMagRegistration,
      magRegistrationNumber: scenario.hasMagRegistration ? `MAG-QA-2026-${scenario.cedula.slice(-3)}` : '',
      magIssueDate: issue.toISOString().slice(0, 10),
      magExpiryDate: expiry.toISOString().slice(0, 10),
      documents,
      adminReview: {
        status: scenario.reviewStatus,
        observations: scenario.status === 'Rechazada' ? 'Mock QA: documento inconsistente para validar rechazo.' : '',
        missingDocuments: scenario.incomplete ? ['manipulacion_alimentos'] : [],
      },
    },
    sanitaryInfo: {
      hasFoodHandlerCard: scenario.sanitaryComplete,
      foodHandlerCardNumber: scenario.sanitaryComplete ? `MAN-QA-${scenario.cedula.slice(-4)}` : '',
      foodHandlerIssueDate: issue.toISOString().slice(0, 10),
      foodHandlerExpiryDate: expiry.toISOString().slice(0, 10),
      healthPermitNumber: scenario.sanitaryComplete ? `MS-QA-${scenario.cedula.slice(-4)}` : '',
      senasaRegistration: scenario.sanitaryComplete ? `SENASA-QA-${scenario.cedula.slice(-4)}` : '',
      coldChainRequired: scenario.requiresElectricity,
      coldChainDescription: scenario.requiresElectricity ? 'Refrigeracion QA con hieleras certificadas mock.' : '',
    },
    taxInfo: {
      regime: scenario.taxRegime,
      taxNumber: scenario.taxRegime === 'no_inscrito' ? '' : `TRIB-QA-${scenario.cedula}`,
    },
    qualityInfo: {
      freshProduct: true,
      pestFree: scenario.scenario !== 'Productor rechazado',
      labeling: scenario.scenario !== 'Datos incompletos',
      packaging: 'Empaque mock reutilizable para QA',
    },
    confirmation: {
      swornDeclaration: true,
      adminReviewRequired: scenario.reviewStatus === 'under_review',
      observations: `Seed QA: ${scenario.scenario}`,
    },
  }
}

const ensureRole = async (nombre: string, transaction: any) => {
  const [role] = await Role.findOrCreate({
    where: { nombre },
    defaults: { nombre, descripcion: `Rol ${nombre}` },
    transaction,
  })
  return role
}

const ensureFairs = async (transaction: any) => {
  const fairNames = [
    'Feria QA Zapote',
    'Feria QA Alajuela Centro',
    'Feria QA Cartago Agricola',
    'Feria QA Heredia Norte',
  ]
  const fairs = []
  for (const nombre of fairNames) {
    const [feria] = await Feria.findOrCreate({
      where: { nombre },
      defaults: { nombre, dias: 'Sabado', horario: '06:00-13:00', source: 'qa-seed' },
      transaction,
    })
    fairs.push(feria)
  }
  return fairs
}

const cleanupQaData = async (transaction: any) => {
  const users = await Usuario.findAll({ where: { email: { [Op.in]: qaEmails } }, attributes: ['id'], transaction })
  const userIds = users.map((user: any) => user.id)
  if (!userIds.length) return
  const puestos = await PuestoProductor.findAll({ where: { usuario_id: { [Op.in]: userIds } }, attributes: ['id'], transaction })
  const puestoIds = puestos.map((puesto: any) => puesto.id)
  if (puestoIds.length) await PuestoFeria.destroy({ where: { puesto_id: { [Op.in]: puestoIds } }, transaction })
  await SolicitudCambioRol.destroy({ where: { usuario_id: { [Op.in]: userIds } }, transaction })
  await PuestoProductor.destroy({ where: { usuario_id: { [Op.in]: userIds } }, transaction })
  await Usuario.destroy({ where: { id: { [Op.in]: userIds } }, transaction })
}

const seed = async () => {
  ensureDirs()
  await sequelize.authenticate()
  const transaction = await sequelize.transaction()
  try {
    await cleanupQaData(transaction)
    const usuarioRole = await ensureRole('Usuario', transaction)
    const productorRole = await ensureRole('Productor', transaction)
    const fairs = await ensureFairs(transaction)
    const scenarios = createMockProductorScenarios()
    const password = await bcrypt.hash(PASSWORD, 12)

    for (let index = 0; index < scenarios.length; index += 1) {
      const scenario = scenarios[index]
      const role = scenario.roleAfterSeed === 'Productor' ? productorRole : usuarioRole
      const fair = fairs[index % fairs.length]
      const documents = []
      for (const asset of scenario.assets) documents.push(await uploadOrFallback(asset))
      const datosExtendidos = buildDatosExtendidos(scenario, documents, fair.id)

      const user = await Usuario.create({
        name: scenario.fullName,
        nombre: scenario.fullName,
        email: scenario.email,
        password,
        roleId: role.id,
        status: 'Activo',
        avatar: documents.find((doc) => doc.key === 'foto_puesto')?.secureUrl || null,
        feriaId: fair.id,
        puesto_info: {
          qaSeed: true,
          scenario: scenario.scenario,
          telefono: scenario.phone,
          cedula: scenario.cedula,
        },
      }, { transaction })

      const puesto = await PuestoProductor.create({
        usuario_id: user.id,
        feria_id: fair.id,
        nombre_puesto: scenario.standName,
        descripcion: scenario.description,
        telefono: scenario.phone,
        email: scenario.email,
        horarios: 'Sabados 6:00 a.m. a 1:00 p.m.',
        horarios_list: ['Sabado 06:00-13:00'],
        tipos_producto: scenario.categories,
        metodos_cultivo: scenario.productionMethod,
        redes_sociales: datosExtendidos.standInfo.socialMedia,
        fotos_nombres: documents.filter((doc) => doc.key === 'foto_puesto').map((doc) => doc.safeName),
        datos_extendidos: datosExtendidos,
        fecha_registro: new Date(),
      }, { transaction })

      await PuestoFeria.create({ puesto_id: puesto.id, feria_id: fair.id }, { transaction })
      if (scenario.multipleFairs) {
        await PuestoFeria.create({ puesto_id: puesto.id, feria_id: fairs[(index + 1) % fairs.length].id }, { transaction })
      }

      await SolicitudCambioRol.create({
        usuario_id: user.id,
        nombre_usuario: scenario.fullName,
        nombre_del_puesto: scenario.standName,
        correo_usuario: scenario.email,
        rol_solicitado: 'Productor',
        estado: scenario.status,
        fecha_solicitud: new Date(),
        motivo_respuesta: scenario.status === 'Rechazada'
          ? 'Mock QA: rechazo para pruebas de dashboard y reenvio documental.'
          : scenario.status === 'Aprobada'
            ? 'Mock QA: aprobado para pruebas de permisos.'
            : 'Mock QA: pendiente para revision administrativa.',
        fecha_respuesta: scenario.status === 'Pendiente' ? null : new Date(),
        documentos_rutas: documents.reduce((acc: Record<string, string>, doc: UploadedAsset) => {
          acc[doc.key] = doc.secureUrl
          return acc
        }, {}),
      }, { transaction })

      console.log(`QA productor ${index + 1}/15: ${scenario.email} - ${scenario.scenario}`)
    }

    await transaction.commit()
    console.log(`\nSeed QA completado. Password comun: ${PASSWORD}`)
    console.log(`Assets: ${hasCloudinary ? 'Cloudinary' : `fallback local ${PUBLIC_BASE}`}`)
  } catch (error) {
    await transaction.rollback()
    throw error
  } finally {
    await sequelize.close()
  }
}

if (process.argv.includes('--dry-run')) {
  ensureDirs()
  const scenarios = createMockProductorScenarios()
  scenarios.forEach((scenario: any) => scenario.assets.forEach(ensureAssetFile))
  console.log(`Dry run QA: ${scenarios.length} productores generados.`)
  console.log(`Primer correo: ${scenarios[0].email}`)
  console.log(`Mock documents: ${DOC_DIR}`)
  console.log(`Mock images: ${IMG_DIR}`)
  console.log(`Cloudinary: ${hasCloudinary ? 'activo' : 'fallback local'}`)
  process.exit(0)
}

seed().catch((error: Error) => {
  console.error('Seed QA fallo:', error.message)
  process.exit(1)
})
