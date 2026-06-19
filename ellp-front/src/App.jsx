import './App.css'

import { Route, Routes } from 'react-router-dom'

import { Login } from './pages/Login'
import { Inicial } from './pages/Inicial'
import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { FormularioVoluntario } from './pages/FormularioVoluntario'
import { PrivateRoute } from './components/PrivateRoute'
import { TrocarSenha } from './pages/TrocarSenha'


function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/voluntarios"
        element={
          // <PrivateRoute>
            <ListagemVoluntarios />
          // </PrivateRoute>
        }
      />

      <Route
        path="/voluntarios/novo"
        element={
          // <PrivateRoute>
            <FormularioVoluntario />
          // </PrivateRoute>
        }
      />

      <Route
        path="/inicial"
        element={
            <Inicial />
        }
      />

      <Route
        path="/trocar-senha"
        element={
          // <PrivateRoute>
            <TrocarSenha />
          // </PrivateRoute>
        }
      />

    </Routes>
  )
}

export default App