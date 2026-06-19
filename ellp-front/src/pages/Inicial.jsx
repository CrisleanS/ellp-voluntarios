import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Menu } from '../components/Menu';
import { buscarVoluntario, gerarTermo } from '../api/voluntarios';
import { formatarData } from '../uteis/formatarData';
import './Inicial.css'

export function Inicial() {
	const usuario = JSON.parse(localStorage.getItem('usuario'))
	const [voluntario, setVoluntario] = useState(null)
	const [modalAberto, setModalAberto] = useState(false)

	useEffect(() => {
		const idVoluntario = usuario.voluntarioId;

		buscarVoluntario(idVoluntario)
			.then(response => {
				setVoluntario(response.data)
			})
			.catch(error => {
				console.error('Erro ao pegar detalhes do voluntário:', error)
			});
	}, []);

	async function gerarPDF() {
		try {
			const idVoluntario = usuario.voluntarioId || usuario.id;
			const response = await gerarTermo(idVoluntario);

			const blob = new Blob([response.data], { type: 'application/pdf' });
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `termo-voluntario-${idVoluntario}.pdf`;
			link.click();
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Erro ao gerar PDF:', error);
			alert('Erro ao gerar o termo em PDF.');
		}
	}

	function modalDetalhes() {

		return (
			<div className="modal-overlay" onClick={() => setModalAberto(false)}>
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
								<strong>Nome:</strong> {voluntario.nome}
							</p>

							<p>
								<strong>CPF:</strong> {voluntario.cpf}
							</p>

							<p>
								<strong>Nascimento:</strong> {formatarData(voluntario.dataNascimento)}
							</p>

							<p>
								<strong>Endereço:</strong> {voluntario.endereco},
								{' '}
								{voluntario.cidade}
								{' - '}
								{voluntario.estado}
							</p>
						</div>

						<div className="secao-detalhe">
							<h3>Contato</h3>

							<p>
								<strong>E-mail:</strong> {voluntario.email}
							</p>

							<p>
								<strong>Telefone:</strong> {voluntario.telefone}
							</p>
						</div>

						{voluntario.estudanteUtfpr && (
							<div className="secao-detalhe destaque-faculdade">
								<h3>Vínculo Acadêmico</h3>

								<p><strong>Instituição:</strong> UTFPR</p>
								<p><strong>RA:</strong> {voluntario.ra}</p>

								<p>
									<strong>Curso:</strong> {voluntario.curso}
									{' '}
									({voluntario.periodo})
								</p>
							</div>
						)}

						<div className="secao-detalhe largura-total">
							<h3>Participação no Projeto</h3>

							<p>
								<strong>Status:</strong>

								<span
									className={`status-badge ${voluntario.ativo ? 'ativo' : 'inativo'}`}
								>
									{voluntario.ativo ? 'Ativo' : 'Inativo'}
								</span>
							</p>

							<p>
								<strong>Data de Entrada:</strong>
								{' '}
								{formatarData(voluntario.dataEntrada)}
							</p>

							{!voluntario.ativo && voluntario.dataSaida && (
								<p>
									<strong>Data de Saída:</strong>
									{' '}
									{formatarData(voluntario.dataSaida)}
								</p>
							)}

							<div className="sintese-box">
								<strong>Síntese de Atividades:</strong>

								<p>{voluntario.sinteseAtividades}</p>
							</div>
						</div>

					</div>

					<button className="btn-fechar" onClick={() => setModalAberto(false)}>
						Fechar
					</button>

				</div>
			</div>
		)
	}

	return (
		<>
			<Header />
			<Menu />
			<h2 className='saudacoes-usuario'>{`Olá, ${usuario.nome}`}</h2>

			<div className='acoes-usuario'>
				<button
					className='botoes-acoes-usuario'
					onClick={() => {
						setModalAberto(true)
					}
					}
				>Conferir dados
				</button>

				<button
					className='botoes-acoes-usuario'
					onClick={gerarPDF}
				>Gerar PDF
				</button>
			</div>

			{modalAberto && voluntario && modalDetalhes()}
		</>
	)

}
