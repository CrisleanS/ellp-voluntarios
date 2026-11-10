import { describe, expect, it } from 'vitest';
import {
	apenasDigitos,
	formatarCpf,
	formatarTelefone,
	validarCpf,
	validarDataNascimento,
	validarEmail,
	validarTelefone,
} from './formatarCamposVoluntario';

describe('formatação e validação de CPF', () => {
	it('remove caracteres não numéricos e mascara CPF incrementalmente', () => {
		expect(apenasDigitos('abc 529.982.247-25')).toBe('52998224725');
		expect(formatarCpf('529')).toBe('529');
		expect(formatarCpf('5299')).toBe('529.9');
		expect(formatarCpf('5299822')).toBe('529.982.2');
		expect(formatarCpf('5299822472')).toBe('529.982.247-2');
		expect(formatarCpf('529982247251')).toBe('529.982.247-25');
	});

	it('valida dígitos verificadores e rejeita CPFs incompletos ou repetidos', () => {
		expect(validarCpf('529.982.247-25')).toBe(true);
		expect(validarCpf('123.456.789-00')).toBe(false);
		expect(validarCpf('111.111.111-11')).toBe(false);
		expect(validarCpf('529')).toBe(false);
	});
});

describe('formatação e validação de telefone', () => {
	it('formata telefone fixo e celular sem exceder onze dígitos', () => {
		expect(formatarTelefone('11984564658')).toBe('11 98456 4658');
		expect(formatarTelefone('(43) 3333-4444')).toBe('43 3333 4444');
		expect(formatarTelefone('11')).toBe('11');
		expect(formatarTelefone('119845646589')).toBe('11 98456 4658');
	});

	it('aceita somente telefones com DDD brasileiro válido', () => {
		expect(validarTelefone('11 98456 4658')).toBe(true);
		expect(validarTelefone('43 3333 4444')).toBe(true);
		expect(validarTelefone('00 98456 4658')).toBe(false);
		expect(validarTelefone('11 123')).toBe(false);
	});
});

describe('validação de e-mail e nascimento', () => {
	it('valida e-mail com espaços externos e rejeita formato inválido', () => {
		expect(validarEmail('  pessoa@example.com ')).toBe(true);
		expect(validarEmail('pessoa@')).toBe(false);
		expect(validarEmail(' pessoa example.com ')).toBe(false);
	});

	it('aceita datas passadas e rejeita vazias, inválidas e futuras', () => {
		expect(validarDataNascimento('2000-01-01')).toBe(true);
		expect(validarDataNascimento('')).toBe(false);
		expect(validarDataNascimento('invalid')).toBe(false);
		expect(validarDataNascimento('2999-01-01')).toBe(false);
	});
});
