import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ENDPOINTS } from '../../services/api.config'

interface User {
  id: string
  email: string
  role: string
  name: string
  nombre?: string
  status: string
  feriaId?: number
  puestoInfo?: {
    numero: string
    descripcion: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>
  logout: () => void
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
  }, [])



  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      // Buscar usuario en la API usando ENDPOINTS centralizados
      const response = await fetch(`${ENDPOINTS.usuarios}?email=${email}&password=${password}`)
      const users = await response.json()

      if (users.length > 0) {
        const authenticatedUser = users[0]
        // Guardar en estado y localStorage (sin password por seguridad)
        const userToStore: User = {
          id: String(authenticatedUser.id),
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          name: authenticatedUser.name || authenticatedUser.nombre,
          nombre: authenticatedUser.nombre || authenticatedUser.name,
          status: authenticatedUser.status || 'Activo',
          feriaId: authenticatedUser.feriaId,
          puestoInfo: authenticatedUser.puestoInfo,
        }
        setUser(userToStore)
        localStorage.setItem('user', JSON.stringify(userToStore))
        return { success: true, role: authenticatedUser.role }
      }
      return { success: false }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
