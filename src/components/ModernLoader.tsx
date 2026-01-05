import React from 'react';

interface ModernLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  message = 'Chargement en cours...', 
  size = 'medium',
  fullScreen = true 
}) => {
  const sizeMap = {
    small: { spinner: 40, inner: 32, dot: 8 },
    medium: { spinner: 64, inner: 52, dot: 12 },
    large: { spinner: 80, inner: 68, dot: 16 },
  };

  const dimensions = sizeMap[size];

  const containerStyle: React.CSSProperties = fullScreen ? {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(248, 250, 252, 0.98)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    minHeight: '200px',
  };

  return (
    <div style={containerStyle}>
      {/* Spinner principal */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        {/* Cercle extérieur */}
        <div
          style={{
            width: `${dimensions.spinner}px`,
            height: `${dimensions.spinner}px`,
            border: '3px solid #F3F4F6',
            borderRadius: '50%',
            position: 'relative',
          }}
        />
        
        {/* Cercle animé */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${dimensions.spinner}px`,
            height: `${dimensions.spinner}px`,
            border: '3px solid transparent',
            borderTopColor: '#DC2626',
            borderRightColor: '#DC2626',
            borderRadius: '50%',
            animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
          }}
        />
        
        {/* Cercle intérieur */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${dimensions.inner}px`,
            height: `${dimensions.inner}px`,
            border: '3px solid transparent',
            borderBottomColor: '#EF4444',
            borderLeftColor: '#EF4444',
            borderRadius: '50%',
            animation: 'spin-reverse 0.8s linear infinite',
          }}
        />
        
        {/* Point central */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${dimensions.dot}px`,
            height: `${dimensions.dot}px`,
            background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* Message */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: size === 'small' ? '13px' : size === 'large' ? '16px' : '14px',
            fontWeight: 600,
            color: '#1F2937',
            margin: '0 0 8px 0',
            animation: 'fade-in-out 2s ease-in-out infinite',
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                background: '#9CA3AF',
                borderRadius: '50%',
                animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes spin-reverse {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes fade-in-out {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: translateY(0);
          }
          40% { 
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
};

export default ModernLoader;
