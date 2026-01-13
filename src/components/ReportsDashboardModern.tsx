import React, { useState } from 'react';
import { UserProfile } from '../services/UserProfileService';
import ActivitySynthesisView from './ActivitySynthesisView';
import ReportsStatistics from './ReportsStatistics';
import WeeklyReportView from './WeeklyReportView';

interface ReportsDashboardModernProps {
  userProfile: UserProfile;
}

type TabId = 'synthesis' | 'statistics' | 'weekly';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
  color: string;
}

const styles = {
  container: {
    padding: '24px',
    background: '#F8FAFC',
    minHeight: '100vh',
  },
  header: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerContent: {
    position: 'relative' as const,
    zIndex: 1,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '12px',
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    background: '#2563eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1F2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  statsBar: {
    display: 'flex',
    gap: '24px',
    marginTop: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1F2937',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tabsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  tab: {
    background: '#FFFFFF',
    border: '2px solid #E5E7EB',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  tabActive: {
    borderColor: '#2563eb',
    background: '#eff6ff',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
  },
  tabHover: {
    borderColor: '#2563eb',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(37, 99, 235, 0.15)',
  },
  tabIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  },
  tabContent: {
    flex: 1,
  },
  tabLabel: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1F2937',
    display: 'block',
    marginBottom: '4px',
  },
  tabDescription: {
    fontSize: '13px',
    color: '#6B7280',
  },
  tabBadge: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    background: '#2563eb',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 600,
    padding: '4px 8px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
  },
  content: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    minHeight: '400px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
  },
};

const ReportsDashboardModern: React.FC<ReportsDashboardModernProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<TabId>('synthesis');
  const [hoveredTab, setHoveredTab] = useState<TabId | null>(null);

  const tabs: Tab[] = [
    {
      id: 'synthesis',
      label: 'Synthèse',
      icon: '📊',
      description: 'Vue consolidée de toutes les activités',
      color: '#3B82F6',
    },
    {
      id: 'statistics',
      label: 'Statistiques',
      icon: '📈',
      description: 'Graphiques et indicateurs de performance',
      color: '#10B981',
    },
    {
      id: 'weekly',
      label: 'Rapport Hebdo',
      icon: '📋',
      description: 'Génération du rapport hebdomadaire',
      color: '#F59E0B',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'synthesis':
        return <ActivitySynthesisView />;
      case 'statistics':
        return <ReportsStatistics />;
      case 'weekly':
        return <WeeklyReportView userProfile={userProfile} />;
      default:
        return <ActivitySynthesisView />;
    }
  };

  const getTabStyle = (tabId: TabId) => {
    const isActive = activeTab === tabId;
    const isHovered = hoveredTab === tabId;

    return {
      ...styles.tab,
      ...(isActive ? styles.tabActive : {}),
      ...(isHovered && !isActive ? styles.tabHover : {}),
    };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <div style={styles.headerIcon}>📊</div>
            <div>
              <h1 style={styles.title}>Rapports & Analyses</h1>
              <p style={styles.subtitle}>
                {userProfile.isDirecteur
                  ? 'Vue consolidée de tous les départements'
                  : `Département ${userProfile.departement || 'DGE'} • ${userProfile.fonction || 'Agent'}`
                }
              </p>
            </div>
          </div>

          {/* Stats bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>156</span>
              <span style={styles.statLabel}>Activités totales</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>92%</span>
              <span style={styles.statLabel}>Taux de complétion</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>12</span>
              <span style={styles.statLabel}>Rapports générés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={getTabStyle(tab.id)}
            onClick={() => setActiveTab(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
          >
            <div style={{ ...styles.tabIcon, background: `${tab.color}15` }}>
              <span style={{ fontSize: '24px' }}>{tab.icon}</span>
            </div>
            <div style={styles.tabContent}>
              <span style={styles.tabLabel}>{tab.label}</span>
              <span style={styles.tabDescription}>{tab.description}</span>
            </div>
            {activeTab === tab.id && (
              <div style={styles.tabBadge}>Actif</div>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsDashboardModern;
