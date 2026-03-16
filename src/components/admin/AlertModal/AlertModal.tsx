import React from 'react';

// Modal de alerta simple para mostrar mensajes informativos o de error
interface AlertModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning';
    onClose: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, title, message, type = 'warning', onClose }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            default: return 'ℹ️';
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content confirm-modal">
                <span className="confirm-icon">{getIcon()}</span>
                <h2>{title}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{message}</p>
                <div className="modal-footer" style={{ justifyContent: 'center' }}>
                    <button
                        className="btn-primary"
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
