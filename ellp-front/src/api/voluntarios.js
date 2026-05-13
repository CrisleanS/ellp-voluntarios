import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
});

export const listarVoluntarios = (ativo) =>
  api.get('/voluntarios', { params: ativo !== undefined ? { ativo } : {} });

export const buscarVoluntario = (id) =>
  api.get(`/voluntarios/${id}`);

export const cadastrarVoluntario = (dados) =>
  api.post('/voluntarios', dados);

export const editarVoluntario = (id, dados) =>
  api.put(`/voluntarios/${id}`, dados);

export const removerVoluntario = (id) =>
  api.delete(`/voluntarios/${id}`);

export const registrarSaida = (id) =>
  api.patch(`/voluntarios/${id}/saida`);

export const gerarTermo = (id) =>
  api.get(`/voluntarios/${id}/termo`, { responseType: 'blob' });