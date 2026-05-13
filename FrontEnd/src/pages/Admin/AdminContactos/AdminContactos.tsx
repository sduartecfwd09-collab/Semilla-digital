import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { ENDPOINTS } from '../../../services/api.config';
import './AdminContactos.css';

interface ContactMessage {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  respuesta: string;
  fechaEnvio: string;
  fechaRespuesta: string;
  estado: 'Pendiente' | 'Respondido';
}

const AdminContactos: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(ENDPOINTS.contactMessages);
      const data: ContactMessage[] = await res.json();
      setMessages(data.sort((a, b) => 
        new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
      ));
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      Swal.fire('Error', 'No se pudieron cargar los mensajes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    const trimmedReply = replyText.trim();

    if (!trimmedReply) {
      Swal.fire('Error', 'La respuesta no puede estar vacía.', 'error');
      return;
    }

    if (trimmedReply.length < 5) {
      Swal.fire('Error', 'La respuesta debe tener al menos 5 caracteres.', 'error');
      return;
    }

    try {
      const res = await fetch(`${ENDPOINTS.contactMessages}/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respuesta: trimmedReply,
          fechaRespuesta: new Date().toISOString(),
          estado: 'Respondido'
        })
      });

      if (res.ok) {
        setMessages(messages.map(m => 
          m.id === messageId 
            ? { ...m, respuesta: trimmedReply, fechaRespuesta: new Date().toISOString(), estado: 'Respondido' as const }
            : m
        ));
        setReplyingTo(null);
        setReplyText('');

        Swal.fire({
          icon: 'success',
          title: '¡Respuesta enviada!',
          text: 'El usuario podrá ver tu respuesta en su perfil.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error('Error al responder');
      }
    } catch {
      Swal.fire('Error', 'No se pudo enviar la respuesta.', 'error');
    }
  };

  const handleDelete = async (messageId: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar mensaje?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${ENDPOINTS.contactMessages}/${messageId}`, { method: 'DELETE' });
        setMessages(messages.filter(m => m.id !== messageId));
        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error');
      }
    }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mensaje.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || m.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = messages.filter(m => m.estado === 'Pendiente').length;
  const respondedCount = messages.filter(m => m.estado === 'Respondido').length;

  return (
    <div className="admin-contactos-container">
      <header className="admin-contactos-header">
        <div>
          <h1>Mensajes de Contacto</h1>
          <p>Gestiona los mensajes y quejas enviados por los usuarios</p>
        </div>
        <div className="admin-contactos-stats">
          <div className="admin-contactos-stat pending">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="admin-contactos-stat responded">
            <span className="stat-number">{respondedCount}</span>
            <span className="stat-label">Respondidos</span>
          </div>
        </div>
      </header>

      <div className="admin-contactos-filters">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o mensaje..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-contactos-search"
        />
        <div className="admin-contactos-filter-btns">
          {['Todos', 'Pendiente', 'Respondido'].map(status => (
            <button
              key={status}
              className={`admin-contactos-filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-contactos-loading">Cargando mensajes...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="admin-contactos-empty">
          <p>No hay mensajes {filterStatus !== 'Todos' ? `con estado "${filterStatus}"` : ''}</p>
        </div>
      ) : (
        <div className="admin-contactos-list">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`admin-contacto-card ${msg.estado === 'Respondido' ? 'responded' : 'pending'}`}>
              <div className="admin-contacto-card-header">
                <div className="admin-contacto-user-info">
                  <div className="admin-contacto-avatar">{msg.nombre.charAt(0).toUpperCase()}</div>
                  <div>
                    <h3>{msg.nombre}</h3>
                    <p>{msg.correo}</p>
                    <a 
                      href={`https://wa.me/506${msg.telefono.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-contacto-whatsapp"
                      title="Abrir WhatsApp"
                    >
                      📱 {msg.telefono} 💬
                    </a>
                  </div>
                </div>
                <div className="admin-contacto-meta">
                  <span className={`admin-contacto-status ${msg.estado === 'Respondido' ? 'status-responded' : 'status-pending'}`}>
                    {msg.estado === 'Respondido' ? '✅ Respondido' : '⏳ Pendiente'}
                  </span>
                  <span className="admin-contacto-date">
                    {new Date(msg.fechaEnvio).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="admin-contacto-message">
                <p>{msg.mensaje}</p>
              </div>

              {msg.respuesta && (
                <div className="admin-contacto-response">
                  <strong>Tu respuesta:</strong>
                  <p>{msg.respuesta}</p>
                  {msg.fechaRespuesta && (
                    <span className="admin-contacto-date">
                      Respondido el {new Date(msg.fechaRespuesta).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

              {replyingTo === msg.id && (
                <div className="admin-contacto-reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={3}
                    maxLength={500}
                  />
                  <div className="admin-contacto-reply-actions">
                    <button 
                      className="admin-contacto-btn cancel"
                      onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="admin-contacto-btn submit"
                      onClick={() => handleReply(msg.id)}
                    >
                      Enviar respuesta
                    </button>
                  </div>
                </div>
              )}

              <div className="admin-contacto-actions">
                {msg.estado === 'Pendiente' && replyingTo !== msg.id && (
                  <button 
                    className="admin-contacto-btn reply"
                    onClick={() => { setReplyingTo(msg.id); setReplyText(''); }}
                  >
                    Responder
                  </button>
                )}
                {msg.estado === 'Respondido' && replyingTo !== msg.id && (
                  <button 
                    className="admin-contacto-btn reply"
                    onClick={() => { setReplyingTo(msg.id); setReplyText(msg.respuesta); }}
                  >
                    Editar respuesta
                  </button>
                )}
                <button 
                  className="admin-contacto-btn delete"
                  onClick={() => handleDelete(msg.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContactos;
