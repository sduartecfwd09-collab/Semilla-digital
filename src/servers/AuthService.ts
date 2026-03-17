// ─────────────────────────────────────────────────────────────────
// AuthService.ts
// Servicio para autenticación y gestión de usuarios
// ─────────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001'

interface User {
  id: number
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
    role: 'admin_feriante',
    nombre: data.nombre,
    feriaId: data.feriaId,
    puestoInfo: {
      numero: data.puestoNumero,
      descripcion: data.puestoDescripcion,
    },
  }

  const response = await fetch(`${BASE_URL}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  })

  if (!response.ok) {
    throw new Error('Error al registrar usuario')
  }

  return response.json()
}

/**
 * Verifica si un email ya existe
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await fetch(`${BASE_URL}/usuarios?email=${email}`)
  const users = await response.json()
  return users.length > 0
}

/**
 * Actualiza información del usuario
 */
export const updateUser = async (userId: number, updates: Partial<User>): Promise<User> => {
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
export const getUserById = async (userId: number): Promise<User> => {
  const response = await fetch(`${BASE_URL}/usuarios/${userId}`)
  
  if (!response.ok) {
    throw new Error('Usuario no encontrado')
  }

  return response.json()
}
