import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ENDPOINTS } from '../../services/api.config'

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

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
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

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error al parsear usuario:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Normalizamos el email para la búsqueda
      const targetEmail = email.toLowerCase().trim()
      const targetPassword = password.trim()

      // Obtenemos todos los usuarios para filtrar manualmente (más fiable que los query params)
      const response = await fetch(ENDPOINTS.usuarios)
      if (!response.ok) return false
      
      const allUsers = await response.json()
      
      // Buscamos un usuario que coincida (email ignorando mayúsculas)
      const authenticatedUser = allUsers.find((u: any) => 
        u.email.toLowerCase() === targetEmail && 
        u.password === targetPassword
      )

      if (authenticatedUser) {
        // Guardar en estado y localStorage (sin password por seguridad)
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
        return true
      }
      return false
    } catch (error) {
      console.error('Error en login:', error)
      return false
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
  }

  const value = {
    user,
    login,
    logout,
    updateUserInContext,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
