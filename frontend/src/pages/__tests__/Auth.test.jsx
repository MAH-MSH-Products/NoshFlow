import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
import Register from '../Register';

global.fetch = vi.fn();

describe('Suite 1: Authentication & Routing', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('Test 1.1: Registration Flow - should successfully register and show success message', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Registration successful', token: 'fake-token', name: 'Test User', role: 'Customer' }),
        });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/e.g. John Doe/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

        const registerButton = screen.getByRole('button', { name: /Register/i });
        fireEvent.click(registerButton);

        await waitFor(() => {
            expect(screen.getByText(/successful/i)).toBeInTheDocument();
        }, { timeout: 2000 });
    });

    it('Test 1.2: Login & Token Management - should login and save JWT to localStorage', async () => {
        const mockToken = 'fake-jwt-token-12345';
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: mockToken, name: 'Test User', role: 'Customer' }),
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/email@example.com/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });

        const loginButton = screen.getByRole('button', { name: /Login/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe(mockToken);
        });
    });

});