import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('./pages/Login', () => ({ Login: () => <p>Login route</p> }));
vi.mock('./pages/Inicial', () => ({ Inicial: () => <p>Initial route</p> }));
vi.mock('./pages/ListagemVoluntarios', () => ({ ListagemVoluntarios: () => <p>Volunteer list route</p> }));
vi.mock('./pages/FormularioVoluntario', () => ({ FormularioVoluntario: () => <p>Volunteer form route</p> }));
vi.mock('./pages/TrocarSenha', () => ({ TrocarSenha: () => <p>Change password route</p> }));
vi.mock('./pages/PrimeiroAcesso', () => ({ PrimeiroAcesso: () => <p>First access route</p> }));

describe('rotas da aplicação', () => {
	function renderApp(path, usuario) {
		window.history.replaceState({}, '', path);
		localStorage.clear();
		if (usuario) {
			localStorage.setItem('usuario', JSON.stringify(usuario));
			localStorage.setItem('token', 'token');
		}
		return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
	}

	it.each([
		['/', null, 'Login route'],
		['/primeiro-acesso/senha', null, 'First access route'],
		['/voluntarios', { tipo: 'ADMIN', primeiroLogin: false }, 'Volunteer list route'],
		['/voluntarios/novo', { tipo: 'ADMIN', primeiroLogin: false }, 'Volunteer form route'],
		['/inicial', { tipo: 'VOLUNTARIO', primeiroLogin: false }, 'Initial route'],
		['/trocar-senha', { tipo: 'VOLUNTARIO', primeiroLogin: true }, 'Change password route'],
	])('renderiza %s conforme a sessão', (path, usuario, conteudo) => {
		renderApp(path, usuario);
		expect(screen.getByText(conteudo)).toBeInTheDocument();
	});

	it('redireciona usuário sem sessão e bloqueia perfil incompatível', () => {
		const { unmount } = renderApp('/voluntarios', null);
		expect(screen.getByText('Login route')).toBeInTheDocument();
		unmount();
		renderApp('/voluntarios', { tipo: 'VOLUNTARIO', primeiroLogin: false });
		expect(screen.getByText('Initial route')).toBeInTheDocument();
	});
});
