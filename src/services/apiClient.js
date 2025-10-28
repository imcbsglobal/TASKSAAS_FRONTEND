import axios from "axios";
import config from "../app/config";

// Single consolidated API client for the entire application
const apiClient = axios.create({
    baseURL: config.API_BASE_URL,
    timeout: config.API_TIMEOUT,
    headers: {
        "Content-Type": "application/json"
    }
});

// Request interceptor - handles authentication for all requests
apiClient.interceptors.request.use(
    (requestConfig) => {
        // Try multiple token sources for backward compatibility
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const separateToken = localStorage.getItem('token');
        
        // Priority: separate token > user.token
        const authToken = separateToken || user.token;
        
        if (authToken) {
            requestConfig.headers.Authorization = `Bearer ${authToken}`;
        }
        
        return requestConfig;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handles common response logic
apiClient.interceptors.response.use(
    (response) => {
        // Return response.data for successful requests
        return response.data;
    },
    (error) => {
        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        
        // For development/debugging (controlled by config)
        if (config.LOG_LEVEL === 'debug') {
            console.error("API Error:", error);
        }
        
        // Return structured error
        return Promise.reject(error.response?.data || error.message);
    }
);

// Export both the client and the base URL for backward compatibility
export default apiClient;
export const API_BASE_URL = config.API_BASE_URL;