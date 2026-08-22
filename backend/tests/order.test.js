import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server.js';

let mongoServer;
let customerToken;
let adminToken;
let seededMenuItemId;

describe('Suite 3: Customer Order APIs', () => {

    beforeAll(async () => {
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

        const roleSchema = new mongoose.Schema({ name: String }, { strict: false });
        const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
        await Role.insertMany([
            { name: 'Admin' }, { name: 'Customer' }, { name: 'Kitchen Staff' }, { name: 'Cashier' }
        ]);

        const adminRes = await request(app).post('/api/auth/register').send({
            name: 'Order Admin', email: 'admin_order@noshflow.com', password: 'pass', roleName: 'Admin'
        });
        adminToken = adminRes.body.token;

        const customerRes = await request(app).post('/api/auth/register').send({
            name: 'Order Customer', email: 'customer_order@noshflow.com', password: 'pass', roleName: 'Customer'
        });
        customerToken = customerRes.body.token;

        const categorySchema = new mongoose.Schema({ name: String }, { strict: false });
        const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
        const testCategory = await Category.create({ name: 'Main Course' });

        const menuRes = await request(app)
            .post('/api/menu/menu-items')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: 'Test Burger',
                description: 'A juicy test burger',
                price: 15.99,
                stock: 10,
                category: testCategory._id.toString()
            });

        seededMenuItemId = menuRes.body._id || menuRes.body.data?._id;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });


    it('Test 3.1: Should allow a Customer to place an order successfully', async () => {
        const orderRes = await request(app)
            .post('/api/orders')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                items: [
                    {
                        menuItemId: seededMenuItemId,
                        quantity: 2
                    }
                ],
            });

        expect(orderRes.status).toBe(201);
        expect(orderRes.body).toHaveProperty('_id');
        expect(orderRes.body.totalPrice).toBe(31.98);
    });

    it('Test 3.2: Should reject order creation if no token is provided (Unauthorized)', async () => {
        const orderRes = await request(app)
            .post('/api/orders')
            .send({
                items: [{ menuItem: seededMenuItemId, quantity: 1 }],
                totalAmount: 15.99
            });

        expect(orderRes.status).toBe(401);
    });

    it('Test 3.3: Should allow Customer to fetch their own orders', async () => {
        const fetchRes = await request(app)
            .get('/api/orders/me')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(fetchRes.status).toBe(200);
        expect(Array.isArray(fetchRes.body)).toBe(true);
    });
});