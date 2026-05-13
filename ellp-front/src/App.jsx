import './App.css'

import { ListagemVoluntarios } from './pages/ListagemVoluntarios'
import { Route, Routes } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path='/' element={<h1>Página inicial</h1>} />
      <Route path="/voluntarios" element={<ListagemVoluntarios />} />
    </Routes>
  )
}

export default App
