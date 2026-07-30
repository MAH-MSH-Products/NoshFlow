import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KitchenDashboard from '../KitchenDashboard';
import CashierDashboard from '../CashierDashboard';

// Mock global fetch
global.fetch = vi.fn();

describe('Suite 3: Staff Dashboards', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'fake-staff-token');

        // Mock window.alert to prevent tests from hanging if an alert pops up
        global.alert = vi.fn();
    });

    it('Test 3.1: Kitchen Order Rendering - should fetch and categorize orders', async () => {
        // Mock backend response for kitchen orders
        const mockKitchenOrders = [
            {
                _id: 'order1',
                status: 'pending',
                createdAt: new Date().toISOString(),
                items: [{ quantity: 2, menuItem: { title: 'Burger' } }]
            },
            {
                _id: 'order2',
                status: 'preparing',
                createdAt: new Date().toISOString(),
                items: [{ quantity: 1, menuItem: { title: 'Pizza' } }]
            }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockKitchenOrders,
        });

        render(<KitchenDashboard />);

        // Wait for the data to load and check if both items are rendered
        await waitFor(() => {
            // Check for order IDs (slice(-6) logic in your component)
            expect(screen.getByText(/#order1/i)).toBeInTheDocument();
            expect(screen.getByText(/#order2/i)).toBeInTheDocument();

            // Check for food titles
            expect(screen.getByText(/2x/i)).toBeInTheDocument();
            expect(screen.getByText(/Burger/i)).toBeInTheDocument();
            expect(screen.getByText(/Pizza/i)).toBeInTheDocument();
        });
    });

    it('Test 3.2: Status Progression - should send PATCH request when starting preparation', async () => {
        const mockPendingOrder = [
            {
                _id: 'order123',
                status: 'pending',
                createdAt: new Date().toISOString(),
                items: [{ quantity: 1, menuItem: { title: 'Pasta' } }]
            }
        ];

        // First fetch gets the pending order
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockPendingOrder,
        });

        render(<KitchenDashboard />);

        // Wait for the button to appear
        const startBtn = await screen.findByRole('button', { name: /Start Preparing/i });

        // Mock the PATCH request for when the button is clicked
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Status updated' }),
        });

        // Click the button
        fireEvent.click(startBtn);

        // Verify the correct PATCH request was sent
        await waitFor(() => {
            // fetch should have been called twice (once for GET, once for PATCH)
            expect(global.fetch).toHaveBeenCalledTimes(2);

            const patchCallArgs = global.fetch.mock.calls[1]; // The second call
            const patchUrl = patchCallArgs[0];
            const patchOptions = patchCallArgs[1];

            expect(patchUrl).toBe('http://127.0.0.1:5000/api/orders/order123/start');
            expect(patchOptions.method).toBe('PATCH');
        });
    });

    it('Test 3.3: Cashier Delivery - should fetch ready orders and complete them', async () => {
        const mockCashierOrders = [
            {
                _id: 'order456',
                status: 'ready',
                user: 'user789',
                totalPrice: 45.50,
                items: [{ quantity: 1, menuItem: { title: 'Cola' } }]
            }
        ];

        // Mock GET request
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockCashierOrders,
        });

        render(<CashierDashboard />); // ✅ Correct component

        // Wait for the delivery button
        const deliverBtn = await screen.findByRole('button', { name: /Deliver & Complete/i });

        // Mock PATCH request for completion
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Order completed' }),
        });

        fireEvent.click(deliverBtn);

        // Verify the correct PATCH request was sent
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);

            const patchCallArgs = global.fetch.mock.calls[1];
            expect(patchCallArgs[0]).toBe('http://127.0.0.1:5000/api/orders/order456/deliver');
            expect(patchCallArgs[1].method).toBe('PATCH');
        });
    });
});