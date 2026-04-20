import api from './api'

export type User = {
  nome: string
  email: string
}

const authService = {
  login: async (email: string, senha: string) => {
    const response = await api.post('/api/v1/auth/login', { email, senha })
    return response.data
  },

  getUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/v1/auth/me')
    return response.data
  },
}

export default authService
