const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Role = require('../models/Role');

let mongoServer;

describe('Suite 1: Authentication & Security APIs', () => {

    beforeAll(async () => {
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

        const mmsOptions = {
            instance: {
                launchTimeout: 60000
            }
        };

        if (!isCI) {
            mmsOptions.binary = {
                systemBinary: '/usr/bin/mongod'
            };
        }

        mongoServer = await MongoMemoryServer.create(mmsOptions);
        const mongoUri = mongoServer.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(mongoUri);

        await Role.create({ name: 'Customer' });
        await Role.create({ name: 'Admin' });
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('Test 1.1: Registration - should successfully register a new Customer and return a token', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                roleName: 'Customer'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
    });

    it('Test 1.2: Login - should login successfully with correct credentials', async () => {
        await request(app).post('/api/auth/register').send({
            name: 'Login Tester',
            email: 'login@example.com',
            password: 'password123',
            roleName: 'Customer'
        });

        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    it('Test 1.3: Security/Middleware - should reject access to protected routes without a token', async () => {
        const response = await request(app)
            .get('/api/auth/me');

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/token/i);
    });
});