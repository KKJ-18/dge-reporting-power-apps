import React, { useEffect, useState } from 'react';
import { Office365UsersService } from '../services/Office365UsersService';

interface UserProfileProps {
  user: {
    name: string;
    role: string;
    mail?: string;
    phone?: string;
    location?: string;
    department?: string;
  };
  onProfileRefresh?: (profile: any) => void;
  initialError?: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onProfileRefresh, initialError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  useEffect(() => {
    setError(initialError ?? null);
  }, [initialError]);

  const handleConnectOffice365 = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Tentative de connexion à Office 365...');
      const profileResult = await Office365UsersService.MyProfile();
      
      console.log('📊 Résultat de MyProfile:', profileResult);
      
      // Le SDK retourne { data: {...}, success: true }
      const profile = profileResult?.data || profileResult?.result || profileResult;
      
      if (profile && onProfileRefresh) {
        console.log('✅ Profil récupéré avec succès:', profile);
        onProfileRefresh(profileResult);
      }
      setError(null);
    } catch (err: any) {
      console.error('❌ Erreur de connexion:', err);
      setError(err instanceof Error ? err.message : 'Impossible de se connecter à Office 365. Vérifiez les permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDefaultData = ['Utilisateur', 'Chargement...', 'Configuration en cours...'].includes(user.name);

  return (
    <div className="page-header">
      <h1 className="page-title">👤 Mon Profil</h1>
      <p className="page-subtitle">Informations de votre compte utilisateur</p>
      
      <div style={{
        marginTop: '2rem',
        maxWidth: '800px'
      }}>
        {/* Message d'alerte si données par défaut */}
        {isDefaultData && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', color: '#1A1A1A', marginBottom: '0.25rem' }}>
                Connexion Office 365 requise
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                Cliquez sur le bouton ci-dessous pour autoriser l'accès à vos informations Office 365
              </div>
            </div>
            <button
              onClick={handleConnectOffice365}
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                background: isLoading ? '#9CA3AF' : 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                boxShadow: isLoading ? 'none' : '0 2px 8px rgba(204, 0, 0, 0.2)',
                whiteSpace: 'nowrap'
              }}
            >
              {isLoading ? '🔄 Connexion...' : '🔐 Se connecter à Office 365'}
            </button>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991B1B',
            fontSize: '0.875rem'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Carte profil principal */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            {/* Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '700',
              color: '#FFFFFF',
              flexShrink: 0
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Nom et titre */}
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '0.25rem'
              }}>
                {user.name}
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#6B7280',
                fontWeight: '500'
              }}>
                {user.role}
              </p>
            </div>
          </div>

          {/* Informations détaillées */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {user.mail && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>
                  📧 Email
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  color: '#1A1A1A',
                  fontWeight: '500'
                }}>
                  {user.mail}
                </div>
              </div>
            )}

            {user.phone && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>
                  📱 Téléphone
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  color: '#1A1A1A',
                  fontWeight: '500'
                }}>
                  {user.phone}
                </div>
              </div>
            )}

            {user.department && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>
                  🏢 Département
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  color: '#1A1A1A',
                  fontWeight: '500'
                }}>
                  {user.department}
                </div>
              </div>
            )}

            {user.location && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.5rem'
                }}>
                  📍 Localisation
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  color: '#1A1A1A',
                  fontWeight: '500'
                }}>
                  {user.location}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations système */}
        <div style={{
          background: 'rgba(204, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '1rem',
          border: '1px solid rgba(204, 0, 0, 0.1)'
        }}>
          <div style={{
            fontSize: '0.8125rem',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span>ℹ️</span>
            <span>
              Environnement: <strong>{window.parent !== window ? 'Power Apps (Production)' : 'Développement Local'}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
