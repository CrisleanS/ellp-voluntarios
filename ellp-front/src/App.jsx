import './App.css'

import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { FormularioVoluntario } from './pages/FormularioVoluntario'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path='/' element={<h1>Página inicial</h1>} />
      <Route path="/voluntarios" element={<ListagemVoluntarios />} />
      <Route path="/voluntarios/novo" element={<FormularioVoluntario />} />
      <Route path="/voluntarios/:id/editar" element={<FormularioVoluntario />} />
    </Routes>
  )
}

export default App
