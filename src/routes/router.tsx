import { Route, Routes } from 'react-router-dom'
import App from '../App'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import { RotasPrivadas } from './RotasPrivadas'
import { useEffect, useState } from 'react'
import api from '../api/api'

export default function Router() {
  const [carregando, setCarregando] = useState(true);
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    async function validarSessao() {
      try {
        await api.get('/api/v1/auth/me');
        setUsuarioLogado(true);
      } catch {
        setUsuarioLogado(false);
      } finally {
        setCarregando(false);
      }
    }

    validarSessao();
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RotasPrivadas usuarioLogado={usuarioLogado} carregando={carregando} />}>
        <Route path="/" element={<App />} />
      </Route>
    </Routes>
  )
}
