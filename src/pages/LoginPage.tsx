import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import authService from '../api/authService'
import '../login.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      await authService.login(email, senha)
      window.location.href = '/'
    } catch {
      setErro('Falha ao entrar. Verifique seus dados.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-background login-background-left"></div>
      <div className="login-background login-background-right"></div>

      <section className="login-shell">
        <div className="login-brand">
          <span className="login-badge">Acesso administrativo</span>
          <h1>Delícia Potiguar</h1>
          <p>
            Entre com suas credenciais para acessar o painel e gerenciar os
            produtos do cardapio.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Login</h2>
            <p>Use seu e-mail e senha para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="voce@empresa.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>

            {erro && <p className="login-error">{erro}</p>}

            <button
              type="submit"
              className="btn-submit login-submit"
              disabled={carregando}
            >
              {carregando && <span className="spinner"></span>}
              <span>{carregando ? 'Entrando...' : 'Entrar'}</span>
            </button>

            <p className="login-switch">
              Ainda nao tem conta? <Link to="/register">Criar cadastro</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
