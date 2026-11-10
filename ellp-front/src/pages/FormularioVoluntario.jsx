import { Header } from '../components/Header';
import './FormularioVoluntario.css';
import { Menu } from '../components/Menu';
import { useLocation } from 'react-router-dom';

import { useState } from 'react';

import { cadastrarVoluntario, editarVoluntario } from '../api/voluntarios';
import { Feedback } from '../components/Feedback';
import {
	formatarCpf,
	formatarTelefone,
	validarCpf,
	validarDataNascimento,
	validarEmail,
	validarTelefone,
} from '../uteis/formatarCamposVoluntario';

const estadosBrasileiros = new Set([
	'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT',
	'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO',
	'RR', 'SC', 'SP', 'SE', 'TO',
]);

function dataLocalHoje() {
	const hoje = new Date();
	hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
	return hoje.toISOString().slice(0, 10);
}

export function FormularioVoluntario() {
	const location = useLocation();

	// Resgata os dados do voluntário que foram enviados pelo botão
	const voluntario = location.state?.voluntario;

	const [nome, setNome] = useState(voluntario?.nome || '');
	const [cpf, setCpf] = useState(formatarCpf(voluntario?.cpf || ''));
	const [email, setEmail] = useState(voluntario?.email || '');
	const [telefone, setTelefone] = useState(formatarTelefone(voluntario?.telefone || ''));

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
	const [feedback, setFeedback] = useState(null);
	const [erros, setErros] = useState({});

	function atualizarCampo(campo, valor, atualizar) {
		atualizar(valor);
		setErros((atuais) => ({ ...atuais, [campo]: '' }));
		setFeedback(null);
	}

	function validarFormulario() {
		const novosErros = {};
		if (!nome.trim()) novosErros.nome = 'Informe o nome.';
		else if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(nome.trim())) novosErros.nome = 'Use apenas letras, espaços, apóstrofo, ponto ou hífen.';
		else if (nome.trim().length > 120) novosErros.nome = 'O nome deve ter até 120 caracteres.';

		if (!validarCpf(cpf)) novosErros.cpf = 'Informe um CPF válido.';
		if (!validarEmail(email)) novosErros.email = 'Informe um e-mail válido.';
		if (!validarTelefone(telefone)) novosErros.telefone = 'Informe um telefone com DDD: 10 ou 11 dígitos.';
		if (!validarDataNascimento(dataNascimento)) novosErros.dataNascimento = 'Informe uma data de nascimento válida, anterior a hoje.';
		if (!nacionalidade.trim()) novosErros.nacionalidade = 'Informe a nacionalidade.';
		else if (nacionalidade.trim().length > 80) novosErros.nacionalidade = 'Use até 80 caracteres.';
		if (!endereco.trim()) novosErros.endereco = 'Informe o endereço.';
		else if (endereco.trim().length > 200) novosErros.endereco = 'Use até 200 caracteres.';
		if (!cidade.trim()) novosErros.cidade = 'Informe a cidade.';
		else if (cidade.trim().length > 100) novosErros.cidade = 'Use até 100 caracteres.';
		if (!estadosBrasileiros.has(estado.trim().toUpperCase())) novosErros.estado = 'Informe a sigla de um estado brasileiro.';
		if (!dataEntrada) novosErros.dataEntrada = 'Informe a data de entrada.';
		if (dataSaida && dataSaida < dataEntrada) novosErros.dataSaida = 'A data de saída não pode ser anterior à entrada.';
		if (estudanteUtfpr) {
			if (!curso.trim()) novosErros.curso = 'Informe o curso.';
			else if (curso.trim().length > 120) novosErros.curso = 'Use até 120 caracteres.';
			if (!periodo.trim()) novosErros.periodo = 'Informe o período.';
			else if (periodo.trim().length > 30) novosErros.periodo = 'Use até 30 caracteres.';
			if (!ra.trim()) novosErros.ra = 'Informe o RA.';
			else if (!/^[A-Za-z0-9.-]{1,30}$/.test(ra.trim())) novosErros.ra = 'Use até 30 letras, números, pontos ou hífens.';
		}

		setErros(novosErros);
		return Object.keys(novosErros).length === 0;
	}

	async function handleSubmit(event) {

		event.preventDefault();
		setFeedback(null);
		if (!validarFormulario()) {
			setFeedback({ tipo: 'erro', mensagem: 'Revise os campos destacados.' });
			return;
		}

		const voluntarioAtt = {
			nome: nome.trim(),
			cpf: formatarCpf(cpf),
			email: email.trim(),
			telefone: formatarTelefone(telefone),
			dataNascimento,
			nacionalidade: nacionalidade.trim(),
			endereco: endereco.trim(),
			cidade: cidade.trim(),
			estado: estado.trim().toUpperCase(),
			dataEntrada,
			ativo: true,
			dataSaida,
			estudanteUtfpr,
			curso: curso.trim(),
			periodo: periodo.trim(),
			ra: ra.trim().toUpperCase(),
			sinteseAtividades: sinteseAtividades.trim()
		};

		try {

			// Verificamos se existe um id (ou a propriedade que identifica seu voluntario)
			// Se existir, significa que estamos editando.
			if (voluntario?.id) {
				await editarVoluntario(voluntario.id, voluntarioAtt);
				setFeedback({ tipo: 'sucesso', mensagem: 'Voluntário atualizado com sucesso.' });
			} else {
				await cadastrarVoluntario(voluntarioAtt);
				setFeedback({
					tipo: 'sucesso',
					mensagem: 'Voluntário cadastrado. Ele já pode iniciar o primeiro acesso usando o e-mail informado.',
				});
				limparDados();
			}

		} catch (error) {
			console.error(error);

			setFeedback({
				tipo: 'erro',
				mensagem: error.response?.data?.erro ||
					error.response?.data?.message ||
					'Erro ao salvar o voluntário.',
			});
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
					noValidate
				>

					<h3>Dados Pessoais</h3>

					<div className="grupo-form">
						<label htmlFor="nome">Nome</label>

						<input
							id="nome"
							type="text"
							value={nome}
							maxLength={120}
							autoComplete="name"
							aria-invalid={Boolean(erros.nome)}
							aria-describedby={erros.nome ? 'erro-nome' : undefined}
							onChange={(e) => atualizarCampo('nome', e.target.value, setNome)}
						/>
						{erros.nome && <span id="erro-nome" className="erro-campo" role="alert">{erros.nome}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="cpf">CPF</label>

						<input
							id="cpf"
							type="text"
							value={cpf}
							placeholder="000.000.000-00"
							inputMode="numeric"
							maxLength={14}
							aria-invalid={Boolean(erros.cpf)}
							aria-describedby={erros.cpf ? 'erro-cpf' : undefined}
							onChange={(e) => atualizarCampo('cpf', formatarCpf(e.target.value), setCpf)}
						/>
						{erros.cpf && <span id="erro-cpf" className="erro-campo" role="alert">{erros.cpf}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="email-voluntario">E-mail</label>

						<input
							id="email-voluntario"
							type="email"
							value={email}
							maxLength={254}
							autoComplete="email"
							aria-invalid={Boolean(erros.email)}
							aria-describedby={erros.email ? 'erro-email-voluntario' : undefined}
							onChange={(e) => atualizarCampo('email', e.target.value, setEmail)}
						/>
						{erros.email && <span id="erro-email-voluntario" className="erro-campo" role="alert">{erros.email}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="telefone">Telefone</label>

						<input
							id="telefone"
							type="tel"
							value={telefone}
							placeholder="11 98456 4658"
							inputMode="numeric"
							maxLength={13}
							autoComplete="tel"
							aria-invalid={Boolean(erros.telefone)}
							aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
							onChange={(e) => atualizarCampo('telefone', formatarTelefone(e.target.value), setTelefone)}
						/>
						{erros.telefone && <span id="erro-telefone" className="erro-campo" role="alert">{erros.telefone}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="data-nascimento">Data de Nascimento</label>

						<input
							id="data-nascimento"
							type="date"
							value={dataNascimento}
							max={dataLocalHoje()}
							aria-invalid={Boolean(erros.dataNascimento)}
							aria-describedby={erros.dataNascimento ? 'erro-data-nascimento' : undefined}
							onChange={(e) => atualizarCampo('dataNascimento', e.target.value, setDataNascimento)}
						/>
						{erros.dataNascimento && <span id="erro-data-nascimento" className="erro-campo" role="alert">{erros.dataNascimento}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="nacionalidade">Nacionalidade</label>

						<input
							id="nacionalidade"
							type="text"
							value={nacionalidade}
							maxLength={80}
							aria-invalid={Boolean(erros.nacionalidade)}
							onChange={(e) => atualizarCampo('nacionalidade', e.target.value, setNacionalidade)}
						/>
						{erros.nacionalidade && <span className="erro-campo" role="alert">{erros.nacionalidade}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="endereco">Endereço</label>

						<input
							id="endereco"
							type="text"
							value={endereco}
							maxLength={200}
							autoComplete="street-address"
							aria-invalid={Boolean(erros.endereco)}
							onChange={(e) => atualizarCampo('endereco', e.target.value, setEndereco)}
						/>
						{erros.endereco && <span className="erro-campo" role="alert">{erros.endereco}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="cidade">Cidade</label>

						<input
							id="cidade"
							type="text"
							value={cidade}
							maxLength={100}
							autoComplete="address-level2"
							aria-invalid={Boolean(erros.cidade)}
							onChange={(e) => atualizarCampo('cidade', e.target.value, setCidade)}
						/>
						{erros.cidade && <span className="erro-campo" role="alert">{erros.cidade}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="estado">Estado (UF)</label>

						<input
							id="estado"
							type="text"
							value={estado}
							placeholder="PR"
							maxLength={2}
							autoComplete="address-level1"
							aria-invalid={Boolean(erros.estado)}
							onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2), setEstado)}
						/>
						{erros.estado && <span className="erro-campo" role="alert">{erros.estado}</span>}
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
								<label htmlFor="curso">Curso</label>

								<input
									id="curso"
									type="text"
									value={curso}
									maxLength={120}
									aria-invalid={Boolean(erros.curso)}
									onChange={(e) => atualizarCampo('curso', e.target.value, setCurso)}
								/>
								{erros.curso && <span className="erro-campo" role="alert">{erros.curso}</span>}
							</div>

							<div className="grupo-form">
								<label htmlFor="periodo">Período</label>

								<input
									id="periodo"
									type="text"
									value={periodo}
									maxLength={30}
									aria-invalid={Boolean(erros.periodo)}
									onChange={(e) => atualizarCampo('periodo', e.target.value, setPeriodo)}
								/>
								{erros.periodo && <span className="erro-campo" role="alert">{erros.periodo}</span>}
							</div>

							<div className="grupo-form">
								<label htmlFor="ra">RA</label>

								<input
									id="ra"
									type="text"
									value={ra}
									maxLength={30}
									aria-invalid={Boolean(erros.ra)}
									onChange={(e) => atualizarCampo('ra', e.target.value.toUpperCase().replace(/[^A-Z0-9.-]/g, '').slice(0, 30), setRa)}
								/>
								{erros.ra && <span className="erro-campo" role="alert">{erros.ra}</span>}
							</div>

						</>
					)}

					<h3>Participação no Projeto</h3>

					<div className="grupo-form">
						<label htmlFor="data-entrada">Data de Entrada</label>

						<input
							id="data-entrada"
							type="date"
							value={dataEntrada}
							aria-invalid={Boolean(erros.dataEntrada)}
							onChange={(e) => atualizarCampo('dataEntrada', e.target.value, setDataEntrada)}
						/>
						{erros.dataEntrada && <span className="erro-campo" role="alert">{erros.dataEntrada}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="data-saida">Data de Saída</label>

						<input
							id="data-saida"
							type="date"
							value={dataSaida}
							min={dataEntrada || undefined}
							aria-invalid={Boolean(erros.dataSaida)}
							onChange={(e) => atualizarCampo('dataSaida', e.target.value, setDataSaida)}
						/>
						{erros.dataSaida && <span className="erro-campo" role="alert">{erros.dataSaida}</span>}
					</div>

					<div className="grupo-form">
						<label htmlFor="sintese-atividades">Síntese das Atividades</label>

						<textarea
							id="sintese-atividades"
							rows="6"
							value={sinteseAtividades}
							maxLength={5000}
							onChange={(e) => setSinteseAtividades(e.target.value)}
						/>
					</div>

					<button type="submit">
						Salvar Voluntário
					</button>
					<Feedback mensagem={feedback?.mensagem} tipo={feedback?.tipo} />

				</form>

			</div>
		</>
	);
}