import React, { useState } from 'react';

interface ReportsViewProps {
  // Props pour les données futures depuis SharePoint
}

interface Report {
  id: string;
  user: string;
  week: string;
  submissionDate: string;
  status: 'submitted' | 'draft' | 'pending';
}

const ReportsView: React.FC<ReportsViewProps> = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-week');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  // Données d'exemple - seront remplacées par les données SharePoint
  const mockReports: Report[] = [
    { id: '1', user: 'Marie Dubois', week: '2025-W43', submissionDate: '2025-10-25', status: 'submitted' },
    { id: '2', user: 'Jean Martin', week: '2025-W43', submissionDate: '2025-10-24', status: 'submitted' },
    { id: '3', user: 'Sophie Bernard', week: '2025-W43', submissionDate: '', status: 'pending' },
    { id: '4', user: 'Pierre Durand', week: '2025-W43', submissionDate: '2025-10-23', status: 'submitted' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return '✅';
      case 'draft': return '📝';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Soumis';
      case 'draft': return 'Brouillon';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const handleExportReport = (reportId: string, format: 'pdf' | 'csv') => {
    // Logique d'export qui sera connectée à Power Automate
    console.log(`Exporting report ${reportId} as ${format}`);
    alert(`Export du rapport ${reportId} en ${format.toUpperCase()} lancé !`);
  };

  const handleConsolidatedExport = (format: 'pdf' | 'csv') => {
    // Logique d'export consolidé
    console.log(`Exporting consolidated report as ${format}`);
    alert(`Export consolidé en ${format.toUpperCase()} lancé !`);
  };

  return (
    <div className="content-section">
      <div className="card-header">
        <h2 className="card-title">📊 Rapports & Visualisation</h2>
        <p style={{ color: 'var(--dge-dark-gray)', marginTop: '0.5rem' }}>
          Consultez et exportez les rapports d'activité
        </p>
      </div>

      {/* Filtres */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">🔍 Filtres de Recherche</h3>
        </div>
        
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">📅 Période</label>
            <select 
              className="form-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="current-week">Semaine actuelle</option>
              <option value="last-week">Semaine dernière</option>
              <option value="current-month">Mois actuel</option>
              <option value="last-month">Mois dernier</option>
              <option value="quarter">Trimestre actuel</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">🏢 Division</label>
            <select 
              className="form-select"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">Toutes les divisions</option>
              <option value="credits">Division Crédits</option>
              <option value="recouvrement">Division Recouvrement</option>
              <option value="risques">Division Risques</option>
              <option value="operations">Division Opérations</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">👤 Utilisateur</label>
            <select 
              className="form-select"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">Tous les utilisateurs</option>
              <option value="marie">Marie Dubois</option>
              <option value="jean">Jean Martin</option>
              <option value="sophie">Sophie Bernard</option>
              <option value="pierre">Pierre Durand</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="btn btn-primary">🔍 Appliquer les Filtres</button>
          <button className="btn btn-outline">🔄 Réinitialiser</button>
        </div>
      </div>

      {/* Tableau des rapports */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="card-title">📋 Liste des Rapports</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline"
              onClick={() => handleConsolidatedExport('csv')}
            >
              📄 Export CSV
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => handleConsolidatedExport('pdf')}
            >
              📑 Export PDF
            </button>
          </div>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>👤 Utilisateur</th>
              <th>📅 Semaine</th>
              <th>📤 Date de Soumission</th>
              <th>⚡ Statut</th>
              <th>🔧 Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockReports.map(report => (
              <tr key={report.id}>
                <td>{report.user}</td>
                <td>{report.week}</td>
                <td>{report.submissionDate || '-'}</td>
                <td>
                  <span className={`status-indicator status-${report.status === 'submitted' ? 'submitted' : report.status === 'pending' ? 'missing' : 'pending'}`}>
                    {getStatusIcon(report.status)} {getStatusLabel(report.status)}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {report.status === 'submitted' && (
                      <>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleExportReport(report.id, 'pdf')}
                        >
                          📑 PDF
                        </button>
                        <button 
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleExportReport(report.id, 'csv')}
                        >
                          📄 CSV
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      👁️ Voir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-4" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>📊</div>
            <h4>Total Rapports</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
              {mockReports.length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#006400' }}>✅</div>
            <h4>Soumis</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#006400' }}>
              {mockReports.filter(r => r.status === 'submitted').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#FF8C00' }}>⏳</div>
            <h4>En Attente</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C00' }}>
              {mockReports.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>📈</div>
            <h4>Taux de Complétude</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
              {Math.round((mockReports.filter(r => r.status === 'submitted').length / mockReports.length) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;