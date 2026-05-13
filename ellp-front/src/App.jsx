import './App.css'

import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { Route, Routes } from 'react-router-dom'
import { FormularioVoluntario } from './pages/FormularioVoluntario'

function App() {

  return (
    <Routes>
      <Route path='/' element={<h1>Página inicial</h1>} />
      <Route path="/voluntarios" element={<ListagemVoluntarios />} />
      <Route path="/voluntarios/novo" element={<FormularioVoluntario />} />
    </Routes>
  )
}

export default App
