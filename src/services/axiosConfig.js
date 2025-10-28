// axiosConfig.js
import axios from 'axios';
import config from '../app/config';

// Create axios instance
const api = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
});

// Add request interceptor to include token
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token'); // If you store token separately
        
        // Try to get token from user object first, then from separate storage
        const authToken = token || (user && user.token);
        
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;