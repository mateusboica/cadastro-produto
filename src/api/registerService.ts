import api from './api';

const registerService = {
    register: async (nome: string, email: string, senha: string) => {
        const response = await api.post('/api/v1/auth/register', { nome, email, senha});
        return response.data;
    }

};

export default registerService; 