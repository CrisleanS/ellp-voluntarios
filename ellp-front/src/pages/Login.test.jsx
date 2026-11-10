import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { iniciarPrimeiroAcesso, login } from '../api/usuarios';
import { Login } from './Login';

vi.mock('../api/usuarios', () => ({
	login: vi.fn(),
	iniciarPrimeiroAcesso: vi.fn(),
}));

function LocationState() {
	const location = useLocation();
	return <output data-testid="location-state">{JSON.stringify({
		path: location.pathname,
		state: location.state,
	})}</output>;
}

function renderLogin(initialEntry = '/') {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<Login />
			<LocationState />
		</MemoryRouter>,
	);
}

describe('Login', () => {
	beforeEach(() => vi.clearAllMocks());

	it('valida o e-mail e a senha sem chamar a API', async () => {
		const user = userEvent.setup();
		renderLogin();
		await user.type(screen.getByLabelText('E-mail'), 'email-invalido');
		await user.click(screen.getByRole('button', { name: 'Entrar' }));
		expect(screen.getByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
		expect(login).not.toHaveBeenCalled();

		await user.clear(screen.getByLabelText('E-mail'));
		await user.type(screen.getByLabelText('E-mail'), 'pessoa@example.com');
		await user.click(screen.getByRole('button', { name: 'Entrar' }));
		expect(login).not.toHaveBeenCalled();
	});

	it.each([
		[{ id: 1, tipo: 'ADMIN', primeiroLogin: false }, '/voluntarios'],
		[{ id: 2, tipo: 'VOLUNTARIO', primeiroLogin: false }, '/inicial'],
		[{ id: 3, tipo: 'ADMIN', primeiroLogin: true }, '/trocar-senha'],
	])('redireciona após autenticação de acordo com o perfil', async (usuario, destino) => {
		const user = userEvent.setup();
		login.mockResolvedValue({ data: { token: 'jwt', usuario } });
		renderLogin();
		await user.type(screen.getByLabelText('E-mail'), 'pessoa@example.com');
		await user.type(screen.getByLabelText('Senha'), 'senha');
		await user.click(screen.getByRole('button', { name: 'Entrar' }));

		await waitFor(() => expect(JSON.parse(screen.getByTestId('location-state').textContent).path).toBe(destino));
		expect(login).toHaveBeenCalledWith({ email: 'pessoa@example.com', senha: 'senha' });
		expect(localStorage.getItem('token')).toBe('jwt');
		expect(JSON.parse(localStorage.getItem('usuario'))).toEqual(usuario);
	});

	it('mostra mensagem genérica quando o login falha', async () => {
		const user = userEvent.setup();
		login.mockRejectedValue(new Error('credenciais inválidas'));
		renderLogin();
		await user.type(screen.getByLabelText('E-mail'), 'pessoa@example.com');
		await user.type(screen.getByLabelText('Senha'), 'incorreta');
		await user.click(screen.getByRole('button', { name: 'Entrar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.');
	});

	it('exibe mensagem recebida do fluxo de senha cadastrada', () => {
		renderLogin({
			pathname: '/',
			state: { mensagem: 'Senha cadastrada com sucesso.' },
		});
		expect(screen.getByText('Senha cadastrada com sucesso.')).toBeInTheDocument();
	});

	it('abre primeiro acesso, valida formato do e-mail e permite voltar', async () => {
		const user = userEvent.setup();
		renderLogin();
		await user.click(screen.getByRole('button', { name: 'Primeiro acesso' }));
		await user.type(screen.getByLabelText('E-mail cadastrado'), 'invalido');
		await user.click(screen.getByRole('button', { name: 'Continuar' }));
		expect(screen.getByRole('alert')).toHaveTextContent('E-mail inválido.');
		expect(iniciarPrimeiroAcesso).not.toHaveBeenCalled();

		await user.click(screen.getByRole('button', { name: 'Voltar ao login' }));
		expect(screen.getByLabelText('Senha')).toBeInTheDocument();
	});

	it('inicia primeiro acesso com e-mail sem espaços e navega com o token', async () => {
		const user = userEvent.setup();
		iniciarPrimeiroAcesso.mockResolvedValue({ data: { usuarioId: 5, token: 'one-time' } });
		renderLogin();
		await user.click(screen.getByRole('button', { name: 'Primeiro acesso' }));
		await user.type(screen.getByLabelText('E-mail cadastrado'), '  pessoa@example.com  ');
		await user.click(screen.getByRole('button', { name: 'Continuar' }));
		await waitFor(() => {
			const location = JSON.parse(screen.getByTestId('location-state').textContent);
			expect(location.path).toBe('/primeiro-acesso/senha');
			expect(location.state).toEqual({ usuarioId: 5, token: 'one-time' });
		});
		expect(iniciarPrimeiroAcesso).toHaveBeenCalledWith('pessoa@example.com');
	});

	it('apresenta erro retornado pela API ou mensagem padrão', async () => {
		const user = userEvent.setup();
		iniciarPrimeiroAcesso.mockRejectedValueOnce({ response: { data: { erro: 'Conta não encontrada.' } } });
		iniciarPrimeiroAcesso.mockRejectedValueOnce(new Error('offline'));
		renderLogin();
		await user.click(screen.getByRole('button', { name: 'Primeiro acesso' }));
		const email = screen.getByLabelText('E-mail cadastrado');
		await user.type(email, 'pessoa@example.com');
		await user.click(screen.getByRole('button', { name: 'Continuar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Conta não encontrada.');
		await user.clear(email);
		await user.type(email, 'pessoa@example.com');
		await user.click(screen.getByRole('button', { name: 'Continuar' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível iniciar o primeiro acesso.');
	});
});
