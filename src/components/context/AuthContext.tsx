import React, { createContext, useContext, useState, ReactNode } from 'react'

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
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('auth_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        localStorage.removeItem('auth_user')
        return null
      }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)



  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
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
        return { success: true, role: userWithoutPassword.role }
      }
      return { success: false }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false }
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
