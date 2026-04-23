import api from './api'

function accountService() {
    return{
        editAccount: async (email: string, nome: string) => {
            const response = await api.patch('/api/v1/auth/me', { email, nome })
            return response.data
        },
        editSenha: async (senhaAtual: string, novaSenha: string) => {
            const response = await api.patch('/api/v1/auth/me/senha', { senhaAtual, novaSenha })
            return response.data
        }
    }
}

export default accountService()
