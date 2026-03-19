import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import AlertModal from '../AlertModal/AlertModal';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newUser?: any) => void;
    userToEdit?: any;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, userToEdit }) => {
    const isEditing = !!userToEdit;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Vendedor',
        status: 'Activo'
    });
    const [loading, setLoading] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '' });

    useEffect(() => {
        if (userToEdit) {
            setFormData({ ...userToEdit });
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'Vendedor',
                status: 'Activo'
            });
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    // Maneja el envío del formulario para crear o actualizar un usuario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación: No permitir campos vacíos o que solo contengan espacios
        if (!formData.name.trim() || !formData.email.trim()) {
            setAlertConfig({
                isOpen: true,
                message: 'Por favor, completa todos los campos obligatorios y asegúrate de que no contengan solo espacios.'
            });
            return;
        }

        setLoading(true);
        try {
            let result;
            if (isEditing && userToEdit.id) {
                result = await api.updateUser(userToEdit.id, formData);
            } else {
                result = await api.createUser(formData);
            }
            onSuccess(result);
            onClose();
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            setAlertConfig({ isOpen: true, message: `Error al ${isEditing ? 'actualizar' : 'crear'} usuario` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                    <button className="btn-icon" onClick={onClose} aria-label="Cerrar">✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="user-name">Nombre Completo</label>
                        <input
                            id="user-name"
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="user-email">Correo Electrónico</label>
                        <input
                            id="user-email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="user-role">Rol</label>
                        <select
                            id="user-role"
                            className="form-control"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="Administrador">Administrador</option>
                            <option value="Vendedor">Vendedor</option>
                            <option value="Cliente">Cliente</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="user-status">Estado</label>
                        <select
                            id="user-status"
                            className="form-control"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Usuario')}
                        </button>
                    </div>
                </form>
            </div>

            <AlertModal
                isOpen={alertConfig.isOpen}
                title="Información Faltante"
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
            />
        </div>
    );
};

export default UserModal;
