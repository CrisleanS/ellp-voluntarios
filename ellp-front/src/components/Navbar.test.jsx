import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';

describe('Navbar', () => {
	it('renderiza navegação para as páginas públicas e administrativas', () => {
		render(<MemoryRouter><Navbar /></MemoryRouter>);
		expect(screen.getByRole('heading', { name: 'ELLP' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('href', '/');
		expect(screen.getByRole('link', { name: 'Voluntários' })).toHaveAttribute('href', '/voluntarios');
		expect(screen.getByRole('link', { name: 'Cadastrar' })).toHaveAttribute('href', '/voluntarios/novo');
		expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
	});
});
