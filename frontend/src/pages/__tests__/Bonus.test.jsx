import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Menu from '../Menu';
import Cart from '../Cart';
import FoodCard from '../../components/FoodCard';
import { CartProvider, useCart } from '../../context/CartContext';

global.fetch = vi.fn();
global.alert = vi.fn();

const CartInjector = () => {
    const { addToCart } = useCart();
    return (
        <button onClick={() => addToCart({ _id: 'pizza1', title: 'Pizza', price: 20.00 })}>
            Inject Pizza
        </button>
    );
};

describe('Suite 5: Discounts & Bonus Features', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        global.fetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: async () => ([])
            })
        );
    });

    it('Test 5.1: Out-of-Stock UI - button should be disabled if isAvailable is false', () => {
        const mockFood = { _id: 'f1', title: 'Sold Out Burger', name: 'Sold Out Burger', price: 10, stock: 0 };
        const mockAddToCart = vi.fn();

        render(<FoodCard food={mockFood} onAddToCart={mockAddToCart} />);

        const btn = screen.getByRole('button', { name: /stock is 0/i });
        expect(btn).toBeDisabled();

        fireEvent.click(btn);
        expect(mockAddToCart).not.toHaveBeenCalled();
    });

    it('Test 5.2: Search & Filter Logic - should append query parameters to API call', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ([])
        });

        render(
            <CartProvider>
                <MemoryRouter>
                    <Menu />
                </MemoryRouter>
            </CartProvider>
        );

        await waitFor(() => expect(global.fetch).toHaveBeenCalled());

        const searchInput = screen.getByPlaceholderText(/Search for food/i);
        fireEvent.change(searchInput, { target: { value: 'pizza' } });

        const minPriceInput = screen.getByPlaceholderText(/Min Price/i);
        fireEvent.change(minPriceInput, { target: { value: '10' } });

        await waitFor(() => {
            const calls = global.fetch.mock.calls;
            const lastCallUrl = calls[calls.length - 1][0].toString();

            expect(lastCallUrl).toContain('search=pizza');
            expect(lastCallUrl).toContain('minPrice=10');
        }, { timeout: 2000 });
    });

    it('Test 5.3: Discount Validation - should apply discount and reduce total', async () => {
        localStorage.setItem('token', 'fake-token');

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ discountPercentage: 50 })
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

        const discountInput = screen.getByPlaceholderText(/e.g. SUMMER20/i);
        fireEvent.change(discountInput, { target: { value: 'HALFPRICE' } });

        fireEvent.click(screen.getByRole('button', { name: /Apply/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
            expect(screen.getByText(/Success!/i)).toBeInTheDocument();
            // Check for the discounted total price (appears in multiple places)
            const allPrices = screen.getAllByText(/\$10\.00/);
            expect(allPrices.length).toBeGreaterThan(0);
        }, { timeout: 2000 });
    });

});