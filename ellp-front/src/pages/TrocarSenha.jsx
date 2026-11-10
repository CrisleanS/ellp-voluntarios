import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trocarSenha } from '../api/usuarios';
import './TrocarSenha.css'
import { Feedback } from '../components/Feedback';

export function TrocarSenha() {

	const navigate = useNavigate();

	const [senhaAtual, setSenhaAtual] = useState('');
	const [senhaNova, setSenhaNova] = useState('');
	const [feedback, setFeedback] = useState(null);
	const [usuarioAtualizado, setUsuarioAtualizado] = useState(null);

	async function handleTrocarSenha(event) {
		if (event) {
			event.preventDefault();
		}
		setFeedback(null);

		try {
			const usuario = JSON.parse(localStorage.getItem('usuario'));

			if (!usuario || !usuario.id) {
				setFeedback({ tipo: 'erro', mensagem: 'Não foi possível identificar o usuário. Entre novamente.' });
				return;
			}

			const response = await trocarSenha(usuario.id, senhaAtual, senhaNova);
			localStorage.setItem('usuario', JSON.stringify(response.data));
			setUsuarioAtualizado(response.data);
			setFeedback({ tipo: 'sucesso', mensagem: 'Senha alterada com sucesso.' });

		} catch (error) {
			console.error("Erro ao trocar senha:", error);
			const mensagemErro = error.response?.data?.erro || "Erro inesperado ao alterar senha";
			setFeedback({ tipo: 'erro', mensagem: mensagemErro });
		}
	}

	function continuar() {
		navigate(usuarioAtualizado?.tipo === 'ADMIN' ? '/voluntarios' : '/inicial');
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

						<label htmlFor="senha-atual">Senha atual</label>

						<input
							id="senha-atual"
							type="password"
							value={senhaAtual}
							onChange={(e) => setSenhaAtual(e.target.value)}
							required
						/>

					</div>

					<div className="grupo-form">

						<label htmlFor="senha-nova">Senha nova</label>

						<input
							id="senha-nova"
							type="password"
							value={senhaNova}
							onChange={(e) => setSenhaNova(e.target.value)}
							required
						/>

					</div>

					<button
						type="submit"
						className="botao-login"
						disabled={Boolean(usuarioAtualizado)}
					>
						Alterar
					</button>

					<Feedback mensagem={feedback?.mensagem} tipo={feedback?.tipo} />

					{usuarioAtualizado && (
						<button type="button" className="botao-voltar" onClick={continuar}>
							Continuar
						</button>
					)}

					<button
						type="button"
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