import './App.css'

import { Route, Routes } from 'react-router-dom'

import { Login } from './pages/Login'
import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { FormularioVoluntario } from './pages/FormularioVoluntario'
import { PrivateRoute } from './components/PrivateRoute'


function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/voluntarios"
        element={
      <PrivateRoute>
      <ListagemVoluntarios />
      </PrivateRoute>
     }
    />

      <Route
      path="/voluntarios/novo"
       element={
      <PrivateRoute>
      <FormularioVoluntario />
     </PrivateRoute>
    }
    />

    </Routes>
  )
}

export default App