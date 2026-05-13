import { User, Product, Price, Fair } from '../types';
import { API_BASE_URL } from './api.config';

const API_URL = API_BASE_URL;

export const api = {
    // Envoltorio genérico para peticiones fetch
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
        return response.json();
    },

    // Usuarios
    getUsers: () => api.request<User[]>('/usuarios'),
    createUser: (user: Partial<User>) => api.request<User>('/usuarios', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (id: string, user: Partial<User>) => api.request<User>(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
    deleteUser: (id: string) => api.request<void>(`/usuarios/${id}`, { method: 'DELETE' }),

    // Productos
    getProducts: () => api.request<Product[]>('/productos'),
    createProduct: (product: Partial<Product>) => api.request<Product>('/productos', { method: 'POST', body: JSON.stringify(product) }),
    updateProduct: (id: string, product: Partial<Product>) => api.request<Product>(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
    deleteProduct: (id: string) => api.request<void>(`/productos/${id}`, { method: 'DELETE' }),

    // Precios
    getPrices: () => api.request<Price[]>('/precios'),
    updatePrice: (id: string, price: Partial<Price>) => api.request<Price>(`/precios/${id}`, { method: 'PATCH', body: JSON.stringify(price) }),
    deletePrice: (id: string) => api.request<void>(`/precios/${id}`, { method: 'DELETE' }),

    // Ferias
    getFairs: () => api.request<Fair[]>('/ferias'),
};
