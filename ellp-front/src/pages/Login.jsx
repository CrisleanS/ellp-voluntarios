import './Login.css';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { iniciarPrimeiroAcesso, login } from '../api/usuarios';
import './PrimeiroAcesso.css';
import { Feedback } from '../components/Feedback';

export function Login() {

	const navigate = useNavigate();
	const location = useLocation();

	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');
	const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
	const [erroEmail, setErroEmail] = useState('');
	const [erroLogin, setErroLogin] = useState('');
	const [carregando, setCarregando] = useState(false);

	function validarEmail(valor) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
	}

	async function handleLogin(event) {

		event.preventDefault();

		setErroLogin('');
		if (!validarEmail(email) || !senha.trim()) {
			setErroLogin('E-mail ou senha inválidos.');
			return;
		}

		setCarregando(true);
		try {
			const response = await login({ email, senha });

			localStorage.setItem('token', response.data.token);
			localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
			if (response.data.usuario.primeiroLogin) {
				navigate('/trocar-senha')
			}
			else if (response.data.usuario.tipo === 'ADMIN') {
				navigate('/voluntarios')
			} else {
				navigate('/inicial')
			}


		} catch {
			setErroLogin('E-mail ou senha inválidos.');
		} finally {
			setCarregando(false);
		}
	}

	async function handlePrimeiroAcesso(event) {
		event.preventDefault();
		setErroEmail('');

		if (!validarEmail(email)) {
			setErroEmail('E-mail inválido.');
			return;
		}

		setCarregando(true);
		try {
			const response = await iniciarPrimeiroAcesso(email.trim());
			navigate('/primeiro-acesso/senha', {
				state: {
					usuarioId: response.data.usuarioId,
					token: response.data.token,
				},
			});
		} catch (error) {
			setErroEmail(error.response?.data?.erro || 'Não foi possível iniciar o primeiro acesso.');
		} finally {
			setCarregando(false);
		}
	}

	return (

		<div className="container-login">

			<div className="card-login">

				<div className="logo-login">

					<h1>Voluntários ELLP</h1>

					<p>Sistema de gerenciamento</p>

				</div>

				{primeiroAcesso ? (
					<form className="form-login" onSubmit={handlePrimeiroAcesso} noValidate>
						<div className="grupo-form">
							<label htmlFor="email-primeiro-acesso">E-mail cadastrado</label>
							<input
								id="email-primeiro-acesso"
								type="email"
								value={email}
								onChange={(event) => {
									setEmail(event.target.value);
									setErroEmail('');
								}}
								aria-invalid={Boolean(erroEmail)}
								aria-describedby={erroEmail ? 'erro-email-primeiro-acesso' : undefined}
								autoComplete="email"
								required
							/>
							{erroEmail && <span id="erro-email-primeiro-acesso" className="erro-campo" role="alert">{erroEmail}</span>}
						</div>
						<button type="submit" className="botao-login" disabled={carregando}>
							{carregando ? 'Verificando...' : 'Continuar'}
						</button>
						<button
							type="button"
							className="botao-secundario-login"
							onClick={() => {
								setPrimeiroAcesso(false);
								setErroEmail('');
							}}
						>
							Voltar ao login
						</button>
					</form>
				) : (
					<form className="form-login" onSubmit={handleLogin} noValidate>

					<div className="grupo-form">

						<label htmlFor="email-login">E-mail</label>

						<input
							id="email-login"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>

					</div>

					<div className="grupo-form">

						<label htmlFor="senha-login">Senha</label>

						<input
							id="senha-login"
							type="password"
							value={senha}
							onChange={(e) => {
								setSenha(e.target.value);
								setErroLogin('');
							}}
							required
						/>
						<Feedback mensagem={erroLogin} />

					</div>

					<button
						type="submit"
						className="botao-login"
						disabled={carregando}
					>
						{carregando ? 'Entrando...' : 'Entrar'}
					</button>

					<button
						type="button"
						className="botao-secundario-login"
						onClick={() => {
							setPrimeiroAcesso(true);
							setErroEmail('');
							setErroLogin('');
						}}
					>
						Primeiro acesso
					</button>
					<Feedback mensagem={location.state?.mensagem} tipo="sucesso" />
				</form>
				)}

			</div>

		</div>
	);
}