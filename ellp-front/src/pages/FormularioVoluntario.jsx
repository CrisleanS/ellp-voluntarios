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
const camposUtfpr = ['curso', 'periodo', 'ra'];

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
        setErro('Não foi possível carregar os dados do voluntário. Tente novamente.');
      });
  }, [id, modoEdicao]);

  function atualizarCampo(evento) {
    const { name, type, value, checked } = evento.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'estudanteUtfpr' && !checked
        ? Object.fromEntries(camposUtfpr.map((campo) => [campo, '']))
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

    const temCampoFaltando = camposObrigatorios.some((campo) => !formulario[campo]);
    if (temCampoFaltando) {
      return 'Preencha todos os campos obrigatórios.';
    }

    if (formulario.estudanteUtfpr && camposUtfpr.some((campo) => !formulario[campo])) {
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
        setErro('Não foi possível salvar o voluntário. Tente novamente.');
      });
  }

  return (
    <>
      <Header />
      <h2>{modoEdicao ? 'Editar Voluntário' : 'Cadastrar Voluntário'}</h2>

      <form className='formulario-voluntario' onSubmit={enviarFormulario}>
        {erro && <p className='erro-formulario'>{erro}</p>}

        <label htmlFor='nome'>Nome *</label>
        <input id='nome' name='nome' type='text' value={formulario.nome} onChange={atualizarCampo} />

        <label htmlFor='cpf'>CPF *</label>
        <input id='cpf' name='cpf' type='text' value={formulario.cpf} onChange={atualizarCampo} />

        <label htmlFor='email'>E-mail *</label>
        <input id='email' name='email' type='email' value={formulario.email} onChange={atualizarCampo} />

        <label htmlFor='telefone'>Telefone *</label>
        <input id='telefone' name='telefone' type='tel' value={formulario.telefone} onChange={atualizarCampo} />

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
          type='text'
          value={formulario.nacionalidade}
          onChange={atualizarCampo}
        />

        <label htmlFor='endereco'>Endereço *</label>
        <input id='endereco' name='endereco' type='text' value={formulario.endereco} onChange={atualizarCampo} />

        <label htmlFor='cidade'>Cidade *</label>
        <input id='cidade' name='cidade' type='text' value={formulario.cidade} onChange={atualizarCampo} />

        <label htmlFor='estado'>Estado *</label>
        <input id='estado' name='estado' type='text' value={formulario.estado} onChange={atualizarCampo} />

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
            <input id='curso' name='curso' type='text' value={formulario.curso} onChange={atualizarCampo} />

            <label htmlFor='periodo'>Período *</label>
            <input id='periodo' name='periodo' type='text' value={formulario.periodo} onChange={atualizarCampo} />

            <label htmlFor='ra'>RA *</label>
            <input id='ra' name='ra' type='text' value={formulario.ra} onChange={atualizarCampo} />
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
