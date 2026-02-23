import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Home,
  Briefcase,
  FolderOpen,
  BarChart3,
  Target,
  CheckCircle2,
  Users,
  Download,
  Settings,
  HelpCircle,
  TrendingUp,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';
import { UserProfile } from '../services/UserProfileService';
import { getDepartment } from '../config/departmentsData';
import { canAccessModule } from '../config/navigationAccess';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  userProfile: UserProfile;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  type?: 'section';
  label: string;
  icon?: LucideIcon;
  emoji?: string;
}

const SidebarModern: React.FC<SidebarProps> = ({
  activeModule,
  onModuleChange,
  userProfile,
  collapsed = false,
  onCollapsedChange,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on navigation
  const handleNav = useCallback((id: string) => {
    onModuleChange(id);
    if (window.innerWidth < 1024) {
      setMobileOpen(false);
    }
  }, [onModuleChange]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Construction du menu dynamique basé sur le profil
  const menuItems = useMemo(() => {
    const items: MenuItem[] = [];

    // Section Navigation
    items.push({ id: 'section-nav', type: 'section', label: 'NAVIGATION' });
    items.push({ id: 'home', icon: Home, label: 'Tableau de bord' });

    if (!userProfile.isDirecteur && canAccessModule(userProfile, 'assistant-dce')) {
      items.push({ id: 'assistant-dce', icon: Briefcase, label: 'Assistant DCE' });
    }

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
            icon: FolderOpen,
            label: category.name,
            emoji: category.icon,
          });
        });
      }

      if (operationCategories.length > 0) {
        items.push({ id: 'section-operations', type: 'section', label: 'OPÉRATIONS' });
        operationCategories.forEach((category) => {
          items.push({
            id: `category-${category.id}`,
            icon: FolderOpen,
            label: category.name,
            emoji: category.icon,
          });
        });
      }
    }

    // Section Gestion
    items.push({ id: 'section-gestion', type: 'section', label: 'GESTION' });
    if (canAccessModule(userProfile, 'reports-dashboard')) {
      items.push({ id: 'reports-dashboard', icon: BarChart3, label: 'Rapports' });
    }
    if (canAccessModule(userProfile, 'objectifs')) {
      items.push({ id: 'objectifs', icon: Target, label: 'Objectifs' });
    }

    // Section administration (uniquement pour directeur)
    if (canAccessModule(userProfile, 'validation') || canAccessModule(userProfile, 'team-monitoring')) {
      items.push({ id: 'section-admin', type: 'section', label: 'ADMINISTRATION' });
      if (canAccessModule(userProfile, 'validation')) {
        items.push({ id: 'validation', icon: CheckCircle2, label: 'Validation' });
      }
      if (canAccessModule(userProfile, 'team-monitoring')) {
        items.push({ id: 'team-monitoring', icon: Users, label: 'Suivi Équipe' });
      }
    }

    // Section Outils
    items.push({ id: 'section-tools', type: 'section', label: 'OUTILS' });
    if (canAccessModule(userProfile, 'exports')) {
      items.push({ id: 'exports', icon: Download, label: 'Exports' });
    }
    if (canAccessModule(userProfile, 'settings')) {
      items.push({ id: 'settings', icon: Settings, label: 'Paramétrage' });
    }
    if (canAccessModule(userProfile, 'help')) {
      items.push({ id: 'help', icon: HelpCircle, label: 'Guide' });
    }

    return items;
  }, [userProfile]);

  /** Rôle affiché */
  const roleLabel = userProfile.isDirecteur
    ? 'Directeur Général'
    : userProfile.isAssistantDCE
      ? 'Assistant DCE'
      : userProfile.fonction ?? 'Agent';

  const sidebarCls = [
    'sidebar-v2',
    collapsed ? 'sidebar-v2--collapsed' : '',
    mobileOpen ? 'sidebar-v2--mobile-open' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* ── Mobile hamburger button ── */}
      <button
        className="sidebar-v2__mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="sidebar-v2__overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={sidebarCls}>
        {/* ── Collapse toggle (desktop) ── */}
        <button
          className="sidebar-v2__collapse-btn"
          onClick={() => onCollapsedChange?.(!collapsed)}
          aria-label={collapsed ? 'Étendre le menu' : 'Rétracter le menu'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* ── Mobile close button ── */}
        <button
          className="sidebar-v2__mobile-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={18} />
        </button>

        {/* ── Logo ── */}
        <div className="sidebar-v2__logo">
          <TrendingUp size={26} className="text-red-400 flex-shrink-0" />
          <span className="sidebar-v2__logo-text">DGE Reporting</span>
        </div>

        {/* ── User Profile ── */}
        <div className="sidebar-v2__profile">
          <div className="sidebar-v2__avatar">
            <User size={22} />
          </div>
          <div className="sidebar-v2__profile-info">
            <span className="sidebar-v2__profile-name">
              {userProfile.email?.split('@')[0] ?? 'Utilisateur'}
            </span>
            <span className="sidebar-v2__profile-role">{roleLabel}</span>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="sidebar-v2__nav">
          {menuItems.map((item) => {
            if (item.type === 'section') {
              return (
                <div key={item.id} className="sidebar-v2__section">
                  {collapsed ? <span className="sidebar-v2__section-dot" /> : item.label}
                </div>
              );
            }

            const isActive = activeModule === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`sidebar-v2__item ${isActive ? 'sidebar-v2__item--active' : ''}`}
                onClick={() => handleNav(item.id)}
                title={collapsed ? item.label : undefined}
              >
                {isActive && <span className="sidebar-v2__active-bar" />}

                <span className="sidebar-v2__item-icon">
                  {item.emoji ? (
                    <span className="text-base leading-none">{item.emoji}</span>
                  ) : Icon ? (
                    <Icon size={18} />
                  ) : null}
                </span>
                <span className="sidebar-v2__item-label">{item.label}</span>

                {/* Tooltip on collapsed mode */}
                {collapsed && (
                  <span className="sidebar-v2__tooltip">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="sidebar-v2__footer">
          <span>{collapsed ? 'v3' : 'v3.0 — DGE'}</span>
        </div>
      </aside>
    </>
  );
};

export default SidebarModern;
