import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  role: string
  nombre: string
  feriaId: number
  puestoInfo: {
    numero: string
    descripcion: string
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
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
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error al parsear usuario:', error)
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Buscar usuario en la API
      const response = await fetch(`http://localhost:3001/usuarios?email=${email}&password=${password}`)
      const users = await response.json()

      if (users.length > 0) {
        const authenticatedUser = users[0]
        // Guardar en estado y localStorage (sin password)
        const userWithoutPassword = {
          id: authenticatedUser.id,
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          nombre: authenticatedUser.nombre || authenticatedUser.name, // Handle both name/nombre
          feriaId: authenticatedUser.feriaId,
          puestoInfo: authenticatedUser.puestoInfo,
        }
        setUser(userWithoutPassword)
        localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword))
        return true
      }
      return false
    } catch (error) {
      console.error('Error en login:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
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
