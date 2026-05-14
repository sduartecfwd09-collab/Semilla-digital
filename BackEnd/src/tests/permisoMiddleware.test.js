const { requirePermiso } = require('../middlewares/permisoMiddleware');
const permisoService = require('../services/permisoService');

// Mock del servicio
jest.mock('../services/permisoService');

describe('Middleware: permisoMiddleware (requirePermiso)', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      user: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('Debería retornar 401 si no hay req.user (no autenticado)', async () => {
    mockReq.user = undefined;
    const middleware = requirePermiso('usuarios.crear');
    await middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('no autenticado')
    }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('Debería permitir acceso si req.user.permisos incluye el permiso (Caché en JWT)', async () => {
    mockReq.user.permisos = ['usuarios.ver', 'usuarios.crear'];
    const middleware = requirePermiso('usuarios.crear');
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  test('Debería bloquear acceso si req.user.permisos NO incluye el permiso (Caché en JWT)', async () => {
    mockReq.user.permisos = ['usuarios.ver'];
    const middleware = requirePermiso('usuarios.crear');
    await middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining('Acceso denegado')
    }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('Debería permitir acceso verificando en BD si el JWT no tiene array de permisos (Fallback)', async () => {
    mockReq.user.roleId = 1; // ID de admin simulado
    permisoService.tienePermiso.mockResolvedValue(true); // Simulamos que el BD dice que sí

    const middleware = requirePermiso('productos.eliminar');
    await middleware(mockReq, mockRes, mockNext);

    expect(permisoService.tienePermiso).toHaveBeenCalledWith(1, 'productos.eliminar');
    expect(mockNext).toHaveBeenCalled();
  });

  test('Debería bloquear acceso verificando en BD si el usuario no tiene el permiso (Fallback)', async () => {
    mockReq.user.roleId = 3; // ID de usuario simulado
    permisoService.tienePermiso.mockResolvedValue(false); // Simulamos que la BD dice que no

    const middleware = requirePermiso('configuracion.gestionar');
    await middleware(mockReq, mockRes, mockNext);

    expect(permisoService.tienePermiso).toHaveBeenCalledWith(3, 'configuracion.gestionar');
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false
    }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('Debería permitir acceso si se requiere AL MENOS UNO de varios permisos y tiene uno', async () => {
    mockReq.user.roleId = 2; // ID de agricultor
    
    // Simulamos que el primer permiso no lo tiene, pero el segundo sí
    permisoService.tienePermiso
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    const middleware = requirePermiso('admin.super', 'productos.crear');
    await middleware(mockReq, mockRes, mockNext);

    expect(permisoService.tienePermiso).toHaveBeenCalledTimes(2);
    expect(mockNext).toHaveBeenCalled();
  });
});
