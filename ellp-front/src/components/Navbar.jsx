import { Link } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {

    return (
        <nav className="navbar">

            <h2>ELLP</h2>

            <div className="menu-links">

                <Link to="/">
                    Início
                </Link>

                <Link to="/voluntarios">
                    Voluntários
                </Link>

                <Link to="/voluntarios/novo">
                    Cadastrar
                </Link>

                <Link to="/login">
                    Login
                </Link>

            </div>

        </nav>
    );
}