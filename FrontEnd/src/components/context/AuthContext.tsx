import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>
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
      }
    }
    setIsLoading(false)
  }, [])



  const login = async (email: string, password: string): Promise<{ success: boolean; role?: string }> => {
    try {
      setIsLoading(true);
      const targetEmail = email.toLowerCase().trim()
      const targetPassword = password.trim()

      const response = await fetch(ENDPOINTS.authLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // necesario para que el navegador acepte la cookie httpOnly
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      if (!response.ok) return { success: false }

      const authData = await response.json()
      const authenticatedUser = authData.data?.user || authData.user;
      if (authenticatedUser) {
        // Guardamos solo info no sensible del usuario en localStorage para
        // poder hidratar la UI al recargar la app. El token NUNCA se guarda
        // aquí — vive solo en la cookie httpOnly que el backend seteó.
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
        return { success: true, role: authenticatedUser.role }
      }
      return { success: false }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false };
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
    // Invalidamos la cookie httpOnly llamando al backend. No esperamos el resultado
    // (fire-and-forget) porque la UI ya está fuera de sesión y un fallo de red no
    // debe bloquearla. Tampoco necesitamos token para esto: el endpoint solo borra
    // la cookie con res.clearCookie.
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    }).catch(() => { /* silently ignore */ })

    // Limpiezas por compatibilidad con flujos viejos
    localStorage.removeItem('token')
    localStorage.removeItem('agromap_password_temp')
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
