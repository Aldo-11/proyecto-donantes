const request = require('supertest');
const app = require('../app');

describe('Sistema de Donantes', () => {
  let adminToken;

  beforeAll(async () => {
    // Login como admin
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'admin123' });
    
    adminToken = response.body.token;
  });

  describe('Autenticación', () => {
    test('Login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'admin123' })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.username).toBe('admin');
    });

    test('Login fallido con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Gestión de Donantes', () => {
    test('Crear donante exitosamente', async () => {
      const timestamp = Date.now();
      const donorData = {
        name: 'Juan Pérez',
        email: `juan${timestamp}@example.com`, 
        blood_type: 'O+',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/donors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(donorData)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.donor.email).toBe(donorData.email);
    });

    test('Error al crear donante sin autenticación', async () => {
      const response = await request(app)
        .post('/api/donors')
        .send({ name: 'Test', email: 'test@example.com' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Obtener lista de donantes (solo admin)', async () => {
      const response = await request(app)
        .get('/api/donors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Validaciones', () => {
    test('Error al crear donante sin email', async () => {
      const response = await request(app)
        .post('/api/donors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Sin Email' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});