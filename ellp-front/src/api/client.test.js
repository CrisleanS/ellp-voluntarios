import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';

describe('cliente HTTP', () => {
	let adaptadorAnterior;

	beforeEach(() => {
		adaptadorAnterior = api.defaults.adapter;
		localStorage.clear();
	});

	afterEach(() => {
		api.defaults.adapter = adaptadorAnterior;
		vi.unstubAllGlobals();
	});

	it('adiciona token de sessão se o cabeçalho ainda não estiver definido', async () => {
		let configuracaoRecebida;
		localStorage.setItem('token', 'token-de-sessao');
		api.defaults.adapter = async (config) => {
			configuracaoRecebida = config;
			return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config };
		};

		await api.get('/teste');

		expect(configuracaoRecebida.headers.Authorization).toBe('Bearer token-de-sessao');
	});

	it('preserva autorização definida na requisição e segue sem token salvo', async () => {
		let configuracaoRecebida;
		api.defaults.adapter = async (config) => {
			configuracaoRecebida = config;
			return { data: 'ok', status: 200, statusText: 'OK', headers: {}, config };
		};
		await api.get('/teste', { headers: { Authorization: 'Bearer token-temporario' } });
		expect(configuracaoRecebida.headers.Authorization).toBe('Bearer token-temporario');

		await api.get('/teste-sem-token');
		expect(configuracaoRecebida.headers.Authorization).toBeUndefined();
	});

	it('limpa sessão e redireciona quando a API responde 401', async () => {
		const assign = vi.fn();
		vi.stubGlobal('window', { location: { assign } });
		localStorage.setItem('token', 'expirado');
		localStorage.setItem('usuario', '{"id":1}');
		api.defaults.adapter = async (config) => {
			const error = new Error('Unauthorized');
			error.config = config;
			error.response = { status: 401, config, data: {} };
			throw error;
		};

		await expect(api.get('/protegido')).rejects.toMatchObject({
			response: { status: 401 },
		});
		expect(localStorage.getItem('token')).toBeNull();
		expect(localStorage.getItem('usuario')).toBeNull();
		expect(assign).toHaveBeenCalledWith('/');
	});

	it('propaga erros diferentes de 401 sem apagar a sessão', async () => {
		localStorage.setItem('token', 'valido');
		api.defaults.adapter = async (config) => {
			const error = new Error('Erro do servidor');
			error.config = config;
			error.response = { status: 500, config, data: {} };
			throw error;
		};

		await expect(api.get('/erro')).rejects.toMatchObject({
			response: { status: 500 },
		});
		expect(localStorage.getItem('token')).toBe('valido');
	});
});
