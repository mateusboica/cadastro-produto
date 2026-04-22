import { useEffect, useState } from 'react'
import authService from './authService'

function useAuthContext() {
  const [nome, setNome] = useState('Usuario')
  const [email, setEmail] = useState('Carregando...')

  useEffect(() => {
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
  }, [])

  return { nome, email }
}

export default useAuthContext
