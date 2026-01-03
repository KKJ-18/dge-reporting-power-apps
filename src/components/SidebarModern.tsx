import React, { useState, useMemo } from 'react';
import { UserProfile } from '../services/UserProfileService';
import { getDepartment } from '../config/departmentsData';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  userProfile: UserProfile;
}

// Icônes SVG modernes
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  export: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  template: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
};

// Styles inline pour le sidebar
const styles = {
  sidebar: {
    position: 'fixed' as const,
    left: 0,
    top: 0,
    height: '100vh',
    width: '180px',
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 1000,
    borderRight: '1px solid #E5E7EB',
  },
  logoSection: {
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: '#DC2626',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: 'white',
  },
  logoTitle: {
    color: '#1F2937',
    fontSize: '14px',
    fontWeight: 700,
    margin: 0,
    lineHeight: 1.2,
  },
  logoSubtitle: {
    color: '#9CA3AF',
    fontSize: '10px',
    margin: 0,
  },
  nav: {
    flex: 1,
    padding: '8px 0',
    overflowY: 'auto' as const,
    overflowX: 'hidden' as const,
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#9CA3AF',
    padding: '16px 16px 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  navItem: {
    width: 'calc(100% - 16px)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    border: 'none',
    background: 'transparent',
    color: '#4B5563',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'all 0.15s ease',
    borderRadius: '8px',
    margin: '2px 8px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  navItemActive: {
    background: '#DC2626',
    color: '#FFFFFF',
    fontWeight: 600,
  },
  navItemHover: {
    background: '#FEF2F2',
    color: '#DC2626',
  },
  navItemIcon: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '14px',
  },
};

const SidebarModern: React.FC<SidebarProps> = ({ activeModule, onModuleChange, userProfile }) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Construction du menu dynamique basé sur le profil
  const menuItems = useMemo(() => {
    const items: any[] = [];

    // Section Navigation
    items.push({ id: 'section-nav', type: 'section', label: 'NAVIGATION' });
    items.push({ id: 'home', icon: Icons.home, label: 'Tableau de bord' });

    // Si l'utilisateur a un département (Agent ou Chef), ajouter les catégories
    if (userProfile.departement && !userProfile.isDirecteur) {
      const department = getDepartment(userProfile.departement);
      
      // Catégories d'activités commerciales
      const activityCategories = department.categories.filter(cat => 
        !cat.id.includes('recouvrement') && 
        !cat.id.includes('rapatriement') && 
        !cat.id.includes('transfert') &&
        !cat.id.includes('credoc')
      );
      
      // Catégories opérationnelles
      const operationCategories = department.categories.filter(cat => 
        cat.id.includes('recouvrement') || 
        cat.id.includes('rapatriement') || 
        cat.id.includes('transfert') ||
        cat.id.includes('credoc')
      );

      if (activityCategories.length > 0) {
        items.push({ id: 'section-activities', type: 'section', label: 'ACTIVITÉS' });
        activityCategories.forEach((category) => {
          items.push({
            id: `category-${category.id}`,
            icon: Icons.folder,
            label: category.name,
            emoji: category.icon
          });
        });
      }

      if (operationCategories.length > 0) {
        items.push({ id: 'section-operations', type: 'section', label: 'OPÉRATIONS' });
        operationCategories.forEach((category) => {
          items.push({
            id: `category-${category.id}`,
            icon: Icons.folder,
            label: category.name,
            emoji: category.icon
          });
        });
      }
    }

    // Section Gestion
    items.push({ id: 'section-gestion', type: 'section', label: 'GESTION' });
    items.push({ id: 'reports-dashboard', icon: Icons.chart, label: 'Rapports' });
    items.push({ id: 'objectifs', icon: Icons.target, label: 'Objectifs' });

    // Section administration (uniquement pour directeur)
    if (userProfile.isDirecteur) {
      items.push({ id: 'section-admin', type: 'section', label: 'ADMINISTRATION' });
      items.push({ id: 'validation', icon: Icons.check, label: 'Validation' });
      items.push({ id: 'team-monitoring', icon: Icons.users, label: 'Suivi Équipe' });
    }

    // Section Outils
    items.push({ id: 'section-tools', type: 'section', label: 'OUTILS' });
    items.push({ id: 'exports', icon: Icons.export, label: 'Exports' });
    items.push({ id: 'settings', icon: Icons.settings, label: 'Paramétrage' });
    items.push({ id: 'help', icon: Icons.help, label: 'Guide' });

    return items;
  }, [userProfile]);

  const getNavItemStyle = (itemId: string) => {
    const isActive = activeModule === itemId;
    const isHovered = hoveredItem === itemId;
    
    return {
      ...styles.navItem,
      ...(isActive ? styles.navItemActive : {}),
      ...(isHovered && !isActive ? styles.navItemHover : {}),
    };
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo et titre */}
      <div style={styles.logoSection}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>📊</div>
          <div>
            <h1 style={styles.logoTitle}>DGE Reporting</h1>
            <p style={styles.logoSubtitle}>Plateforme de suivi</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          // Section Title
          if (item.type === 'section') {
            return (
              <div key={item.id} style={styles.sectionTitle}>
                {item.label}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              style={getNavItemStyle(item.id)}
              onClick={() => onModuleChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={item.label}
            >
              <span style={styles.navItemIcon}>
                {item.emoji || item.icon}
              </span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarModern;
