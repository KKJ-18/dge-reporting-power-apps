import React, { useState } from 'react';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  currentUser?: {
    name: string;
    role: string;
    avatar?: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, onModuleChange, currentUser }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'home', icon: '🏠', label: 'Tableau de Bord', badge: null },
    { id: 'credit-classique', icon: '💰', label: 'Crédit Classique', badge: null },
    { id: 'credit-programme', icon: '🎯', label: 'Crédit Programme', badge: null },
    { id: 'admin-engagements', icon: '📊', label: 'Admin. Engagements', badge: null },
    { id: 'suivi-mep', icon: '📈', label: 'Suivi MEP', badge: null },
    { id: 'activites-annexes', icon: '📋', label: 'Activités Annexes', badge: null },
    { id: 'divider', label: 'divider' },
    { id: 'sharepoint-activity', icon: '📝', label: 'SharePoint Activity', badge: null },
    { id: 'sharepoint-explorer', icon: '🔍', label: 'Explorateur SharePoint', badge: null },
    { id: 'reports', icon: '📑', label: 'Mes Rapports', badge: null },
    { id: 'validation', icon: '✅', label: 'Validation', badge: '3' },
    { id: 'analytics', icon: '📊', label: 'Statistiques', badge: null },
    { id: 'divider2', label: 'divider' },
    { id: 'settings', icon: '⚙️', label: 'Paramètres', badge: null },
    { id: 'help', icon: '❓', label: 'Aide', badge: null }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Bouton de rétraction */}
      <button 
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Étendre" : "Réduire"}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {/* Logo et titre */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📈</div>
        {!isCollapsed && (
          <div>
            <div className="sidebar-title">DGE Reporting</div>
            <div className="sidebar-subtitle">Plateforme Hebdomadaire</div>
          </div>
        )}
      </div>

      {/* Profil utilisateur */}
      {currentUser && (
        <div className="user-info" style={{
          background: 'rgba(26, 26, 26, 0.03)',
          borderRadius: '8px',
          padding: '0.875rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            {currentUser.avatar || currentUser.name.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div style={{ flex: 1 }}>
              <div className="user-name" style={{ 
                fontWeight: '600', 
                fontSize: '0.875rem',
                color: '#1A1A1A',
                marginBottom: '0.125rem'
              }}>
                {currentUser.name}
              </div>
              <div className="user-role" style={{ 
                fontSize: '0.75rem', 
                color: '#6B7280'
              }}>
                {currentUser.role}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav>
        <ul className="nav-menu">
          {menuItems.map((item) => {
            if (item.label === 'divider') {
              return (
                <li key={item.id} style={{
                  height: '1px',
                  background: 'rgba(0, 0, 0, 0.08)',
                  margin: '1rem 0'
                }} />
              );
            }

            return (
              <li key={item.id} className="nav-item">
                <a
                  className={`nav-link ${activeModule === item.id ? 'active' : ''}`}
                  onClick={() => onModuleChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-text" style={{ flex: 1 }}>{item.label}</span>}
                  {!isCollapsed && item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div style={{
          marginTop: 'auto',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            fontSize: '0.6875rem', 
            color: '#9CA3AF',
            textAlign: 'center'
          }}>
            <div>© 2025 DGE</div>
            <div style={{ marginTop: '0.25rem' }}>Version 2.0.0</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;