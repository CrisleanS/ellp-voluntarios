import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children, role }) {

    let usuario;
    try {
        usuario = JSON.parse(localStorage.getItem('usuario'));
    } catch {
        usuario = null;
    }

    if (!usuario || !localStorage.getItem('token')) {
        return <Navigate to="/" />;
    }
    if (usuario.primeiroLogin && window.location.pathname !== '/trocar-senha') {
        return <Navigate to="/trocar-senha" />;
    }
    if (role && usuario.tipo !== role) {
        return <Navigate to={usuario.tipo === 'ADMIN' ? '/voluntarios' : '/inicial'} />;
    }

    return children;
}