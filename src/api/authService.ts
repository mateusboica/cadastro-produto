import api from "./api";

const authService = {
    login: async (email: string, senha: string) => {
        const response = await api.post('/api/v1/auth/login', { email, senha });

        return response.data;

    }

};

export default authService;