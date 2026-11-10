import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { definirSenhaPrimeiroAcesso } from '../api/usuarios';
import { PrimeiroAcesso } from './PrimeiroAcesso';

vi.mock('../api/usuarios', () => ({ definirSenhaPrimeiroAcesso: vi.fn() }));

function LocationState() {
	const location = useLocation();
	return <output data-testid="location-state">{JSON.stringify({
		path: location.pathname,
		state: location.state,
	})}</output>;
}

function renderPrimeiroAcesso(state = { usuarioId: 5, token: 'temporario' }) {
	return render(
		<MemoryRouter initialEntries={[{ pathname: '/primeiro-acesso/senha', state }]}>
			<PrimeiroAcesso />
			<LocationState />
		</MemoryRouter>,
	);
}

describe('PrimeiroAcesso', () => {
	beforeEach(() => vi.clearAllMocks());

	it('exibe bloqueio e permite voltar se token ou usuário estiver ausente', async () => {
		const user = userEvent.setup();
		renderPrimeiroAcesso({ usuarioId: 5 });
		expect(screen.getByRole('alert')).toHaveTextContent('Solicitação de primeiro acesso inválida ou expirada.');
		await user.click(screen.getByRole('button', { name: 'Voltar ao login' }));
		expect(JSON.parse(screen.getByTestId('location-state').textContent).path).toBe('/');
	});

	it('atualiza checklist de requisitos e alterna visualização das senhas', async () => {
		const user = userEvent.setup();
		renderPrimeiroAcesso();
		const senha = screen.getByLabelText('Senha');
		await user.type(senha, 'SenhaForte1!');
		expect(screen.getByText('Pelo menos 8 caracteres').closest('li')).toHaveClass('requisito-atendido');
		expect(screen.getByText('Uma letra maiúscula').closest('li')).toHaveClass('requisito-atendido');
		expect(screen.getByText('Uma letra minúscula').closest('li')).toHaveClass('requisito-atendido');
		expect(screen.getByText('Um número').closest('li')).toHaveClass('requisito-atendido');
		expect(screen.getByText('Um caractere especial').closest('li')).toHaveClass('requisito-atendido');
		expect(senha).toHaveAttribute('type', 'password');
		await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
		expect(senha).toHaveAttribute('type', 'text');
		await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
		expect(senha).toHaveAttribute('type', 'password');

		const confirmacao = screen.getByLabelText('Repita a senha');
		await user.type(confirmacao, 'SenhaForte1!');
		await user.click(screen.getByRole('button', { name: 'Mostrar confirmação da senha' }));
		expect(confirmacao).toHaveAttribute('type', 'text');
		await user.click(screen.getByRole('button', { name: 'Ocultar confirmação da senha' }));
		expect(confirmacao).toHaveAttribute('type', 'password');
	});

	it('mostra critérios ausentes após tentativa com senha fraca', async () => {
		const user = userEvent.setup();
		renderPrimeiroAcesso();
		await user.type(screen.getByLabelText('Senha'), 'curta');
		await user.click(screen.getByRole('button', { name: 'Cadastrar senha' }));
		expect(screen.getByText(/Ainda falta:/)).toBeInTheDocument();
		expect(definirSenhaPrimeiroAcesso).not.toHaveBeenCalled();
	});

	it('mostra uma única mensagem quando as senhas não coincidem', async () => {
		const user = userEvent.setup();
		renderPrimeiroAcesso();
		await user.type(screen.getByLabelText('Senha'), 'SenhaForte1!');
		await user.type(screen.getByLabelText('Repita a senha'), 'SenhaErrada2!');
		await user.click(screen.getByRole('button', { name: 'Cadastrar senha' }));
		expect(screen.getAllByRole('alert').filter((alert) =>
			alert.textContent.includes('As senhas não coincidem.'))).toHaveLength(1);
		expect(definirSenhaPrimeiroAcesso).not.toHaveBeenCalled();
	});

	it('define senha e encaminha para login com confirmação de sucesso', async () => {
		const user = userEvent.setup();
		definirSenhaPrimeiroAcesso.mockResolvedValue({});
		renderPrimeiroAcesso();
		await user.type(screen.getByLabelText('Senha'), 'SenhaForte1!');
		await user.type(screen.getByLabelText('Repita a senha'), 'SenhaForte1!');
		await user.click(screen.getByRole('button', { name: 'Cadastrar senha' }));

		await waitFor(() => {
			const location = JSON.parse(screen.getByTestId('location-state').textContent);
			expect(location.path).toBe('/');
			expect(location.state.mensagem).toContain('Senha cadastrada.');
		});
		expect(definirSenhaPrimeiroAcesso).toHaveBeenCalledWith(
			5, 'SenhaForte1!', 'SenhaForte1!', 'temporario',
		);
	});

	it('mostra erro da API ou mensagem padrão', async () => {
		const user = userEvent.setup();
		definirSenhaPrimeiroAcesso.mockRejectedValueOnce({
			response: { data: { erro: 'Token expirado.' } },
		});
		definirSenhaPrimeiroAcesso.mockRejectedValueOnce(new Error('offline'));
		renderPrimeiroAcesso();
		await user.type(screen.getByLabelText('Senha'), 'SenhaForte1!');
		await user.type(screen.getByLabelText('Repita a senha'), 'SenhaForte1!');
		await user.click(screen.getByRole('button', { name: 'Cadastrar senha' }));
		expect(await screen.findByText('Token expirado.')).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Cadastrar senha' }));
		expect(await screen.findByText(/Não foi possível cadastrar a senha/)).toBeInTheDocument();
	});
});
