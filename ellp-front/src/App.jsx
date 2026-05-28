import './App.css'

import { Routes, Route } from 'react-router-dom'

import { Navbar } from './components/Navbar'

import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { FormularioVoluntario } from './pages/FormularioVoluntario'

function App() {

  return (
    <>

      <Navbar />

      <Routes>

        <Route
          path='/'
          element={<h1>Página inicial</h1>}
        />

        <Route
          path="/voluntarios"
          element={<ListagemVoluntarios />}
        />

        <Route
          path="/voluntarios/novo"
          element={<FormularioVoluntario />}
        />

      </Routes>

    </>
  )
}

export default App