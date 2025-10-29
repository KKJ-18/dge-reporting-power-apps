import React, { useState } from 'react';

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
    console.log(`Sending reminder to user ${userId}`);
    alert('Rappel envoyé avec succès !');
  };

  const handleBulkReminder = () => {
    const pendingUsers = filteredSubmissions.filter(s => s.currentWeekStatus !== 'submitted');
    console.log(`Sending bulk reminder to ${pendingUsers.length} users`);
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
        <p style={{ color: 'var(--dge-dark-gray)', marginTop: '0.5rem' }}>
          Suivez l'état des soumissions et gérez les rappels
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#006400' }}>✅</div>
            <h4>Soumis</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#006400' }}>
              {mockSubmissions.filter(s => s.currentWeekStatus === 'submitted').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#FF8C00' }}>⏳</div>
            <h4>En Attente</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FF8C00' }}>
              {mockSubmissions.filter(s => s.currentWeekStatus === 'pending').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>🚨</div>
            <h4>En Retard</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
              {mockSubmissions.filter(s => s.currentWeekStatus === 'overdue').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: 'var(--dge-red)' }}>📊</div>
            <h4>Taux Global</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--dge-red)' }}>
              {Math.round((mockSubmissions.filter(s => s.currentWeekStatus === 'submitted').length / mockSubmissions.length) * 100)}%
            </p>
          </div>
        </div>
      </div>

      {/* Statistiques par division */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">📈 Taux de Complétude par Division</h3>
        </div>
        
        <div className="grid grid-2">
          {getDivisionStats().map(stat => (
            <div key={stat.division} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>{stat.division}</h4>
                <span style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 'bold', 
                  color: stat.rate >= 80 ? '#006400' : stat.rate >= 50 ? '#FF8C00' : 'var(--dge-red)' 
                }}>
                  {stat.rate}%
                </span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stat.rate}%` }}
                ></div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                <span>✅ {stat.submitted} soumis</span>
                <span>⏳ {stat.pending} en attente</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtres et actions */}
      <div className="card" style={{ marginBottom: '2rem' }}>
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
              />
              Seulement les non-soumis
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                    <small style={{ color: 'var(--dge-dark-gray)' }}>{submission.email}</small>
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
                    <span style={{ color: submission.daysPending > 3 ? 'var(--dge-red)' : '#FF8C00' }}>
                      {submission.daysPending} jour{submission.daysPending > 1 ? 's' : ''}
                    </span>
                  ) : '-'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {submission.currentWeekStatus !== 'submitted' && (
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        onClick={() => handleSendReminder(submission.id)}
                      >
                        📧 Rappel
                      </button>
                    )}
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
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