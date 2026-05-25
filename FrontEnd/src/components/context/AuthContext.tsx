import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { ENDPOINTS, API_BASE_URL } from '../../services/api.config'

interface User {
  id: string
  email: string
  role: string
  name: string
  nombre?: string
  status: string
  avatar?: string
  feriaId?: number
  puestoInfo?: {
    numero: string
    descripcion: string
  }
}

interface AuthResult {
  success: boolean
  role?: string
  status?: number
  message?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  register: (data: { name: string; email: string; password: string }) => Promise<AuthResult>
  logout: () => void
  updateUserInContext: (updatedUser: Partial<User>) => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error al parsear usuario:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const storeAuthenticatedUser = (authenticatedUser: any): AuthResult => {
    if (!authenticatedUser) return { success: false }

    const userToStore: User = {
      id: String(authenticatedUser.id),
      email: authenticatedUser.email,
      role: authenticatedUser.role,
      name: authenticatedUser.name || authenticatedUser.nombre,
      nombre: authenticatedUser.nombre || authenticatedUser.name,
      status: authenticatedUser.status || 'Activo',
      avatar: authenticatedUser.avatar,
      feriaId: authenticatedUser.feriaId,
      puestoInfo: authenticatedUser.puestoInfo,
    }

    setUser(userToStore)
    localStorage.setItem('user', JSON.stringify(userToStore))
    return { success: true, role: userToStore.role }
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true)
      const response = await fetch(ENDPOINTS.authLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password.trim(),
        }),
      })

      if (!response.ok) return { success: false, status: response.status }

      const authData = await response.json()
      return storeAuthenticatedUser(authData.data?.user || authData.user)
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: { name: string; email: string; password: string }): Promise<AuthResult> => {
    try {
      setIsLoading(true)
      const response = await fetch(ENDPOINTS.authRegister, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: data.password.trim(),
        }),
      })

      const authData = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: authData.message || authData.error,
        }
      }

      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => { /* silently ignore */ })
      setUser(null)
      localStorage.removeItem('user')
      return { success: true }
    } catch (error) {
      console.error('Error en registro:', error)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserInContext = (updatedData: Partial<User>) => {
    if (!user) return
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => { /* silently ignore */ })

    localStorage.removeItem('token')
    localStorage.removeItem('agromap_password_temp')
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUserInContext,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
