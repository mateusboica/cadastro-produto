import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import registerService from '../api/registerService'
import '../login.css'

function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setCarregando(true)

    try {
      await registerService.register(nome, email, senha)
      alert('Conta criada com sucesso! Agora voce pode fazer login.')
      setNome('')
      setEmail('')
      setSenha('')
      setConfirmarSenha('')
      } catch (error) {
        console.error('Erro ao criar conta:', error)
        setErro('Ocorreu um erro ao criar a conta. Tente novamente mais tarde.')
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
          <span className="login-badge">Criacao de conta</span>
          <h1>Delicia Potiguar</h1>
          <p>
            Cadastre um novo acesso administrativo para acompanhar pedidos,
            atualizar produtos e manter o cardapio sempre pronto.
          </p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>Registro</h2>
            <p>Preencha os dados abaixo para criar sua conta.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                required
              />
            </div>

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
                placeholder="Crie uma senha"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="confirmarSenha">Confirmar senha</label>
              <input
                id="confirmarSenha"
                type="password"
                placeholder="Repita sua senha"
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
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
              <span>{carregando ? 'Criando conta...' : 'Criar conta'}</span>
            </button>

            <p className="login-switch">
              Ja possui conta? <Link to="/login">Fazer login</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  )
}

export default RegisterPage
