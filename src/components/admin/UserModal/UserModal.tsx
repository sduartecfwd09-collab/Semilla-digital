import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any
interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newUser?: any) => void;
    userToEdit?: any;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, userToEdit }) => {
    const { user } = useAuth();
    const isFirstAdmin = user?.id === 'admin-main';
    const isEditing = !!userToEdit;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: '',
        role: 'Usuario',
        status: 'Active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userToEdit) {
            setFormData({ ...userToEdit });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                avatar: '',
                role: 'Usuario',
                status: 'Activo'
            });
        }
    }, [userToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || (!isEditing && !formData.password?.trim())) {
            Swal.fire('Información Faltante', 'Por favor, completa todos los campos obligatorios.', 'warning');
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
            Swal.fire('Éxito', `Usuario ${isEditing ? 'actualizado' : 'creado'} correctamente.`, 'success');
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            Swal.fire('Error', `Error al ${isEditing ? 'actualizar' : 'crear'} usuario`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="admin-modal">
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-section">
                        <h3>Información Personal</h3>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Nombre Completo</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Contraseña</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder={isEditing ? 'Sin cambios si está vacío' : 'Contraseña del usuario'}
                                />
                            </div>
                            <div className="form-field">
                                <label>URL de Foto de Perfil</label>
                                <input
                                    type="text"
                                    value={formData.avatar}
                                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                    placeholder="https://ejemplo.com/avatar.jpg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Configuración de Cuenta</h3>
                        <div className="form-grid">
                            <div className="form-field">
                                <label>Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    disabled={!isFirstAdmin}
                                >
                                    <option value="Administrador">Administrador</option>
                                    <option value="Agricultor">Agricultor</option>
                                    <option value="Usuario">Usuario</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label>Estado</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Guardar Usuario')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
