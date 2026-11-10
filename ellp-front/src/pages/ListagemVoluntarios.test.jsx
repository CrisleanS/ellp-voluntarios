import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
	ativarVoluntario,
	gerarTermo,
	listarVoluntarios,
	registrarSaida,
} from '../api/voluntarios';
import { ListagemVoluntarios } from './ListagemVoluntarios';

vi.mock('../api/voluntarios', () => ({
	listarVoluntarios: vi.fn(),
	registrarSaida: vi.fn(),
	ativarVoluntario: vi.fn(),
	gerarTermo: vi.fn(),
}));

const pessoas = [
	{
		id: 1, nome: 'João Silva', cpf: '529.982.247-25', email: 'joao@example.com',
		telefone: '11 98456 4658', ativo: true, dataEntrada: '2024-01-02',
		dataNascimento: '2000-01-01', endereco: 'Rua A', cidade: 'Curitiba', estado: 'PR',
		estudanteUtfpr: true, ra: 'RA1', curso: 'Computação', periodo: '2º',
		sinteseAtividades: 'Atividades',
	},
	{
		id: 2, nome: 'Maria Souza', cpf: '123.456.789-09', email: 'maria@example.com',
		telefone: '43 3333 4444', ativo: false, dataEntrada: '2023-01-02',
		dataSaida: '2024-01-02', dataNascimento: '1999-02-02', endereco: 'Rua B',
		cidade: 'Londrina', estado: 'PR', estudanteUtfpr: false, sinteseAtividades: 'Resumo',
	},
];

function renderLista() {
	return render(
		<MemoryRouter initialEntries={['/voluntarios']}>
			<ListagemVoluntarios />
			<LocationState />
		</MemoryRouter>,
	);
}

function LocationState() {
	const location = useLocation();
	return <output data-testid="location-state">{JSON.stringify({
		path: location.pathname,
		state: location.state,
	})}</output>;
}

function configurarAdmin() {
	localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN', nome: 'Admin' }));
	listarVoluntarios.mockResolvedValue({ data: pessoas });
}

describe('ListagemVoluntarios', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		configurarAdmin();
	});

	it('carrega e filtra pelo nome ou CPF e alterna o status listado', async () => {
		const user = userEvent.setup();
		renderLista();
		expect(await screen.findByText('João Silva')).toBeInTheDocument();
		expect(screen.getByText('2 voluntários encontrados')).toBeInTheDocument();
		await user.type(screen.getByPlaceholderText('Buscar por nome ou CPF...'), '529.982');
		expect(screen.getByText('1 voluntários encontrados')).toBeInTheDocument();
		expect(screen.queryByText('Maria Souza')).not.toBeInTheDocument();
		await user.clear(screen.getByPlaceholderText('Buscar por nome ou CPF...'));
		await user.type(screen.getByPlaceholderText('Buscar por nome ou CPF...'), 'MARIA');
		expect(screen.getByText('Maria Souza')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Ativos' }));
		await waitFor(() => expect(listarVoluntarios).toHaveBeenLastCalledWith(true));
		await user.click(screen.getByRole('button', { name: 'Inativos' }));
		await waitFor(() => expect(listarVoluntarios).toHaveBeenLastCalledWith(false));
		await user.click(screen.getByRole('button', { name: 'Todos' }));
		await waitFor(() => expect(listarVoluntarios).toHaveBeenLastCalledWith(undefined));
	});

	it('abre detalhes e fecha pelo botão e pelo fundo do modal', async () => {
		const user = userEvent.setup();
		renderLista();
		await user.click(await screen.findByText('João Silva'));
		expect(screen.getByRole('heading', { name: 'Detalhes do Voluntário' })).toBeInTheDocument();
		expect(screen.getByText('01/01/2000')).toBeInTheDocument();
		expect(screen.getByText(/Computação/)).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Fechar' }));
		expect(screen.queryByRole('heading', { name: 'Detalhes do Voluntário' })).not.toBeInTheDocument();
		await user.click(screen.getByText('Maria Souza'));
		fireEvent.click(screen.getByText('Detalhes do Voluntário').parentElement.parentElement);
		expect(screen.queryByText('Detalhes do Voluntário')).not.toBeInTheDocument();
	});

	it('desativa voluntário e mostra retorno de sucesso ou erro', async () => {
		const user = userEvent.setup();
		registrarSaida.mockRejectedValueOnce(new Error('offline'));
		registrarSaida.mockResolvedValueOnce({});
		renderLista();
		const linhaJoao = (await screen.findByText('João Silva')).closest('tr');
		await user.click(within(linhaJoao).getByRole('button', { name: 'Desativar' }));
		expect(await screen.findByText('Erro ao desativar voluntário.')).toBeInTheDocument();
		await user.click(within(screen.getByText('João Silva').closest('tr')).getByRole('button', { name: 'Desativar' }));
		expect(await screen.findByText('Voluntário desativado com sucesso.')).toBeInTheDocument();
	});

	it('reativa voluntário, limpa data de saída e mostra mensagem da API', async () => {
		const user = userEvent.setup();
		ativarVoluntario.mockRejectedValueOnce({ response: { data: { erro: 'Não permitido.' } } });
		ativarVoluntario.mockRejectedValueOnce(new Error('offline'));
		ativarVoluntario.mockResolvedValueOnce({});
		listarVoluntarios.mockResolvedValue({
			data: pessoas.map((voluntario) => ({ ...voluntario, ativo: false })),
		});
		renderLista();
		const linhaJoao = (await screen.findByText('João Silva')).closest('tr');
		await user.click(within(linhaJoao).getByRole('button', { name: 'Ativar' }));
		expect(await screen.findByText('Não permitido.')).toBeInTheDocument();
		await user.click(within(screen.getByText('João Silva').closest('tr')).getByRole('button', { name: 'Ativar' }));
		expect(await screen.findByText('Erro ao ativar voluntário.')).toBeInTheDocument();
		await user.click(within(screen.getByText('João Silva').closest('tr')).getByRole('button', { name: 'Ativar' }));
		expect(await screen.findByText('Voluntário ativado com sucesso.')).toBeInTheDocument();
	});

	it('navega à edição com voluntário selecionado', async () => {
		const user = userEvent.setup();
		renderLista();
		await user.click(within((await screen.findByText('João Silva')).closest('tr')).getByRole('button', { name: 'Editar' }));
		const location = JSON.parse(screen.getByTestId('location-state').textContent);
		expect(location.path).toBe('/voluntarios/novo');
		expect(location.state.voluntario).toMatchObject({ id: 1, nome: 'João Silva' });
	});

	it('gera termo, baixa PDF e informa sucesso ou falha', async () => {
		const user = userEvent.setup();
		const url = {
			createObjectURL: vi.fn(() => 'blob:termo'),
			revokeObjectURL: vi.fn(),
		};
		vi.stubGlobal('URL', url);
		const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
		gerarTermo.mockResolvedValueOnce({ data: new Blob(['pdf']) });
		gerarTermo.mockRejectedValueOnce(new Error('offline'));
		renderLista();
		await user.click(within((await screen.findByText('João Silva')).closest('tr')).getByRole('button', { name: 'Gerar Termo' }));
		expect(await screen.findByText('Termo de João Silva gerado com sucesso.')).toBeInTheDocument();
		expect(click).toHaveBeenCalledOnce();
		expect(url.revokeObjectURL).toHaveBeenCalledWith('blob:termo');

		await user.click(within(screen.getByText('João Silva').closest('tr')).getByRole('button', { name: 'Gerar Termo' }));
		expect(await screen.findByText('Erro ao gerar o termo em PDF.')).toBeInTheDocument();
		vi.unstubAllGlobals();
	});

	it('mostra erro ao falhar carregamento e oculta ações para não-admin', async () => {
		listarVoluntarios.mockRejectedValueOnce(new Error('offline'));
		const { unmount } = renderLista();
		expect(await screen.findByText('Erro ao carregar voluntários.')).toBeInTheDocument();
		unmount();

		localStorage.setItem('usuario', JSON.stringify({ tipo: 'VOLUNTARIO' }));
		listarVoluntarios.mockResolvedValue({ data: pessoas });
		renderLista();
		expect(await screen.findByText('João Silva')).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Desativar' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Gerar Termo' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
	});
});
