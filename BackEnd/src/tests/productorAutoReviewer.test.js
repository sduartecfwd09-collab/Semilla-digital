'use strict';

// Mocks de dependencias externas — el reviewer no debe tocar DB ni red.
jest.mock('../services/ai/groqService', () => ({ chat: jest.fn() }));
jest.mock('../services/emailService', () => ({ sendMail: jest.fn().mockResolvedValue({}) }));
jest.mock('../services/auditService', () => ({ registrar: jest.fn().mockResolvedValue({}) }));

const mockSolicitudService = {
  findById: jest.fn(),
  approve: jest.fn().mockResolvedValue({}),
  reject: jest.fn().mockResolvedValue({}),
};
jest.mock('../services/solicitudCambioRolService', () => mockSolicitudService);

const mockPuestoProductor = { findOne: jest.fn() };
jest.mock('../models', () => ({
  PuestoProductor: mockPuestoProductor,
}));

const groq = require('../services/ai/groqService');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');
const reviewer = require('../services/ai/productorAutoReviewer');

const solicitudPendienteProductor = {
  id: 42,
  usuarioId: 7,
  estado: 'Pendiente',
  rolSolicitado: 'Productor',
  nombreUsuario: 'Juan Pérez',
  correoUsuario: 'juan@example.com',
  nombreDelPuesto: 'Verduras del Valle',
};

const puestoCompleto = {
  toJSON: () => ({
    id: 100,
    usuario_id: 7,
    feria_id: 1,
    nombre_puesto: 'Verduras del Valle',
    descripcion: 'Venta de verduras orgánicas frescas cosechadas en finca propia.',
    telefono: '88887777',
    email: 'juan@example.com',
    horarios: 'Sábados 7-12',
    tipos_producto: ['Verduras', 'Hierbas'],
    metodos_cultivo: 'Agricultura orgánica certificada',
    fotos_base64: ['data:image/jpeg;base64,xx'],
    fotos_nombres: ['foto1.jpg'],
    datos_extendidos: {
      personal: {
        nombre: 'Juan',
        primerApellido: 'Pérez',
        cedula: '1-1234-5678',
        fechaNacimiento: '1985-05-10',
        provincia: 'Cartago',
        direccionExacta: 'Del parque 200m sur, casa verde',
      },
      produccion: { nombreFinca: 'Finca La Esperanza', descripcionAgricola: 'Cultivo orgánico' },
      mag: {},
      sanitario: { tieneManipulacionAlimentos: false },
      tributario: { numeroTributario: '123' },
      solicitudFeria: { aceptaReglamento: true, aceptaDerechoPiso: true },
      calidad: {},
      documentos: {
        foto_carnet_mag: '/path/mag.pdf',
        constancia_tributaria: '/path/trib.pdf',
      },
    },
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.AI_AUTO_REVIEW_ENABLED = 'true';
});

describe('productorAutoReviewer.review', () => {
  test('aprueba cuando pre-check pasa e IA responde aprobado=true', async () => {
    mockSolicitudService.findById.mockResolvedValue(solicitudPendienteProductor);
    mockPuestoProductor.findOne.mockResolvedValue(puestoCompleto);
    groq.chat.mockResolvedValue(JSON.stringify({
      aprobado: true,
      faltantes: [],
      resumen: 'Cumple todos los requisitos.',
    }));

    const result = await reviewer.review(42);

    expect(result.procesado).toBe(true);
    expect(result.decision.aprobado).toBe(true);
    expect(mockSolicitudService.approve).toHaveBeenCalledWith(42, expect.objectContaining({
      motivo_respuesta: expect.stringContaining('Cumple'),
    }));
    expect(mockSolicitudService.reject).not.toHaveBeenCalled();
    expect(emailService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'juan@example.com',
      subject: expect.stringContaining('aprobada'),
    }));
    expect(auditService.registrar).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'AI_REVIEW_APPROVE',
    }));
  });

  test('rechaza por pre-check sin llamar a la IA cuando faltan datos obligatorios', async () => {
    mockSolicitudService.findById.mockResolvedValue(solicitudPendienteProductor);
    const puestoIncompleto = {
      toJSON: () => ({
        ...puestoCompleto.toJSON(),
        nombre_puesto: '',
        telefono: '123',
        datos_extendidos: {
          ...puestoCompleto.toJSON().datos_extendidos,
          personal: { ...puestoCompleto.toJSON().datos_extendidos.personal, cedula: '' },
          solicitudFeria: { aceptaReglamento: false, aceptaDerechoPiso: false },
        },
      }),
    };
    mockPuestoProductor.findOne.mockResolvedValue(puestoIncompleto);

    const result = await reviewer.review(42);

    expect(result.procesado).toBe(true);
    expect(result.decision.aprobado).toBe(false);
    expect(result.decision.origen).toBe('pre-check');
    expect(groq.chat).not.toHaveBeenCalled();
    expect(mockSolicitudService.reject).toHaveBeenCalled();
    expect(emailService.sendMail).toHaveBeenCalledWith(expect.objectContaining({
      subject: expect.stringContaining('rechazada'),
    }));
    expect(auditService.registrar).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'AI_REVIEW_REJECT',
    }));
  });

  test('rechaza cuando la IA responde aprobado=false', async () => {
    mockSolicitudService.findById.mockResolvedValue(solicitudPendienteProductor);
    mockPuestoProductor.findOne.mockResolvedValue(puestoCompleto);
    groq.chat.mockResolvedValue(JSON.stringify({
      aprobado: false,
      faltantes: ['Descripción incoherente con actividad agrícola'],
      resumen: 'La descripción no corresponde a actividad agrícola.',
    }));

    const result = await reviewer.review(42);

    expect(result.decision.aprobado).toBe(false);
    expect(result.decision.origen).toBe('ia');
    expect(mockSolicitudService.reject).toHaveBeenCalled();
    expect(mockSolicitudService.approve).not.toHaveBeenCalled();
  });

  test('no procesa si la solicitud no es de rol Productor', async () => {
    mockSolicitudService.findById.mockResolvedValue({
      ...solicitudPendienteProductor,
      rolSolicitado: 'Repartidor',
    });

    const result = await reviewer.review(42);

    expect(result.procesado).toBe(false);
    expect(result.motivo).toMatch(/rol/i);
    expect(groq.chat).not.toHaveBeenCalled();
    expect(emailService.sendMail).not.toHaveBeenCalled();
  });

  test('idempotencia: no procesa si la solicitud ya no está Pendiente', async () => {
    mockSolicitudService.findById.mockResolvedValue({
      ...solicitudPendienteProductor,
      estado: 'Aprobada',
    });

    const result = await reviewer.review(42);

    expect(result.procesado).toBe(false);
    expect(mockSolicitudService.approve).not.toHaveBeenCalled();
    expect(mockSolicitudService.reject).not.toHaveBeenCalled();
  });

  test('si la IA falla, deja la solicitud Pendiente y registra AI_REVIEW_FAIL', async () => {
    mockSolicitudService.findById.mockResolvedValue(solicitudPendienteProductor);
    mockPuestoProductor.findOne.mockResolvedValue(puestoCompleto);
    groq.chat.mockRejectedValue(new Error('Groq HTTP 503'));

    const result = await reviewer.review(42);

    expect(result.procesado).toBe(false);
    expect(mockSolicitudService.approve).not.toHaveBeenCalled();
    expect(mockSolicitudService.reject).not.toHaveBeenCalled();
    expect(auditService.registrar).toHaveBeenCalledWith(expect.objectContaining({
      accion: 'AI_REVIEW_FAIL',
    }));
  });

  test('parsea respuesta IA con fences de markdown', async () => {
    mockSolicitudService.findById.mockResolvedValue(solicitudPendienteProductor);
    mockPuestoProductor.findOne.mockResolvedValue(puestoCompleto);
    groq.chat.mockResolvedValue('```json\n{"aprobado":true,"faltantes":[],"resumen":"OK"}\n```');

    const result = await reviewer.review(42);

    expect(result.decision.aprobado).toBe(true);
    expect(mockSolicitudService.approve).toHaveBeenCalled();
  });
});
