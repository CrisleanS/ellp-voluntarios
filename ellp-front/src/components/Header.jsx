import { useNavigate } from 'react-router-dom';
import './Header.css'

export function Header() {
	const navigate = useNavigate();

	function logout() {
		localStorage.removeItem('usuario');
		navigate('/');
	}

	return (
		<header >
			<div
				className='logo'
				onClick={() => navigate('/inicial')}
			>
				<h1 className='ellp'>
					<span style={{ color: '#0374c8' }}>E</span>
					<span style={{ color: '#ea7b23' }}>L</span>
					<span style={{ color: '#0374c8' }}>L</span>
					<span style={{ color: '#ea7b23' }}>P</span>
				</h1>
				<p>Ensino Lúdico de Lógica de Programação</p>
			</div>


			<button
				className='logout-button'
				onClick={logout}
			>
				Sair
			</button>
		</header>
	);
}