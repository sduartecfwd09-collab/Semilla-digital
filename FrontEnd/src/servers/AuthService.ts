import { API_BASE_URL } from '../services/api.config'

const BASE_URL = API_BASE_URL

interface User {
  id: string | number
  email: string
  password: string
  role: string
  nombre: string
  feriaId: number
  puestoInfo: {
    numero: string
    descripcion: string
  }
}

interface RegisterData {
  email: string
  password: string
  nombre: string
  feriaId: number
  puestoNumero: string
  puestoDescripcion: string
}

/**
 * Registra un nuevo usuario
 */
export const register = async (data: RegisterData): Promise<User> => {
  const newUser = {
    email: data.email,
    password: data.password,
    role: 'Agricultor',
    name: data.nombre,
    feriaId: data.feriaId,
    puestoInfo: {
      numero: data.puestoNumero,
      descripcion: data.puestoDescripcion,
    },
  }

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  })

  if (response.status === 409) {
    throw new Error('EmailAlreadyExists')
  }

  if (!response.ok) {
    throw new Error('Error al registrar usuario')
  }

  const result = await response.json();
  return result.user || result;
}

/**
 * Verifica si un email ya existe (Mock para compatibilidad)
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  // El backend maneja esto directamente en el endpoint /auth/register devolviendo 409
  return false;
}

/**
 * Actualiza información del usuario
 */
export const updateUser = async (userId: string | number, updates: Partial<User>): Promise<User> => {
  const response = await fetch(`${BASE_URL}/usuarios/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    throw new Error('Error al actualizar usuario')
  }

  return response.json()
}

/**
 * Obtiene información de un usuario por ID
 */
export const getUserById = async (userId: string | number): Promise<User> => {
  const response = await fetch(`${BASE_URL}/usuarios/${userId}`)
  
  if (!response.ok) {
    throw new Error('Usuario no encontrado')
  }

  return response.json()
}
