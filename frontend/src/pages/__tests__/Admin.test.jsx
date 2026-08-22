import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '../AdminDashboard';

// Mock global functions
global.fetch = vi.fn();
global.alert = vi.fn();
global.confirm = vi.fn(() => true);

describe('Suite 4: Admin Panel', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.setItem('token', 'fake-admin-token');
        
        // Mock all fetch calls globally using mockImplementation
        global.fetch.mockImplementation((url) => {
            if (url.includes('/categories')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ([{ _id: 'cat1', name: 'Pizza' }])
                });
            }
            if (url.includes('/menu-items') && !url.includes('/menu-items/')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ([
                        { _id: 'item1', name: 'Existing Pizza', title: 'Existing Pizza', price: 15.00, stock: 10, category: { _id: 'cat1', name: 'Pizza' } }
                    ])
                });
            }
            if (url.includes('/users')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ([])
                });
            }
            if (url.includes('/roles')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ([{ _id: 'role1', name: 'Admin' }])
                });
            }
            if (url.includes('/stats')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ totalOrders: 0, totalRevenue: 0, chartData: [] })
                });
            }
            if (url.includes('/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ isForceOpen: false })
                });
            }
            if (url.includes('/discounts')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ([])
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => ({})
            });
        });
    });

    it('Test 4.1: Initial Rendering - should fetch and display current menu', async () => {
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(screen.getByText(/Existing Pizza/i)).toBeInTheDocument();
        });
    });

    it('Test 4.2: Menu Management - should submit FormData when adding a new item', async () => {
        render(<AdminDashboard />);

        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'Test Burger' } });
            fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '10.99' } });
            fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Delicious' } });
        });

        const addBtn = screen.getByRole('button', { name: /Add Menu Item/i });
        fireEvent.click(addBtn);

        await waitFor(() => {
            const postCalls = global.fetch.mock.calls.filter(call => call[1]?.method === 'POST');
            expect(postCalls.length).toBeGreaterThan(0);

            const postBody = postCalls[0][1].body;
            expect(postBody instanceof FormData).toBe(true);
            expect(postBody.get('title')).toBe('Test Burger');
            expect(postBody.get('price')).toBe('10.99');
        });
    });

    it('Test 4.3: Item Deletion - should send DELETE request when removing an item', async () => {
        render(<AdminDashboard />);

        await waitFor(() => {
            const deleteBtn = screen.getByRole('button', { name: /Delete/i });
            fireEvent.click(deleteBtn);
        });

        await waitFor(() => {
            expect(global.confirm).toHaveBeenCalled();
            const deleteCalls = global.fetch.mock.calls.filter(call => call[1]?.method === 'DELETE');
            expect(deleteCalls.length).toBeGreaterThan(0);
        });
    });
});