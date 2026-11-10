import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { buscarVoluntario, gerarTermo } from '../api/voluntarios';
import { Inicial } from './Inicial';

vi.mock('../api/voluntarios', () => ({
	buscarVoluntario: vi.fn(),
	gerarTermo: vi.fn(),
}));

const dadosVoluntario = {
	nome: 'Ana Pessoa', cpf: '529.982.247-25', dataNascimento: '2000-01-01',
	endereco: 'Rua A', cidade: 'Curitiba', estado: 'PR', email: 'ana@example.com',
	telefone: '11 98456 4658', estudanteUtfpr: true, ra: 'RA1', curso: 'Computação',
	periodo: '2º', ativo: false, dataEntrada: '2023-01-01', dataSaida: '2024-01-01',
	sinteseAtividades: 'Ações do projeto',
};

function renderInicial(usuario = { id: 5, nome: 'Ana', tipo: 'VOLUNTARIO', voluntarioId: 7 }) {
	localStorage.setItem('usuario', JSON.stringify(usuario));
	return render(<MemoryRouter><Inicial /></MemoryRouter>);
}

describe('Inicial', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		buscarVoluntario.mockResolvedValue({ data: dadosVoluntario });
	});

	it('carrega os dados, abre detalhes e fecha a janela modal', async () => {
		const user = userEvent.setup();
		renderInicial();
		expect(await screen.findByText('Olá, Ana')).toBeInTheDocument();
		expect(buscarVoluntario).toHaveBeenCalledWith(7);
		await user.click(screen.getByRole('button', { name: 'Conferir dados' }));
		expect(screen.getByRole('heading', { name: 'Detalhes do Voluntário' })).toBeInTheDocument();
		await user.click(screen.getByRole('heading', { name: 'Detalhes do Voluntário' }));
		expect(screen.getByRole('heading', { name: 'Detalhes do Voluntário' })).toBeInTheDocument();
		expect(screen.getByText('01/01/2000')).toBeInTheDocument();
		expect(screen.getByText('01/01/2024')).toBeInTheDocument();
		expect(await screen.findByText(/Computação/)).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Fechar' }));
		expect(screen.queryByRole('heading', { name: 'Detalhes do Voluntário' })).not.toBeInTheDocument();
	});

	it('fecha a janela modal ao clicar no fundo', async () => {
		const user = userEvent.setup();
		const { container } = renderInicial();
		await user.click(await screen.findByRole('button', { name: 'Conferir dados' }));
		await user.click(container.querySelector('.modal-overlay'));
		expect(screen.queryByRole('heading', { name: 'Detalhes do Voluntário' })).not.toBeInTheDocument();
	});

	it('mostra mensagem padrão se o servidor não detalhar falha ao carregar os dados', async () => {
		buscarVoluntario.mockRejectedValueOnce(new Error('offline'));
		renderInicial();
		expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao carregar seus dados.');
	});

	it('exibe dados sem curso de UTFPR para não estudante', async () => {
		buscarVoluntario.mockResolvedValueOnce({
			data: { ...dadosVoluntario, estudanteUtfpr: false, ativo: true, dataSaida: null },
		});
		const user = userEvent.setup();
		renderInicial();
		await user.click(await screen.findByRole('button', { name: 'Conferir dados' }));
		expect(screen.queryByText('Vínculo Acadêmico')).not.toBeInTheDocument();
		expect(screen.getByText('Ativo')).toBeInTheDocument();
		expect(screen.queryByText('Data de Saída:')).not.toBeInTheDocument();
	});

	it('usa o ID da conta quando voluntarioId estiver ausente e reporta erro de carregamento', async () => {
		buscarVoluntario.mockRejectedValueOnce({ response: { data: { erro: 'Sem dados.' } } });
		renderInicial({ id: 5, nome: 'Ana', tipo: 'VOLUNTARIO' });
		expect(await screen.findByRole('alert')).toHaveTextContent('Sem dados.');
		expect(buscarVoluntario).toHaveBeenCalledWith(undefined);
	});

	it('gera e baixa termo e mostra erro retornado pelo servidor', async () => {
		const user = userEvent.setup();
		const url = {
			createObjectURL: vi.fn(() => 'blob:termo'),
			revokeObjectURL: vi.fn(),
		};
		vi.stubGlobal('URL', url);
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		gerarTermo.mockResolvedValueOnce({ data: new Blob(['pdf']) });
		gerarTermo.mockRejectedValueOnce({ response: { data: { erro: 'PDF indisponível.' } } });
		renderInicial();
		await user.click(screen.getByRole('button', { name: 'Gerar PDF' }));
		expect(await screen.findByRole('status')).toHaveTextContent('Termo gerado e baixado com sucesso.');
		expect(gerarTermo).toHaveBeenCalledWith(7);
		expect(click).toHaveBeenCalledOnce();
		await user.click(screen.getByRole('button', { name: 'Gerar PDF' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('PDF indisponível.');
		vi.unstubAllGlobals();
	});

	it('usa o ID do usuário como fallback para gerar termo', async () => {
		const user = userEvent.setup();
		gerarTermo.mockResolvedValue({ data: new Blob(['pdf']) });
		renderInicial({ id: 5, nome: 'Ana', tipo: 'VOLUNTARIO' });
		await user.click(screen.getByRole('button', { name: 'Gerar PDF' }));
		await waitFor(() => expect(gerarTermo).toHaveBeenCalledWith(5));
	});
});
