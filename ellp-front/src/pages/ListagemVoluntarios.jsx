import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { listarVoluntarios } from '../api/voluntarios';
import { Link } from 'react-router-dom';

import './ListagemVoluntarios.css'

export function ListagemVoluntarios() {
	const [voluntarios, setVoluntarios] = useState([]);
	const [ativo, setAtivo] = useState(true)

	useEffect(() => {
		listarVoluntarios(ativo)
			.then(response => {
				setVoluntarios(response.data)
			})
			.catch(error => {
				console.error('Erro ao listar voluntários:', error)
			});
	}, [ativo])

	return (
		<>
			<Header />
			<h2>Listagem de Voluntários</h2>

			<div className='acoes-listagem'>
				<Link to='/voluntarios/novo' className='botao-novo-voluntario'>
					Novo voluntário
				</Link>
			</div>

			<div className='botoes-status'>
				<button onClick={() => setAtivo(true)} className='ativo'>Ativos</button>
				<button onClick={() => setAtivo(false)} className='inativo'>Inativos</button>
				<button onClick={() => setAtivo(undefined)} className='todos'>Todos</button>
			</div>

			<div className='usuarios-encontrados'>
				{voluntarios.length} voluntários encontrados
			</div>

			<table className="tabela-voluntarios">
				<thead>
					<tr>
						<th>Nome</th>
						<th>CPF</th>
						<th>E-mail</th>
						<th>Telefone</th>
						<th>Status</th>
						<th>Data de Entrada</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{voluntarios.map((voluntario) => (
						<tr key={voluntario.id}>
							<td>{voluntario.nome}</td>
							<td>{voluntario.cpf}</td>
							<td>{voluntario.email}</td>
							<td>{voluntario.telefone}</td>
							<td>
								<span className={`${voluntario.ativo ? 'ativo' : 'inativo'}`}>
									{voluntario.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</td>
							<td>{voluntario.dataEntrada}</td>
							<td>
								<Link to={`/voluntarios/${voluntario.id}/editar`}>Editar</Link>
							</td>
						</tr>
					))}
				</tbody>
			</table>

		</>
	);
}
