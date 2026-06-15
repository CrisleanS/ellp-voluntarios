import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { listarVoluntarios, registrarSaida, gerarTermo } from '../api/voluntarios';
import { Menu } from '../components/Menu';
import { formatarData } from '../uteis/formatarData';

import './ListagemVoluntarios.css'

export function ListagemVoluntarios() {
	const [voluntarios, setVoluntarios] = useState([]);
	const [voluntarioSelecionado, setVoluntarioSelecionado] = useState(null);
	const [ativo, setAtivo] = useState(true)
	const [modalAberto, setModalAberto] = useState(false)
	const [busca, setBusca] = useState('')
	const [mensagem, setMensagem] = useState(null) // { texto, tipo: 'sucesso' | 'erro' }

	useEffect(() => {
		listarVoluntarios(ativo)
			.then(response => {
				setVoluntarios(response.data)
			})
			.catch(error => {
				console.error('Erro ao listar voluntários:', error)
				mostrarMensagem('Erro ao carregar voluntários.', 'erro')
			});
	}, [ativo])

	function mostrarMensagem(texto, tipo) {
		setMensagem({ texto, tipo })
		setTimeout(() => setMensagem(null), 4000)
	}

	function desativarVoluntario(id) {
		registrarSaida(id)
			.then(() => {
				setVoluntarios(prev =>
					prev.map(v => v.id === id ? { ...v, ativo: false } : v)
				)
				mostrarMensagem('Voluntário desativado com sucesso.', 'sucesso')
			})
			.catch(error => {
				console.error('Erro ao desativar voluntário:', error)
				mostrarMensagem('Erro ao desativar voluntário.', 'erro')
			});
	}

	async function baixarTermo(id, nome) {
		try {
			const response = await gerarTermo(id);
			const blob = new Blob([response.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `termo-voluntario-${id}.pdf`;
			link.click();
			window.URL.revokeObjectURL(url);
			mostrarMensagem(`Termo de ${nome} gerado com sucesso.`, 'sucesso')
		} catch (error) {
			console.error('Erro ao gerar termo:', error)
			mostrarMensagem('Erro ao gerar o termo em PDF.', 'erro')
		}
	}

	function abrirDetalhes(voluntario) {
		setVoluntarioSelecionado(voluntario)
		setModalAberto(true)
	}

	function fecharDetalhes() {
		setVoluntarioSelecionado(null)
		setModalAberto(false)
	}

	// Filtro por texto (nome ou CPF)
	const voluntariosFiltrados = voluntarios.filter(v => {
		const termo = busca.toLowerCase()
		return (
			v.nome.toLowerCase().includes(termo) ||
			v.cpf.toLowerCase().includes(termo)
		)
	})

	const isAdmin = JSON.parse(localStorage.getItem('usuario'))?.tipo === 'ADMIN';

	return (
		<>
			<Header />
			<Menu />
			<h2>Listagem de Voluntários</h2>

			{mensagem && (
				<div className={`mensagem-feedback ${mensagem.tipo}`}>
					{mensagem.texto}
				</div>
			)}

			<div className='botoes-status'>
				<button onClick={() => setAtivo(true)} className='ativo'>Ativos</button>
				<button onClick={() => setAtivo(false)} className='inativo'>Inativos</button>
				<button onClick={() => setAtivo(undefined)} className='todos'>Todos</button>
			</div>

			<div className='barra-busca'>
				<input
					type="text"
					placeholder="Buscar por nome ou CPF..."
					value={busca}
					onChange={(e) => setBusca(e.target.value)}
				/>
			</div>

			<div className='usuarios-encontrados'>
				{voluntariosFiltrados.length} voluntários encontrados
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
					{voluntariosFiltrados.map((voluntario) => (
						<tr
							key={voluntario.id}
							onClick={() => abrirDetalhes(voluntario)}
						>
							<td>{voluntario.nome}</td>
							<td>{voluntario.cpf}</td>
							<td>{voluntario.email}</td>
							<td>{voluntario.telefone}</td>

							<td>
								<span className={`${voluntario.ativo ? 'ativo' : 'inativo'}`}>
									{voluntario.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</td>

							<td>{formatarData(voluntario.dataEntrada)}</td>

							<td className='botao-desativar'>

								{isAdmin && voluntario.ativo && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											desativarVoluntario(voluntario.id);
										}}
									>
										Desativar
									</button>
								)}

								{isAdmin && (
									<button
										onClick={(e) => {
											e.stopPropagation();
											baixarTermo(voluntario.id, voluntario.nome);
										}}
										style={{ marginLeft: '5px' }}
									>
										Gerar Termo
									</button>
								)}

							</td>
						</tr>
					))}
				</tbody>
			</table>

			{modalAberto && voluntarioSelecionado && (
				<div className="modal-overlay" onClick={fecharDetalhes}>
					<div
						className="modal-content modal-largo"
						onClick={(e) => e.stopPropagation()}
					>

						<h2>Detalhes do Voluntário</h2>
						<hr />

						<div className="detalhes-grid">

							<div className="secao-detalhe">
								<h3>Dados Pessoais</h3>

								<p>
									<strong>Nome:</strong> {voluntarioSelecionado.nome}
								</p>

								<p>
									<strong>CPF:</strong> {voluntarioSelecionado.cpf}
								</p>

								<p>
									<strong>Nascimento:</strong> {formatarData(voluntarioSelecionado.dataNascimento)}
								</p>

								<p>
									<strong>Endereço:</strong> {voluntarioSelecionado.endereco},
									{' '}
									{voluntarioSelecionado.cidade}
									{' - '}
									{voluntarioSelecionado.estado}
								</p>
							</div>

							<div className="secao-detalhe">
								<h3>Contato</h3>

								<p>
									<strong>E-mail:</strong> {voluntarioSelecionado.email}
								</p>

								<p>
									<strong>Telefone:</strong> {voluntarioSelecionado.telefone}
								</p>
							</div>

							{voluntarioSelecionado.estudanteUtfpr && (
								<div className="secao-detalhe destaque-faculdade">
									<h3>Vínculo Acadêmico</h3>

									<p><strong>Instituição:</strong> UTFPR</p>
									<p><strong>RA:</strong> {voluntarioSelecionado.ra}</p>

									<p>
										<strong>Curso:</strong> {voluntarioSelecionado.curso}
										{' '}
										({voluntarioSelecionado.periodo})
									</p>
								</div>
							)}

							<div className="secao-detalhe largura-total">
								<h3>Participação no Projeto</h3>

								<p>
									<strong>Status:</strong>

									<span
										className={`status-badge ${voluntarioSelecionado.ativo ? 'ativo' : 'inativo'}`}
									>
										{voluntarioSelecionado.ativo ? 'Ativo' : 'Inativo'}
									</span>
								</p>

								<p>
									<strong>Data de Entrada:</strong>
									{' '}
									{formatarData(voluntarioSelecionado.dataEntrada)}
								</p>

								{!voluntarioSelecionado.ativo && voluntarioSelecionado.dataSaida && (
									<p>
										<strong>Data de Saída:</strong>
										{' '}
										{formatarData(voluntarioSelecionado.dataSaida)}
									</p>
								)}

								<div className="sintese-box">
									<strong>Síntese de Atividades:</strong>

									<p>{voluntarioSelecionado.sinteseAtividades}</p>
								</div>
							</div>

						</div>

						<button className="btn-fechar" onClick={fecharDetalhes}>
							Fechar
						</button>

					</div>
				</div>
			)}

		</>
	);
}
