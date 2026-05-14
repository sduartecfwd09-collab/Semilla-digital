const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');
const { Usuario, Role, Permiso } = require('../models');
const permisoService = require('../services/permisoService');

// Mocks
jest.mock('../models');
jest.mock('../services/permisoService');

describe('Seguridad RBAC: Integración de Rutas y Middlewares', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  
  let adminToken;
  let userToken;

  beforeAll(() => {
    // Generar tokens de prueba
    adminToken = jwt.sign(
      { id: 1, email: 'admin@test.com', role: 'Administrador', roleId: 1, permisos: ['usuarios.ver', 'roles.ver', 'auditoria.ver'] },
      JWT_SECRET
    );
    userToken = jwt.sign(
      { id: 2, email: 'user@test.com', role: 'Usuario', roleId: 3, permisos: ['productos.ver'] },
      JWT_SECRET
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Acceso Protegido por Roles y Permisos', () => {
    
    test('GET /usuarios - Debería permitir acceso a un Administrador', async () => {
      Usuario.findAll = jest.fn().mockResolvedValue([]);

      const response = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      if (response.status !== 200) console.log('Error Body:', response.body);
      expect(response.status).toBe(200);
    });

    test('GET /usuarios - Debería denegar acceso (403) a un Usuario normal', async () => {
      const response = await request(app)
        .get('/usuarios')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('Acceso via Cookies - Debería permitir acceso si el token está en una cookie', async () => {
      Usuario.findAll = jest.fn().mockResolvedValue([]);
      
      const response = await request(app)
        .get('/usuarios')
        .set('Cookie', `agromap_token=${adminToken}`); // Formato string para supertest

      if (response.status !== 200) console.log('Cookie Test Failure Body:', response.body);
      expect(response.status).toBe(200);
    });
  });

  describe('JWT Validation', () => {
    test('Debería retornar 401 si no se envía token ni cookie', async () => {
      const response = await request(app).get('/usuarios');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('no se proporcionó');
    });

    test('Debería retornar 403 si el token es inválido/manipulado', async () => {
      // Usar un token que tenga el formato Bearer pero que sea inválido para JWT
      const response = await request(app)
        .get('/usuarios')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload');
      
      if (response.status !== 403) console.log('Invalid Token Failure Body:', response.body);
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('inválido');
    });
  });

});
