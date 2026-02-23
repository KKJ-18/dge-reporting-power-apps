import React, { useState } from 'react';
import { debugLog } from '../utils/logger';

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
    debugLog(`Exporting report ${reportId} as ${format}`);
    alert(`Export du rapport ${reportId} en ${format.toUpperCase()} lancé !`);
  };

  const handleConsolidatedExport = (format: 'pdf' | 'csv') => {
    // Logique d'export consolidé
    debugLog(`Exporting consolidated report as ${format}`);
    alert(`Export consolidé en ${format.toUpperCase()} lancé !`);
  };

  return (
    <div className="content-section">
      <div className="card-header">
        <h2 className="card-title">📊 Rapports & Visualisation</h2>
        <p className="text-(--dge-dark-gray) mt-2">
          Consultez et exportez les rapports d'activité
        </p>
      </div>

      {/* Filtres */}
      <div className="card mb-8">
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

        <div className="flex gap-4 mt-4">
          <button className="btn btn-primary">🔍 Appliquer les Filtres</button>
          <button className="btn btn-outline">🔄 Réinitialiser</button>
        </div>
      </div>

      {/* Tableau des rapports */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">📋 Liste des Rapports</h3>
          <div className="flex gap-2">
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
                  <div className="flex gap-2">
                    {report.status === 'submitted' && (
                      <>
                        <button 
                          className="btn btn-outline px-2 py-1 text-xs"
                          onClick={() => handleExportReport(report.id, 'pdf')}
                        >
                          📑 PDF
                        </button>
                        <button 
                          className="btn btn-outline px-2 py-1 text-xs"
                          onClick={() => handleExportReport(report.id, 'csv')}
                        >
                          📄 CSV
                        </button>
                      </>
                    )}
                    <button 
                      className="btn btn-primary px-2 py-1 text-xs"
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
      <div className="grid grid-4 mt-8">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-(--dge-red)">📊</div>
            <h4>Total Rapports</h4>
            <p className="text-2xl font-bold text-(--dge-red)">
              {mockReports.length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-green-800">✅</div>
            <h4>Soumis</h4>
            <p className="text-2xl font-bold text-green-800">
              {mockReports.filter(r => r.status === 'submitted').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-orange-500">⏳</div>
            <h4>En Attente</h4>
            <p className="text-2xl font-bold text-orange-500">
              {mockReports.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-(--dge-red)">📈</div>
            <h4>Taux de Complétude</h4>
            <p className="text-2xl font-bold text-(--dge-red)">
              {Math.round((mockReports.filter(r => r.status === 'submitted').length / mockReports.length) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;