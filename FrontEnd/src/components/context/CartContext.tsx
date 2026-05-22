import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { API_BASE_URL } from '../../services/api.config'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: string
  nombre: string
  emoji: string
  precio: number
  feriaNombre: string
  provincia: string
  unidad: string
  cantidad: number
  descripcion?: string
  categoria?: string
}

export interface DeliveryInfo {
  nombre: string
  telefono: string
  direccion: string
  provincia: string
  notas: string
  costoEnvio: number
}

export interface Proforma {
  id: string
  fecha: string
  items: CartItem[]
  subtotal: number
  delivery?: DeliveryInfo
  total: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'cantidad'>, cantidad?: number) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  proformas: Proforma[]
  saveProforma: (delivery?: DeliveryInfo) => Promise<Proforma>
  deleteProforma: (id: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

const CartProviderInner: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth()
  const userId = user?.id || null
  const cartKey = userId ? `agromap_cart_${userId}` : null
  const proformasKey = userId ? `agromap_proformas_${userId}` : null

  const [items, setItems] = useState<CartItem[]>(() => {
    if (!cartKey) return []
    try {
      const stored = localStorage.getItem(cartKey)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const [proformas, setProformas] = useState<Proforma[]>(() => {
    if (!proformasKey) return []
    try {
      const stored = localStorage.getItem(proformasKey)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(items))
    }
  }, [items, cartKey])

  useEffect(() => {
    if (proformasKey) {
      localStorage.setItem(proformasKey, JSON.stringify(proformas))
    }
  }, [proformas, proformasKey])

  const addToCart = (item: Omit<CartItem, 'cantidad'>, cantidad = 1) => {
    if (!userId) return
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.feriaNombre === item.feriaNombre)
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.feriaNombre === item.feriaNombre
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        )
      }
      return [...prev, { ...item, cantidad }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string) => {
    if (!userId) return
    setItems(prev => prev.filter(i => !(i.id === id || `${i.id}-${i.feriaNombre}` === id)))
  }

  const updateQuantity = (id: string, cantidad: number) => {
    if (!userId) return
    if (cantidad <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(i =>
      (i.id === id || `${i.id}-${i.feriaNombre}` === id) ? { ...i, cantidad } : i
    ))
  }

  const clearCart = () => {
    if (!userId) return
    setItems([])
  }

  const getTotal = () => items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  const getItemCount = () => items.reduce((sum, i) => sum + i.cantidad, 0)

  const saveProforma = async (delivery?: DeliveryInfo): Promise<Proforma> => {
    const subtotal = getTotal()

    const proformaData = {
      usuario_id: userId ? Number(userId) : null,
      subtotal,
      total: subtotal + (delivery?.costoEnvio || 0),
      costo_envio: delivery?.costoEnvio || 0,
      notas: delivery?.notas || '',
      items: items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        emoji: item.emoji,
        precio: item.precio,
        feriaNombre: item.feriaNombre,
        provincia: item.provincia,
        unidad: item.unidad,
        cantidad: item.cantidad,
        descripcion: item.descripcion || '',
        categoria: item.categoria || '',
      })),
      direccion_id: null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/proformas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proformaData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la proforma en el servidor');
      }

      const resData = await response.json();
      const dbProforma = resData.success ? resData.data : resData;

      const proforma: Proforma = {
        id: dbProforma.id || `PRO-${Date.now()}`,
        fecha: dbProforma.fecha ? new Date(dbProforma.fecha).toLocaleString('es-CR') : new Date().toLocaleString('es-CR'),
        items: [...items],
        subtotal,
        delivery,
        total: proformaData.total,
      };

      setProformas(prev => [proforma, ...prev]);
      clearCart();
      return proforma;
    } catch (error) {
      console.error('Error al guardar proforma en DB:', error);
      const proforma: Proforma = {
        id: `PRO-${Date.now()}`,
        fecha: new Date().toLocaleString('es-CR'),
        items: [...items],
        subtotal,
        delivery,
        total: subtotal + (delivery?.costoEnvio || 0),
      };
      setProformas(prev => [proforma, ...prev]);
      clearCart();
      return proforma;
    }
  }

  const deleteProforma = (id: string) => {
    if (!userId) return
    setProformas(prev => prev.filter(p => p.id !== id))
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
    isCartOpen,
    setIsCartOpen,
    proformas,
    saveProforma,
    deleteProforma,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth()
  return (
    <CartProviderInner key={user?.id || 'guest'}>
      {children}
    </CartProviderInner>
  )
}
