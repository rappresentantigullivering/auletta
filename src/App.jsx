import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import KeyManagement from './pages/KeyManagement'

function App() {
  return (
    <>
      {/* Un menu di navigazione temporaneo per testare */}
      <nav style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/">Calendario</Link>
        <Link to="/keys">Gestione Chiavi</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Registrati</Link>
      </nav>

      {/* Qui vengono renderizzate le pagine */}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/keys" element={<KeyManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </>
  )
}

export default App