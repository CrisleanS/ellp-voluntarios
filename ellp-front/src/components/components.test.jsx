import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Feedback } from './Feedback';
import { Header } from './Header';
import { Menu } from './Menu';
import { PrivateRoute } from './PrivateRoute';

function CaminhoAtual() {
	const location = useLocation();
	return <p data-testid="caminho">{location.pathname}</p>;
}

describe('Feedback', () => {
	it('não exibe conteúdo sem mensagem', () => {
		const { container } = render(<Feedback />);
		expect(container).toBeEmptyDOMElement();
	});

	it('usa alerta para erro e status para sucesso', () => {
		const { rerender } = render(<Feedback mensagem="Falha" />);
		expect(screen.getByRole('alert')).toHaveTextContent('Falha');
		rerender(<Feedback mensagem="Salvo" tipo="sucesso" />);
		expect(screen.getByRole('status')).toHaveTextContent('Salvo');
	});
});

describe('Menu e Header', () => {
	it('mostra links administrativos somente para ADMIN', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN', nome: 'Admin' }));
		const { rerender } = render(<MemoryRouter><Menu /></MemoryRouter>);
		expect(screen.getByRole('link', { name: 'Voluntários' })).toHaveAttribute('href', '/voluntarios');
		expect(screen.getByRole('link', { name: 'Novo Voluntário' })).toHaveAttribute('href', '/voluntarios/novo');
		expect(screen.getByText('Admin')).toBeInTheDocument();

		localStorage.setItem('usuario', JSON.stringify({ tipo: 'VOLUNTARIO', nome: 'Pessoa' }));
		rerender(<MemoryRouter><Menu /></MemoryRouter>);
		expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
	});

	it('navega para inicial pelo logo e limpa sessão ao sair', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN' }));
		localStorage.setItem('token', 'token');
		render(
			<MemoryRouter initialEntries={['/voluntarios']}>
				<Header />
				<CaminhoAtual />
			</MemoryRouter>,
		);
		fireEvent.click(screen.getByText('E'));
		expect(screen.getByTestId('caminho')).toHaveTextContent('/inicial');
		fireEvent.click(screen.getByRole('button', { name: 'Sair' }));
		expect(screen.getByTestId('caminho')).toHaveTextContent('/');
		expect(localStorage.getItem('usuario')).toBeNull();
		expect(localStorage.getItem('token')).toBeNull();
	});
});

describe('PrivateRoute', () => {
	function renderProtected(path = '/privado', role = 'ADMIN') {
		return render(
			<MemoryRouter initialEntries={[path]}>
				<Routes>
					<Route path="/" element={<p>Login</p>} />
					<Route path="/voluntarios" element={<p>Admin home</p>} />
					<Route path="/inicial" element={<p>Volunteer home</p>} />
					<Route path="/trocar-senha" element={<p>Trocar senha</p>} />
					<Route path="/privado" element={
						<PrivateRoute role={role}><p>Conteúdo protegido</p></PrivateRoute>
					} />
				</Routes>
			</MemoryRouter>,
		);
	}

	it('redireciona quando não há sessão ou o usuário salvo é inválido', () => {
		renderProtected();
		expect(screen.getByText('Login')).toBeInTheDocument();

		localStorage.setItem('usuario', '{');
		localStorage.setItem('token', 'token');
		renderProtected();
		expect(screen.getAllByText('Login')).toHaveLength(2);
	});

	it('direciona primeiro login para troca de senha antes de aplicar o perfil', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'VOLUNTARIO', primeiroLogin: true }));
		localStorage.setItem('token', 'token');
		renderProtected();
		expect(screen.getByText('Trocar senha')).toBeInTheDocument();
	});

	it('redireciona perfil incompatível para a página inicial do perfil', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'VOLUNTARIO', primeiroLogin: false }));
		localStorage.setItem('token', 'token');
		renderProtected();
		expect(screen.getByText('Volunteer home')).toBeInTheDocument();
	});

	it('redireciona administrador de rota exclusiva de voluntário para listagem', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN', primeiroLogin: false }));
		localStorage.setItem('token', 'token');
		renderProtected('/privado', 'VOLUNTARIO');
		expect(screen.getByText('Admin home')).toBeInTheDocument();
	});

	it('permite acesso se perfil confere ou está sem restrição', () => {
		localStorage.setItem('usuario', JSON.stringify({ tipo: 'ADMIN', primeiroLogin: false }));
		localStorage.setItem('token', 'token');
		renderProtected();
		expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
	});
});
