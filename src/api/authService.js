import api from "./api";

const authService = {
    login: async (email, password) => {
        const response = await api.post('/login', { email, password });
        return response.data;
    }
};

export default authService;