import { useEffect, useRef, useState } from 'react'
import authService from '../api/authService'

export default function Header() {
  const [userOptionsOpen, setUserOptionsOpen] = useState(false)
  const [email, setEmail] = useState('Carregando...')
  const [nome, setNome] = useState('Usuario')
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserOptionsOpen(false)
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserOptionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  useEffect(() => {
    authService
      .getUser()
      .then((user) => {
        setEmail(user.email.trim() || 'Conta')
        setNome(user.nome.trim() || 'Usuario')
      })
      .catch((error) => {
        console.error('Erro ao buscar usuario:', error)
        setEmail('Conta')
        setNome('Usuario')
      })
  }, [])

  function handleLogout() {
    document.cookie = 'token=; Max-Age=0; path=/;'
    window.location.href = '/login'
  }

  return (
    <header>
      <div className="logo-container">
        <span className="logo">Delicia Potiguar</span>
      </div>

      <div className="user-menu-container" ref={userMenuRef}>
        <button
          className={`user-options ${userOptionsOpen ? 'is-open' : ''}`}
          aria-label="Menu da conta"
          aria-expanded={userOptionsOpen}
          aria-haspopup="menu"
          onClick={() => setUserOptionsOpen((open) => !open)}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=2c2c2c&color=fff`}
            alt="Perfil do usuario"
          />
          <div className="user-options-text">
            <span className="user-options-label">{email}</span>
            <span className="user-options-name">{nome}</span>
          </div>
          <svg
            className="user-options-caret"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {userOptionsOpen && (
          <div className="user-options-menu" role="menu">
            <div className="user-options-menu-header">
              <span className="user-options-menu-kicker">Sessao ativa</span>
              <strong>{nome}</strong>
              <span>{email}</span>
            </div>

            <div className="divider"></div>

            <button
              className="menu-action editar-conta"
              type="button"
              role="menuitem"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Editar conta</span>
            </button>

            <button
              className="menu-action logout-btn"
              type="button"
              role="menuitem"
              onClick={handleLogout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
