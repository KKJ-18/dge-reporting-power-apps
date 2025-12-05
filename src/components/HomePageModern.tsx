import React, { useState, useEffect } from 'react';
import { UserProfile, UserProfileService } from '../services/UserProfileService';
import { getDepartment, DEPARTMENTS_MAP } from '../config/departmentsData';
import DepartmentDashboardAnalyse from './DepartmentDashboardAnalyse';
import DepartmentDashboardDSE from './DepartmentDashboardDSE';
import DepartmentDashboardDPNP from './DepartmentDashboardDPNP';
import './HomePageModern.css';

interface HomePageModernProps {
  onModuleSelect: (moduleId: string) => void;
}

const HomePageModern: React.FC<HomePageModernProps> = ({ onModuleSelect }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const profile = await UserProfileService.getCurrentUserProfile();
      console.log('🏠 HomePageModern - Profil reçu:', profile);
      console.log('🏠 Département du profil:', profile.departement);
      console.log('🏠 Type du département:', typeof profile.departement);
      console.log('🏠 Est Directeur:', profile.isDirecteur);
      setUserProfile(profile);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil');
      console.error('❌ Erreur profil:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Affichage du chargement
  if (loadingProfile) {
    return (
      <div className="homepage-modern">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  // Affichage erreur
  if (error || !userProfile) {
    return (
      <div className="homepage-modern">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p className="error-message">{error || 'Impossible de charger votre profil'}</p>
          <button className="btn btn-primary" onClick={loadUserProfile}>
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Vue Directeur - Accès à tous les départements
  if (userProfile.isDirecteur) {
    return (
      <div className="homepage-modern dept-direction fade-in">
        <div className="director-view">
          <div className="welcome-header">
            <div className="welcome-icon">🌍</div>
            <div className="welcome-content">
              <h1 className="welcome-title">Bienvenue, Directeur</h1>
              <p className="welcome-subtitle">
                Vue globale de la Direction • Accès à tous les départements
              </p>
            </div>
          </div>

          <div className="departments-selection">
            <h2 className="section-title">Sélectionnez un département</h2>
            <div className="departments-grid">
              {Object.values(DEPARTMENTS_MAP).map((dept) => (
                <div
                  key={dept.id}
                  className="department-selector-card"
                  style={{ borderTopColor: dept.color }}
                  onClick={() => onModuleSelect(`department-${dept.id}`)}
                >
                  <div className="dept-card-header">
                    <span className="dept-icon" style={{ backgroundColor: `${dept.color}15` }}>
                      {dept.icon}
                    </span>
                    <div className="dept-info">
                      <h3 className="dept-name">{dept.name}</h3>
                      <p className="dept-full-name">{dept.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="dept-stats">
                    <div className="dept-stat">
                      <span className="dept-stat-value">{dept.categories.length}</span>
                      <span className="dept-stat-label">Catégories</span>
                    </div>
                    <div className="dept-stat">
                      <span className="dept-stat-value">
                        {dept.categories.reduce((sum, cat) => sum + cat.activities.length, 0)}
                      </span>
                      <span className="dept-stat-label">Activités</span>
                    </div>
                  </div>

                  <button className="btn-access-dept" style={{ backgroundColor: dept.color }}>
                    Accéder au département →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-actions">
            <h2 className="section-title">Actions rapides</h2>
            <div className="actions-grid">
              <button className="action-card" onClick={() => onModuleSelect('reports')}>
                <span className="action-icon">📊</span>
                <span className="action-label">Voir tous les rapports</span>
              </button>
              <button className="action-card" onClick={() => onModuleSelect('activities')}>
                <span className="action-icon">📝</span>
                <span className="action-label">Gestion des activités</span>
              </button>
              <button className="action-card" onClick={() => onModuleSelect('categories')}>
                <span className="action-icon">📂</span>
                <span className="action-label">Gestion des catégories</span>
              </button>
              <button className="action-card" onClick={() => onModuleSelect('settings')}>
                <span className="action-icon">⚙️</span>
                <span className="action-label">Paramètres</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vue Chef de département / Agent - Interface spécifique au département
  if (userProfile.departement) {
    const department = getDepartment(userProfile.departement);
    
    // Déterminer la classe de département pour le thème
    const getDeptClass = () => {
      switch (userProfile.departement) {
        case 'DA': return 'dept-da';
        case 'DSE': return 'dept-dse';
        case 'DPNP': return 'dept-dpnp';
        default: return '';
      }
    };
    
    // Sélection du bon dashboard selon le département
    const renderDepartmentDashboard = () => {
      switch (userProfile.departement) {
        case 'DA':
          return (
            <DepartmentDashboardAnalyse 
              department={department} 
              userProfile={userProfile}
            />
          );
        case 'DSE':
          return (
            <DepartmentDashboardDSE 
              department={department} 
              userProfile={userProfile}
            />
          );
        case 'DPNP':
          return (
            <DepartmentDashboardDPNP 
              department={department} 
              userProfile={userProfile}
            />
          );
        default:
          return (
            <DepartmentDashboardAnalyse 
              department={department} 
              userProfile={userProfile}
            />
          );
      }
    };
    
    return (
      <div className={`homepage-modern ${getDeptClass()} fade-in`}>
        {renderDepartmentDashboard()}
      </div>
    );
  }

  // Utilisateur sans département assigné
  return (
    <div className="homepage-modern">
      <div className="error-container">
        <div className="error-icon">🚫</div>
        <h2>Accès non autorisé</h2>
        <p className="error-message">
          Votre compte n'est assigné à aucun département. <br/>
          Veuillez contacter votre administrateur pour obtenir l'accès.
        </p>
        <div className="contact-info">
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Fonction:</strong> {userProfile.fonction || 'Non définie'}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePageModern;
