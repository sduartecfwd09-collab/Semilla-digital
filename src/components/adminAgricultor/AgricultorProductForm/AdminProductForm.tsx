import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Producto, CATEGORIAS, EMOJIS_POR_CATEGORIA } from '../../../servers/ProductService'
import { getFerias } from '../../../servers/AgricultorServices'
import ProductIcon, { EMOJI_ICON_MAP } from '../../../utils/productIcons'
import './AdminProductForm.css'

interface AdminProductFormProps {
  producto?: Producto
  userId: string | number
  onSubmit: (producto: Producto) => void
  onCancel: () => void
}

interface Feria {
  id: string | number
  nombre: string
  provincia: string
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  producto,
  userId,
  onSubmit,
  onCancel,
}) => {
  const [ferias, setFerias] = useState<Feria[]>([])
  const [formData, setFormData] = useState<Producto>({
    userId,
    nombre: '',
    emoji: '🍅',
    descripcion: '',
    categoria: 'Verduras',
    imagen: '',
    disponible: true,
    precios: [],
  })

  const [selectedFerias, setSelectedFerias] = useState<{
    [key: string | number]: { selected: boolean; precio: string }
  }>({})

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const data = await getFerias()
        setFerias(data)

        if (producto) {
          const feriasMap: { [key: string | number]: { selected: boolean; precio: string } } = {}
          data.forEach((feria: Feria) => {
            const precioEnFeria = producto.precios.find((p) => String(p.feriaId) === String(feria.id))
            feriasMap[String(feria.id)] = {
              selected: !!precioEnFeria,
              precio: precioEnFeria ? precioEnFeria.precio.toString() : '',
            }
          })
          setSelectedFerias(feriasMap)
        } else {
          const feriasMap: { [key: string | number]: { selected: boolean; precio: string } } = {}
          data.forEach((feria: Feria) => {
            feriasMap[String(feria.id)] = { selected: false, precio: '' }
          })
          setSelectedFerias(feriasMap)
        }
      } catch (error) {
        console.error('Error al cargar ferias:', error)
      }
    }

    fetchFerias()

    if (producto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(producto)
    }
  }, [producto, userId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFeriaToggle = (feriaId: string | number) => {
    setSelectedFerias({
      ...selectedFerias,
      [feriaId]: {
        ...selectedFerias[feriaId],
        selected: !selectedFerias[feriaId].selected,
      },
    })
  }

  const handlePrecioChange = (feriaId: string | number, precio: string) => {
    setSelectedFerias({
      ...selectedFerias,
      [feriaId]: {
        ...selectedFerias[feriaId],
        precio,
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const precios = Object.entries(selectedFerias)
      .filter(([, data]) => data.selected && data.precio)
      .map(([feriaId, data]) => {
        const feria = ferias.find((f) => String(f.id) === String(feriaId))
        return {
          feriaId: feriaId,
          feriaNombre: feria?.nombre || '',
          provincia: feria?.provincia || '',
          precio: parseFloat(data.precio),
        }
      })

    if (precios.length === 0) {
      alert('Debes agregar al menos un precio en una feria')
      return
    }

    onSubmit({ ...formData, precios })
  }

  const emojisDisponibles = EMOJIS_POR_CATEGORIA[formData.categoria] || []

  return (
    <div className="admin-product-form-overlay">
      <div className="admin-product-form-modal">
        <div className="admin-product-form-header">
          <h2>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onCancel} className="admin-product-form-close">
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-product-form">
          <div className="admin-product-form-row">
            <div className="admin-product-form-group">
              <label>Nombre del Producto</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="ej: Tomate"
                required
              />
            </div>

            <div className="admin-product-form-group">
              <label>Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange}>
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-product-form-group">
            <label>Ícono del Producto</label>
            <div className="admin-product-form-emoji-picker">
              {emojisDisponibles.map((emoji) => {
                const def = EMOJI_ICON_MAP[emoji]
                const isActive = formData.emoji === emoji
                return (
                  <button
                    key={emoji}
                    type="button"
                    title={def?.label ?? emoji}
                    className={`admin-product-form-emoji-btn ${isActive ? 'active' : ''}`}
                    style={isActive ? { background: def?.bg, borderColor: def?.color } : {}}
                    onClick={() => setFormData({ ...formData, emoji })}
                  >
                    <ProductIcon emoji={emoji} size={22} />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="admin-product-form-group">
            <label>Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="ej: Tomate maduro · Por kilogramo"
              required
            />
          </div>

          <div className="admin-product-form-group">
            <label>Precios por Feria</label>
            <div className="admin-product-form-ferias">
              {ferias.map((feria) => (
                <div key={feria.id} className="admin-product-form-feria-item">
                  <label className="admin-product-form-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFerias[feria.id]?.selected || false}
                      onChange={() => handleFeriaToggle(feria.id)}
                    />
                    <span>{feria.nombre}</span>
                  </label>
                  {selectedFerias[feria.id]?.selected && (
                    <input
                      type="number"
                      placeholder="Precio ₡"
                      value={selectedFerias[feria.id].precio}
                      onChange={(e) => handlePrecioChange(feria.id, e.target.value)}
                      className="admin-product-form-precio-input"
                      min="0"
                      step="50"
                      required
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="admin-product-form-actions">
            <button type="button" onClick={onCancel} className="admin-product-form-btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="admin-product-form-btn-submit">
              {producto ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductForm
