export const API_BASE_URL = 'http://localhost:3002';

export const ENDPOINTS = {
  usuarios: `${API_BASE_URL}/usuarios`,
  ferias: `${API_BASE_URL}/ferias`,
  recetas: `${API_BASE_URL}/recetas`,
  solicitudesCambioRol: `${API_BASE_URL}/solicitudes`,
  puestosAgricultor: `${API_BASE_URL}/puestos`,
  productos: `${API_BASE_URL}/productos`,
  contactMessages: `${API_BASE_URL}/mensajes`,
  authLogin: `${API_BASE_URL}/auth/login`,
  authRegister: `${API_BASE_URL}/auth/register`
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
};
