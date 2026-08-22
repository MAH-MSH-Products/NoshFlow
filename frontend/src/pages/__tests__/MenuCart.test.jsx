import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Menu from '../Menu';
import Cart from '../Cart';
import { CartProvider, useCart } from '../../context/CartContext';

global.fetch = vi.fn();

const CartInjector = () => {
    const { addToCart } = useCart();
    return (
        <button onClick={() => addToCart({ _id: 'food123', name: 'Pepperoni Pizza', price: 15.00, quantity: 1 })}>
            Inject Pizza
        </button>
    );
};

describe('Suite 2: Menu & Cart Context', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Test 2.1: Menu Fetching - should fetch from API and display FoodCards', async () => {
        const mockMenuData = [
            { _id: 'm1', title: 'Cheeseburger', price: 12.50, description: 'Yummy burger', category: 'Fast Food', isAvailable: true }
        ];

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockMenuData,
        });

        render(
            <CartProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </CartProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Cheeseburger')).toBeInTheDocument();
            expect(screen.getByText('$12.50')).toBeInTheDocument();
        });
    });

    it('Test 2.2: Cart Logic - should add item, update quantity, and calculate total', async () => {
        render(
            <CartProvider>
                <MemoryRouter>
                    <CartInjector />
                    <Cart />
                </MemoryRouter>
            </CartProvider>
        );

        expect(screen.getByText(/Your Cart is Empty/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText('Inject Pizza'));

        expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
        expect(screen.getByText('$15.00 each')).toBeInTheDocument();

        const plusBtn = screen.getByText('+');
        fireEvent.click(plusBtn);

        await waitFor(() => {
            const totals = screen.getAllByText('$30.00');
            expect(totals.length).toBeGreaterThan(0);
        });
    });

    it('Test 2.3: Checkout Payload - should construct correct JSON and POST to backend', async () => {
        localStorage.setItem('token', 'fake-jwt-token');

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Order placed successfully!' }),
        });

        render(
            <CartProvider>
                <MemoryRouter>
                    <CartInjector />
                    <Cart />
                </MemoryRouter>
            </CartProvider>
        );

        fireEvent.click(screen.getByText('Inject Pizza'));

        const checkoutBtn = screen.getByRole('button', { name: /Confirm & Pay/i });
        fireEvent.click(checkoutBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);

            const fetchArgs = global.fetch.mock.calls[0];
            const fetchUrl = fetchArgs[0];
            const fetchOptions = fetchArgs[1];

            expect(fetchUrl).toBe('http://127.0.0.1:5000/api/orders');
            expect(fetchOptions.method).toBe('POST');

            const requestBody = JSON.parse(fetchOptions.body);
            expect(requestBody.items[0].menuItemId).toBe('food123');
            expect(requestBody.items[0].quantity).toBe(1);
        });
    });
});