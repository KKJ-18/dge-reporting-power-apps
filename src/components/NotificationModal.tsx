import React from 'react';


interface NotificationModalProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose
}) => {
  if (!isOpen) return null;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  const colors = {
    success: '#107c10',
    error: '#d83b01',
    warning: '#f7630c',
    info: '#0078d4'
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div 
        className={`notification-modal notification-${type}`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderTopColor: colors[type] }}
      >
        <div className="notification-header">
          <div className="notification-icon" style={{ backgroundColor: `${colors[type]}15` }}>
            <span style={{ fontSize: '2rem' }}>{icons[type]}</span>
          </div>
          <h3 className="notification-title">{title}</h3>
          <button className="notification-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="notification-body">
          <p className="notification-message">{message}</p>
        </div>
        
        <div className="notification-footer">
          <button 
            className="notification-btn-primary" 
            onClick={onClose}
            style={{ backgroundColor: colors[type] }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
