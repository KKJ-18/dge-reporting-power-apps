import React, { useState, useEffect } from 'react';
import { DEPARTMENTS_MAP } from '../config/departmentsData';
import { UtilisateursService } from '../services/UtilisateursService';
import { UserProfileService } from '../services/UserProfileService';
import UserManagement from './UserManagement';
import './DirectorDashboard.css';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  fonction: string;
  departement: 'DA' | 'DSE' | 'DPNP' | null;
  activitiesCount: number;
  lastReport: string | null;
  status: 'active' | 'pending' | 'inactive';
}

const DirectorDashboard: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<'DA' | 'DSE' | 'DPNP' | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Chargement des données de l\'équipe...');
      
      // 1. Récupérer le profil du directeur connecté
      const currentProfile = await UserProfileService.getCurrentUserProfile();
      console.log('👔 Profil directeur:', currentProfile);
      
      // 2. Récupérer tous les utilisateurs depuis SharePoint
      const utilisateursResult = await UtilisateursService.getAll();
      console.log('📋 Résultat utilisateurs:', utilisateursResult);
      
      const allUsers = utilisateursResult?.data || utilisateursResult?.value || [];
      console.log('👥 Nombre total d\'utilisateurs:', allUsers.length);
      
      // 3. Filtrer pour exclure le directeur lui-même et transformer en TeamMember
      const team: TeamMember[] = allUsers
        .filter((user: any) => {
          // Exclure l'utilisateur actuel (directeur)
          const isSelf = user.Email?.toLowerCase() === currentProfile.email.toLowerCase();
          if (isSelf) {
            console.log('⏭️ Exclusion du directeur:', user.Email);
          }
          return !isSelf;
        })
        .map((user: any) => {
          // Extraire le département depuis l'objet SharePoint Choice
          let dept: 'DA' | 'DSE' | 'DPNP' | null = null;
          if (user.Departement?.Value) {
            const deptValue = user.Departement.Value.toUpperCase();
            if (deptValue === 'DA' || deptValue === 'DSE' || deptValue === 'DPNP') {
              dept = deptValue as 'DA' | 'DSE' | 'DPNP';
            }
          }
          
          // TODO: Récupérer le nombre d'activités et la date du dernier rapport depuis SharePoint
          // Pour l'instant, valeurs par défaut
          const activitiesCount = 0;
          const lastReport = null;
          const status: 'active' | 'pending' | 'inactive' = 'pending';
          
          return {
            id: user.ID?.toString() || user.ItemInternalId?.toString() || '',
            name: user.Title || user.Email || 'Utilisateur',
            email: user.Email || '',
            fonction: user.Fonction || 'Non définie',
            departement: dept,
            activitiesCount,
            lastReport,
            status
          };
        })
        .filter((member: TeamMember) => member.departement !== null); // Exclure ceux sans département
      
      console.log('✅ Membres de l\'équipe chargés:', team.length);
      setTeamMembers(team);
    } catch (error) {
      console.error('❌ Erreur chargement équipe:', error);
      setError(error instanceof Error ? error.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = selectedDepartment === 'ALL'
    ? teamMembers
    : teamMembers.filter(m => m.departement === selectedDepartment);

  const stats = {
    total: teamMembers.length,
    active: teamMembers.filter(m => m.status === 'active').length,
    pending: teamMembers.filter(m => m.status === 'pending').length,
    totalActivities: teamMembers.reduce((sum, m) => sum + m.activitiesCount, 0)
  };

  if (loading) {
    return (
      <div className="director-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des données de l'équipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="director-dashboard">
        <div className="error-container">
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button 
            className="btn btn-primary"
            onClick={loadTeamData}
          >
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0) {
    return (
      <div className="director-dashboard">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">👔 Pilotage Directeur</h1>
            <p className="dashboard-subtitle">Vue d'ensemble de l'activité de vos équipes</p>
          </div>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '12px',
          marginTop: '2rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h2>Aucun membre d'équipe</h2>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Aucun utilisateur avec département assigné trouvé dans la table Utilisateurs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="director-dashboard">
      {/* Modal de gestion des utilisateurs */}
      {showUserManagement && (
        <UserManagement onClose={() => {
          setShowUserManagement(false);
          loadTeamData(); // Recharger les données après fermeture
        }} />
      )}

      {/* En-tête */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">👔 Pilotage Directeur</h1>
            <p className="dashboard-subtitle">Vue d'ensemble de l'activité de vos équipes</p>
          </div>
          <button 
            className="btn-manage-users"
            onClick={() => setShowUserManagement(true)}
            title="Gérer les utilisateurs"
          >
            👥 Gérer les Utilisateurs
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Collaborateurs</div>
          </div>
        </div>
        
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Actifs cette semaine</div>
          </div>
        </div>
        
        <div className="stat-card stat-warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">En attente de rapport</div>
          </div>
        </div>
        
        <div className="stat-card stat-info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalActivities}</div>
            <div className="stat-label">Activités totales</div>
          </div>
        </div>
      </div>

      {/* Filtres par département */}
      <div className="department-filters">
        <button
          className={`dept-filter-btn ${selectedDepartment === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedDepartment('ALL')}
        >
          🌍 Tous les départements
        </button>
        {Object.values(DEPARTMENTS_MAP).map((dept) => (
          <button
            key={dept.id}
            className={`dept-filter-btn ${selectedDepartment === dept.id ? 'active' : ''}`}
            style={{
              borderLeftColor: selectedDepartment === dept.id ? dept.color : 'transparent'
            }}
            onClick={() => setSelectedDepartment(dept.id)}
          >
            {dept.icon} {dept.name}
          </button>
        ))}
      </div>

      {/* Liste des membres de l'équipe */}
      <div className="team-list">
        <h2 className="section-title">
          Membres de l'équipe 
          <span style={{ 
            marginLeft: '1rem', 
            fontSize: '0.875rem', 
            fontWeight: 'normal', 
            color: '#666' 
          }}>
            ({filteredMembers.length} membre{filteredMembers.length > 1 ? 's' : ''})
          </span>
        </h2>
        
        {filteredMembers.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 2rem',
            background: 'white',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ color: '#666' }}>
              Aucun membre trouvé pour ce département
            </p>
          </div>
        ) : (
          <div className="team-grid">
          {filteredMembers.map((member) => {
            // member.departement ne peut pas être null ici car on a filtré dans loadTeamData
            if (!member.departement) return null;
            
            const dept = DEPARTMENTS_MAP[member.departement];
            return (
              <div
                key={member.id}
                className={`team-member-card status-${member.status}`}
                style={{ borderTopColor: dept.color }}
              >
                <div className="member-header">
                  <div className="member-avatar">
                    {member.name.charAt(0)}
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">{member.name}</h3>
                    <p className="member-fonction">{member.fonction}</p>
                  </div>
                  <div className="member-status">
                    {member.status === 'active' && <span className="status-badge status-active">✅ Actif</span>}
                    {member.status === 'pending' && <span className="status-badge status-pending">⏳ En attente</span>}
                    {member.status === 'inactive' && <span className="status-badge status-inactive">❌ Inactif</span>}
                  </div>
                </div>

                <div className="member-details">
                  <div className="detail-row">
                    <span className="detail-icon">{dept.icon}</span>
                    <span className="detail-text">{dept.fullName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📧</span>
                    <span className="detail-text">{member.email}</span>
                  </div>
                </div>

                <div className="member-stats">
                  <div className="member-stat">
                    <span className="stat-value">{member.activitiesCount}</span>
                    <span className="stat-label">Activités</span>
                  </div>
                  <div className="member-stat">
                    <span className="stat-value">
                      {member.lastReport ? new Date(member.lastReport).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                    <span className="stat-label">Dernier rapport</span>
                  </div>
                </div>

                <div className="member-actions">
                  <button className="btn-action btn-primary">
                    📊 Voir les rapports
                  </button>
                  <button className="btn-action btn-secondary">
                    📧 Contacter
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
};

export default DirectorDashboard;
