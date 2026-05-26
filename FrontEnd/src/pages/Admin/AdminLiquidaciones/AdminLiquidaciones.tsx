import React, { useEffect, useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { authFetch, ENDPOINTS } from '../../../services/api.config'

interface ProductorPendiente {
  productor_id: number
  num_ventas: string
  total_pendiente: string
  productor?: { id: number; name?: string; nombre?: string; email: string }
}

interface PlatformSetting {
  id: number
  clave: string
  valor: string
  descripcion: string
}

const fmt = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 })

const AdminLiquidaciones: React.FC = () => {
  const [pendientes, setPendientes] = useState<ProductorPendiente[]>([])
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [comisionEdit, setComisionEdit] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [resLiq, resSett] = await Promise.all([
        authFetch(ENDPOINTS.liquidaciones),
        authFetch(ENDPOINTS.platformSettings),
      ])
      const liqJson = await resLiq.json()
      const settJson = await resSett.json()
      const pend: ProductorPendiente[] = liqJson.success ? liqJson.data : []
      const setts: PlatformSetting[] = settJson.success ? settJson.data : []
      setPendientes(pend)
      setSettings(setts)
      const comision = setts.find(s => s.clave === 'comision_porcentaje')
      if (comision) setComisionEdit(comision.valor)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLiquidarBatch = async (productorId: number, nombre: string) => {
    const result = await Swal.fire({
      title: `¿Liquidar a ${nombre}?`,
      text: 'Se marcarán todas sus ganancias pendientes como "Liquidado".',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2f8f46',
      confirmButtonText: 'Sí, liquidar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return
    try {
      const res = await authFetch(ENDPOINTS.liquidacionesBatch(productorId), {
        method: 'POST',
        body: JSON.stringify({ notas: 'Liquidado desde panel admin' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Error al liquidar')
      Swal.fire({ icon: 'success', title: `${json.data?.liquidadas || 0} ventas liquidadas`, timer: 2000, showConfirmButton: false })
      fetchData()
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message })
    }
  }

  const handleSaveComision = async () => {
    const pct = parseFloat(comisionEdit)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return Swal.fire({ icon: 'error', title: 'Valor inválido', text: 'El porcentaje debe ser entre 0 y 100.' })
    }
    try {
      const res = await authFetch(`${ENDPOINTS.platformSettings}/comision_porcentaje`, {
        method: 'PATCH',
        body: JSON.stringify({ valor: String(pct) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      Swal.fire({ icon: 'success', title: 'Comisión actualizada', timer: 1500, showConfirmButton: false })
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Error', text: e.message })
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>
        Liquidaciones de Productores
      </h1>

      {/* Configuración de comisión */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>Comisión de la plataforma:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number" min="0" max="100" step="0.5"
            value={comisionEdit}
            onChange={e => setComisionEdit(e.target.value)}
            style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', textAlign: 'center' }}
          />
          <span style={{ fontWeight: 700, color: '#64748b' }}>%</span>
        </div>
        <button onClick={handleSaveComision}
          style={{ padding: '7px 18px', background: '#2f8f46', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
          Guardar
        </button>
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Se aplica a nuevas ventas. Las ventas ya registradas mantienen su porcentaje original.</span>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : pendientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '1rem' }}>
          No hay ganancias pendientes de liquidación.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {['Productor', 'Email', 'N.º ventas', 'Total pendiente', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendientes.map((p) => {
                const nombre = p.productor?.name || p.productor?.nombre || `Productor #${p.productor_id}`
                const email = p.productor?.email || '—'
                return (
                  <tr key={p.productor_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{nombre}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{email}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>{p.num_ventas}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#2f8f46' }}>{fmt.format(parseFloat(p.total_pendiente))}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        onClick={() => handleLiquidarBatch(p.productor_id, nombre)}
                        style={{ padding: '6px 16px', background: '#2f8f46', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
                      >
                        Liquidar todo
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminLiquidaciones
