import React, { useState, useEffect } from 'react';
import { UserProfile, UserProfileService } from '../services/UserProfileService';
import { getDepartment, DEPARTMENTS_MAP } from '../config/departmentsData';
import DepartmentDashboardAnalyse from './DepartmentDashboardAnalyseTailwind';
import DepartmentDashboardDSE from './DepartmentDashboardDSETailwind';
import DepartmentDashboardDPNP from './DepartmentDashboardDPNPTailwind';

interface HomePageModernProps {
  onModuleSelect: (moduleId: string) => void;
}

// Icônes SVG
const Icons = {
  chart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  folder: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  cog: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  globe: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

const HomePageModernTailwind: React.FC<HomePageModernProps> = ({ onModuleSelect }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const profile = await UserProfileService.getCurrentUserProfile();
      setUserProfile(profile);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Écran de chargement
  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="loader"></div>
          <p className="text-neutral-600">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-neutral-800 mb-2">Erreur de chargement</h2>
          <p className="text-neutral-600 mb-6">{error || 'Impossible de charger votre profil'}</p>
          <button className="btn-primary" onClick={loadUserProfile}>
            {Icons.refresh}
            <span>Réessayer</span>
          </button>
        </div>
      </div>
    );
  }

  // Vue Directeur - Accès à tous les départements
  if (userProfile.isDirecteur) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header de bienvenue */}
        <div className="bg-gradient-to-r from-direction-500 to-direction-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              {Icons.globe}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold mb-1">Bienvenue, Directeur</h1>
              <p className="text-white/80 text-sm lg:text-base">Vue globale de la Direction • Accès à tous les départements</p>
            </div>
          </div>
        </div>

        {/* Grille des départements */}
        <section>
          <h2 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-direction-500 rounded-full"></span>
            Sélectionnez un département
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Object.values(DEPARTMENTS_MAP).map((dept) => (
              <div
                key={dept.id}
                className="bg-white rounded-xl p-5 border-2 border-neutral-100 border-t-4 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ borderTopColor: dept.color }}
                onClick={() => onModuleSelect(`department-${dept.id}`)}
              >
                {/* Header de la carte */}
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${dept.color}15` }}
                  >
                    {dept.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-800 text-base">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-neutral-500 truncate">{dept.fullName}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 mb-4 py-3 border-y border-neutral-100">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold" style={{ color: dept.color }}>
                      {dept.categories.length}
                    </div>
                    <div className="text-xs text-neutral-500">Catégories</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold" style={{ color: dept.color }}>
                      {dept.categories.reduce((sum, cat) => sum + cat.activities.length, 0)}
                    </div>
                    <div className="text-xs text-neutral-500">Activités</div>
                  </div>
                </div>

                {/* Bouton d'accès */}
                <button 
                  className="w-full py-2.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ backgroundColor: dept.color }}
                >
                  <span>Accéder au département</span>
                  {Icons.arrowRight}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Actions rapides */}
        <section>
          <h2 className="text-lg font-bold text-neutral-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-direction-500 rounded-full"></span>
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'reports', icon: Icons.chart, label: 'Voir tous les rapports', color: 'bg-blue-500' },
              { id: 'activities', icon: Icons.document, label: 'Gestion des activités', color: 'bg-green-500' },
              { id: 'categories', icon: Icons.folder, label: 'Gestion des catégories', color: 'bg-amber-500' },
              { id: 'settings', icon: Icons.cog, label: 'Paramètres', color: 'bg-neutral-500' },
            ].map((action) => (
              <button
                key={action.id}
                className="bg-white rounded-xl p-4 border-2 border-neutral-100 flex flex-col items-center gap-3 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                onClick={() => onModuleSelect(action.id)}
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white`}>
                  {action.icon}
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Vue Chef de département / Agent
  if (userProfile.departement) {
    const department = getDepartment(userProfile.departement);
    
    // Sélection du bon dashboard selon le département
    const renderDepartmentDashboard = () => {
      switch (userProfile.departement) {
        case 'DA':
          return <DepartmentDashboardAnalyse department={department} userProfile={userProfile} />;
        case 'DSE':
          return <DepartmentDashboardDSE department={department} userProfile={userProfile} />;
        case 'DPNP':
          return <DepartmentDashboardDPNP department={department} userProfile={userProfile} />;
        default:
          return <DepartmentDashboardAnalyse department={department} userProfile={userProfile} />;
      }
    };
    
    return (
      <div className="animate-fade-in">
        {renderDepartmentDashboard()}
      </div>
    );
  }

  // Utilisateur sans département assigné
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Accès non autorisé</h2>
        <p className="text-neutral-600 mb-4">
          Votre compte n'est assigné à aucun département.<br/>
          Veuillez contacter votre administrateur pour obtenir l'accès.
        </p>
        <div className="bg-neutral-50 rounded-xl p-4 text-sm text-left space-y-1">
          <p><strong className="text-neutral-700">Email:</strong> {userProfile.email}</p>
          <p><strong className="text-neutral-700">Fonction:</strong> {userProfile.fonction || 'Non définie'}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePageModernTailwind;
