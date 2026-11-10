import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { trocarSenha } from '../api/usuarios';
import { TrocarSenha } from './TrocarSenha';

vi.mock('../api/usuarios', () => ({ trocarSenha: vi.fn() }));

function LocationState() {
	const location = useLocation();
	return <output data-testid="path">{location.pathname}</output>;
}

function renderTrocarSenha() {
	return render(
		<MemoryRouter initialEntries={['/trocar-senha']}>
			<TrocarSenha />
			<LocationState />
		</MemoryRouter>,
	);
}

describe('TrocarSenha', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();
	});

	it('recusa alteração se usuário não puder ser identificado', async () => {
		renderTrocarSenha();
		fireEvent.submit(screen.getByRole('button', { name: 'Alterar' }).closest('form'));
		expect(await screen.findByText(/Não foi possível identificar o usuário/)).toBeInTheDocument();
		expect(trocarSenha).not.toHaveBeenCalled();
	});

	it('altera senha, atualiza sessão e permite continuar como admin', async () => {
		const user = userEvent.setup();
		localStorage.setItem('usuario', JSON.stringify({ id: 8, tipo: 'ADMIN' }));
		trocarSenha.mockResolvedValue({ data: { id: 8, tipo: 'ADMIN' } });
		renderTrocarSenha();
		await user.type(screen.getByLabelText('Senha atual'), 'atual');
		await user.type(screen.getByLabelText('Senha nova'), 'nova');
		await user.click(screen.getByRole('button', { name: 'Alterar' }));
		expect(await screen.findByText('Senha alterada com sucesso.')).toBeInTheDocument();
		expect(JSON.parse(localStorage.getItem('usuario'))).toEqual({ id: 8, tipo: 'ADMIN' });
		await user.click(screen.getByRole('button', { name: 'Continuar' }));
		expect(screen.getByTestId('path')).toHaveTextContent('/voluntarios');
	});

	it('encaminha voluntário para a página inicial', async () => {
		const user = userEvent.setup();
		localStorage.setItem('usuario', JSON.stringify({ id: 4, tipo: 'VOLUNTARIO' }));
		trocarSenha.mockResolvedValue({ data: { id: 4, tipo: 'VOLUNTARIO' } });
		renderTrocarSenha();
		await user.type(screen.getByLabelText('Senha atual'), 'atual');
		await user.type(screen.getByLabelText('Senha nova'), 'nova');
		await user.click(screen.getByRole('button', { name: 'Alterar' }));
		await user.click(await screen.findByRole('button', { name: 'Continuar' }));
		expect(screen.getByTestId('path')).toHaveTextContent('/inicial');
	});

	it('mostra erro do backend ou mensagem padrão', async () => {
		const user = userEvent.setup();
		localStorage.setItem('usuario', JSON.stringify({ id: 4, tipo: 'VOLUNTARIO' }));
		trocarSenha.mockRejectedValueOnce({ response: { data: { erro: 'Senha incorreta.' } } });
		trocarSenha.mockRejectedValueOnce(new Error('offline'));
		renderTrocarSenha();
		await user.type(screen.getByLabelText('Senha atual'), 'atual');
		await user.type(screen.getByLabelText('Senha nova'), 'nova');
		await user.click(screen.getByRole('button', { name: 'Alterar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Senha incorreta.');
		await user.click(screen.getByRole('button', { name: 'Alterar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Erro inesperado ao alterar senha');
	});

	it('permite voltar ao login', async () => {
		const user = userEvent.setup();
		renderTrocarSenha();
		await user.click(screen.getByRole('button', { name: 'Voltar' }));
		await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/'));
	});
});
