import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Producto, CATEGORIAS } from '../../../servers/ProductService'
import { getCategoryIcon } from '../../../utils/categoryIcons'
import CategoryIcon from '../../CategoryIcon/CategoryIcon'
import { getFerias } from '../../../servers/AgricultorServices'
import './AdminProductForm.css'
import { Feria } from '../../../types/feria.types'

interface AdminProductFormProps {
  producto?: Producto
  userId: string | number
  onSubmit: (producto: Producto) => void
  onCancel: () => void
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AdminProductForm: React.FC<AdminProductFormProps> = ({
  producto,
  userId,
  onSubmit,
  onCancel,
}) => {
  const isEdit = !!producto
  const [ferias, setFerias] = useState<Feria[]>([])
  const [formData, setFormData] = useState<Producto>({
    userId,
    nombre: '',
    emoji: 'Verduras',
    descripcion: '',
    categoria: 'Verduras',
    imagen: '',
    disponible: true,
    precios: [],
  })

  const [selectedFerias, setSelectedFerias] = useState<{
    [key: string]: { selected: boolean; precio: string }
  }>({})

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const data = await getFerias()
        setFerias(data)

        if (producto) {
          const feriasMap: { [key: string]: { selected: boolean; precio: string } } = {}
          data.forEach((feria: Feria) => {
            const precioEnFeria = producto.precios.find((p) => p.feriaId === feria.id)
            feriasMap[feria.id] = {
              selected: !!precioEnFeria,
              precio: precioEnFeria ? precioEnFeria.precio.toString() : '',
            }
          })
          setSelectedFerias(feriasMap)
        } else {
          const feriasMap: { [key: string]: { selected: boolean; precio: string } } = {}
          data.forEach((feria: Feria) => {
            feriasMap[feria.id] = { selected: false, precio: '' }
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
    if (name === 'categoria') {
      setFormData({ ...formData, categoria: value, emoji: value })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFeriaToggle = (feriaId: string) => {
    setSelectedFerias({
      ...selectedFerias,
      [feriaId]: {
        ...selectedFerias[feriaId],
        selected: !selectedFerias[feriaId].selected,
      },
    })
  }

  const handlePrecioChange = (feriaId: string, precio: string) => {
    setSelectedFerias({
      ...selectedFerias,
      [feriaId]: {
        ...selectedFerias[feriaId],
        precio,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      Swal.fire('Error', 'El nombre del producto es obligatorio', 'error');
      return;
    }

    if (!formData.direccionPuesto?.trim()) {
      Swal.fire('Error', 'La dirección del puesto es obligatoria', 'error');
      return;
    }

    const precios = ferias
      .filter(feria => selectedFerias[feria.id]?.selected)
      .map(feria => ({
        feriaId: feria.id,
        feriaNombre: feria.nombre,
        provincia: feria.provincia,
        precio: parseFloat(selectedFerias[feria.id].precio) || 0
      }))

    try {
      await onSubmit({ ...formData, emoji: formData.categoria, precios })
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Producto Actualizado' : 'Producto Creado',
        text: `El producto ${formData.nombre} se ha guardado correctamente`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al guardar producto:', error)
      Swal.fire('Error', 'No se pudo guardar el producto', 'error');
    }
  }

  const categoryIconData = getCategoryIcon(formData.categoria)

  return (
    <div className="admin-product-form-overlay">
      <div className="admin-product-form-modal">
        <div className="admin-product-form-header">
          <h2>{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
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

          {/* Icono de categoría auto-asignado */}
          <div className="admin-product-form-group">
            <label>Icono de categoría</label>
            <div className="admin-product-form-icon-preview" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: categoryIconData.bgColor,
              border: `1.5px solid ${categoryIconData.color}20`,
            }}>
              <CategoryIcon categoria={formData.categoria} size={32} />
              <div>
                <span style={{
                  fontWeight: 600,
                  color: categoryIconData.color,
                  fontSize: '0.95rem'
                }}>
                  {formData.categoria}
                </span>
                <p style={{
                  margin: '2px 0 0',
                  fontSize: '0.75rem',
                  color: '#64748b'
                }}>
                  Se asigna automáticamente según la categoría
                </p>
              </div>
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
              <label>Unidad</label>
              <select 
                name="unidad" 
                value={formData.unidad || 'Unidad'} 
                onChange={handleChange}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
              >
                <option value="Unidad">Por Unidad (un)</option>
                <option value="Kilogramo">Por Kilogramo (kg)</option>
                <option value="Docena">Por Docena (doc)</option>
                <option value="Mano">Por Mano (mano)</option>
                <option value="Caja">Por Caja (cj)</option>
              </select>
            </div>
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
              {isEdit ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductForm
