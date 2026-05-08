import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import api from '../api/api'
import App from '../App'
import ProductPage from '../components/ProductPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import SystemPlaceholderPage from '../pages/SystemPlaceholderPage'
import { RotasPrivadas } from './RotasPrivadas'
import EditAccount from '../pages/EditAccount'
import EditLoja from '../pages/EditLoja'

export default function Router() {
  const [carregando, setCarregando] = useState(true)
  const [usuarioLogado, setUsuarioLogado] = useState(false)

  useEffect(() => {
    async function validarSessao() {
      try {
        await api.get('/api/v1/auth/me')
        setUsuarioLogado(true)
      } catch {
        setUsuarioLogado(false)
      } finally {
        setCarregando(false)
      }
    }

    validarSessao()
  }, [])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <RotasPrivadas
            usuarioLogado={usuarioLogado}
            carregando={carregando}
          />
        }
      >
        <Route element={<App />}>
          <Route index element={<Navigate to="/produtos" replace />} />
          <Route path="/produtos" element={<ProductPage />} />
          <Route
            path="/pedidos"
            element={
              <SystemPlaceholderPage
                title="Pedidos"
                description="Aqui entra a tela para acompanhar novos pedidos, atualizar status e consultar historico."
              />
            }
          />
          <Route
            path="/clientes"
            element={
              <SystemPlaceholderPage
                title="Clientes"
                description="Aqui entra a tela de clientes, contatos, enderecos e preferencias."
              />
            }
          />
          <Route
            path="/relatorios"
            element={
              <SystemPlaceholderPage
                title="Relatorios"
                description="Aqui entram indicadores, vendas, produtos mais pedidos e desempenho do cardapio."
              />
            }
          />
          <Route
            path="/configuracoes"
            element={
              <SystemPlaceholderPage
                title="Configuracoes"
                description="Aqui entram dados da loja, preferencias do painel e ajustes gerais do sistema."
              />
            }
            // Rotas de usuuario
            />
            <Route path="/editar-conta"
             element={<EditAccount />}/> 

             <Route path='/editar-loja'
             element={<EditLoja />}/>

        </Route>
      </Route>
    </Routes>
  )
}
