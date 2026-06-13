import './Login.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';

export function Login() {

	const navigate = useNavigate();

	const [email, setEmail] = useState('');
	const [senha, setSenha] = useState('');

	async function handleLogin(event) {

		event.preventDefault();

		try {

			const response = await axios.post(
				'http://localhost:8081/api/usuarios/login',
				{
					email,
					senha
				}
			);

			localStorage.setItem(
				'usuario',
				JSON.stringify(response.data)
			);

			if (response.data.tipo === 'ADMIN') {

				navigate('/voluntarios/novo');

			} else {

				navigate('/voluntarios');
			}

		} catch (error) {

			console.error(error);

			alert('E-mail ou senha inválidos.');
		}
	}

	return (

		<div className="container-login">

			<div className="card-login">

				<div className="logo-login">

					<h1>Voluntários ELLP</h1>

					<p>Sistema de gerenciamento</p>

				</div>

				<form
					className="form-login"
					onSubmit={handleLogin}
				>

					<div className="grupo-form">

						<label>E-mail</label>

						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>

					</div>

					<div className="grupo-form">

						<label>Senha</label>

						<input
							type="password"
							value={senha}
							onChange={(e) => setSenha(e.target.value)}
							required
						/>

					</div>

					<button
						type="submit"
						className="botao-login"
					>
						Entrar
					</button>

				</form>

			</div>

		</div>
	);
}