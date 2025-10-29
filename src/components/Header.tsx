import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'saisie', label: 'Saisie Hebdomadaire', icon: '📝' },
    { id: 'rapports', label: 'Rapports & Visualisation', icon: '📊' },
    { id: 'suivi', label: 'Suivi des Soumissions', icon: '📋' },
    { id: 'consolidation', label: 'Consolidation', icon: '📈' },
    { id: 'sharepoint', label: 'Config SharePoint', icon: '📁' }
  ];

  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <h1 className="app-title">📈 Plateforme de Reporting DGE</h1>
          <p className="app-subtitle">Système de reporting hebdomadaire des activités</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem' }}>
            👤 {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      <nav className="nav-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;