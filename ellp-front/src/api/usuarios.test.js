import { beforeEach, describe, expect, it, vi } from 'vitest';
import { definirSenhaPrimeiroAcesso, iniciarPrimeiroAcesso, login, trocarSenha } from './usuarios';
import api from './client';

vi.mock('./client', () => ({
	default: {
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

describe('API de usuários', () => {
	beforeEach(() => vi.clearAllMocks());

	it('envia as credenciais de login para a rota correta', () => {
		const dados = { email: 'admin@example.com', senha: 'senha' };
		login(dados);
		expect(api.post).toHaveBeenCalledWith('/usuarios/login', dados);
	});

	it('altera senha com senha atual e nova', () => {
		trocarSenha(9, 'atual', 'nova');
		expect(api.patch).toHaveBeenCalledWith('/usuarios/9/alterar-senha', {
			senhaAtual: 'atual',
			novaSenha: 'nova',
		});
	});

	it('inicia primeiro acesso com e-mail', () => {
		iniciarPrimeiroAcesso('pessoa@example.com');
		expect(api.post).toHaveBeenCalledWith('/usuarios/primeiro-acesso', {
			email: 'pessoa@example.com',
		});
	});

	it('define senha inicial com confirmação e token temporário', () => {
		definirSenhaPrimeiroAcesso(12, 'SenhaForte1!', 'SenhaForte1!', 'jwt-temporario');
		expect(api.patch).toHaveBeenCalledWith(
			'/usuarios/12/primeiro-acesso/senha',
			{ senha: 'SenhaForte1!', confirmarSenha: 'SenhaForte1!' },
			{ headers: { Authorization: 'Bearer jwt-temporario' } },
		);
	});
});
