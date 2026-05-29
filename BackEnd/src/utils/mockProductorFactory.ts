type EstadoSolicitud = 'Aprobada' | 'Pendiente' | 'Rechazada'
type ReviewStatus = 'approved' | 'pending' | 'under_review' | 'rejected'
type ProductCategory =
  | 'frutas'
  | 'verduras'
  | 'granos'
  | 'plantas'
  | 'lacteos'
  | 'carnes'
  | 'embutidos'
  | 'preparados'
  | 'conservas'
  | 'procesados'
  | 'otros'

interface MockAsset {
  key: string
  filename: string
  mimeType: string
  text: string
}

interface MockProductorScenario {
  scenario: string
  email: string
  fullName: string
  cedula: string
  phone: string
  birthDate: string
  province: string
  canton: string
  district: string
  producerType: 'directo' | 'familiar' | 'cooperativa' | 'asociacion'
  status: EstadoSolicitud
  reviewStatus: ReviewStatus
  roleAfterSeed: 'Usuario' | 'Productor'
  standName: string
  description: string
  categories: ProductCategory[]
  mainProducts: string
  farmName: string
  farmSize: string
  productionMethod: string
  monthlyProduction: string
  hasMagRegistration: boolean
  magExpired: boolean
  sanitaryComplete: boolean
  taxRegime: 'no_inscrito' | 'simplificado' | 'tradicional'
  incomplete: boolean
  multipleFairs: boolean
  requiresElectricity: boolean
  requiresWater: boolean
  assets: MockAsset[]
}

const requestedEmails = [
  'sarsteph03@gmail.com',
  'duartex.gene@gmail.com',
  'genesisdc009@gmail.com',
  'saraiduartec2007@gmail.com',
  'foxsusana6@gmail.com',
  'sduartecfwd09@gmail.com',
]

const generatedEmails = [
  'qa.productor.aprobado@agromap.test',
  'qa.productor.pendiente@agromap.test',
  'qa.productor.rechazado@agromap.test',
  'qa.organico@agromap.test',
  'qa.sinmag@agromap.test',
  'qa.vencidos@agromap.test',
  'qa.multiferia@agromap.test',
  'qa.sanitario@agromap.test',
  'qa.incompleto@agromap.test',
]

const names = [
  'Sofia Arias Mora',
  'Diego Duarte Campos',
  'Genesis Delgado Castro',
  'Sara Duarte Cordero',
  'Susana Flores Rojas',
  'Sebastian Duarte Fernandez',
  'Mariela Quiros Solano',
  'Alonso Vargas Brenes',
  'Paula Jimenez Chacon',
  'Rafael Mendez Araya',
  'Natalia Vega Urena',
  'Oscar Salazar Marin',
  'Valeria Paniagua Soto',
  'Mauricio Cordero Leiva',
  'Camila Rojas Alfaro',
]

const baseScenarios = [
  ['Productor aprobado', 'Aprobada', 'approved', 'Productor', ['frutas', 'verduras'], 'Hortalizas y frutas frescas'],
  ['Productor pendiente', 'Pendiente', 'pending', 'Usuario', ['granos'], 'Frijol, maiz y semillas'],
  ['Productor rechazado', 'Rechazada', 'rejected', 'Usuario', ['otros'], 'Artesanias rurales y plantas secas'],
  ['Productor organico', 'Aprobada', 'approved', 'Productor', ['verduras', 'frutas'], 'Canastas organicas'],
  ['Productor sin MAG', 'Pendiente', 'under_review', 'Usuario', ['plantas'], 'Plantas ornamentales'],
  ['Documentos vencidos', 'Pendiente', 'under_review', 'Usuario', ['lacteos'], 'Queso fresco y yogurt'],
  ['Multiples ferias', 'Aprobada', 'approved', 'Productor', ['frutas', 'procesados'], 'Mermeladas y frutas'],
  ['Sanitario completo', 'Aprobada', 'approved', 'Productor', ['carnes', 'embutidos'], 'Carnes y embutidos artesanales'],
  ['Datos incompletos', 'Pendiente', 'under_review', 'Usuario', ['verduras'], 'Lechuga y culantro'],
  ['Premium completo', 'Aprobada', 'approved', 'Productor', ['frutas', 'verduras', 'granos'], 'Productos premium de finca'],
  ['Agricola', 'Aprobada', 'approved', 'Productor', ['verduras'], 'Tuberculos y hortalizas'],
  ['Lacteos', 'Pendiente', 'under_review', 'Usuario', ['lacteos'], 'Leche, queso y natilla'],
  ['Carnicos', 'Pendiente', 'under_review', 'Usuario', ['carnes'], 'Cortes empacados'],
  ['Panaderia', 'Aprobada', 'approved', 'Productor', ['preparados'], 'Pan artesanal y reposteria'],
  ['Artesanias', 'Rechazada', 'rejected', 'Usuario', ['otros'], 'Artesanias decorativas'],
] as const

const provinces = [
  ['San Jose', 'Escazu', 'San Rafael'],
  ['Alajuela', 'San Ramon', 'Santiago'],
  ['Cartago', 'Oreamuno', 'San Rafael'],
  ['Heredia', 'Barva', 'San Pedro'],
  ['Guanacaste', 'Liberia', 'Canas Dulces'],
  ['Puntarenas', 'Esparza', 'San Juan Grande'],
  ['Limon', 'Guapiles', 'Rita'],
]

const sanitaryCategories = new Set<ProductCategory>(['lacteos', 'carnes', 'embutidos', 'preparados', 'conservas', 'procesados'])

const pad = (value: number) => String(value).padStart(3, '0')

const qaEmails = [...requestedEmails, ...generatedEmails]

const createMockProductorScenarios = (): MockProductorScenario[] =>
  baseScenarios.map((scenario, index) => {
    const [province, canton, district] = provinces[index % provinces.length]
    const categories = [...scenario[4]] as ProductCategory[]
    const requiresSanitary = categories.some((category) => sanitaryCategories.has(category))
    const incomplete = scenario[0] === 'Datos incompletos'
    const magExpired = scenario[0] === 'Documentos vencidos'
    const hasMagRegistration = !['Productor sin MAG', 'Datos incompletos'].includes(scenario[0])

    return {
      scenario: scenario[0],
      email: [...requestedEmails, ...generatedEmails][index],
      fullName: names[index],
      cedula: `10${pad(index + 1)}45${pad(index + 21)}`.slice(0, 9),
      phone: index === 8 ? '1234567' : `8${String(6200000 + index * 13791).slice(0, 7)}`,
      birthDate: `${1978 + (index % 20)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
      province,
      canton,
      district,
      producerType: index % 4 === 0 ? 'directo' : index % 4 === 1 ? 'familiar' : index % 4 === 2 ? 'cooperativa' : 'asociacion',
      status: scenario[1],
      reviewStatus: scenario[2],
      roleAfterSeed: scenario[3],
      standName: `Puesto QA ${scenario[0]}`,
      description: `DOCUMENTO MOCK PARA TESTING. ${scenario[0]} con datos ficticios para QA, OCR e IA. VALIDO SOLO EN ENTORNO QA.`,
      categories,
      mainProducts: scenario[5],
      farmName: `Finca QA ${index + 1}`,
      farmSize: `${1 + index * 0.7} ha`,
      productionMethod: scenario[0] === 'Productor organico' ? 'Organico certificado mock' : 'Buenas practicas agricolas QA',
      monthlyProduction: `${120 + index * 35} kg mensuales`,
      hasMagRegistration,
      magExpired,
      sanitaryComplete: requiresSanitary && !incomplete,
      taxRegime: index % 3 === 0 ? 'simplificado' : index % 3 === 1 ? 'tradicional' : 'no_inscrito',
      incomplete,
      multipleFairs: scenario[0] === 'Multiples ferias',
      requiresElectricity: requiresSanitary || scenario[0] === 'Panaderia',
      requiresWater: requiresSanitary,
      assets: buildAssetList(index, requiresSanitary, hasMagRegistration, incomplete),
    }
  })

const buildAssetList = (index: number, sanitary: boolean, mag: boolean, incomplete: boolean): MockAsset[] => {
  const id = `QA-2026-${pad(index + 1)}`
  const assets: MockAsset[] = [
    { key: 'identificacion', filename: `identificacion_${id}.pdf`, mimeType: 'application/pdf', text: `NOMBRE PRODUCTOR TEST ${id}\nDOCUMENTO MOCK PARA TESTING\nVALIDO SOLO EN ENTORNO QA` },
    { key: 'foto_puesto', filename: `puesto_${id}.png`, mimeType: 'image/png', text: `PUESTO PRODUCTOR TEST ${id}` },
    { key: 'certificacion_productor', filename: `certificacion_${id}.pdf`, mimeType: 'application/pdf', text: `CERTIFICACION PRODUCTOR TEST\nREGISTRO QA ${id}\nDOCUMENTO MOCK PARA TESTING` },
  ]
  if (mag) assets.push({ key: 'registro_mag', filename: `carnet_mag_${id}.pdf`, mimeType: 'application/pdf', text: `REGISTRO MAG ${id}\nDOCUMENTO MOCK PARA TESTING\nVALIDO SOLO EN ENTORNO QA` })
  if (sanitary && !incomplete) {
    assets.push({ key: 'manipulacion_alimentos', filename: `manipulacion_${id}.pdf`, mimeType: 'application/pdf', text: `MANIPULACION ALIMENTOS ${id}\nDOCUMENTO MOCK PARA TESTING` })
    assets.push({ key: 'senasa', filename: `senasa_${id}.pdf`, mimeType: 'application/pdf', text: `SENASA MOCK ${id}\nDOCUMENTO MOCK PARA TESTING` })
    assets.push({ key: 'permiso_salud', filename: `permiso_salud_${id}.pdf`, mimeType: 'application/pdf', text: `MINISTERIO SALUD MOCK ${id}\nDOCUMENTO MOCK PARA TESTING` })
  }
  return assets
}

module.exports = { createMockProductorScenarios, qaEmails }
