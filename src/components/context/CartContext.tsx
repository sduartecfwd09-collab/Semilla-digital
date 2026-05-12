import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  addToCart: (item: Omit<CartItem, 'cantidad'>) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, cantidad: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  proformas: Proforma[]
  saveProforma: (delivery?: DeliveryInfo) => Proforma
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

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('agromap_cart')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const [proformas, setProformas] = useState<Proforma[]>(() => {
    try {
      const stored = localStorage.getItem('agromap_proformas')
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('agromap_cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('agromap_proformas', JSON.stringify(proformas))
  }, [proformas])

  const addToCart = (item: Omit<CartItem, 'cantidad'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.feriaNombre === item.feriaNombre)
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.feriaNombre === item.feriaNombre
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      }
      return [...prev, { ...item, cantidad: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(i => !(i.id === id || `${i.id}-${i.feriaNombre}` === id)))
  }

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(i =>
      (i.id === id || `${i.id}-${i.feriaNombre}` === id) ? { ...i, cantidad } : i
    ))
  }

  const clearCart = () => setItems([])

  const getTotal = () => items.reduce((sum, i) => sum + i.precio * i.cantidad, 0)

  const getItemCount = () => items.reduce((sum, i) => sum + i.cantidad, 0)

  const saveProforma = (delivery?: DeliveryInfo): Proforma => {
    const subtotal = getTotal()
    const proforma: Proforma = {
      id: `PRO-${Date.now()}`,
      fecha: new Date().toLocaleString('es-CR'),
      items: [...items],
      subtotal,
      delivery,
      total: subtotal + (delivery?.costoEnvio || 0),
    }
    setProformas(prev => [proforma, ...prev])
    clearCart()
    return proforma
  }

  const deleteProforma = (id: string) => {
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
