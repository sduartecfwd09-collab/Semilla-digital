import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Producto, CATEGORIAS, EMOJIS_POR_CATEGORIA } from '../../../servers/ProductService'
import { getFerias } from '../../../servers/AgricultorServices'
import './AdminProductForm.css'

interface AdminProductFormProps {
  producto?: Producto
  userId: string | number
  onSubmit: (producto: Producto) => void
  onCancel: () => void
}

interface Feria {
  id: number
  nombre: string
  provincia: string
}

const PROVINCIAS = [
  'San José',
  'Alajuela',
  'Cartago',
  'Heredia',
  'Guanacaste',
  'Puntarenas',
  'Limón'
]

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  producto,
  userId,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Producto>({
    userId,
    nombre: '',
    emoji: '🍅',
    descripcion: '',
    categoria: 'Verduras',
    imagen: '',
    disponible: true,
    provincia: 'San José',
    direccionPuesto: '',
    unidad: 'Unidad',
    precios: [],
  })

  const [precio, setPrecio] = useState('')

  useEffect(() => {
    if (producto) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(producto)
      if (producto.precios && producto.precios.length > 0) {
        setPrecio(producto.precios[0].precio.toString())
      }
    }
  }, [producto])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!formData.nombre.trim()) {
      Swal.fire('Error', 'El nombre del producto es obligatorio', 'error');
      return;
    }

    if (!precio || parseFloat(precio) <= 0) {
      Swal.fire('Error', 'Por favor ingresa un precio válido', 'error');
      return;
    }

    if (!formData.direccionPuesto?.trim()) {
      Swal.fire('Error', 'La dirección del puesto es obligatoria', 'error');
      return;
    }

    const precios = [{
      feriaId: 1, 
      feriaNombre: 'Feria Local',
      provincia: formData.provincia || 'San José',
      precio: parseFloat(precio)
    }]

    try {
      await onSubmit({ ...formData, precios })
      Swal.fire({
        icon: 'success',
        title: producto ? 'Producto Actualizado' : 'Producto Creado',
        text: `El producto ${formData.nombre} se ha guardado correctamente`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar el producto', 'error');
    }
  }

  const emojisDisponibles = EMOJIS_POR_CATEGORIA[formData.categoria] || []

  return (
    <div className="admin-product-form-overlay">
      <div className="admin-product-form-modal">
        <div className="admin-product-form-header">
          <h2>{producto ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onCancel} className="admin-product-form-close">
            ✕
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
            <label>Emoji</label>
            <div className="admin-product-form-emoji-picker">
              {emojisDisponibles.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className={`admin-product-form-emoji-btn ${
                    formData.emoji === emoji ? 'active' : ''
                  }`}
                  onClick={() => setFormData({ ...formData, emoji })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-product-form-row">
            <div className="admin-product-form-group">
              <label>Provincia</label>
              <select 
                name="provincia" 
                value={formData.provincia} 
                onChange={handleChange}
              >
                {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="admin-product-form-group">
              <label>Precio y Unidad</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="admin-product-form-precio-wrapper" style={{ flex: 1 }}>
                  <span className="precio-prefix">₡</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={precio}
                    onChange={(e) => setPrecio(e.target.value)}
                    className="admin-product-form-precio-input"
                    min="0"
                    step="50"
                    required
                  />
                </div>
                <select 
                  name="unidad" 
                  value={formData.unidad || 'Unidad'} 
                  onChange={handleChange}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                >
                  <option value="Unidad">Por Unidad (un)</option>
                  <option value="Kilogramo">Por Kilogramo (kg)</option>
                  <option value="Docena">Por Docena (doc)</option>
                  <option value="Mano">Por Mano (mano)</option>
                  <option value="Caja">Por Caja (cj)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admin-product-form-group">
            <label>Dirección del Puesto</label>
            <input
              type="text"
              name="direccionPuesto"
              value={formData.direccionPuesto}
              onChange={handleChange}
              placeholder="ej: Pasillo 3, Puesto 15 (Al lado de las frutas)"
              required
            />
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
