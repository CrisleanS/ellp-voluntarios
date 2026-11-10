import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	ativarVoluntario,
	buscarVoluntario,
	cadastrarVoluntario,
	editarVoluntario,
	gerarTermo,
	listarVoluntarios,
	registrarSaida,
	removerVoluntario,
} from './voluntarios';
import api from './client';

vi.mock('./client', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		patch: vi.fn(),
		delete: vi.fn(),
	},
}));

describe('API de voluntários', () => {
	beforeEach(() => vi.clearAllMocks());

	it('lista por status ou sem filtro', () => {
		listarVoluntarios(true);
		listarVoluntarios();
		expect(api.get).toHaveBeenNthCalledWith(1, '/voluntarios', { params: { ativo: true } });
		expect(api.get).toHaveBeenNthCalledWith(2, '/voluntarios', { params: {} });
	});

	it('busca e cadastra voluntário', () => {
		const dados = { nome: 'João' };
		buscarVoluntario(3);
		cadastrarVoluntario(dados);
		expect(api.get).toHaveBeenCalledWith('/voluntarios/3');
		expect(api.post).toHaveBeenCalledWith('/voluntarios', dados);
	});

	it('edita e remove voluntário', () => {
		const dados = { nome: 'João' };
		editarVoluntario(3, dados);
		removerVoluntario(3);
		expect(api.put).toHaveBeenCalledWith('/voluntarios/3', dados);
		expect(api.delete).toHaveBeenCalledWith('/voluntarios/3');
	});

	it('ativa, registra saída e solicita termo como blob', () => {
		ativarVoluntario(3);
		registrarSaida(3);
		gerarTermo(3);
		expect(api.patch).toHaveBeenNthCalledWith(1, '/voluntarios/3/ativar');
		expect(api.patch).toHaveBeenNthCalledWith(2, '/voluntarios/3/saida');
		expect(api.get).toHaveBeenCalledWith('/voluntarios/3/termo', { responseType: 'blob' });
	});
});
