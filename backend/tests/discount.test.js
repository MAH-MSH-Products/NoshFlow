import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';

let mongoServer;
let adminToken;
let customerToken;
let createdDiscountId;

describe('Suite 4: Discount APIs', () => {

    beforeAll(async () => {
        // Mocking working hours to avoid 403 closed errors if any route uses it
        process.env.OPENING_HOUR = '00:00';
        process.env.CLOSING_HOUR = '23:59';

        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
        const mmsOptions = { instance: { launchTimeout: 60000 } };
        if (!isCI) {
            mmsOptions.binary = { systemBinary: '/usr/bin/mongod' };
        }

        mongoServer = await MongoMemoryServer.create(mmsOptions);
        const mongoUri = mongoServer.getUri();

        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(mongoUri);
        await mongoose.connection.db.dropDatabase();

        // Seed Roles
        const roleSchema = new mongoose.Schema({ name: String }, { strict: false });
        const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
        await Role.insertMany([
            { name: 'Admin' }, { name: 'Customer' }
        ]);

        // Register Admin
        const adminRes = await request(app).post('/api/auth/register').send({
            name: 'Discount Admin', email: 'admin_disc@noshflow.com', password: 'pass', roleName: 'Admin'
        });
        adminToken = adminRes.body.token;

        // Register Customer
        const customerRes = await request(app).post('/api/auth/register').send({
            name: 'Discount Customer', email: 'customer_disc@noshflow.com', password: 'pass', roleName: 'Customer'
        });
        customerToken = customerRes.body.token;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('Test 4.1: Should allow Admin to create a new discount code', async () => {
        const res = await request(app)
            .post('/api/discounts')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                code: 'SUMMER20',
                discountPercentage: 20,
                maxUses: 100,
                // Setting expiration to next year
                expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.code).toBe('SUMMER20');

        createdDiscountId = res.body._id;
    });

    it('Test 4.2: Should reject Customer from creating a discount code (Forbidden)', async () => {
        const res = await request(app)
            .post('/api/discounts')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                code: 'HACK100',
                discountPercentage: 100,
                maxUses: 10,
                expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            });

        expect(res.status).toBe(403);
    });

    it('Test 4.3: Should allow Customer to validate an active discount code', async () => {
        const res = await request(app)
            .post('/api/discounts/validate')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ code: 'SUMMER20' });

        expect(res.status).toBe(200);
        expect(res.body.valid).toBe(true);
        expect(res.body.discountPercentage).toBe(20);
    });

    it('Test 4.4: Should return error for an invalid or non-existent discount code', async () => {
        const res = await request(app)
            .post('/api/discounts/validate')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ code: 'INVALIDCODE' });

        // Depending on backend implementation, it might be 400 or 404. Assuming 400.
        expect(res.status).toBe(400);
    });
});