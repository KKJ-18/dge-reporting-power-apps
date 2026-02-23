import React, { useState } from 'react';
import { debugLog } from '../utils/logger';

interface SubmissionTrackingProps {
  // Future props pour les données SharePoint
}

interface UserSubmission {
  id: string;
  userName: string;
  division: string;
  email: string;
  currentWeekStatus: 'submitted' | 'pending' | 'overdue';
  submissionDate?: string;
  daysPending?: number;
  lastSubmissionWeek?: string;
}

const SubmissionTracking: React.FC<SubmissionTrackingProps> = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  // Données d'exemple - seront remplacées par SharePoint
  const mockSubmissions: UserSubmission[] = [
    {
      id: '1',
      userName: 'Marie Dubois',
      division: 'Crédits',
      email: 'marie.dubois@dge.gov',
      currentWeekStatus: 'submitted',
      submissionDate: '2025-10-25T14:30:00',
      lastSubmissionWeek: '2025-W43'
    },
    {
      id: '2',
      userName: 'Jean Martin',
      division: 'Recouvrement',
      email: 'jean.martin@dge.gov',
      currentWeekStatus: 'submitted',
      submissionDate: '2025-10-24T16:45:00',
      lastSubmissionWeek: '2025-W43'
    },
    {
      id: '3',
      userName: 'Sophie Bernard',
      division: 'Risques',
      email: 'sophie.bernard@dge.gov',
      currentWeekStatus: 'pending',
      daysPending: 2,
      lastSubmissionWeek: '2025-W42'
    },
    {
      id: '4',
      userName: 'Pierre Durand',
      division: 'Opérations',
      email: 'pierre.durand@dge.gov',
      currentWeekStatus: 'overdue',
      daysPending: 5,
      lastSubmissionWeek: '2025-W41'
    },
    {
      id: '5',
      userName: 'Claire Moreau',
      division: 'Crédits',
      email: 'claire.moreau@dge.gov',
      currentWeekStatus: 'submitted',
      submissionDate: '2025-10-26T09:15:00',
      lastSubmissionWeek: '2025-W43'
    },
    {
      id: '6',
      userName: 'Paul Leroy',
      division: 'Recouvrement',
      email: 'paul.leroy@dge.gov',
      currentWeekStatus: 'pending',
      daysPending: 1,
      lastSubmissionWeek: '2025-W42'
    }
  ];

  const filteredSubmissions = mockSubmissions.filter(submission => {
    if (selectedDivision !== 'all' && submission.division !== selectedDivision) return false;
    if (showOnlyPending && submission.currentWeekStatus === 'submitted') return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return '✅';
      case 'pending': return '⏳';
      case 'overdue': return '🚨';
      default: return '❓';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted': return 'Soumis';
      case 'pending': return 'En attente';
      case 'overdue': return 'En retard';
      default: return 'Inconnu';
    }
  };

  const getDivisionStats = () => {
    const divisions = ['Crédits', 'Recouvrement', 'Risques', 'Opérations'];
    return divisions.map(division => {
      const divisionUsers = mockSubmissions.filter(s => s.division === division);
      const submitted = divisionUsers.filter(s => s.currentWeekStatus === 'submitted').length;
      const total = divisionUsers.length;
      const rate = total > 0 ? Math.round((submitted / total) * 100) : 0;
      
      return {
        division,
        submitted,
        total,
        rate,
        pending: total - submitted
      };
    });
  };

  const handleSendReminder = (userId: string) => {
    // Logique pour envoyer un rappel via Power Automate
    debugLog(`Sending reminder to user ${userId}`);
    alert('Rappel envoyé avec succès !');
  };

  const handleBulkReminder = () => {
    const pendingUsers = filteredSubmissions.filter(s => s.currentWeekStatus !== 'submitted');
    debugLog(`Sending bulk reminder to ${pendingUsers.length} users`);
    alert(`Rappel collectif envoyé à ${pendingUsers.length} utilisateurs !`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="content-section">
      <div className="card-header">
        <h2 className="card-title">📋 Suivi des Soumissions</h2>
        <p className="text-(--dge-dark-gray) mt-2">
          Suivez l'état des soumissions et gérez les rappels
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-4 mb-8">
        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-green-800">✅</div>
            <h4>Soumis</h4>
            <p className="text-2xl font-bold text-green-800">
              {mockSubmissions.filter(s => s.currentWeekStatus === 'submitted').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-orange-500">⏳</div>
            <h4>En Attente</h4>
            <p className="text-2xl font-bold text-orange-500">
              {mockSubmissions.filter(s => s.currentWeekStatus === 'pending').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-(--dge-red)">🚨</div>
            <h4>En Retard</h4>
            <p className="text-2xl font-bold text-(--dge-red)">
              {mockSubmissions.filter(s => s.currentWeekStatus === 'overdue').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center">
            <div className="text-3xl text-(--dge-red)">📊</div>
            <h4>Taux Global</h4>
            <p className="text-2xl font-bold text-(--dge-red)">
              {Math.round((mockSubmissions.filter(s => s.currentWeekStatus === 'submitted').length / mockSubmissions.length) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques par division */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="card-title">📈 Taux de Complétude par Division</h3>
        </div>
        
        <div className="grid grid-2">
          {getDivisionStats().map(stat => (
            <div key={stat.division} className="card">
              <div className="flex justify-between items-center mb-4">
                <h4 className="m-0">{stat.division}</h4>
                <span className={`text-xl font-bold ${stat.rate >= 80 ? 'text-green-800' : stat.rate >= 50 ? 'text-orange-500' : 'text-(--dge-red)'}`}>
                  {stat.rate}%
                </span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stat.rate}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-2 text-sm">
                <span>✅ {stat.submitted} soumis</span>
                <span>⏳ {stat.pending} en attente</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="card mb-8">
        <div className="card-header">
          <h3 className="card-title">🔍 Filtres et Actions</h3>
        </div>
        
        <div className="grid grid-3">
          <div className="form-group">
            <label className="form-label">📅 Semaine</label>
            <input
              type="week"
              className="form-input"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">🏢 Division</label>
            <select 
              className="form-select"
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              <option value="all">Toutes les divisions</option>
              <option value="Crédits">Division Crédits</option>
              <option value="Recouvrement">Division Recouvrement</option>
              <option value="Risques">Division Risques</option>
              <option value="Opérations">Division Opérations</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">📋 Affichage</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
              />
              Seulement les non-soumis
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button 
            className="btn btn-primary"
            onClick={handleBulkReminder}
            disabled={filteredSubmissions.filter(s => s.currentWeekStatus !== 'submitted').length === 0}
          >
            📧 Rappel Collectif ({filteredSubmissions.filter(s => s.currentWeekStatus !== 'submitted').length})
          </button>
          <button className="btn btn-outline">
            📊 Exporter le Suivi
          </button>
        </div>
      </div>

      {/* Liste détaillée des utilisateurs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">👥 Liste des Utilisateurs</h3>
        </div>
        
        <table className="table">
          <thead>
            <tr>
              <th>👤 Utilisateur</th>
              <th>🏢 Division</th>
              <th>⚡ Statut</th>
              <th>📅 Date de Soumission</th>
              <th>⏰ Retard</th>
              <th>🔧 Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map(submission => (
              <tr key={submission.id}>
                <td>
                  <div>
                    <strong>{submission.userName}</strong>
                    <br />
                    <small className="text-(--dge-dark-gray)">{submission.email}</small>
                  </div>
                </td>
                <td>{submission.division}</td>
                <td>
                  <span className={`status-indicator status-${
                    submission.currentWeekStatus === 'submitted' ? 'submitted' : 
                    submission.currentWeekStatus === 'overdue' ? 'missing' : 'pending'
                  }`}>
                    {getStatusIcon(submission.currentWeekStatus)} {getStatusLabel(submission.currentWeekStatus)}
                  </span>
                </td>
                <td>
                  {submission.submissionDate ? formatDate(submission.submissionDate) : '-'}
                </td>
                <td>
                  {submission.daysPending ? (
                    <span className={submission.daysPending > 3 ? 'text-(--dge-red)' : 'text-orange-500'}>
                      {submission.daysPending} jour{submission.daysPending > 1 ? 's' : ''}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <div className="flex gap-2">
                    {submission.currentWeekStatus !== 'submitted' && (
                      <button 
                        className="btn btn-outline px-2 py-1 text-xs"
                        onClick={() => handleSendReminder(submission.id)}
                      >
                        📧 Rappel
                      </button>
                    )}
                    <button 
                      className="btn btn-primary px-2 py-1 text-xs"
                    >
                      👁️ Historique
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubmissionTracking;