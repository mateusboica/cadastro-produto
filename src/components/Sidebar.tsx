import { NavLink } from 'react-router-dom'
import DeveloperSignature from './DeveloperSignature'

const menuItems = [
  { to: '/produtos', label: 'Produtos', description: 'Cadastro e cardapio', icon: 'inventory' },
  { to: '/pedidos', label: 'Pedidos', description: 'Acompanhar vendas', icon: 'shopping_cart' },
  { to: '/clientes', label: 'Clientes', description: 'Base de contatos', icon: 'people' },
  { to: '/relatorios', label: 'Relatorios', description: 'Resultados do negocio', icon: 'bar_chart' },
  { to: '/configuracoes', label: 'Configuracoes', description: 'Preferencias do sistema', icon: 'settings' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">DP</span>
        <div>
          <strong>Delicia Potiguar</strong>
          <span>Painel administrativo</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Menu principal">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'is-active' : ''}`
            }
          >
            <span className="sidebar-link-icon material-symbols-outlined">
              {item.icon}
            </span>
            <span className="sidebar-link-text">
              <span className="sidebar-link-label">{item.label}</span>
              <span className="sidebar-link-description">{item.description}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <DeveloperSignature className="sidebar-signature" />
    </aside>
  )
}
