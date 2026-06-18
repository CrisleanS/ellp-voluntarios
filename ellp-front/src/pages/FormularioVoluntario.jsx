import { Header } from '../components/Header';
import './FormularioVoluntario.css';
import { Menu } from '../components/Menu';
import { Navigate, useParams, useLocation } from 'react-router-dom';

import { useState } from 'react';

import { cadastrarVoluntario, editarVoluntario } from '../api/voluntarios';

export function FormularioVoluntario() {
	const location = useLocation();

	// Resgata os dados do voluntário que foram enviados pelo botão
	const voluntario = location.state?.voluntario;

	const usuario = JSON.parse(
		localStorage.getItem('usuario')
	);

	if (usuario?.tipo !== 'ADMIN') {
		return <Navigate to="/voluntarios" />;
	}

	const [nome, setNome] = useState(voluntario?.nome || '');
	const [cpf, setCpf] = useState(voluntario?.cpf || '');
	const [email, setEmail] = useState(voluntario?.email || '');
	const [telefone, setTelefone] = useState(voluntario?.telefone || '');

	const [dataNascimento, setDataNascimento] = useState(voluntario?.dataNascimento || '');
	const [nacionalidade, setNacionalidade] = useState(voluntario?.nacionalidade || '');
	const [endereco, setEndereco] = useState(voluntario?.endereco || '');
	const [cidade, setCidade] = useState(voluntario?.cidade || '');
	const [estado, setEstado] = useState(voluntario?.estado || '');

	const [dataEntrada, setDataEntrada] = useState(voluntario?.dataEntrada || '');
	const [dataSaida, setDataSaida] = useState(voluntario?.dataSaida || '');

	const [estudanteUtfpr, setEstudanteUtfpr] = useState(voluntario?.estudanteUtfpr || false);

	const [curso, setCurso] = useState(voluntario?.curso || '');
	const [periodo, setPeriodo] = useState(voluntario?.periodo || '');
	const [ra, setRa] = useState(voluntario?.ra || '');

	const [sinteseAtividades, setSinteseAtividades] = useState(voluntario?.sinteseAtividades || '');

	async function handleSubmit(event) {

		event.preventDefault();

		if (
			!nome ||
			!cpf ||
			!email ||
			!telefone ||
			!dataNascimento ||
			!nacionalidade ||
			!endereco ||
			!cidade ||
			!estado ||
			!dataEntrada
		) {

			alert('Preencha todos os campos obrigatórios.');

			return;
		}

		if (estudanteUtfpr && (!curso || !periodo || !ra)) {

			alert('Preencha os dados acadêmicos da UTFPR.');

			return;
		}

		const voluntarioAtt = {
			nome,
			cpf,
			email,
			telefone,
			dataNascimento,
			nacionalidade,
			endereco,
			cidade,
			estado,
			dataEntrada,
			ativo: true,
			dataSaida,
			estudanteUtfpr,
			curso,
			periodo,
			ra,
			sinteseAtividades
		};

		try {

			// Verificamos se existe um id (ou a propriedade que identifica seu voluntario)
			// Se existir, significa que estamos editando.
			if (voluntario?.id) {
				await editarVoluntario(voluntario.id, voluntarioAtt);
				alert('Voluntário atualizado com sucesso!');
			} else {
				// Se não tem ID, é um cadastro novo
				await cadastrarVoluntario(voluntarioAtt);
				alert('Voluntário cadastrado com sucesso!');
				limparDados()
			}

		} catch (error) {
			console.error(error);

			console.log('Resposta:', error.response);

			alert(
				error.response?.data?.erro ||
				error.response?.data?.message ||
				'Erro ao cadastrar voluntário.'
			);
		}
	}

	function limparDados() {
		setNome('');
		setCpf('');
		setEmail('');
		setTelefone('');
		setDataNascimento('');
		setNacionalidade('');
		setEndereco('');
		setCidade('');
		setEstado('');
		setDataEntrada('');
		setDataSaida('');

		setEstudanteUtfpr(false);

		setCurso('');
		setPeriodo('');
		setRa('');

		setSinteseAtividades('');
	}

	return (
		<>
			<Header />
			<Menu />

			<div className="container-formulario">

				<h2>{voluntario ? 'Editar Voluntário' : 'Cadastro de Voluntário'}</h2>

				<form
					className="formulario-voluntario"
					onSubmit={handleSubmit}
				>

					<h3>Dados Pessoais</h3>

					<div className="grupo-form">
						<label>Nome</label>

						<input
							type="text"
							value={nome}
							onChange={(e) => setNome(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>CPF</label>

						<input
							type="text"
							value={cpf}
							onChange={(e) => setCpf(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>E-mail</label>

						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Telefone</label>

						<input
							type="text"
							value={telefone}
							onChange={(e) => setTelefone(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Data de Nascimento</label>

						<input
							type="date"
							value={dataNascimento}
							onChange={(e) => setDataNascimento(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Nacionalidade</label>

						<input
							type="text"
							value={nacionalidade}
							onChange={(e) => setNacionalidade(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Endereço</label>

						<input
							type="text"
							value={endereco}
							onChange={(e) => setEndereco(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Cidade</label>

						<input
							type="text"
							value={cidade}
							onChange={(e) => setCidade(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Estado</label>

						<input
							type="text"
							value={estado}
							onChange={(e) => setEstado(e.target.value)}
						/>
					</div>

					<h3>Dados Acadêmicos</h3>

					<div className="grupo-checkbox">

						<label>
							<input
								type="checkbox"
								checked={estudanteUtfpr}
								onChange={(e) => setEstudanteUtfpr(e.target.checked)}
							/>

							É estudante da UTFPR
						</label>

					</div>

					{estudanteUtfpr && (
						<>

							<div className="grupo-form">
								<label>Curso</label>

								<input
									type="text"
									value={curso}
									onChange={(e) => setCurso(e.target.value)}
								/>
							</div>

							<div className="grupo-form">
								<label>Período</label>

								<input
									type="text"
									value={periodo}
									onChange={(e) => setPeriodo(e.target.value)}
								/>
							</div>

							<div className="grupo-form">
								<label>RA</label>

								<input
									type="text"
									value={ra}
									onChange={(e) => setRa(e.target.value)}
								/>
							</div>

						</>
					)}

					<h3>Participação no Projeto</h3>

					<div className="grupo-form">
						<label>Data de Entrada</label>

						<input
							type="date"
							value={dataEntrada}
							onChange={(e) => setDataEntrada(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Data de Saída</label>

						<input
							type="date"
							value={dataSaida}
							onChange={(e) => setDataSaida(e.target.value)}
						/>
					</div>

					<div className="grupo-form">
						<label>Síntese das Atividades</label>

						<textarea
							rows="6"
							value={sinteseAtividades}
							onChange={(e) => setSinteseAtividades(e.target.value)}
						/>
					</div>

					<button type="submit">
						Salvar Voluntário
					</button>

				</form>

			</div>
		</>
	);
}