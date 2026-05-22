// Lee la URL del backend desde la variable de entorno de Vite.
// En desarrollo se puede omitir y cae al default localhost:3002.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3002';

export const ENDPOINTS = {
  usuarios: `${API_BASE_URL}/usuarios`,
  cambiarPassword: (id: string | number) => `${API_BASE_URL}/usuarios/${id}/password`,
  ferias: `${API_BASE_URL}/ferias`,
  recetas: `${API_BASE_URL}/recetas`,
  solicitudesCambioRol: `${API_BASE_URL}/solicitudes`,
  puestosProductor: `${API_BASE_URL}/puestos`,
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
