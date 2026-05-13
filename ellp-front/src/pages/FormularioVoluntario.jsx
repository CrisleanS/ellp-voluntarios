import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import {
  buscarVoluntario,
  cadastrarVoluntario,
  editarVoluntario,
} from '../api/voluntarios';
import './FormularioVoluntario.css';

const estadoInicial = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  dataNascimento: '',
  nacionalidade: '',
  endereco: '',
  cidade: '',
  estado: '',
  dataEntrada: '',
  estudanteUtfpr: false,
  curso: '',
  periodo: '',
  ra: '',
};

export function FormularioVoluntario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState(estadoInicial);
  const [erro, setErro] = useState('');

  const modoEdicao = useMemo(() => Boolean(id), [id]);

  useEffect(() => {
    if (!modoEdicao) {
      return;
    }

    buscarVoluntario(id)
      .then((response) => {
        const dados = response.data;
        setFormulario({
          nome: dados.nome || '',
          cpf: dados.cpf || '',
          email: dados.email || '',
          telefone: dados.telefone || '',
          dataNascimento: dados.dataNascimento || '',
          nacionalidade: dados.nacionalidade || '',
          endereco: dados.endereco || '',
          cidade: dados.cidade || '',
          estado: dados.estado || '',
          dataEntrada: dados.dataEntrada || '',
          estudanteUtfpr: Boolean(dados.estudanteUtfpr),
          curso: dados.curso || '',
          periodo: dados.periodo || '',
          ra: dados.ra || '',
        });
      })
      .catch(() => {
        setErro('Não foi possível carregar os dados do voluntário.');
      });
  }, [id, modoEdicao]);

  function atualizarCampo(evento) {
    const { name, type, value, checked } = evento.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'estudanteUtfpr' && !checked
        ? { curso: '', periodo: '', ra: '' }
        : {}),
    }));
  }

  function validarCamposObrigatorios() {
    const camposObrigatorios = [
      'nome',
      'cpf',
      'email',
      'telefone',
      'dataNascimento',
      'nacionalidade',
      'endereco',
      'cidade',
      'estado',
      'dataEntrada',
    ];

    const faltando = camposObrigatorios.some((campo) => !formulario[campo]);
    if (faltando) {
      return 'Preencha todos os campos obrigatórios.';
    }

    if (
      formulario.estudanteUtfpr
      && (!formulario.curso || !formulario.periodo || !formulario.ra)
    ) {
      return 'Preencha curso, período e RA para estudantes da UTFPR.';
    }

    return '';
  }

  function enviarFormulario(evento) {
    evento.preventDefault();
    const mensagemErro = validarCamposObrigatorios();

    if (mensagemErro) {
      setErro(mensagemErro);
      return;
    }

    setErro('');

    const acao = modoEdicao
      ? editarVoluntario(id, formulario)
      : cadastrarVoluntario(formulario);

    acao
      .then(() => {
        navigate('/voluntarios');
      })
      .catch(() => {
        setErro('Não foi possível salvar o voluntário.');
      });
  }

  return (
    <>
      <Header />
      <h2>{modoEdicao ? 'Editar Voluntário' : 'Cadastrar Voluntário'}</h2>

      <form className='formulario-voluntario' onSubmit={enviarFormulario}>
        {erro && <p className='erro-formulario'>{erro}</p>}

        <label htmlFor='nome'>Nome *</label>
        <input id='nome' name='nome' value={formulario.nome} onChange={atualizarCampo} />

        <label htmlFor='cpf'>CPF *</label>
        <input id='cpf' name='cpf' value={formulario.cpf} onChange={atualizarCampo} />

        <label htmlFor='email'>E-mail *</label>
        <input id='email' name='email' type='email' value={formulario.email} onChange={atualizarCampo} />

        <label htmlFor='telefone'>Telefone *</label>
        <input id='telefone' name='telefone' value={formulario.telefone} onChange={atualizarCampo} />

        <label htmlFor='dataNascimento'>Data de nascimento *</label>
        <input
          id='dataNascimento'
          name='dataNascimento'
          type='date'
          value={formulario.dataNascimento}
          onChange={atualizarCampo}
        />

        <label htmlFor='nacionalidade'>Nacionalidade *</label>
        <input
          id='nacionalidade'
          name='nacionalidade'
          value={formulario.nacionalidade}
          onChange={atualizarCampo}
        />

        <label htmlFor='endereco'>Endereço *</label>
        <input id='endereco' name='endereco' value={formulario.endereco} onChange={atualizarCampo} />

        <label htmlFor='cidade'>Cidade *</label>
        <input id='cidade' name='cidade' value={formulario.cidade} onChange={atualizarCampo} />

        <label htmlFor='estado'>Estado *</label>
        <input id='estado' name='estado' value={formulario.estado} onChange={atualizarCampo} />

        <label htmlFor='dataEntrada'>Data de entrada *</label>
        <input id='dataEntrada' name='dataEntrada' type='date' value={formulario.dataEntrada} onChange={atualizarCampo} />

        <label className='checkbox-estudante' htmlFor='estudanteUtfpr'>
          <input
            id='estudanteUtfpr'
            name='estudanteUtfpr'
            type='checkbox'
            checked={formulario.estudanteUtfpr}
            onChange={atualizarCampo}
          />
          É estudante da UTFPR
        </label>

        {formulario.estudanteUtfpr && (
          <>
            <label htmlFor='curso'>Curso *</label>
            <input id='curso' name='curso' value={formulario.curso} onChange={atualizarCampo} />

            <label htmlFor='periodo'>Período *</label>
            <input id='periodo' name='periodo' value={formulario.periodo} onChange={atualizarCampo} />

            <label htmlFor='ra'>RA *</label>
            <input id='ra' name='ra' value={formulario.ra} onChange={atualizarCampo} />
          </>
        )}

        <div className='acoes-formulario'>
          <button type='button' onClick={() => navigate('/voluntarios')}>Cancelar</button>
          <button type='submit'>{modoEdicao ? 'Salvar' : 'Cadastrar'}</button>
        </div>
      </form>
    </>
  );
}
