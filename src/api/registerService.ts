import api from './api';

const registerService = {
    register: async (name: string, email: string, password: string) => {
        const response = await api.post('/register', { name, email, password });
        return response.data;
    }

};

export default registerService;