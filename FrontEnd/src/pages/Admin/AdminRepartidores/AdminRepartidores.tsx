import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ENDPOINTS, authFetch } from '../../../services/api.config';
import '../AdminUsuarios/AdminUsuarios.css';

interface RepartidorData {
  id: string; // ID de la solicitud o del usuario
  usuarioId: string;
  nombreUsuario: string;
  correoUsuario: string;
  vehicleType: string;
  licensePlate: string;
  marca: string;
  modelo: string;
  anio?: number;
  estado: string;
  fechaSolicitud: string;
  documentosBase64?: Record<string, string>;
  confirmaciones?: Record<string, boolean>;
  avatar?: string;
}

const AdminRepartidores: React.FC = () => {
  const [repartidores, setRepartidores] = useState<RepartidorData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const [solRes, userRes] = await Promise.all([
        authFetch(ENDPOINTS.solicitudesCambioRol),
        authFetch(ENDPOINTS.usuarios)
      ]);
      
      const solDataRaw = await solRes.json();
      const userDataRaw = await userRes.json();

      const solList = solDataRaw.data ?? solDataRaw;
      const userList = userDataRaw.data ?? userDataRaw;

      const userMap: Record<string, any> = {};
      (Array.isArray(userList) ? userList : []).forEach(u => {
        userMap[String(u.id)] = u;
      });

      // Filtrar solicitudes para DRIVER
      const deliverySolicitudes = (Array.isArray(solList) ? solList : []).filter(
        (s: any) => (s.rol_solicitado ?? s.rolSolicitado) === 'DRIVER'
      );

      // Usaremos la solicitud más reciente por usuario si hay duplicados,
      // pero por ahora mapeamos todas o solo la última de cada usuario
      const repartidoresMap = new Map<string, RepartidorData>();

      deliverySolicitudes.forEach((s: any) => {
        const uId = String(s.usuario_id ?? s.usuarioId);
        const user = userMap[uId];
        
        // Si ya tenemos una y es más reciente, ignoramos la vieja
        const currentData = repartidoresMap.get(uId);
        const sDate = new Date(s.fecha_solicitud ?? s.fechaSolicitud).getTime();
        
        if (!currentData || sDate > new Date(currentData.fechaSolicitud).getTime()) {
          repartidoresMap.set(uId, {
            id: s.id,
            usuarioId: uId,
            nombreUsuario: user ? user.name : (s.nombre_usuario ?? s.nombreUsuario ?? 'Desconocido'),
            correoUsuario: user ? user.email : (s.correo_usuario ?? s.correoUsuario ?? 'N/A'),
            vehicleType: s.vehicle_type ?? s.vehicleType ?? 'N/A',
            licensePlate: s.license_plate ?? s.licensePlate ?? 'N/A',
            marca: s.marca_vehiculo ?? s.marcaVehiculo ?? 'N/A',
            modelo: s.modelo_vehiculo ?? s.modeloVehiculo ?? 'N/A',
            anio: s.anio_vehiculo ?? s.anioVehiculo,
            estado: s.estado ?? 'Pendiente',
            fechaSolicitud: s.fecha_solicitud ?? s.fechaSolicitud ?? '',
            documentosBase64: s.documentos_base64 ?? s.documentosBase64 ?? {},
            confirmaciones: s.confirmaciones ?? {},
            avatar: user?.avatar
          });
        }
      });

      setRepartidores(Array.from(repartidoresMap.values()).sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()));
    } catch (error) {
      console.error('Error fetching repartidores:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos de repartidores', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleVerDetalles = (rep: RepartidorData) => {
    // Construir HTML para las imágenes
    let docsHtml = '';
    if (rep.documentosBase64 && Object.keys(rep.documentosBase64).length > 0) {
      docsHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; margin-top: 15px;">`;
      Object.entries(rep.documentosBase64).forEach(([key, base64Str]) => {
        if (base64Str.startsWith('data:image')) {
          docsHtml += `
            <div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
              <span style="font-size:0.75rem; color:#64748b; font-weight:bold;">${key}</span>
              <img src="${base64Str}" style="width:100%; height:80px; object-fit:cover; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer;" onclick="window.open('${base64Str}', '_blank')" />
            </div>
          `;
        }
      });
      docsHtml += `</div>`;
    } else {
      docsHtml = '<p style="color:#64748b; font-style:italic; font-size:0.9rem;">No hay documentos adjuntos</p>';
    }

    Swal.fire({
      title: `Detalles del Repartidor`,
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.6;">
          <h4 style="margin-bottom:0.5rem; color:#052e16;">Información del Vehículo</h4>
          <p><strong>Tipo:</strong> ${rep.vehicleType}</p>
          <p><strong>Placa:</strong> ${rep.licensePlate}</p>
          <p><strong>Marca / Modelo:</strong> ${rep.marca} / ${rep.modelo}</p>
          ${rep.anio ? `<p><strong>Año:</strong> ${rep.anio}</p>` : ''}
          
          <hr style="opacity: 0.2; margin: 15px 0;">
          
          <h4 style="margin-bottom:0.5rem; color:#052e16;">Documentos y Evidencias</h4>
          ${docsHtml}
        </div>
      `,
      confirmButtonColor: '#3B9C3A',
      confirmButtonText: 'Cerrar ventana',
      width: '600px'
    });
  };

  const handleCambiarEstado = async (rep: RepartidorData, nuevoEstado: 'Aprobada' | 'Rechazada') => {
    const confirm = await Swal.fire({
      title: '¿Confirmar decisión?',
      text: `Vas a marcar esta solicitud como ${nuevoEstado}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Volver'
    });

    if (!confirm.isConfirmed) return;

    try {
      const accion = nuevoEstado === 'Aprobada' ? 'aprobar' : 'rechazar';
      await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${rep.id}/${accion}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          motivoRespuesta: `Solicitud de delivery ${nuevoEstado.toLowerCase()}`,
          motivo_respuesta: `Solicitud de delivery ${nuevoEstado.toLowerCase()}`,
          fechaRespuesta: new Date().toISOString(),
          fecha_respuesta: new Date().toISOString()
        })
      });
      
      Swal.fire('¡Listo!', `Repartidor ${nuevoEstado.toLowerCase()} correctamente.`, 'success');
      fetchDatos();
    } catch (error) {
      console.error('Error updating repartidor:', error);
      Swal.fire('Error', 'No se pudo actualizar el estado', 'error');
    }
  };

  return (
    <div className="users-container">
      <header className="users-header">
        <h1>Gestión de Repartidores</h1>
      </header>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando repartidores...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Repartidor</th>
                <th>Vehículo</th>
                <th>Fecha de Solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {repartidores.map(rep => (
                <tr key={rep.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {rep.avatar ? (
                          <img src={rep.avatar} alt={rep.nombreUsuario} />
                        ) : (
                          rep.nombreUsuario.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="user-details">
                        <span className="user-name">
                          {rep.nombreUsuario}
                        </span>
                        <span className="user-email">
                          {rep.correoUsuario}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="puesto-info">
                      <span className="user-name" style={{ color: '#052e16' }}>{rep.vehicleType}</span>
                      <div className="user-email">
                        Placa: <strong>{rep.licensePlate}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{new Date(rep.fechaSolicitud).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${
                      rep.estado === 'Pendiente' ? 'status-pending' : 
                      rep.estado === 'Aprobada' ? 'status-active' : 'status-rejected'
                    }`}>
                      {rep.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-text btn-edit-pill" 
                        title="Ver detalles"
                        onClick={() => handleVerDetalles(rep)}
                      >
                        <span className="btn-icon-small">👁️</span> Detalles
                      </button>
                      
                      {rep.estado === 'Pendiente' && (
                        <>
                          <button 
                            className="btn-text btn-edit-pill" 
                            title="Aprobar"
                            onClick={() => handleCambiarEstado(rep, 'Aprobada')}
                          >
                            <span className="btn-icon-small">✅</span> Aprobar
                          </button>
                          <button 
                            className="btn-text btn-delete-pill" 
                            title="Rechazar"
                            onClick={() => handleCambiarEstado(rep, 'Rechazada')}
                          >
                            <span className="btn-icon-small">❌</span> Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {repartidores.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay registros de repartidores.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRepartidores;
