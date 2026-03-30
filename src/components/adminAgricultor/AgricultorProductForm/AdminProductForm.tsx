/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { X } from 'lucide-react'
import { Producto, CATEGORIAS } from '../../../servers/ProductService'
import { getCategoryIcon } from '../../../utils/categoryIcons'
import { PRODUCTOS_CATALOGO, getCategoriasDelCatalogo } from '../../../utils/productCatalog'
import CategoryIcon from '../../CategoryIcon/CategoryIcon'
import { getFerias } from '../../../servers/AgricultorServices'
import { useAuth } from '../../context/AuthContext'
import './AdminProductForm.css'
import { Feria } from '../../../types/feria.types'

interface AdminProductFormProps {
  producto?: Producto
  userId: string | number
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const { user } = useAuth()
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
    unidad: 'Kilogramo',
    precios: [],
  })

  const [selectedFeriaId, setSelectedFeriaId] = useState<string>('')
  const [precio, setPrecio] = useState<string>('')

  useEffect(() => {
    const fetchFerias = async () => {
      try {
        const data = await getFerias()
        setFerias(data)

        if (producto && producto.precios && producto.precios.length > 0) {
          setSelectedFeriaId(String(producto.precios[0].feriaId))
          setPrecio(producto.precios[0].precio.toString())
        } else if (user?.feriaId) {
          // Si es nuevo y tenemos feria asignada al usuario, la precargamos
          setSelectedFeriaId(String(user.feriaId))
        }
      } catch (error) {
        console.error('Error al cargar ferias:', error)
      }
    }

    fetchFerias()

    if (producto) {
      setFormData(producto)
    }
  }, [producto, userId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    if (name === 'nombre') {
      const catalogProduct = PRODUCTOS_CATALOGO.find(p => p.nombre === value)
      if (catalogProduct) {
        setFormData({
          ...formData,
          nombre: catalogProduct.nombre,
          emoji: catalogProduct.emoji,
          categoria: catalogProduct.categoria,
        })
      } else {
        setFormData({ ...formData, nombre: value })
      }
    } else if (name === 'categoria') {
      setFormData({ ...formData, categoria: value, emoji: value })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim()) {
      Swal.fire('Error', 'El nombre del producto es obligatorio', 'error');
      return;
    }

    const numericPrice = parseFloat(precio);
    if (numericPrice < 0) {
      Swal.fire('Error', 'El precio no puede ser negativo', 'error');
      return;
    }

    // Intentamos obtener la feria seleccionada o la del usuario como fallback
    const finalFeriaId = selectedFeriaId || String(user?.feriaId || '');
    const selectedFeria = ferias.find(f => String(f.id) === finalFeriaId);

    // Creamos el arreglo de precios. Si no hay feria, usamos la provincia seleccionada en el form
    const precios = selectedFeria ? [{
      feriaId: selectedFeria.id,
      feriaNombre: selectedFeria.nombre,
      provincia: selectedFeria.provincia,
      precio: numericPrice || 0
    }] : [{
      feriaId: 1, // ID genérico para feria local
      feriaNombre: 'Feria Local',
      provincia: formData.provincia || 'N/A',
      precio: numericPrice || 0
    }];

    try {
      await onSubmit({ 
        ...formData, 
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || '',
        direccionPuesto: formData.direccionPuesto?.trim() || '',
        emoji: formData.categoria, 
        precios 
      })
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Producto Actualizado' : 'Producto Creado',
        text: `El producto ${formData.nombre} se ha guardado correctamente con precio ₡${numericPrice}`,
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
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-product-form">
          <div className="admin-product-form-row">
            <div className="admin-product-form-group">
              <label>Nombre del Producto</label>
              <select
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              >
                <option value="">— Seleccionar producto —</option>
                {getCategoriasDelCatalogo().map(cat => (
                  <optgroup key={cat} label={cat}>
                    {PRODUCTOS_CATALOGO
                      .filter(p => p.categoria === cat)
                      .map(p => (
                        <option key={p.nombre} value={p.nombre}>
                          {p.emoji} {p.nombre}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
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
          </div>

          <div className="admin-product-form-row">
            <div className="admin-product-form-group">
              <label>Precio (₡)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ej: 1500"
                  value={precio}
                  onChange={(e) => {
                    // Solo permitir dígitos
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setPrecio(val)
                  }}
                  required
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                />
                <select 
                  name="unidad" 
                  value={formData.unidad || 'Kilogramo'} 
                  onChange={handleChange}
                  style={{ width: '140px', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                >
                  <option value="Kilogramo">Por kg</option>
                  <option value="Gramo">Por gramo</option>
                  <option value="Unidad">Por un</option>
                  <option value="Litro">Por litro</option>
                  <option value="Mililitro">Por ml</option>
                  <option value="Botella">Por botella</option>
                  <option value="Docena">Por docena</option>
                  <option value="Mano">Por mano</option>
                  <option value="Caja">Por caja</option>
                </select>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Precio según la unidad seleccionada
              </p>
            </div>
          </div>

<div style={{ display: 'none' }}>
              <label>Feria (automática)</label>
              <input type="hidden" value={selectedFeriaId} />
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
