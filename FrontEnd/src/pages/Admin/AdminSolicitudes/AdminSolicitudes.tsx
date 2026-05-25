import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { ENDPOINTS, authFetch } from '../../../services/api.config';
import { escapeHtml } from '../../../utils/escapeHtml';
import '../AdminUsuarios/AdminUsuarios.css'; // Reutilizamos estilos

// Helper: desempaqueta respuestas del backend que vienen como { success, data }
const unwrap = async (res: Response): Promise<any> => {
  const json = await res.json();
  return json && json.success && json.data !== undefined ? json.data : json;
};

interface Solicitud {
  id: string;
  usuarioId: string | null;
  nombreDelPuesto: string;
  correoUsuario: string;
  rolSolicitado: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fechaSolicitud: string;
  motivoRespuesta?: string;
}

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const AdminSolicitudes: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [usuarios, setUsuarios] = useState<Record<string, Usuario>>({});
  const [usuariosEmail, setUsuariosEmail] = useState<Record<string, Usuario>>({});
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const [solRes, userRes] = await Promise.all([
        authFetch(ENDPOINTS.solicitudesCambioRol),
        authFetch(ENDPOINTS.usuarios)
      ]);
      
      const solList = (await unwrap(solRes)) || [];
      const userList = (await unwrap(userRes)) || [];

      const solData: Solicitud[] = Array.isArray(solList) ? solList.map((s: any) => ({
        id: s.id,
        usuarioId: s.usuario_id ?? s.usuarioId,
        nombreDelPuesto: s.nombre_del_puesto ?? s.nombreDelPuesto ?? s.nombre_usuario ?? s.nombreUsuario ?? '',
        correoUsuario: s.correo_usuario ?? s.correoUsuario ?? '',
        rolSolicitado: s.rol_solicitado ?? s.rolSolicitado ?? '',
        estado: s.estado,
        fechaSolicitud: s.fecha_solicitud ?? s.fechaSolicitud ?? '',
        motivoRespuesta: s.motivo_respuesta ?? s.motivoRespuesta
      })) : [];

      const userData: Usuario[] = Array.isArray(userList) ? userList : [];
      
      // Mapear usuarios por ID y por Correo para búsquedas flexibles
      const userMap: Record<string, Usuario> = {};
      const userEmailMap: Record<string, Usuario> = {};
      
      userData.forEach(u => {
        userMap[String(u.id)] = u;
        if (u.email) {
          userEmailMap[u.email.toLowerCase()] = u;
        }
      });
      
      setSolicitudes(solData.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()));
      setUsuarios(userMap);
      setUsuariosEmail(userEmailMap);
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleResponder = async (solicitud: Solicitud, nuevoEstado: 'Aprobada' | 'Rechazada') => {
    // 1. Pedir motivo con validación obligatoria
    const { value: motivo } = await Swal.fire({
      title: `${nuevoEstado === 'Aprobada' ? 'Aprobar' : 'Rechazar'} Solicitud`,
      input: 'textarea',
      inputLabel: 'Motivo o mensaje para el usuario (Obligatorio)',
      inputPlaceholder: 'Ingresá el motivo aquí...',
      showCancelButton: true,
      confirmButtonColor: nuevoEstado === 'Aprobada' ? '#2d8a42' : '#d33',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Debés escribir un mensaje para el usuario';
        }
        return null;
      }
    });

    if (motivo === undefined) return; // Cancelado

    // 2. Confirmación final antes de enviar
    const confirm = await Swal.fire({
      title: '¿Confirmar decisión?',
      html: `Vas a marcar esta solicitud como <strong>${escapeHtml(nuevoEstado)}</strong>.<br/><br/><strong>Mensaje adjunto:</strong><br/>"${escapeHtml(motivo)}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Volver'
    });

    if (!confirm.isConfirmed) return;

    try {
      // 1. Llamar al endpoint dedicado de admin (aprobar/rechazar). El PATCH
      //    genérico /solicitudes/:id bloquea cambios de estado por seguridad.
      const accion = nuevoEstado === 'Aprobada' ? 'aprobar' : 'rechazar';
      await authFetch(`${ENDPOINTS.solicitudesCambioRol}/${solicitud.id}/${accion}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivoRespuesta: motivo,
          motivo_respuesta: motivo
        })
      });

      // 2. Si es aprobada, asignar la feria automáticamente al usuario desde su puesto
      if (nuevoEstado === 'Aprobada' && solicitud.usuarioId) {
        try {
          const puestosRes = await authFetch(ENDPOINTS.puestosProductor);
          const puestosRaw = (await unwrap(puestosRes));
          const puestos = Array.isArray(puestosRaw) ? puestosRaw : (puestosRaw?.rows || []);
          const miPuesto = puestos.find((p: any) => String(p.usuarioId) === String(solicitud.usuarioId));

          if (miPuesto && miPuesto.feriaId) {
            await authFetch(`${ENDPOINTS.usuarios}/${solicitud.usuarioId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ feriaId: miPuesto.feriaId })
            });
          }
        } catch (e) {
          console.error("Error al asignar feria automáticamente:", e);
        }
      }
      Swal.fire('¡Listo!', `Solicitud ${nuevoEstado.toLowerCase()} correctamente${nuevoEstado === 'Aprobada' ? '. El usuario podrá activar su rol de Productor desde su perfil.' : '.'}`, 'success');
      fetchDatos();
    } catch (error) {
      console.error('Error updating solicitud:', error);
      Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
    }
  };

  const handleVerDetalles = async (solicitud: Solicitud) => {
    try {
      Swal.fire({
        title: 'Cargando información...',
        didOpen: () => {
          Swal.showLoading();
        }
      });
      const res = await authFetch(`${ENDPOINTS.puestosProductor}`);
      const resRaw = (await unwrap(res));
      const puestos = Array.isArray(resRaw) ? resRaw : (resRaw?.rows || []);
      const puestoUsuario = puestos.filter((p: any) => String(p.usuarioId) === String(solicitud.usuarioId)).pop();

      if (!puestoUsuario) {
        Swal.fire('Sin información', 'El usuario no ha completado los datos del puesto.', 'warning');
        return;
      }

      const safe = (v: unknown) => escapeHtml(v ?? 'N/A');
      const ubicacionTxt = Array.isArray(puestoUsuario.ubicacion)
        ? puestoUsuario.ubicacion.join(', ')
        : (puestoUsuario.ubicacion || 'N/A');
      const tiposTxt = Array.isArray(puestoUsuario.tiposProducto)
        ? puestoUsuario.tiposProducto.join(', ')
        : 'N/A';

      Swal.fire({
        title: `Detalles de la Solicitud`,
        html: `
          <div style="text-align: left; font-size: 0.95rem; line-height: 1.5;">
            <p><strong>Nombre del Puesto:</strong> ${safe(puestoUsuario.nombrePuesto)}</p>
            <p><strong>Ferias de interés:</strong> ${escapeHtml(ubicacionTxt)}</p>
            <p><strong>Descripción:</strong> ${safe(puestoUsuario.descripcion)}</p>
            <p><strong>Tipos de Producto:</strong> ${escapeHtml(tiposTxt)}</p>
            <hr style="opacity: 0.3; margin: 10px 0;">
            <p><strong>Teléfono:</strong> ${safe(puestoUsuario.telefono)}</p>
            <p><strong>Email de contacto:</strong> ${safe(puestoUsuario.email)}</p>
            <p><strong>Horarios propuestos:</strong> ${safe(puestoUsuario.horarios)}</p>
            <p><strong>Métodos de Cultivo:</strong> ${safe(puestoUsuario.metodosCultivo)}</p>
            <p><strong>Redes Sociales:</strong> ${safe(puestoUsuario.redesSociales)}</p>
            <hr style="opacity: 0.3; margin: 10px 0;">
            ${puestoUsuario.fotosBase64 && puestoUsuario.fotosBase64.length > 0
              ? `<p><strong>Fotos Adjuntas:</strong></p><div style="display:flex; gap:10px; overflow-x:auto; padding-bottom: 5px;">${puestoUsuario.fotosBase64
                  .filter((b64: string) => typeof b64 === 'string' && b64.startsWith('data:image/'))
                  .map((b64: string) => `<img src="${escapeHtml(b64)}" style="max-height: 120px; border-radius: 4px; border: 1px solid #ddd; object-fit: cover;" />`).join('')}</div>`
              : (puestoUsuario.fotosNombres && puestoUsuario.fotosNombres.length > 0
                  ? `<p><strong>Fotos adjuntas:</strong> ${puestoUsuario.fotosNombres.length} foto(s)</p>`
                  : '')}
          </div>
        `,
        confirmButtonColor: 'var(--verde-claro)',
        confirmButtonText: 'Cerrar ventana',
        width: '600px'
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los detalles del puesto', 'error');
    }
  };

  return (
    <div className="users-container">
      <header className="users-header">
        <h1>Solicitudes de Productor</h1>
      </header>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando solicitudes...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Solicitante</th>
                <th>Nombre del Puesto</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(sol => {
                // Buscamos el usuario por ID o por Correo (como fallback secundario)
                const userById = usuarios[String(sol.usuarioId)];
                const userByEmail = sol.correoUsuario ? usuariosEmail[sol.correoUsuario.toLowerCase()] : null;
                const user = userById || userByEmail;

                const nombreSolicitante = user ? user.name : (sol.correoUsuario || 'Usuario Desconocido');
                const emailSolicitante = user ? user.email : (sol.correoUsuario || 'N/A');

                return (
                  <tr key={sol.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={nombreSolicitante} />
                          ) : (
                            nombreSolicitante.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="user-details">
                          <span className="user-name">
                            {nombreSolicitante}
                          </span>
                          <span className="user-email">
                            {emailSolicitante}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="puesto-info">
                        <span className="user-name" style={{ color: '#052e16' }}>{sol.nombreDelPuesto}</span>
                        <div className="user-email">
                          Para: <strong>{sol.rolSolicitado}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(sol.fechaSolicitud).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${
                        sol.estado === 'Pendiente' ? 'status-pending' : 
                        sol.estado === 'Aprobada' ? 'status-active' : 'status-rejected'
                      }`}>
                        {sol.estado}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-text btn-edit-pill" 
                          title="Ver detalles"
                          onClick={() => handleVerDetalles(sol)}
                        >
                          <span className="btn-icon-small">👁️</span> Detalles
                        </button>
                        {sol.estado === 'Pendiente' && (
                          <>
                            <button 
                              className="btn-text btn-edit-pill" 
                              title="Aprobar solicitud"
                              onClick={() => handleResponder(sol, 'Aprobada')}
                            >
                              <span className="btn-icon-small">✅</span> Aprobar
                            </button>
                            <button 
                              className="btn-text btn-delete-pill" 
                              title="Rechazar solicitud"
                              onClick={() => handleResponder(sol, 'Rechazada')}
                            >
                              <span className="btn-icon-small">❌</span> Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {solicitudes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay solicitudes de momento.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminSolicitudes;
