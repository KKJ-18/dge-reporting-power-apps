import React, { useEffect, useState } from 'react';
import { Office365UsersService } from '../services/Office365UsersService';
import { debugLog } from '../utils/logger';

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
      debugLog('🔐 Tentative de connexion à Office 365...');
      const profileResult = await Office365UsersService.MyProfile();
      
      debugLog('📊 Résultat de MyProfile:', profileResult);
      
      // Le SDK retourne { data: {...}, success: true }
      const profile = profileResult?.data || profileResult?.result || profileResult;
      
      if (profile && onProfileRefresh) {
        debugLog('✅ Profil récupéré avec succès:', profile);
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
      
      <div className="mt-8 max-w-[800px]">
        {/* Message d'alerte si données par défaut */}
        {isDefaultData && (
          <div className="bg-amber-100/50 border border-amber-400/40 rounded-xl p-4 mb-6 flex items-center gap-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="font-semibold text-neutral-900 mb-1">
                Connexion Office 365 requise
              </div>
              <div className="text-sm text-neutral-500">
                Cliquez sur le bouton ci-dessous pour autoriser l'accès à vos informations Office 365
              </div>
            </div>
            <button
              onClick={handleConnectOffice365}
              disabled={isLoading}
              className={`px-6 py-3 text-sm font-semibold rounded-lg text-white whitespace-nowrap transition-all ${
                isLoading
                  ? 'bg-neutral-400 cursor-not-allowed'
                  : 'bg-linear-to-br from-red-700 to-red-900 hover:opacity-95 shadow-md'
              }`}
            >
              {isLoading ? '🔄 Connexion...' : '🔐 Se connecter à Office 365'}
            </button>
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100/60 border border-red-300 rounded-xl p-4 mb-6 text-red-800 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Carte profil principal */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-6">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-black/10">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-linear-to-br from-red-700 to-red-900 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Nom et titre */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900 mb-1">
                {user.name}
              </h2>
              <p className="text-base text-neutral-500 font-medium">
                {user.role}
              </p>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            {user.mail && (
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  📧 Email
                </div>
                <div className="text-[0.9375rem] text-neutral-900 font-medium">
                  {user.mail}
                </div>
              </div>
            )}

            {user.phone && (
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  📱 Téléphone
                </div>
                <div className="text-[0.9375rem] text-neutral-900 font-medium">
                  {user.phone}
                </div>
              </div>
            )}

            {user.department && (
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  🏢 Département
                </div>
                <div className="text-[0.9375rem] text-neutral-900 font-medium">
                  {user.department}
                </div>
              </div>
            )}

            {user.location && (
              <div>
                <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  📍 Localisation
                </div>
                <div className="text-[0.9375rem] text-neutral-900 font-medium">
                  {user.location}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informations système */}
        <div className="bg-red-900/5 rounded-xl p-4 border border-red-900/10">
          <div className="text-[0.8125rem] text-neutral-500 flex items-center gap-2">
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
