import { Header } from '../components/Header';
import './FormularioVoluntario.css';

import { useState } from 'react';

import { cadastrarVoluntario } from '../api/voluntarios';

export function FormularioVoluntario() {

	const [nome, setNome] = useState('');
	const [cpf, setCpf] = useState('');
	const [email, setEmail] = useState('');
	const [telefone, setTelefone] = useState('');

	const [dataNascimento, setDataNascimento] = useState('');
	const [nacionalidade, setNacionalidade] = useState('');
	const [endereco, setEndereco] = useState('');
	const [cidade, setCidade] = useState('');
	const [estado, setEstado] = useState('');
	const [dataEntrada, setDataEntrada] = useState('');

	const [estudanteUtfpr, setEstudanteUtfpr] = useState(false);

	const [curso, setCurso] = useState('');
	const [periodo, setPeriodo] = useState('');
	const [ra, setRa] = useState('');

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

		const voluntario = {
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
			estudanteUtfpr,
			curso,
			periodo,
			ra
		};

		try {

			await cadastrarVoluntario(voluntario);

			alert('Voluntário cadastrado com sucesso!');

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

			setEstudanteUtfpr(false);

			setCurso('');
			setPeriodo('');
			setRa('');

		} catch (error) {

			console.error(error);

			alert('Erro ao cadastrar voluntário.');
		}
	}

	return (
		<>
			<Header />

			<div className="container-formulario">

				<h2>Cadastro de Voluntário</h2>

				<form
					className="formulario-voluntario"
					onSubmit={handleSubmit}
				>

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

					<div className="grupo-form">
						<label>Data de Entrada</label>

						<input
							type="date"
							value={dataEntrada}
							onChange={(e) => setDataEntrada(e.target.value)}
						/>
					</div>

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

					<button type="submit">
						Salvar Voluntário
					</button>

				</form>

			</div>
		</>
	);
}