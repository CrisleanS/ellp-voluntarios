import api from './client';

export const login = (dados) =>
  api.post('/usuarios/login', dados);

export const trocarSenha = (idUsuario, senhaAtual, novaSenha) =>
  api.patch(`/usuarios/${idUsuario}/alterar-senha`, {
    senhaAtual,
    novaSenha,
  });

export const iniciarPrimeiroAcesso = (email) =>
  api.post('/usuarios/primeiro-acesso', { email });

export const definirSenhaPrimeiroAcesso = (idUsuario, senha, confirmarSenha, token) =>
  api.patch(
    `/usuarios/${idUsuario}/primeiro-acesso/senha`,
    { senha, confirmarSenha },
    { headers: { Authorization: `Bearer ${token}` } },
  );