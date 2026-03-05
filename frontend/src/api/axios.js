import axios from 'axios';

// In dev mode Vite proxies /api to the backend, so we just use a relative URL.
const api = axios.create({
    baseURL: '/api/v1',
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
