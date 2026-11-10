import { describe, expect, it } from 'vitest';
import { formatarData } from './formatarData';

describe('formatarData', () => {
	it('formata ISO para padrão brasileiro', () => {
		expect(formatarData('2024-03-09')).toBe('09/03/2024');
	});

	it('retorna hífen quando não há data', () => {
		expect(formatarData('')).toBe('-');
		expect(formatarData(null)).toBe('-');
	});
});
