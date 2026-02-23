import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  hideHeader?: boolean;
  departmentColor?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl'
};

// Couleur unifiée DGE — Rouge Corporate
const UNIFIED_HEADER = 'linear-gradient(135deg, #CC0000 0%, #990000 100%)';

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  hideHeader = false,
}) => {
  // Fermer avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`
          ${sizeClasses[size]} 
          w-full 
          bg-white 
          rounded-2xl 
          shadow-2xl 
          overflow-hidden
          transform
          animate-slideUp
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {!hideHeader && (
          <div 
            className="relative px-6 py-5 text-white"
            style={{ background: UNIFIED_HEADER }}
          >
            <h2 className="text-xl font-bold pr-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                className="
                  absolute top-1/2 right-4 
                  -translate-y-1/2
                  w-9 h-9 
                  flex items-center justify-center
                  rounded-full
                  shadow-lg
                  hover:scale-110 hover:rotate-90
                  transition-all duration-300 ease-out
                  z-10
                "
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: 'white'
                }}
                onClick={onClose}
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`
          modal-tailwind-body
          ${hideHeader ? 'p-0' : 'p-6'} 
          max-h-[75vh] 
          overflow-y-auto
          scrollbar-thin
        `}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
