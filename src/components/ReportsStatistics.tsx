import React, { useState, useEffect } from 'react';
import { ReportsService, type ReportFilters, type CompletionStats, type CategoryStats, type ActivityStats } from '../services/ReportsService';
import { DepartmentActivitiesService } from '../services/DepartmentActivitiesService';
import { UserProfileService, type UserProfile } from '../services/UserProfileService';
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import './ReportsStatistics.css';

interface Department {
  id: string;
  name: string;
  fullName: string;
}

interface Category {
  id: string;
  name: string;
}

interface Activity {
  id: string;
  name: string;
  frequency: string;
}

interface TeamMember {
  email: string;
  name: string;
  submissionsCount: number;
}

const ReportsStatistics: React.FC = () => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  
  // Profil utilisateur
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isDirector, setIsDirector] = useState(false);
  
  // États des filtres
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>(''); // Nouveau filtre utilisateur

  // États des données
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]); // Liste des membres de l'équipe
  
  // États des statistiques
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [overallStats, setOverallStats] = useState<any>(null);
  const [dailyStats, setDailyStats] = useState<CompletionStats[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);

  // Charger le profil utilisateur au montage
  useEffect(() => {
    loadUserProfile();
    loadDepartments();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await UserProfileService.getCurrentUserProfile();
      setUserProfile(profile);
      setIsDirector(profile.isDirecteur);
      
      // Si l'utilisateur a un département, le pré-sélectionner
      if (profile.departement && !profile.isDirecteur) {
        setSelectedDepartment(profile.departement);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  };

  // Charger les catégories quand le département change
  useEffect(() => {
    if (selectedDepartment) {
      loadCategories(selectedDepartment);
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedDepartment]);

  // Charger les membres de l'équipe quand le département change (pour directeur)
  useEffect(() => {
    if (isDirector && selectedDepartment) {
      loadTeamMembers();
    } else {
      setTeamMembers([]);
      setSelectedUser('');
    }
  }, [selectedDepartment, isDirector]);

  // Charger les activités quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      loadActivities(selectedDepartment, selectedCategory);
    } else {
      setActivities([]);
      setSelectedActivity('');
    }
  }, [selectedCategory, selectedDepartment]);

  const loadTeamMembers = async () => {
    if (!selectedDepartment || !userProfile) return;
    
    setLoadingUsers(true);
    try {
      const filters = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        departmentId: selectedDepartment
      };
      
      let users = await ReportsService.getSubmittingUsers(filters);
      
      // Filtrage par rôle
      if (userProfile.isDirecteur) {
        // Directeur : TOUS les utilisateurs (peut voir tous les départements)
        // Si un département est sélectionné, les utilisateurs sont déjà filtrés par le service
        // Pas de filtre supplémentaire nécessaire
      } else if (userProfile.fonction?.toLowerCase().includes('chef')) {
        // Chef de département : TOUS les utilisateurs de son département
        // Vérifier que le département sélectionné est le sien
        if (selectedDepartment !== userProfile.departement) {
          users = []; // Ne peut pas voir d'autres départements
        }
        // Sinon, garder tous les utilisateurs du département (pas de filtre)
      } else {
        // Agent : uniquement ses propres données
        users = users.filter(u => u.email.toLowerCase() === userProfile.email.toLowerCase());
      }
      
      setTeamMembers(users);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      setDepartments(depts.map(d => ({
        id: d.id,
        name: d.name,
        fullName: d.fullName || d.name
      })));
    } catch (error) {
      console.error('Erreur chargement départements:', error);
    }
  };

  const loadCategories = async (departmentId: string) => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      const dept = depts.find(d => d.id === departmentId);
      
      if (dept) {
        // Charger toutes les catégories - le filtrage se fera dans les stats
        setCategories(dept.categories.map(c => ({
          id: c.id,
          name: c.name
        })));
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadActivities = async (departmentId: string, categoryId: string) => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      const dept = depts.find(d => d.id === departmentId);
      if (dept) {
        const cat = dept.categories.find(c => c.id === categoryId);
        if (cat) {
          setActivities(cat.activities.map(a => ({
            id: a.id,
            name: a.name,
            frequency: a.frequency
          })));
        }
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const filters: ReportFilters = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        departmentId: selectedDepartment || undefined,
        categoryId: selectedCategory || undefined,
        activityId: selectedActivity || undefined,
        userId: selectedUser || undefined // Ajouter le filtre utilisateur
      };

      const [overall, daily, category, activity] = await Promise.all([
        ReportsService.getOverallStats(filters),
        ReportsService.getDailyCompletionStats(filters),
        ReportsService.getCategoryStats(filters),
        ReportsService.getActivityStats(filters)
      ]);

      setOverallStats(overall);
      setDailyStats(daily);
      setCategoryStats(category);
      setActivityStats(activity);

      showSuccess('Statistiques chargées', 'Les rapports ont été générés avec succès');
    } catch (error: any) {
      showError('Erreur de chargement', error.message || 'Impossible de charger les statistiques');
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    
    // Si pas directeur, garder le département de l'utilisateur
    if (!isDirector && userProfile?.departement) {
      setSelectedDepartment(userProfile.departement);
    } else {
      setSelectedDepartment('');
    }
    
    setSelectedCategory('');
    setSelectedActivity('');
    setSelectedUser('');
    setCategories([]);
    setActivities([]);
    setTeamMembers([]);
  };

  const getCompletionColor = (rate: number): string => {
    if (rate >= 80) return '#107c10';
    if (rate >= 50) return '#f7630c';
    return '#d83b01';
  };

  return (
    <div className="reports-statistics-container">
      <div className="reports-header">
        <h1>📊 Rapports & Statistiques</h1>
        <p>Analyse du taux de complétude des activités</p>
        <div className="header-info">
          ℹ️ Semaine de travail : Lundi à Vendredi (5 jours ouvrés)
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <h2>🔍 Filtres</h2>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Date début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>

          <div className="filter-group">
            <label>Date fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="filter-group">
            <label>Département</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={!isDirector && !!userProfile?.departement}
            >
              <option value="">Tous les départements</option>
              {departments
                .filter(dept => {
                  // Directeur : voir tous les départements
                  if (isDirector) return true;
                  // Chef ou Utilisateur : uniquement son département
                  return dept.id === userProfile?.departement;
                })
                .map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.fullName}
                  </option>
                ))}
            </select>
            {!isDirector && userProfile?.departement && (
              <small style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                Vous ne pouvez consulter que votre département
              </small>
            )}
          </div>

          <div className="filter-group">
            <label>Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedDepartment}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Activité</label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">Toutes les activités</option>
              {activities.map(act => (
                <option key={act.id} value={act.name}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par utilisateur (visible uniquement pour directeur) */}
          {isDirector && selectedDepartment && (
            <div className="filter-group">
              <label>
                👤 Membre de l'équipe
                {loadingUsers && <span className="filter-loading"> (chargement...)</span>}
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={loadingUsers || !teamMembers.length}
              >
                <option value="">Tous les membres</option>
                {teamMembers.map(member => (
                  <option key={member.email} value={member.email}>
                    {member.name} ({member.submissionsCount} soumissions)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="filters-actions">
          <button
            className="btn btn-primary"
            onClick={loadStatistics}
            disabled={loading}
          >
            {loading ? '⏳ Chargement...' : '📊 Générer le rapport'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={resetFilters}
            disabled={loading}
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      {overallStats && (
        <div className="overview-section">
          <h2>📈 Vue d'ensemble</h2>
          <div className="overview-cards">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-label">Activités suivies</div>
                <div className="stat-value">{overallStats.totalActivities}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Activités complétées</div>
                <div className="stat-value">{overallStats.uniqueActivitiesSubmitted}</div>
                <div className="stat-progress">
                  <div
                    className="stat-progress-bar"
                    style={{
                      width: `${overallStats.activityCompletionRate}%`,
                      backgroundColor: getCompletionColor(overallStats.activityCompletionRate)
                    }}
                  />
                </div>
                <div className="stat-percentage" style={{ color: getCompletionColor(overallStats.activityCompletionRate) }}>
                  {overallStats.activityCompletionRate}%
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📤</div>
              <div className="stat-content">
                <div className="stat-label">Soumissions totales</div>
                <div className="stat-value">{overallStats.totalActualSubmissions}</div>
                <div className="stat-subtitle">sur {overallStats.totalExpectedSubmissions} attendues</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Taux de soumission</div>
                <div className="stat-value">{overallStats.submissionCompletionRate}%</div>
                <div className="stat-progress">
                  <div
                    className="stat-progress-bar"
                    style={{
                      width: `${overallStats.submissionCompletionRate}%`,
                      backgroundColor: getCompletionColor(overallStats.submissionCompletionRate)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-label">Période analysée</div>
                <div className="stat-value">{overallStats.period.days}</div>
                <div className="stat-subtitle">jours</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique complétude par jour */}
      {dailyStats.length > 0 && (
        <div className="chart-section">
          <h2>📅 Taux de complétude quotidien</h2>
          <div className="daily-chart">
            {dailyStats.map((stat, index) => (
              <div key={index} className="daily-bar-container">
                <div className="daily-bar-wrapper">
                  <div
                    className="daily-bar"
                    style={{
                      height: `${stat.completionRate}%`,
                      backgroundColor: getCompletionColor(stat.completionRate)
                    }}
                    title={`${stat.completionRate}% (${stat.completedActivities}/${stat.expectedActivities})`}
                  >
                    <span className="bar-label">{stat.completionRate}%</span>
                  </div>
                </div>
                <div className="daily-date">
                  {new Date(stat.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques par catégorie */}
      {categoryStats.length > 0 && (
        <div className="table-section">
          <h2>📂 Statistiques par catégorie</h2>
          <div className="stats-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Activités</th>
                  <th>Complétées</th>
                  <th>Soumissions</th>
                  <th>Taux de complétude</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map(stat => (
                  <tr key={stat.categoryId}>
                    <td className="category-name">{stat.categoryName}</td>
                    <td>{stat.totalActivities}</td>
                    <td>{stat.completedActivities}</td>
                    <td>{stat.submissions}</td>
                    <td>
                      <span
                        className="completion-badge"
                        style={{ backgroundColor: getCompletionColor(stat.completionRate) }}
                      >
                        {stat.completionRate}%
                      </span>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${stat.completionRate}%`,
                            backgroundColor: getCompletionColor(stat.completionRate)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistiques par activité */}
      {activityStats.length > 0 && (
        <div className="table-section">
          <h2>🎯 Statistiques par activité</h2>
          <div className="stats-table-wrapper">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Activité</th>
                  <th>Fréquence</th>
                  <th>Attendu</th>
                  <th>Réalisé</th>
                  <th>Taux</th>
                  <th>Dernière soumission</th>
                  <th>Progression</th>
                </tr>
              </thead>
              <tbody>
                {activityStats.map(stat => (
                  <tr key={stat.activityId}>
                    <td className="activity-name">{stat.activityName}</td>
                    <td>
                      <span className="frequency-badge">{stat.frequency}</span>
                    </td>
                    <td>{stat.expectedSubmissions}</td>
                    <td>{stat.actualSubmissions}</td>
                    <td>
                      <span
                        className="completion-badge"
                        style={{ backgroundColor: getCompletionColor(stat.completionRate) }}
                      >
                        {stat.completionRate}%
                      </span>
                    </td>
                    <td>
                      {stat.lastSubmission
                        ? new Date(stat.lastSubmission).toLocaleDateString('fr-FR')
                        : 'Aucune'}
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${stat.completionRate}%`,
                            backgroundColor: getCompletionColor(stat.completionRate)
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Message si aucune donnée */}
      {!loading && !overallStats && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Aucune statistique à afficher</h3>
          <p>Sélectionnez une période et cliquez sur "Générer le rapport"</p>
        </div>
      )}

      <NotificationModal
        isOpen={notification.isOpen}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={closeNotification}
      />
    </div>
  );
};

export default ReportsStatistics;
