import React, { useState, useMemo } from 'react';
import { UserProfile } from '../services/UserProfileService';
import { getDepartment } from '../config/departmentsData';
import './Sidebar.css';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange, userProfile }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Construction du menu dynamique basé sur le profil
  const menuItems = useMemo(() => {
    const items: any[] = [
      { id: 'home', icon: '🏠', label: 'Tableau de Bord', badge: null }
    ];

    // Si l'utilisateur a un département, ajouter les catégories du département
    if (userProfile.departement && !userProfile.isDirecteur) {
      const department = getDepartment(userProfile.departement);
      
      // Ajouter un séparateur
      items.push({ id: 'divider-dept', label: 'divider' });
      
      // Ajouter les catégories du département
      department.categories.forEach((category) => {
        items.push({
          id: `category-${category.id}`,
          icon: category.icon,
          label: category.name,
          badge: null
        });
      });
    }

    // Sections communes pour tous les utilisateurs
    items.push(
      { id: 'divider-common', label: 'divider' },
      { id: 'reports', icon: '📑', label: 'Rapports', badge: null },
      { id: 'analytics', icon: '📊', label: 'Statistiques', badge: null },
      { id: 'objectifs', icon: '🎯', label: 'Objectifs', badge: null }
    );

    // Section administration (uniquement pour directeur)
    if (userProfile.isDirecteur) {
      items.push(
        { id: 'divider-admin', label: 'divider' },
        { id: 'validation', icon: '✅', label: 'Validation', badge: null },
        { id: 'team-monitoring', icon: '👥', label: 'Suivi Équipe', badge: null }
      );
    }

    // Section paramètres et aide
    items.push(
      { id: 'divider-settings', label: 'divider' },
      { id: 'settings', icon: '⚙️', label: 'Paramètres', badge: null },
      { id: 'help', icon: '❓', label: 'Aide', badge: null }
    );

    return items;
  }, [userProfile]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton de rétraction moderne */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
        aria-label={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isCollapsed ? (
            <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          ) : (
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </svg>
      </button>

      {/* Logo et titre */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📈</div>
        {!isCollapsed && (
          <div className="sidebar-logo-text">
            <div className="sidebar-title">DGE Reporting</div>
            <div className="sidebar-subtitle">Plateforme Hebdomadaire</div>
          </div>
        )}
      </div>

      {/* Menu de navigation (sans scroll) */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.label === 'divider') {
            return !isCollapsed && <div key={item.id} className="sidebar-divider" />;
          }

          return (
            <button
              key={item.id}
              className={`sidebar-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => onModuleChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sidebar-item-icon">{item.icon}</span>
              {!isCollapsed && (
                <>
                  <span className="sidebar-item-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-version">
            <div>© 2025 DGE</div>
            <div>Version 2.0.0</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
