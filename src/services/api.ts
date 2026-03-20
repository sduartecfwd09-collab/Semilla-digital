import { User, Product, Price, Fair } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

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
    getUsers: () => api.request<User[]>('/users'),
    createUser: (user: Partial<User>) => api.request<User>('/users', { method: 'POST', body: JSON.stringify(user) }),
    updateUser: (id: string, user: Partial<User>) => api.request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
    deleteUser: (id: string) => api.request<void>(`/users/${id}`, { method: 'DELETE' }),

    // Productos
    getProducts: () => api.request<Product[]>('/products'),
    createProduct: (product: Partial<Product>) => api.request<Product>('/products', { method: 'POST', body: JSON.stringify(product) }),
    updateProduct: (id: string, product: Partial<Product>) => api.request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
    deleteProduct: (id: string) => api.request<void>(`/products/${id}`, { method: 'DELETE' }),

    // Precios
    getPrices: () => api.request<Price[]>('/prices'),
    updatePrice: (id: string, price: Partial<Price>) => api.request<Price>(`/prices/${id}`, { method: 'PATCH', body: JSON.stringify(price) }),
    deletePrice: (id: string) => api.request<void>(`/prices/${id}`, { method: 'DELETE' }),

    // Ferias
    getFairs: () => api.request<Fair[]>('/fairs'),
};
