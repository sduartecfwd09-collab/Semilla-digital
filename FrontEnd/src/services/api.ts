import { User, Product, Fair } from '../types';
import { API_BASE_URL } from './api.config';

const API_URL = API_BASE_URL;

export const api = {
    // Envoltorio genérico para peticiones fetch.
    // La autenticación viaja en la cookie httpOnly `agromap_token` que el navegador
    // envía automáticamente cuando usamos `credentials: 'include'`.
    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const headers = new Headers(options.headers);

        if (!headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        // Bearer header como fallback si todavía hay token en localStorage
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
            credentials: 'include',
        });
        if (!response.ok) {
            // Intentamos extraer el mensaje del backend ({ success: false, message: '...' })
            // para que el caller pueda mostrarlo al usuario. Si el body no es JSON
            // (ej. 502 detrás de un proxy), caemos al statusText.
            let backendMsg: string | null = null;
            try {
                const body = await response.json();
                backendMsg = body?.message || body?.error || null;
            } catch { /* no JSON */ }
            throw new Error(backendMsg || `API Error: ${response.statusText}`);
        }
        const json = await response.json();
        // Si la respuesta viene envuelta en { success: true, data: [...] }, extraemos data
        return (json && json.success && json.data !== undefined) ? json.data : json;
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

    // Ferias
    getFairs: () => api.request<Fair[]>('/ferias'),
};
