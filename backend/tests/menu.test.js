import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../server.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let adminToken;
let customerToken;

describe('Suite 2: Menu & Uploads APIs', () => {

    beforeAll(async () => {
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
        const mmsOptions = {
            instance: { launchTimeout: 60000 }
        };
        if (!isCI) {
            mmsOptions.binary = {
                systemBinary: 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe'
            };
        }

        mongoServer = await MongoMemoryServer.create(mmsOptions);
        const mongoUri = mongoServer.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(mongoUri);

        await mongoose.connection.db.dropDatabase();

        const roleSchema = new mongoose.Schema({ name: String }, { strict: false });
        const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

        await Role.insertMany([
            { name: 'Admin' },
            { name: 'Customer' },
            { name: 'Kitchen Staff' },
            { name: 'Cashier' }
        ]);

        const adminRes = await request(app).post('/api/auth/register').send({
            name: 'Admin User',
            email: 'admin@noshflow.com',
            password: 'password123',
            roleName: 'Admin'
        });

        if (adminRes.status !== 201) {
            console.error("❌ Admin Registration Failed! Backend Response:", adminRes.body);
            throw new Error(`Admin registration failed with status ${adminRes.status}. Check logs.`);
        }
        adminToken = adminRes.body.token;

        const customerRes = await request(app).post('/api/auth/register').send({
            name: 'Normal Customer',
            email: 'customer@noshflow.com',
            password: 'password123',
            roleName: 'Customer'
        });

        if (customerRes.status !== 201) {
            console.error("❌ Customer Registration Failed! Backend Response:", customerRes.body);
            throw new Error(`Customer registration failed with status ${customerRes.status}. Check logs.`);
        }
        customerToken = customerRes.body.token;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        if (mongoServer) {
            await mongoServer.stop();
        }
    });

    it('Test 2.1: Fetch Menu - should return an empty array initially (or seeded data)', async () => {
        const response = await request(app).get('/api/menu/menu-items');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it('Test 2.2: Create Menu Item - Admin should successfully create an item with an image', async () => {
        const categoryRes = await request(app)
            .post('/api/menu/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Main Course',
                description: 'Delicious main dishes'
            });

        expect(categoryRes.status).toBe(201);

        const realCategoryId = categoryRes.body._id || categoryRes.body.data._id;

        const response = await request(app)
            .post('/api/menu/menu-items')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('name', 'Classic Burger')
            .field('price', 12.99)
            .field('description', 'Delicious beef burger with cheese')
            .field('category', realCategoryId)
            .attach('image', Buffer.from('fake-image-content'), 'burger.jpg');

        if (response.status !== 201) {
            console.error("❌ Menu Item Creation Failed! Backend Response:", response.body);
        }

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe('Classic Burger');
    });

    it('Test 2.3: Authorization - Customer should NOT be able to create a menu item', async () => {
        const response = await request(app)
            .post('/api/menu/menu-items')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                name: 'Hacked Burger',
                price: 1.99
            });

        expect([401, 403]).toContain(response.status);
    });
});