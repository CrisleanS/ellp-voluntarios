import './App.css'

import { Route, Routes } from 'react-router-dom'

import { Login } from './pages/Login'
import { Inicial } from './pages/Inicial'
import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { FormularioVoluntario } from './pages/FormularioVoluntario'
import { PrivateRoute } from './components/PrivateRoute'
import { TrocarSenha } from './pages/TrocarSenha'
import { PrimeiroAcesso } from './pages/PrimeiroAcesso'


function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />
      <Route path="/primeiro-acesso/senha" element={<PrimeiroAcesso />} />

      <Route
        path="/voluntarios"
        element={
          <PrivateRoute role="ADMIN">
            <ListagemVoluntarios />
          </PrivateRoute>
        }
      />

      <Route
        path="/voluntarios/novo"
        element={
          <PrivateRoute role="ADMIN">
            <FormularioVoluntario />
          </PrivateRoute>
        }
      />

      <Route
        path="/inicial"
        element={
          <PrivateRoute role="VOLUNTARIO">
            <Inicial />
          </PrivateRoute>
        }
      />

      <Route
        path="/trocar-senha"
        element={
          <PrivateRoute>
            <TrocarSenha />
          </PrivateRoute>
        }
      />

    </Routes>
  )
}

export default App