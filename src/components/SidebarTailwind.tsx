import React, { useState, useMemo } from 'react';
import { UserProfile } from '../services/UserProfileService';
import { getDepartment } from '../config/departmentsData';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  userProfile: UserProfile;
}

// Icônes SVG pour un design plus moderne
const Icons = {
  home: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  folder: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  help: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange, userProfile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Couleurs par département
  const getDeptColors = () => {
    if (userProfile.isDirecteur) {
      return {
        bg: 'bg-direction-500',
        bgLight: 'bg-direction-50',
        text: 'text-direction-600',
        border: 'border-direction-500',
        hover: 'hover:bg-direction-50',
        active: 'bg-direction-100 text-direction-700',
      };
    }
    switch (userProfile.departement) {
      case 'DA':
        return {
          bg: 'bg-da-500',
          bgLight: 'bg-da-50',
          text: 'text-da-600',
          border: 'border-da-500',
          hover: 'hover:bg-da-50',
          active: 'bg-da-100 text-da-700',
        };
      case 'DSE':
        return {
          bg: 'bg-dse-500',
          bgLight: 'bg-dse-50',
          text: 'text-dse-600',
          border: 'border-dse-500',
          hover: 'hover:bg-dse-50',
          active: 'bg-dse-100 text-dse-700',
        };
      case 'DPNP':
        return {
          bg: 'bg-dpnp-500',
          bgLight: 'bg-dpnp-50',
          text: 'text-dpnp-600',
          border: 'border-dpnp-500',
          hover: 'hover:bg-dpnp-50',
          active: 'bg-dpnp-100 text-dpnp-700',
        };
      default:
        return {
          bg: 'bg-primary-600',
          bgLight: 'bg-primary-50',
          text: 'text-primary-600',
          border: 'border-primary-500',
          hover: 'hover:bg-primary-50',
          active: 'bg-primary-100 text-primary-700',
        };
    }
  };

  const colors = getDeptColors();

  // Construction du menu dynamique basé sur le profil
  const menuItems = useMemo(() => {
    const items: any[] = [
      { id: 'home', icon: Icons.home, label: 'Tableau de Bord' }
    ];

    // Si l'utilisateur a un département (Agent ou Chef), ajouter les catégories
    if (userProfile.departement && !userProfile.isDirecteur) {
      const department = getDepartment(userProfile.departement);
      
      items.push({ id: 'divider-dept', type: 'divider', label: 'Activités' });
      
      department.categories.forEach((category) => {
        items.push({
          id: `category-${category.id}`,
          icon: Icons.folder,
          label: category.name,
          emoji: category.icon
        });
      });
    }

    // Module Rapports & Analyses
    items.push(
      { id: 'divider-reports', type: 'divider', label: 'Rapports' },
      { id: 'reports-dashboard', icon: Icons.chart, label: 'Rapports & Analyses' },
      { id: 'objectifs', icon: Icons.target, label: 'Objectifs' }
    );

    // Section administration (uniquement pour directeur)
    if (userProfile.isDirecteur) {
      items.push(
        { id: 'divider-admin', type: 'divider', label: 'Administration' },
        { id: 'validation', icon: Icons.check, label: 'Validation' },
        { id: 'team-monitoring', icon: Icons.users, label: 'Suivi Équipe' }
      );
    }

    // Section paramètres et aide
    items.push(
      { id: 'divider-settings', type: 'divider' },
      { id: 'settings', icon: Icons.settings, label: 'Paramètres' },
      { id: 'help', icon: Icons.help, label: 'Guide' }
    );

    return items;
  }, [userProfile]);

  return (
    <aside className={`
      fixed left-0 top-0 h-screen bg-white border-r border-neutral-200
      flex flex-col py-5 z-50 transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      {/* Bouton de rétraction */}
      <button 
        className={`
          absolute -right-3 top-6 w-6 h-6 rounded-full
          ${colors.bg} text-white shadow-md
          flex items-center justify-center
          hover:scale-110 transition-transform duration-200
        `}
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
      >
        {isCollapsed ? Icons.chevronRight : Icons.chevronLeft}
      </button>

      {/* Logo et titre */}
      <div className={`flex items-center gap-2 px-4 mb-6 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className={`
          w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700
          flex items-center justify-center text-white text-base
          shadow-md flex-shrink-0
        `}>
          📊
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-primary-600 leading-tight">
              DGE Reporting
            </h1>
            <p className="text-[10px] text-primary-400">Plateforme Hebdomadaire</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {menuItems.map((item) => {
          // Divider
          if (item.type === 'divider') {
            return !isCollapsed ? (
              <div key={item.id} className="my-4">
                {item.label && (
                  <span className="px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
                <div className="mt-2 border-t border-neutral-100"></div>
              </div>
            ) : (
              <div key={item.id} className="my-4 border-t border-neutral-100"></div>
            );
          }

          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1
                font-medium text-sm transition-all duration-200
                ${isActive 
                  ? `${colors.active} shadow-sm border-l-4 ${colors.border}` 
                  : `text-neutral-600 ${colors.hover} hover:text-neutral-900 hover:translate-x-1 hover:shadow-sm`
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              onClick={() => onModuleChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? colors.text : ''}`}>
                {item.emoji ? (
                  <span className="text-lg">{item.emoji}</span>
                ) : (
                  item.icon
                )}
              </span>
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer - Profil utilisateur */}
      {!isCollapsed && (
        <div className="px-4 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50">
            <div className={`
              w-9 h-9 rounded-full ${colors.bg} 
              flex items-center justify-center text-white text-sm font-bold
            `}>
              {userProfile.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-800 truncate">
                {userProfile.email?.split('@')[0] || 'Utilisateur'}
              </p>
              <p className="text-xs text-neutral-500">
                {userProfile.isDirecteur ? 'Directeur' : userProfile.departement || 'Agent'}
              </p>
            </div>
          </div>
          
          <div className="mt-3 text-center text-xs text-neutral-400">
            <span>© 2025 DGE</span>
            <span className="mx-2">•</span>
            <span>v2.0</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
