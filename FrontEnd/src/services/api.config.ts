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
  // Solo los mensajes enviados por el usuario autenticado (buzón personal).
  contactMessagesMine: `${API_BASE_URL}/mensajes/mios`,
  authLogin: `${API_BASE_URL}/auth/login`,
  authRegister: `${API_BASE_URL}/auth/register`,
  delivery: `${API_BASE_URL}/delivery`,
  authForgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  authResetPassword: `${API_BASE_URL}/auth/reset-password`,
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
  // La autenticación viaja por cookie httpOnly (`agromap_token`) seteada por el backend.
  // `credentials: 'include'` hace que el navegador la envíe automáticamente en cada
  // petición cross-origin. También mantenemos el header Bearer como fallback si
  // todavía hay un token en localStorage (compat con sesiones previas).
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { cache: 'no-store', ...options, headers, credentials: 'include' });

  if (response.status === 401) {
    if (!window.location.pathname.includes('/auth')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirigir de forma inmediata para limpiar la sesión expirada
      import('sweetalert2').then((Swal) => {
        Swal.default.fire({
          icon: 'error',
          title: 'Sesión expirada',
          text: 'Tu sesión ha expirado. Por favor, iniciá sesión nuevamente.',
          confirmButtonColor: 'var(--verde-claro)'
        }).then(() => {
          window.location.href = '/auth';
        });
      }).catch(() => {
        window.location.href = '/auth';
      });
    }
  }

  return response;
};

/** Fetch con auth para FormData (sin Content-Type manual) */
export const authFormFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...options, headers, credentials: 'include' });
};
