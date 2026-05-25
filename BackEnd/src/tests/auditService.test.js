const auditService = require('../services/auditService');
const { AuditLog } = require('../models');

// Mock del modelo AuditLog de Sequelize
jest.mock('../models', () => {
  return {
    AuditLog: {
      create: jest.fn(),
      findAndCountAll: jest.fn()
    },
    Usuario: {}
  };
});

describe('Service: auditService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registrar()', () => {
    test('Debería crear un log de auditoría correctamente con todos los parámetros', async () => {
      AuditLog.create.mockResolvedValue({ id: 1 });
      
      const mockReq = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'user-agent': 'Mozilla/5.0'
        }
      };

      await auditService.registrar({
        usuarioId: 5,
        accion: 'ELIMINAR',
        recurso: 'productos',
        recursoId: 10,
        detalles: { reason: 'Obsoleto' },
        req: mockReq
      });

      expect(AuditLog.create).toHaveBeenCalledWith({
        usuario_id: 5,
        accion: 'ELIMINAR',
        recurso: 'productos',
        recurso_id: 10,
        detalles: { reason: 'Obsoleto' },
        ip: '192.168.1.1',
        user_agent: 'Mozilla/5.0'
      });
    });

    test('No debería fallar ni lanzar excepción si AuditLog.create falla (Graceful degradation)', async () => {
      // Forzamos un error en la base de datos
      AuditLog.create.mockRejectedValue(new Error('DB Connection Error'));
      
      // Espiamos console.error para ver si se llama
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // No debe lanzar excepción, debe manejarla y registrar en consola
      await expect(auditService.registrar({ accion: 'LOGIN', recurso: 'auth' })).resolves.not.toThrow();
      
      expect(consoleSpy).toHaveBeenCalledWith('⚠️ Error registrando audit log:', 'DB Connection Error');
      
      consoleSpy.mockRestore();
    });
  });

  describe('consultar()', () => {
    test('Debería retornar datos paginados correctamente', async () => {
      AuditLog.findAndCountAll.mockResolvedValue({
        count: 100,
        rows: [{ id: 1 }, { id: 2 }]
      });

      const result = await auditService.consultar({
        page: 2,
        limit: 10
      });

      expect(AuditLog.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        limit: 10,
        offset: 10, // (2 - 1) * 10
        order: [['created_at', 'DESC']]
      }));

      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }],
        pagination: {
          total: 100,
          page: 2,
          limit: 10,
          totalPages: 10
        }
      });
    });
  });
});
