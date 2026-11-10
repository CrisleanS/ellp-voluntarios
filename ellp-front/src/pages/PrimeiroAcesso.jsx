import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { definirSenhaPrimeiroAcesso } from '../api/usuarios';
import './TrocarSenha.css';
import './PrimeiroAcesso.css';

const requisitosSenha = [
	{ id: 'tamanho', texto: 'Pelo menos 8 caracteres', valida: (senha) => senha.length >= 8 },
	{ id: 'maiuscula', texto: 'Uma letra maiúscula', valida: (senha) => /[A-Z]/.test(senha) },
	{ id: 'minuscula', texto: 'Uma letra minúscula', valida: (senha) => /[a-z]/.test(senha) },
	{ id: 'numero', texto: 'Um número', valida: (senha) => /\d/.test(senha) },
	{ id: 'especial', texto: 'Um caractere especial', valida: (senha) => /[^A-Za-z\d]/.test(senha) },
];

export function PrimeiroAcesso() {
	const location = useLocation();
	const navigate = useNavigate();
	const { usuarioId, token } = location.state || {};

	const [senha, setSenha] = useState('');
	const [confirmarSenha, setConfirmarSenha] = useState('');
	const [mostrarSenha, setMostrarSenha] = useState(false);
	const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
	const [erro, setErro] = useState('');
	const [tentouConfirmarSenha, setTentouConfirmarSenha] = useState(false);
	const [carregando, setCarregando] = useState(false);

	if (!usuarioId || !token) {
		return (
			<div className="container-trocar-senha">
				<div className="card-trocar-senha">
					<p className="erro-campo" role="alert">Solicitação de primeiro acesso inválida ou expirada.</p>
					<button className="botao-voltar" onClick={() => navigate('/', { replace: true })}>
						Voltar ao login
					</button>
				</div>
			</div>
		);
	}

	const todosRequisitosAtendidos = requisitosSenha.every((requisito) => requisito.valida(senha));

	async function handleSubmit(event) {
		event.preventDefault();
		setErro('');
		setTentouConfirmarSenha(true);

		if (!todosRequisitosAtendidos) {
			const faltando = requisitosSenha
				.filter((requisito) => !requisito.valida(senha))
				.map((requisito) => requisito.texto.toLowerCase());
			setErro(`Ainda falta: ${faltando.join(', ')}.`);
			return;
		}
		if (senhaConfirmacaoInvalida()) {
			return;
		}

		setCarregando(true);
		try {
			await definirSenhaPrimeiroAcesso(usuarioId, senha, confirmarSenha, token);
			navigate('/', {
				replace: true,
				state: { mensagem: 'Senha cadastrada. Agora entre com seu e-mail e a nova senha.' },
			});
		} catch (error) {
			setErro(error.response?.data?.erro || 'Não foi possível cadastrar a senha. Solicite um novo primeiro acesso.');
		} finally {
			setCarregando(false);
		}
	}

	function senhaConfirmacaoInvalida() {
		return !confirmarSenha || senha !== confirmarSenha;
	}

	return (
		<div className="container-trocar-senha">
			<div className="card-trocar-senha">
				<div className="logo-trocar-senha">
					<h1>Voluntários ELLP</h1>
					<p>Cadastre sua senha de acesso</p>
				</div>

				<form className="form-login" onSubmit={handleSubmit} noValidate>
					<div className="grupo-form">
						<label htmlFor="senha-primeiro-acesso">Senha</label>
						<div className="campo-senha">
							<input
								id="senha-primeiro-acesso"
								type={mostrarSenha ? 'text' : 'password'}
								value={senha}
								onChange={(event) => {
									setSenha(event.target.value);
									setErro('');
								}}
								autoComplete="new-password"
								aria-describedby="requisitos-senha"
								required
							/>
							<button
								type="button"
								className="botao-mostrar-senha"
								onClick={() => setMostrarSenha((mostrar) => !mostrar)}
								aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
							>
								{mostrarSenha ? 'Ocultar' : 'Mostrar'}
							</button>
						</div>
					</div>

					<ul className="lista-requisitos" id="requisitos-senha" aria-live="polite">
						{requisitosSenha.map((requisito) => {
							const atendido = requisito.valida(senha);
							return (
								<li key={requisito.id} className={atendido ? 'requisito-atendido' : 'requisito-pendente'}>
									<span aria-hidden="true">{atendido ? '✓' : '○'}</span> {requisito.texto}
								</li>
							);
						})}
					</ul>

					<div className="grupo-form">
						<label htmlFor="confirmar-senha-primeiro-acesso">Repita a senha</label>
						<div className="campo-senha">
							<input
								id="confirmar-senha-primeiro-acesso"
								type={mostrarConfirmacao ? 'text' : 'password'}
								value={confirmarSenha}
								onChange={(event) => {
									setConfirmarSenha(event.target.value);
									setErro('');
								}}
								autoComplete="new-password"
								aria-invalid={Boolean(tentouConfirmarSenha && senhaConfirmacaoInvalida())}
								required
							/>
							<button
								type="button"
								className="botao-mostrar-senha"
								onClick={() => setMostrarConfirmacao((mostrar) => !mostrar)}
								aria-label={mostrarConfirmacao ? 'Ocultar confirmação da senha' : 'Mostrar confirmação da senha'}
							>
								{mostrarConfirmacao ? 'Ocultar' : 'Mostrar'}
							</button>
						</div>
						{tentouConfirmarSenha && senhaConfirmacaoInvalida() && (
							<span className="erro-campo" role="alert">As senhas não coincidem.</span>
						)}
					</div>

					{erro && <p className="erro-campo" role="alert">{erro}</p>}

					<button type="submit" className="botao-login" disabled={carregando}>
						{carregando ? 'Cadastrando...' : 'Cadastrar senha'}
					</button>
				</form>
			</div>
		</div>
	);
}
