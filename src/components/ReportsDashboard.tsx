import React, { useState } from 'react';
import { UserProfile } from '../services/UserProfileService';
import ActivitySynthesisView from './ActivitySynthesisView';
import ReportsStatistics from './ReportsStatistics';
import WeeklyReportView from './WeeklyReportView';
import './ReportsDashboard.css';

interface ReportsDashboardProps {
  userProfile: UserProfile;
}

type TabId = 'synthesis' | 'statistics' | 'weekly';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}

const ReportsDashboard: React.FC<ReportsDashboardProps> = ({ userProfile }) => {
  const [activeTab, setActiveTab] = useState<TabId>('synthesis');

  // Déterminer la classe de département pour le thème
  const getDeptClass = () => {
    if (userProfile.isDirecteur) return 'dept-direction';
    switch (userProfile.departement) {
      case 'DA': return 'dept-da';
      case 'DSE': return 'dept-dse';
      case 'DPNP': return 'dept-dpnp';
      default: return '';
    }
  };

  const tabs: Tab[] = [
    { 
      id: 'synthesis', 
      label: 'Synthèse', 
      icon: '📊',
      description: 'Vue consolidée de toutes les activités'
    },
    { 
      id: 'statistics', 
      label: 'Statistiques', 
      icon: '📈',
      description: 'Graphiques et indicateurs de performance'
    },
    { 
      id: 'weekly', 
      label: 'Rapport Hebdo', 
      icon: '📋',
      description: 'Génération du rapport hebdomadaire'
    }
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

  return (
    <div className={`reports-dashboard ${getDeptClass()} fade-in`}>
      {/* Header */}
      <div className="reports-header">
        <div className="reports-header-content">
          <h1 className="reports-title">
            <span className="reports-icon">📊</span>
            Rapports & Analyses
          </h1>
          <p className="reports-subtitle">
            {userProfile.isDirecteur 
              ? 'Vue consolidée de tous les départements'
              : `Données du département ${userProfile.departement}`
            }
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="reports-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`reports-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <div className="tab-content">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="reports-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsDashboard;
