import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { listarVoluntarios } from '../api/voluntarios';
import { registrarSaida } from '../api/voluntarios';

import './ListagemVoluntarios.css'

export function ListagemVoluntarios() {
	const [voluntarios, setVoluntarios] = useState([]);
	const [voluntarioSelecionado, setVoluntarioSelecionado] = useState(null);
	const [ativo, setAtivo] = useState(true)
	const [modalAberto, setModalAberto] = useState(false)

	useEffect(() => {
		listarVoluntarios(ativo)
			.then(response => {
				setVoluntarios(response.data)
			})
			.catch(error => {
				console.error('Erro ao listar voluntários:', error)
			});
	}, [ativo])

	function desativarVoluntario(id) {
		registrarSaida(id)
			.then(() => {
				setVoluntarios(prev => prev.map(v => v.id === id ? { ...v, ativo: false } : v))
			})
			.catch(error => {
				console.error('Erro ao desativar voluntário:', error)
			});
	}

	function abrirDetalhes(voluntario) {
		setVoluntarioSelecionado(voluntario)
		setModalAberto(true)
	}

	function fecharDetalhes() {
		setVoluntarioSelecionado(null)
		setModalAberto(false)
	}

	function formatarData(dataIso) {
		if (!dataIso) return '-';
		const [ano, mes, dia] = dataIso.split('-');
		return `${dia}/${mes}/${ano}`;
	}

	return (
		<>
			<Header />
			<h2>Listagem de Voluntários</h2>

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
					</tr>
				</thead>
				<tbody>
					{voluntarios.map((voluntario) => (
						<tr key={voluntario.id} onClick={() => abrirDetalhes(voluntario)}>
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
							<td className='botao-desativar' onClick={() => { desativarVoluntario(voluntario.id) }}>
								{voluntario.ativo ? 'Desativar' : ''}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{modalAberto && voluntarioSelecionado && (
  <div className="modal-overlay" onClick={fecharDetalhes}>
    <div className="modal-content modal-largo" onClick={(e) => e.stopPropagation()}>
      
      <h2>Detalhes do Voluntário</h2>
      <hr />
      
      {/* Usando um Grid no CSS para dividir em duas colunas fica ótimo aqui */}
      <div className="detalhes-grid">
        
        <div className="secao-detalhe">
          <h3>Dados Pessoais</h3>
          <p><strong>Nome:</strong> {voluntarioSelecionado.nome}</p>
          <p><strong>CPF:</strong> {voluntarioSelecionado.cpf}</p>
          <p><strong>Nascimento:</strong> {formatarData(voluntarioSelecionado.dataNascimento)}</p>
          <p><strong>Endereço:</strong> {voluntarioSelecionado.endereco}, {voluntarioSelecionado.cidade} - {voluntarioSelecionado.estado}</p>
        </div>

        <div className="secao-detalhe">
          <h3>Contato</h3>
          <p><strong>E-mail:</strong> {voluntarioSelecionado.email}</p>
          <p><strong>Telefone:</strong> {voluntarioSelecionado.telefone}</p>
        </div>

        {/* Só renderiza essa div se for estudante da UTFPR */}
        {voluntarioSelecionado.estudanteUtfpr && (
          <div className="secao-detalhe destaque-faculdade">
            <h3>Vínculo Acadêmico</h3>
            <p><strong>Instituição:</strong> UTFPR</p>
            <p><strong>RA:</strong> {voluntarioSelecionado.ra}</p>
            <p><strong>Curso:</strong> {voluntarioSelecionado.curso} ({voluntarioSelecionado.periodo})</p>
          </div>
        )}

        <div className="secao-detalhe largura-total">
          <h3>Participação no Projeto</h3>
          <p><strong>Status:</strong> 
            <span className={`status-badge ${voluntarioSelecionado.ativo ? 'ativo' : 'inativo'}`}>
              {voluntarioSelecionado.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </p>
          <p><strong>Data de Entrada:</strong> {formatarData(voluntarioSelecionado.dataEntrada)}</p>
          
          {/* Só mostra a data de saída se ele não estiver ativo e a data existir */}
          {!voluntarioSelecionado.ativo && voluntarioSelecionado.dataSaida && (
            <p><strong>Data de Saída:</strong> {formatarData(voluntarioSelecionado.dataSaida)}</p>
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