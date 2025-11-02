import React from 'react';

interface HomePageProps {
  onModuleSelect: (moduleId: string) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
}

interface ModuleInfo {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  frequency: 'Journalière' | 'Hebdomadaire' | 'Mensuelle';
  completionRate: number;
  lastUpdate?: string;
}

const HomePage: React.FC<HomePageProps> = ({ onModuleSelect, selectedPeriod, onPeriodChange }) => {
  const modules: ModuleInfo[] = [
    {
      id: 'credit-classique',
      icon: '💰',
      title: 'Crédit Classique',
      subtitle: 'Dossiers, comités, FAR et notes de circulation',
      frequency: 'Journalière',
      completionRate: 85,
      lastUpdate: '2025-10-28'
    },
    {
      id: 'credit-programme',
      icon: '🎯',
      title: 'Crédit Programme',
      subtitle: 'Entreprises, particuliers et évaluation des délais',
      frequency: 'Journalière',
      completionRate: 60,
      lastUpdate: '2025-10-27'
    },
    {
      id: 'admin-engagements',
      icon: '📊',
      title: 'Administration des Engagements',
      subtitle: 'Amortissables, découvert, restructurés, leasing',
      frequency: 'Journalière',
      completionRate: 40,
      lastUpdate: '2025-10-25'
    },
    {
      id: 'suivi-mep',
      icon: '📈',
      title: 'Suivi Dossiers MEP',
      subtitle: 'Dossiers en cours de mise en place',
      frequency: 'Mensuelle',
      completionRate: 100,
      lastUpdate: '2025-10-01'
    },
    {
      id: 'activites-annexes',
      icon: '📋',
      title: 'Activités Annexes',
      subtitle: 'Visites, formations, procédures et études',
      frequency: 'Hebdomadaire',
      completionRate: 75,
      lastUpdate: '2025-10-26'
    }
  ];

  const getModuleStatus = (rate: number) => {
    if (rate === 100) return 'complete';
    if (rate > 0) return 'partial';
    return 'empty';
  };

  const getStatusText = (rate: number) => {
    if (rate === 100) return '✅ Complet';
    if (rate > 0) return `${rate}% rempli`;
    return '⚪ Vide';
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const globalStats = {
    totalReports: modules.length,
    completed: modules.filter(m => m.completionRate === 100).length,
    inProgress: modules.filter(m => m.completionRate > 0 && m.completionRate < 100).length,
    pending: modules.filter(m => m.completionRate === 0).length,
    averageCompletion: Math.round(modules.reduce((acc, m) => acc + m.completionRate, 0) / modules.length)
  };

  return (
    <div className="animate-fade-in">
      {/* En-tête de la page */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1 className="page-title">🏠 Tableau de Bord DGE</h1>
            <p className="page-subtitle">
              Bienvenue sur votre plateforme de reporting hebdomadaire
            </p>
          </div>
          
          <div className="page-actions">
            <div className="period-selector">
              <span className="period-selector-label">📅 Période :</span>
              <input
                type="week"
                className="period-selector-input"
                value={selectedPeriod || getCurrentWeek()}
                onChange={(e) => onPeriodChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Statistiques globales */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginTop: '1.5rem'
        }}>
          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.1) 0%, rgba(0, 200, 83, 0.05) 100%)',
            borderLeft: '4px solid #00C853'
          }}>
            <div className="stats-card-label">Modules Complets</div>
            <div className="stats-card-value" style={{ color: '#00C853' }}>
              <span>{globalStats.completed}</span>
              <span className="stats-card-unit">/ {globalStats.totalReports}</span>
            </div>
          </div>

          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.1) 0%, rgba(255, 111, 0, 0.05) 100%)',
            borderLeft: '4px solid #FF6F00'
          }}>
            <div className="stats-card-label">En Cours</div>
            <div className="stats-card-value" style={{ color: '#FF6F00' }}>
              {globalStats.inProgress}
            </div>
          </div>

          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, rgba(204, 0, 0, 0.1) 0%, rgba(204, 0, 0, 0.05) 100%)',
            borderLeft: '4px solid #CC0000'
          }}>
            <div className="stats-card-label">À Compléter</div>
            <div className="stats-card-value" style={{ color: '#CC0000' }}>
              {globalStats.pending}
            </div>
          </div>

          <div className="stats-card" style={{
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
            borderLeft: '4px solid #1976D2'
          }}>
            <div className="stats-card-label">Taux Moyen</div>
            <div className="stats-card-value" style={{ color: '#1976D2' }}>
              <span>{globalStats.averageCompletion}</span>
              <span className="stats-card-unit">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides - Navigation fonctionnelle */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn btn-primary btn-lg"
          onClick={() => onModuleSelect('credit-classique')}
        >
          ➕ Nouveau Rapport
        </button>
        <button 
          className="btn btn-secondary btn-lg"
          onClick={() => onModuleSelect('reports')}
        >
          📋 Consulter mes Rapports
        </button>
        <button 
          className="btn btn-outline btn-lg"
          onClick={() => onModuleSelect('settings')}
        >
          📥 Importer des Données
        </button>
      </div>

      {/* Grille des modules */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          marginBottom: '1.5rem',
          color: '#1A1A1A'
        }}>
          📑 Modules de Saisie
        </h2>
        
        <div className="modules-grid">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="module-card animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onModuleSelect(module.id)}
            >
              <div className={`module-status ${getModuleStatus(module.completionRate)}`}>
                {getStatusText(module.completionRate)}
              </div>
              
              <div className="module-card-header">
                <div className="module-icon">{module.icon}</div>
                <div className="module-info">
                  <h3 className="module-title">{module.title}</h3>
                  <p className="module-subtitle">{module.subtitle}</p>
                </div>
              </div>

              <div className="module-stats">
                <div className="module-stat">
                  <span className="module-stat-value">{module.completionRate}%</span>
                  <span className="module-stat-label">Complétude</span>
                </div>
                <div className="module-stat">
                  <span className="module-stat-value">{module.frequency}</span>
                  <span className="module-stat-label">Fréquence</span>
                </div>
              </div>

              {module.lastUpdate && (
                <div style={{ 
                  marginTop: '1rem', 
                  fontSize: '0.75rem', 
                  color: '#757575',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🕒 Dernière mise à jour : {new Date(module.lastUpdate).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Aide et documentation */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        borderLeft: '4px solid #1976D2'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '700', 
          marginBottom: '1rem',
          color: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💡 Aide et Informations
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          color: '#5C5C5C'
        }}>
          <div>
            <strong style={{ color: '#CC0000', display: 'block', marginBottom: '0.5rem' }}>
              📝 Comment ça marche ?
            </strong>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Sélectionnez un module ci-dessus pour commencer la saisie de vos données. 
              Les formulaires s'adaptent à la fréquence de reporting (journalière, hebdomadaire ou mensuelle).
            </p>
          </div>
          <div>
            <strong style={{ color: '#CC0000', display: 'block', marginBottom: '0.5rem' }}>
              ⏰ Sauvegarde Automatique
            </strong>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Vos données sont sauvegardées automatiquement en brouillon. 
              N'oubliez pas de soumettre votre rapport une fois complété !
            </p>
          </div>
          <div>
            <strong style={{ color: '#CC0000', display: 'block', marginBottom: '0.5rem' }}>
              🔒 Validation
            </strong>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Après soumission, votre rapport sera verrouillé et envoyé pour validation hiérarchique. 
              Vous pourrez le consulter en lecture seule.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;