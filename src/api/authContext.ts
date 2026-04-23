import { useEffect, useState } from 'react'
import authService from './authService'

const AUTH_UPDATED_EVENT = 'auth:user-updated'

export function notifyAuthUpdated() {
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT))
}

function useAuthContext() {
  const [nome, setNome] = useState('Usuario')
  const [email, setEmail] = useState('Carregando...')

  useEffect(() => {
    function carregarUsuario() {
      authService
        .getUser()
        .then((user) => {
          setNome(user.nome.trim() || 'Usuario')
          setEmail(user.email.trim() || 'Conta')
        })
        .catch((error) => {
          console.error('Erro ao buscar usuario:', error)
          setNome('Usuario')
          setEmail('Conta')
        })
    }

    carregarUsuario()
    window.addEventListener(AUTH_UPDATED_EVENT, carregarUsuario)

    return () => {
      window.removeEventListener(AUTH_UPDATED_EVENT, carregarUsuario)
    }
  }, [])

  return { nome, email }
}

export default useAuthContext
