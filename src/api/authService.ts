import api from "./api";

const authService = {
    login: async (email: string, senha: string) => {
        const response = await api.post('/api/v1/auth/login', { email, senha });

        return response.data;

    },

    getEmail: async () => {
        const response = await api.get('/api/v1/auth/me');
        return response.data;
    },

    getNome: async () => {
        const response = await api.get('/api/v1/auth/me-nome');
        return response.data;
    }

};

export default authService;
