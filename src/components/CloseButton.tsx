import React from 'react';

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Bouton de fermeture moderne sans rotation
 */
const CloseButton: React.FC<CloseButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`close-button ${className}`}
      aria-label="Fermer"
      type="button"
      style={{
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#F3F4F6',
        color: '#6B7280',
        fontSize: '1.25rem',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#EF4444';
        e.currentTarget.style.color = '#FFFFFF';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#F3F4F6';
        e.currentTarget.style.color = '#6B7280';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      ×
    </button>
  );
};

export default CloseButton;
