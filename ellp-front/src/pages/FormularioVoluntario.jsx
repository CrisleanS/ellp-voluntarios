import { Header } from '../components/Header';
import './FormularioVoluntario.css';
import { useState } from 'react';
import { cadastrarVoluntario } from '../api/voluntarios';

export function FormularioVoluntario() {

	const [nome, setNome] = useState('');
	const [cpf, setCpf] = useState('');
	const [email, setEmail] = useState('');
	const [telefone, setTelefone] = useState('');

	async function handleSubmit(event) {
		event.preventDefault();

		const voluntario = {
	        nome,
	        cpf,
	        email,
	        telefone
        };

        try {
	        await cadastrarVoluntario(voluntario);

	        alert('Voluntário cadastrado com sucesso!');

	        setNome('');
	        setCpf('');
	        setEmail('');
	        setTelefone('');

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

				<form className="formulario-voluntario" onSubmit={handleSubmit}>

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

					<button type="submit">
						Salvar Voluntário
					</button>

				</form>
			</div>
		</>
	);
}