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
        await api.get('/usuario/me');
        setUsuarioLogado(true);
      } catch (error) {
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

      <Route element={<RotasPrivadas usuarioLogado={usuarioLogado} carregando={carregando} />}>
        <Route path="/produtos" element={<App />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  )
}
