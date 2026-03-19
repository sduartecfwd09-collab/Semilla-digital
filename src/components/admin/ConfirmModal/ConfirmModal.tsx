import React from 'react';

// Modal de confirmación para acciones críticas (como eliminar)
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onCancel, type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal">
                <span className="confirm-icon">{type === 'danger' ? '⚠️' : 'ℹ️'}</span>
                <h2>{title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{message}</p>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn-ghost" onClick={onCancel}>Cancelar</button>
                    <button
                        className={type === 'danger' ? 'btn-danger' : 'btn-primary'}
                        onClick={onConfirm}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
