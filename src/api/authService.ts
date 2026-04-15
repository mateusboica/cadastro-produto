import api from "./api";

const authService = {
    login: async (email: string, senha: string) => {
        const response = await api.post('/api/v1/auth/login', { email, senha });

        if(response.status === 200) {
            return response.data;
        }
        if(response.status === 401) {
            throw new Error('Credenciais inválidas');
        }
        throw new Error('Erro desconhecido');
    }
};

export default authService;