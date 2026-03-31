import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { ENDPOINTS } from '../../services/api.config';
import { useAuth } from '../context/AuthContext';
import './ContactUs.css';

interface ContactMessage {
  id?: string;
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
  respuesta: string;
  fechaEnvio: string;
  fechaRespuesta: string;
  estado: 'Pendiente' | 'Respondido';
}

const ContactUs: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [myMessages, setMyMessages] = useState<ContactMessage[]>([]);
  const [showMyMessages, setShowMyMessages] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.name || user.nombre || '',
        correo: user.email || ''
      }));
    }
    fetchMyMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchMyMessages = async () => {
    try {
      const res = await fetch(ENDPOINTS.contactMessages);
      const data: ContactMessage[] = await res.json();
      
      // Obtener los IDs guardados localmente para usuarios no registrados
      const savedIds: string[] = JSON.parse(localStorage.getItem('agromap_my_messages') || '[]');

      const mine = data.filter((m) => {
        if (user) {
          // Si el usuario está logueado, solo ver los de su correo (ignorando mayúsculas)
          return m.correo.toLowerCase() === user.email.toLowerCase();
        } else {
          // Si es anónimo, ver los de su dispositivo local
          return m.id && savedIds.includes(m.id);
        }
      });
      setMyMessages(mine.sort((a, b) => 
        new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime()
      ));
    } catch {
      // silently fail
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Si es el campo teléfono, solo permitir números y máximo 8 dígitos
    if (name === 'telefono') {
      const onlyNums = value.replace(/[^0-9]/g, '');
      if (onlyNums.length <= 8) {
        setFormData(prev => ({ ...prev, [name]: onlyNums }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 8;
  };

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEditClick = (msg: ContactMessage) => {
    if (msg.estado === 'Respondido') {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Solo puedes editar mensajes que aún no han sido respondidos.'
      });
      return;
    }
    setEditingMessageId(msg.id!);
    setFormData({
      nombre: msg.nombre,
      correo: msg.correo,
      telefono: msg.telefono,
      mensaje: msg.mensaje
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setFormData(prev => ({
      ...prev,
      telefono: '',
      mensaje: '',
      nombre: user ? (user.name || user.nombre || '') : '',
      correo: user ? user.email : ''
    }));
  };

  const handleDeleteMessage = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar mensaje?',
      text: '¿Estás seguro de que deseas eliminar este mensaje?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#718096',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await fetch(`${ENDPOINTS.contactMessages}/${id}`, { method: 'DELETE' });
        
        // Quitar de local storage
        const savedIds: string[] = JSON.parse(localStorage.getItem('agromap_my_messages') || '[]');
        const newIds = savedIds.filter(savedId => savedId !== id);
        localStorage.setItem('agromap_my_messages', JSON.stringify(newIds));

        if (editingMessageId === id) {
          handleCancelEdit();
        }

        Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
        fetchMyMessages();
      } catch {
        Swal.fire('Error', 'No se pudo eliminar el mensaje.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombre = formData.nombre.trim();
    const correo = formData.correo.trim();
    const telefono = formData.telefono.trim();
    const mensaje = formData.mensaje.trim();

    if (!nombre) return Swal.fire('Error', 'El nombre debe tener al menos 3 caracteres.', 'error');
    if (!validateEmail(correo)) return Swal.fire('Error', 'Por favor, ingresa un correo electrónico válido.', 'error');
    if (!validatePhone(telefono)) return Swal.fire('Error', 'El teléfono debe tener exactamente 8 dígitos numéricos.', 'error');
    if (!mensaje || mensaje.length < 10) return Swal.fire('Error', 'El mensaje debe tener al menos 10 caracteres.', 'error');

    setSubmitting(true);

    try {
      if (editingMessageId) {
        // ACTUALIZAR MENSAJE
        const res = await fetch(`${ENDPOINTS.contactMessages}/${editingMessageId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, correo, telefono, mensaje })
        });

        if (res.ok) {
          handleCancelEdit();
          Swal.fire({
            icon: 'success',
            title: '¡Mensaje actualizado!',
            text: 'Tu mensaje ha sido modificado exitosamente.',
            timer: 3000,
            showConfirmButton: false
          });
          fetchMyMessages();
        } else {
          throw new Error('Error al actualizar');
        }
      } else {
        // CREAR NUEVO MENSAJE
        const newMessage: ContactMessage = {
          nombre,
          correo,
          telefono,
          mensaje,
          respuesta: '',
          fechaEnvio: new Date().toISOString(),
          fechaRespuesta: '',
          estado: 'Pendiente'
        };

        const res = await fetch(ENDPOINTS.contactMessages, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage)
        });

        if (res.ok) {
          const createdMessage = await res.json();
          
          // Guardar en local storage para que los usuarios no registrados puedan editarlo luego
          if (createdMessage.id) {
            const savedIds: string[] = JSON.parse(localStorage.getItem('agromap_my_messages') || '[]');
            savedIds.push(createdMessage.id);
            localStorage.setItem('agromap_my_messages', JSON.stringify(savedIds));
          }

          setFormData(prev => ({
            ...prev,
            telefono: '',
            mensaje: '',
            nombre: user ? (user.name || user.nombre || '') : '',
            correo: user ? user.email : ''
          }));
          Swal.fire({
            icon: 'success',
            title: '¡Mensaje enviado!',
            text: 'Tu mensaje ha sido enviado exitosamente. Un administrador te responderá pronto.',
            confirmButtonColor: '#2d8a42',
            timer: 3000,
            showConfirmButton: false
          });
          
          if (!showMyMessages) setShowMyMessages(true);
          fetchMyMessages();
        } else {
          throw new Error('Error al enviar');
        }
      }
    } catch {
      Swal.fire('Error', 'No se pudo procesar la solicitud. Intenta de nuevo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />

      <main className="contact-container">
        <div className="contact-header">
          <h1>Contáctanos</h1>
          <p>¿Tenés alguna consulta, sugerencia o queja? Dejanos tu mensaje y te responderemos lo antes posible.</p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-card animate-fade">
            <div className="contact-form-title">
              {editingMessageId ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <h2>Editar mensaje</h2>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <h2>Enviar mensaje</h2>
                </>
              )}
            </div>

            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="contact-form-group">
                <label htmlFor="contact-nombre">Nombre completo</label>
                <input
                  id="contact-nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre completo"
                  maxLength={100}
                />
              </div>

              <div className="contact-form-row">
                <div className="contact-form-group">
                  <label htmlFor="contact-correo">Correo electrónico</label>
                  <input
                    id="contact-correo"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="tucorreo@ejemplo.com"
                    maxLength={100}
                    disabled={!!user}
                    style={user ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed', color: '#666' } : {}}
                  />
                </div>

                <div className="contact-form-group">
                  <label htmlFor="contact-telefono">Teléfono</label>
                  <input
                    id="contact-telefono"
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="88887777"
                    maxLength={8}
                  />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="contact-mensaje">Mensaje / Queja</label>
                <textarea
                  id="contact-mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje, consulta o queja aquí..."
                  rows={5}
                  maxLength={1000}
                />
                <span className="contact-char-count">{formData.mensaje.trim().length}/1000</span>
              </div>

              <div className="contact-form-actions-flex">
                 {editingMessageId && (
                   <button type="button" onClick={handleCancelEdit} className="contact-cancel-btn" disabled={submitting}>
                     Cancelar
                   </button>
                 )}
                 <button type="submit" className="contact-submit-btn" disabled={submitting} style={{ flex: 1 }}>
                   {submitting ? 'Guardando...' : editingMessageId ? 'Guardar cambios' : 'Enviar mensaje'}
                 </button>
              </div>
            </form>
          </div>

          {/* Info card */}
          <div className="contact-info-card">
            <h3>¿Cómo funciona?</h3>
            <div className="contact-info-step">
              <div className="contact-step-number">1</div>
              <div>
                <strong>Envía tu mensaje</strong>
                <p>Llená el formulario con tus datos y tu consulta o queja.</p>
              </div>
            </div>
            <div className="contact-info-step">
              <div className="contact-step-number">2</div>
              <div>
                <strong>Recibimos tu mensaje</strong>
                <p>Un administrador revisará tu mensaje lo antes posible.</p>
              </div>
            </div>
            <div className="contact-info-step">
              <div className="contact-step-number">3</div>
              <div>
                <strong>Te respondemos</strong>
                <p>Podrás ver la respuesta directamente en esta misma sección desde tu dispositivo.</p>
              </div>
            </div>

            {/* Show my messages if there are local tracking items or logged in user messages */}
            {myMessages.length > 0 && (
              <div className="contact-my-messages-section">
                <button 
                  className="contact-toggle-messages-btn"
                  onClick={() => setShowMyMessages(!showMyMessages)}
                >
                  {showMyMessages ? '▲ Ocultar mis mensajes' : `▼ Ver mis mensajes (${myMessages.length})`}
                </button>

                {showMyMessages && (
                  <div className="contact-my-messages-list">
                    {myMessages.map((msg) => (
                      <div key={msg.id} className={`contact-my-message-item ${msg.estado === 'Respondido' ? 'responded' : 'pending'}`}>
                        <div className="contact-msg-header">
                          <div className="contact-msg-info">
                            <span className={`contact-msg-status ${msg.estado === 'Respondido' ? 'status-responded' : 'status-pending'}`}>
                              {msg.estado === 'Respondido' ? '✅ Respondido' : '⏳ Pendiente'}
                            </span>
                            <span className="contact-msg-date">
                              {new Date(msg.fechaEnvio).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          
                          <div className="contact-msg-actions">
                             {msg.estado === 'Pendiente' && (
                               <button 
                                 className="contact-msg-action-btn btn-edit" 
                                 title="Editar mensaje"
                                 onClick={() => handleEditClick(msg)}
                               >
                                 ✏️
                               </button>
                             )}
                             <button 
                               className="contact-msg-action-btn btn-delete" 
                               title="Eliminar mensaje"
                               onClick={() => handleDeleteMessage(msg.id!)}
                             >
                               🗑️
                             </button>
                          </div>
                        </div>
                        <p className="contact-msg-text"><strong>Asunto:</strong> {msg.mensaje}</p>
                        
                        {msg.respuesta && (
                          <div className="contact-msg-response">
                            <strong>Respuesta del administrador:</strong>
                            <p>{msg.respuesta}</p>
                            {msg.fechaRespuesta && (
                              <span className="contact-msg-date">
                                {new Date(msg.fechaRespuesta).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactUs;
