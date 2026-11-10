import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { cadastrarVoluntario, editarVoluntario } from '../api/voluntarios';
import { FormularioVoluntario } from './FormularioVoluntario';

vi.mock('../api/voluntarios', () => ({
	cadastrarVoluntario: vi.fn(),
	editarVoluntario: vi.fn(),
}));

const voluntarioEditando = {
	id: 21,
	nome: 'Maria Souza',
	cpf: '529.982.247-25',
	email: 'maria@example.com',
	telefone: '11 98456 4658',
	dataNascimento: '2000-01-01',
	nacionalidade: 'Brasileira',
	endereco: 'Rua A, 10',
	cidade: 'Curitiba',
	estado: 'PR',
	dataEntrada: '2024-01-01',
	dataSaida: '',
	estudanteUtfpr: false,
	curso: '',
	periodo: '',
	ra: '',
	sinteseAtividades: '',
};

function renderFormulario(voluntario) {
	const state = voluntario ? { state: { voluntario } } : {};
	return render(
		<MemoryRouter initialEntries={[{ pathname: '/voluntarios/novo', ...state }]}>
			<FormularioVoluntario />
		</MemoryRouter>,
	);
}

async function preencherFormulario(user) {
	await user.type(screen.getByLabelText('Nome'), 'João da Silva');
	await user.type(screen.getByLabelText('CPF'), '52998224725');
	await user.type(screen.getByLabelText('E-mail'), ' joao@example.com ');
	await user.type(screen.getByLabelText('Telefone'), '11984564658');
	await user.type(screen.getByLabelText('Data de Nascimento'), '2000-02-01');
	await user.type(screen.getByLabelText('Nacionalidade'), ' Brasileira ');
	await user.type(screen.getByLabelText('Endereço'), ' Rua B, 20 ');
	await user.type(screen.getByLabelText('Cidade'), ' Curitiba ');
	await user.type(screen.getByLabelText('Estado (UF)'), 'pr');
	await user.type(screen.getByLabelText('Data de Entrada'), '2024-02-01');
	await user.type(screen.getByLabelText('Síntese das Atividades'), 'Apoio no projeto');
}

describe('FormularioVoluntario', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN', nome: 'Admin' }));
	});

	it('mostra erros específicos quando o formulário está vazio', async () => {
		const user = userEvent.setup();
		renderFormulario();
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(screen.getByText('Revise os campos destacados.')).toBeInTheDocument();
		expect(screen.getByText('Informe o nome.')).toBeInTheDocument();
		expect(screen.getByText('Informe um CPF válido.')).toBeInTheDocument();
		expect(screen.getByText('Informe um e-mail válido.')).toBeInTheDocument();
		expect(screen.getByText('Informe um telefone com DDD: 10 ou 11 dígitos.')).toBeInTheDocument();
		expect(screen.getByText('Informe uma data de nascimento válida, anterior a hoje.')).toBeInTheDocument();
		expect(screen.getByText('Informe a sigla de um estado brasileiro.')).toBeInTheDocument();
		expect(cadastrarVoluntario).not.toHaveBeenCalled();
	});

	it('aplica máscaras e normaliza os dados ao cadastrar', async () => {
		const user = userEvent.setup();
		cadastrarVoluntario.mockResolvedValue({});
		renderFormulario();
		await preencherFormulario(user);
		expect(screen.getByLabelText('CPF')).toHaveValue('529.982.247-25');
		expect(screen.getByLabelText('Telefone')).toHaveValue('11 98456 4658');
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		await waitFor(() => expect(cadastrarVoluntario).toHaveBeenCalledOnce());
		expect(cadastrarVoluntario).toHaveBeenCalledWith(expect.objectContaining({
			nome: 'João da Silva',
			cpf: '529.982.247-25',
			email: 'joao@example.com',
			telefone: '11 98456 4658',
			nacionalidade: 'Brasileira',
			endereco: 'Rua B, 20',
			cidade: 'Curitiba',
			estado: 'PR',
			sinteseAtividades: 'Apoio no projeto',
		}));
		expect(await screen.findByRole('status')).toHaveTextContent('Voluntário cadastrado.');
		expect(screen.getByLabelText('Nome')).toHaveValue('');
	});

	it('valida campos acadêmicos e período de participação', async () => {
		const user = userEvent.setup();
		renderFormulario();
		await preencherFormulario(user);
		await user.click(screen.getByLabelText('É estudante da UTFPR'));
		await user.type(screen.getByLabelText('Curso'), 'Curso');
		await user.type(screen.getByLabelText('Período'), '1º');
		await user.type(screen.getByLabelText('RA'), '@@');
		await user.type(screen.getByLabelText('Data de Saída'), '2023-01-01');
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(screen.getByText('A data de saída não pode ser anterior à entrada.')).toBeInTheDocument();
		expect(screen.getByText('Informe o RA.')).toBeInTheDocument();
		expect(cadastrarVoluntario).not.toHaveBeenCalled();
	});

	it('exige curso, período e RA quando a pessoa é estudante UTFPR', async () => {
		const user = userEvent.setup();
		renderFormulario();
		await user.click(screen.getByLabelText('É estudante da UTFPR'));
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(screen.getByText('Informe o curso.')).toBeInTheDocument();
		expect(screen.getByText('Informe o período.')).toBeInTheDocument();
		expect(screen.getByText('Informe o RA.')).toBeInTheDocument();
	});

	it('valida nome e limites de comprimento nos campos textuais', async () => {
		const user = userEvent.setup();
		renderFormulario();
		await preencherFormulario(user);
		fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Nome 123' } });
		fireEvent.change(screen.getByLabelText('Nacionalidade'), { target: { value: 'N'.repeat(81) } });
		fireEvent.change(screen.getByLabelText('Endereço'), { target: { value: 'R'.repeat(201) } });
		fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'C'.repeat(101) } });
		await user.click(screen.getByLabelText('É estudante da UTFPR'));
		fireEvent.change(screen.getByLabelText('Curso'), { target: { value: 'C'.repeat(121) } });
		fireEvent.change(screen.getByLabelText('Período'), { target: { value: 'P'.repeat(31) } });
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(screen.getByText('Use apenas letras, espaços, apóstrofo, ponto ou hífen.')).toBeInTheDocument();
		expect(screen.getByText('Use até 80 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 200 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 100 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 120 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 30 caracteres.')).toBeInTheDocument();
	});

	it('valida nome acima do limite e RA inválido recebido em dados existentes', async () => {
		const user = userEvent.setup();
		const dadosInvalidos = {
			...voluntarioEditando,
			estudanteUtfpr: true,
			curso: 'C'.repeat(121),
			periodo: 'P'.repeat(31),
			ra: 'RA inválido',
		};
		renderFormulario(dadosInvalidos);
		fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'N'.repeat(121) } });
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(screen.getByText('O nome deve ter até 120 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 120 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 30 caracteres.')).toBeInTheDocument();
		expect(screen.getByText('Use até 30 letras, números, pontos ou hífens.')).toBeInTheDocument();
	});

	it('edita dados existentes e apresenta falhas da API', async () => {
		const user = userEvent.setup();
		editarVoluntario.mockRejectedValueOnce({ response: { data: { erro: 'CPF duplicado.' } } });
		renderFormulario(voluntarioEditando);
		expect(screen.getByRole('heading', { name: 'Editar Voluntário' })).toBeInTheDocument();
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('CPF duplicado.');
		expect(editarVoluntario).toHaveBeenCalledWith(21, expect.objectContaining({
			cpf: '529.982.247-25',
			telefone: '11 98456 4658',
		}));
	});

	it('salva edição e mostra mensagem de sucesso e erro simplificado', async () => {
		const user = userEvent.setup();
		editarVoluntario.mockResolvedValueOnce({});
		editarVoluntario.mockRejectedValueOnce({ response: { data: { message: 'Falha ao atualizar.' } } });
		renderFormulario(voluntarioEditando);
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(await screen.findByRole('status')).toHaveTextContent('Voluntário atualizado com sucesso.');
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao atualizar.');
	});

	it('usa mensagem de erro padrão quando API não fornece detalhe', async () => {
		const user = userEvent.setup();
		cadastrarVoluntario.mockRejectedValue(new Error('offline'));
		renderFormulario();
		await preencherFormulario(user);
		await user.click(screen.getByRole('button', { name: 'Salvar Voluntário' }));
		expect(await screen.findByRole('alert')).toHaveTextContent('Erro ao salvar o voluntário.');
	});
});
