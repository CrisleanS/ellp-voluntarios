import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trocarSenha } from '../api/voluntarios';
import './TrocarSenha.css'

import axios from 'axios';

export function TrocarSenha() {

	const navigate = useNavigate();

	const [senhaAtual, setSenhaAtual] = useState('');
	const [senhaNova, setSenhaNova] = useState('');

	async function handleTrocarSenha(event) {
		if (event) {
			event.preventDefault();
		}

		try {
			const usuario = JSON.parse(localStorage.getItem('usuario'));

			if (!usuario || !usuario.id) {
				console.error("Usuário não encontrado no localStorage!");
				return;
			}

			const response = await trocarSenha(usuario.id, senhaAtual, senhaNova);
			console.log("Sucesso na alteração:", response.data);
			alert("Senha alterada com sucesso!");

			navigate('/inicial')

		} catch (error) {
			console.error("Erro ao trocar senha:", error);

			// Exibe a mensagem de erro que vem do backend (conforme a issue pediu
			const mensagemErro = error.response?.data?.erro || "Erro inesperado ao alterar senha";
			console.log("Motivo do erro:", mensagemErro);
		}
	}

	return (

		<div className="container-trocar-senha">

			<div className="card-trocar-senha">

				<div className="logo-trocar-senha">

					<h1>Voluntários ELLP</h1>

					<p>Sistema de gerenciamento</p>

				</div>

				<form
					className="form-login"
					onSubmit={handleTrocarSenha}
				>

					<div className="grupo-form">

						<label>Senha atual</label>

						<input
							type="password"
							value={senhaAtual}
							onChange={(e) => setSenhaAtual(e.target.value)}
							required
						/>

					</div>

					<div className="grupo-form">

						<label>Senha nova</label>

						<input
							type="password"
							value={senhaNova}
							onChange={(e) => setSenhaNova(e.target.value)}
							required
						/>

					</div>

					<button
						type="submit"
						className="botao-login"
					>
						Alterar
					</button>

					<button
						className="botao-voltar"
						onClick={() => {
							navigate('/')
						}}
					>
						Voltar
					</button>

				</form>

			</div>

		</div>
	);
}