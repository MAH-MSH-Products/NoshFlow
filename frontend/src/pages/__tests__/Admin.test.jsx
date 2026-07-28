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
    });

    // Mock the initial fetch for the menu items
    const mockInitialFetch = () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                { _id: 'item1', title: 'Existing Pizza', price: 15.00 }
            ])
        });
    };

    it('Test 4.1: Initial Rendering - should fetch and display current menu', async () => {
        mockInitialFetch();
        render(<AdminDashboard />);

        // Wait for the mock menu item to appear on the screen
        await waitFor(() => {
            expect(screen.getByText('Existing Pizza')).toBeInTheDocument();
        });
    });

    it('Test 4.2: Menu Management - should submit FormData when adding a new item', async () => {
        // 1. Initial GET request for the menu
        mockInitialFetch();
        render(<AdminDashboard />);

        // 2. Mock the POST request for adding the item
        global.fetch.mockImplementationOnce((url, options) => {
            if (options && options.method === 'POST') {
                return Promise.resolve({ ok: true, json: async () => ({ message: 'Added' }) });
            }
            return Promise.resolve({ ok: true, json: async () => ([]) });
        });

        // 3. Fill out the form.
        // We use getByPlaceholderText because your component uses placeholders, not <label> tags.
        await waitFor(() => {
            fireEvent.change(screen.getByPlaceholderText(/Title/i), { target: { value: 'Test Burger' } });
            fireEvent.change(screen.getByPlaceholderText(/Price/i), { target: { value: '10.99' } });
            fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Delicious' } });
        });

        // 4. Click the submit button
        fireEvent.click(screen.getByRole('button', { name: /Save Item/i }));

        // 5. Verify the POST request was sent with a FormData object
        await waitFor(() => {
            const postCalls = global.fetch.mock.calls.filter(call => call[1] && call[1].method === 'POST');
            expect(postCalls.length).toBeGreaterThan(0);

            const postBody = postCalls[0][1].body;
            // Assert it's FormData
            expect(postBody instanceof FormData).toBe(true);
            expect(postBody.get('title')).toBe('Test Burger');
            expect(postBody.get('price')).toBe('10.99');
        });
    });

    it('Test 4.3: Item Deletion - should send DELETE request when removing an item', async () => {
        // 1. Initial GET request with one item
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ([
                { _id: 'item99', title: 'Bad Soup', price: 5.00 }
            ])
        });

        render(<AdminDashboard />);

        // 2. Mock the DELETE request
        global.fetch.mockImplementationOnce((url, options) => {
            if (options && options.method === 'DELETE') {
                return Promise.resolve({ ok: true, json: async () => ({ message: 'Deleted' }) });
            }
            return Promise.resolve({ ok: true, json: async () => ([]) });
        });

        // Wait for the item to render, then click its Delete button
        const deleteBtn = await screen.findByRole('button', { name: /Delete/i });
        fireEvent.click(deleteBtn);

        // Verify window.confirm was called and the DELETE request was sent to the right URL
        await waitFor(() => {
            expect(global.confirm).toHaveBeenCalledTimes(1);

            const deleteCalls = global.fetch.mock.calls.filter(call => call[1] && call[1].method === 'DELETE');
            expect(deleteCalls.length).toBeGreaterThan(0);
            expect(deleteCalls[0][0]).toContain('/api/menu/menu-items/item99');
        });
    });
});