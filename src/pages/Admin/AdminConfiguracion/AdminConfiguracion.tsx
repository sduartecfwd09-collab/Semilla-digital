import React from 'react'
import './AdminConfiguracion.css'

const AdminConfiguracion = () => {
    // Componente para la configuración general del sistema Semillitas
    return (
        <div className="config-container">
            <header>
                <h1>Configuración del Sistema</h1>
            </header>

            <section className="config-section">
                <h2>Ajustes Generales</h2>
                <div className="config-grid">
                    <div className="form-group">
                        <label>Nombre del Sistema</label>
                        <input type="text" className="form-control" defaultValue="Semillitas Admin" />
                    </div>
                    <div className="form-group">
                        <label>Correo de Soporte</label>
                        <input type="email" className="form-control" defaultValue="soporte@semillitas.com" />
                    </div>
                    <div className="form-group">
                        <label>Moneda Principal</label>
                        <select className="form-control">
                            <option value="CRC">Colón Costarricense (₡)</option>
                            <option value="USD">Dólar Estadounidense ($)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Idioma</label>
                        <select className="form-control">
                            <option value="es">Español</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
                <div className="modal-footer" style={{ marginTop: '0' }}>
                    <button className="btn-primary">Guardar Cambios</button>
                </div>
            </section>

            <section className="config-section">
                <h2>Notificaciones y Seguridad</h2>
                <div className="toggle-group">
                    <div className="toggle-info">
                        <h4>Notificaciones por correo</h4>
                        <p>Recibir alertas de nuevos usuarios y cambios de precios.</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                </div>
                <div className="toggle-group">
                    <div className="toggle-info">
                        <h4>Modo de Mantenimiento</h4>
                        <p>Desactivar acceso público temporalmente.</p>
                    </div>
                    <input type="checkbox" />
                </div>
            </section>
        </div>
    )
}

export default AdminConfiguracion
