import { Link, useNavigate } from 'react-router-dom';

export function Menu() {

	const navigate = useNavigate();

	const usuario = JSON.parse(
		localStorage.getItem('usuario')
	);

	function logout() {

		localStorage.removeItem('usuario');

		navigate('/');
	}

	return (
		usuario?.tipo === "ADMIN" && (
			<nav style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				padding: '15px 30px',
				backgroundColor: '#0374c8',
				color: 'white'
			}}>

				<div>
					<strong>ELLP</strong>
				</div>

				<div style={{
					display: 'flex',
					gap: '20px',
					alignItems: 'center'
				}}>

					<Link
						to="/voluntarios"
						style={{ color: 'white' }}
					>
						Voluntários
					</Link>

					{usuario?.tipo === 'ADMIN' && (

						<Link
							to="/voluntarios/novo"
							style={{ color: 'white' }}
						>
							Novo Voluntário
						</Link>
					)}

					<span>
						{usuario?.nome}
					</span>

					<button
						onClick={logout}
						style={{
							padding: '5px 10px',
							cursor: 'pointer'
						}}
					>
						Sair
					</button>

				</div>

			</nav>
		)
	);
}