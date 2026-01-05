import React, { useState, useEffect } from 'react';
import { 
  ActivitySynthesisService, 
  type ActivityRecord, 
  type SynthesisFilters,
  type PaginationOptions,
  type PaginatedResults,
  type UserActivitySummary,
  type DepartmentSummary
} from '../services/ActivitySynthesisService';
import { UserProfileService, type UserProfile } from '../services/UserProfileService';
import { DepartmentActivitiesService } from '../services/DepartmentActivitiesService';
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import { 
  getActivityFields, 
  extractUserFields, 
  formatFieldValue
} from '../utils/activityFieldsConfig';
import './ActivitySynthesisView.css';

type ViewMode = 'detailed' | 'user-summary' | 'department-summary';

const ActivitySynthesisView: React.FC = () => {
  const { notification, showSuccess, showError, showWarning, closeNotification } = useNotification();

  // Profil utilisateur
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtres
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  // Données
  const [allRecords, setAllRecords] = useState<ActivityRecord[]>([]);
  const [paginatedResults, setPaginatedResults] = useState<PaginatedResults<ActivityRecord> | null>(null);
  const [userSummaries, setUserSummaries] = useState<UserActivitySummary[]>([]);
  const [departmentSummaries, setDepartmentSummaries] = useState<DepartmentSummary[]>([]);

  // UI
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<'date' | 'activity' | 'user' | 'department'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Modal de détails
  const [selectedRecord, setSelectedRecord] = useState<ActivityRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Options
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<Array<{ email: string; name: string }>>([]);

  // Charger le profil au montage
  useEffect(() => {
    loadUserProfile();
    loadDepartments();
  }, []);

  // Charger les catégories quand le département change
  useEffect(() => {
    if (selectedDepartment) {
      loadCategories(selectedDepartment);
    } else {
      setCategories([]);
      setSelectedCategory('');
    }
  }, [selectedDepartment]);

  // Charger les activités quand la catégorie change
  useEffect(() => {
    if (selectedDepartment && selectedCategory) {
      loadActivities(selectedDepartment, selectedCategory);
    } else {
      setActivities([]);
      setSelectedActivity('');
    }
  }, [selectedDepartment, selectedCategory]);

  // Charger les membres de l'équipe
  useEffect(() => {
    const isChef = userProfile?.fonction?.toLowerCase().includes('chef');
    if ((userProfile?.isDirecteur || isChef) && selectedDepartment) {
      loadTeamMembers();
    }
  }, [userProfile, selectedDepartment]);

  // Recalculer la pagination quand les paramètres changent
  useEffect(() => {
    if (allRecords.length > 0) {
      updatePagination();
    }
  }, [allRecords, currentPage, pageSize, sortBy, sortOrder]);

  const loadUserProfile = async () => {
    try {
      const profile = await UserProfileService.getCurrentUserProfile();
      setUserProfile(profile);

      // Pré-sélectionner le département pour les non-directeurs
      if (!profile.isDirecteur && profile.departement) {
        setSelectedDepartment(profile.departement);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      showError('Erreur', 'Impossible de charger votre profil');
    }
  };

  const loadDepartments = async () => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      setDepartments(depts.map(d => ({
        id: d.id,
        name: d.fullName || d.name
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
        const catNames = dept.categories.map(c => c.name);
        setCategories(catNames);
      }
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadActivities = async (departmentId: string, categoryName: string) => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      const dept = depts.find(d => d.id === departmentId);
      
      if (dept) {
        const cat = dept.categories.find(c => c.name === categoryName);
        if (cat) {
          const actNames = cat.activities.map(a => a.name);
          setActivities(actNames);
        }
      }
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const loadTeamMembers = async () => {
    if (!selectedDepartment) return;

    try {
      const users = await ActivitySynthesisService.getDepartmentUsers(selectedDepartment);
      setTeamMembers(users);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const loadData = async () => {
    if (!userProfile) {
      showWarning('Profil manquant', 'Veuillez rafraîchir la page');
      return;
    }

    setIsLoading(true);
    setCurrentPage(1); // Reset à la page 1

    try {
      const filters: SynthesisFilters = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        departmentId: selectedDepartment || undefined,
        categoryId: selectedCategory || undefined,
        activityName: selectedActivity || undefined,
        userEmail: selectedUser || undefined,
        searchText: searchText.trim() || undefined
      };

      console.log('🔍 Chargement avec filtres:', filters);

      const records = await ActivitySynthesisService.getAllActivities(filters, userProfile);
      
      setAllRecords(records);

      // Générer les résumés
      const userSums = ActivitySynthesisService.generateUserSummaries(records);
      const deptSums = ActivitySynthesisService.generateDepartmentSummaries(records);
      
      setUserSummaries(userSums);
      setDepartmentSummaries(deptSums);

      showSuccess('Données chargées', `${records.length} activité(s) trouvée(s)`);

      // Appliquer la pagination
      updatePagination();

    } catch (error: any) {
      console.error('Erreur chargement données:', error);
      showError('Erreur', error.message || 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePagination = () => {
    if (allRecords.length === 0) {
      setPaginatedResults(null);
      return;
    }

    const options: PaginationOptions = {
      page: currentPage,
      pageSize,
      sortBy,
      sortOrder
    };

    const paginated = ActivitySynthesisService.paginateResults(allRecords, options);
    setPaginatedResults(paginated);
  };

  const resetFilters = () => {
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    
    if (!userProfile?.isDirecteur && userProfile?.departement) {
      setSelectedDepartment(userProfile.departement);
    } else {
      setSelectedDepartment('');
    }
    
    setSelectedCategory('');
    setSelectedActivity('');
    setSelectedUser('');
    setSearchText('');
    setAllRecords([]);
    setPaginatedResults(null);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (allRecords.length === 0) {
      showWarning('Aucune donnée', 'Veuillez d\'abord charger des données');
      return;
    }

    try {
      const csv = ActivitySynthesisService.exportToCSV(allRecords);
      const filename = `synthese_activites_${startDate}_${endDate}.csv`;
      ActivitySynthesisService.downloadCSV(csv, filename);
      showSuccess('Export réussi', `Fichier ${filename} téléchargé`);
    } catch (error) {
      showError('Erreur d\'export', 'Impossible de générer le fichier CSV');
    }
  };

  const handleExportUserSummary = () => {
    if (userSummaries.length === 0) {
      showWarning('Aucune donnée', 'Veuillez d\'abord charger des données');
      return;
    }

    try {
      const csv = ActivitySynthesisService.exportUserSummariesToCSV(userSummaries);
      const filename = `synthese_utilisateurs_${startDate}_${endDate}.csv`;
      ActivitySynthesisService.downloadCSV(csv, filename);
      showSuccess('Export réussi', `Fichier ${filename} téléchargé`);
    } catch (error) {
      showError('Erreur d\'export', 'Impossible de générer le fichier CSV');
    }
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const renderPagination = () => {
    if (!paginatedResults || paginatedResults.totalPages <= 1) return null;

    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(paginatedResults.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Page {currentPage} sur {paginatedResults.totalPages} 
          ({paginatedResults.totalRecords} résultat(s))
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            «
          </button>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {start > 1 && (
            <>
              <button className="pagination-btn" onClick={() => setCurrentPage(1)}>
                1
              </button>
              {start > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {pages.map(page => (
            <button
              key={page}
              className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          {end < paginatedResults.totalPages && (
            <>
              {end < paginatedResults.totalPages - 1 && <span className="pagination-ellipsis">...</span>}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(paginatedResults.totalPages)}
              >
                {paginatedResults.totalPages}
              </button>
            </>
          )}

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === paginatedResults.totalPages}
          >
            ›
          </button>

          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(paginatedResults.totalPages)}
            disabled={currentPage === paginatedResults.totalPages}
          >
            »
          </button>
        </div>

        <div className="page-size-selector">
          <label>Lignes par page:</label>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    if (!paginatedResults || paginatedResults.data.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Aucune donnée à afficher</h3>
          <p>Cliquez sur "Charger les données" pour commencer</p>
        </div>
      );
    }

    return (
      <>
        <div className="table-wrapper">
          <table className="synthesis-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>
                  📅 Date {renderSortIcon('date')}
                </th>
                <th onClick={() => handleSort('activity')} style={{ cursor: 'pointer' }}>
                  🎯 Activité {renderSortIcon('activity')}
                </th>
                <th>📂 Catégorie</th>
                <th onClick={() => handleSort('user')} style={{ cursor: 'pointer' }}>
                  👤 Utilisateur {renderSortIcon('user')}
                </th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.data.map((record, index) => (
                <tr key={`${record.id}-${index}`}>
                  <td>
                    <div className="date-cell">
                      <div className="date-main">{record.createdDate.toLocaleDateString('fr-FR')}</div>
                      <small className="date-time">{record.createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</small>
                    </div>
                  </td>
                  <td className="activity-cell">
                    <strong>{record.activityName}</strong>
                  </td>
                  <td>
                    <span className="badge badge-category">{record.categoryName}</span>
                  </td>
                  <td>
                    <div className="user-cell">
                      <strong>{record.authorName}</strong>
                    </div>
                  </td>
                  <td className="text-center">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailsModal(true);
                      }}
                      title="Voir les détails"
                    >
                      🔍 Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </>
    );
  };

  const renderUserSummaryView = () => {
    if (userSummaries.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>Aucun résumé utilisateur</h3>
          <p>Chargez des données pour voir les résumés par utilisateur</p>
        </div>
      );
    }

    return (
      <div className="summary-view">
        <div className="summary-header">
          <h3>📊 Résumé par Utilisateur ({userSummaries.length} utilisateur(s))</h3>
          <button className="btn btn-outline" onClick={handleExportUserSummary}>
            📥 Exporter CSV
          </button>
        </div>

        <div className="summary-grid">
          {userSummaries.map((summary, index) => (
            <div key={index} className="summary-card">
              <div className="summary-card-header">
                <h4>👤 {summary.userName}</h4>
                <span className="summary-badge">{summary.totalActivities} activités</span>
              </div>

              <div className="summary-card-body">
                <div className="summary-info">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{summary.userEmail}</span>
                </div>

                <div className="summary-info">
                  <span className="info-label">Département:</span>
                  <span className="info-value">{summary.department}</span>
                </div>

                <div className="summary-info">
                  <span className="info-label">Jours actifs:</span>
                  <span className="info-value">{summary.submissionDates.length} jours</span>
                </div>

                <div className="summary-info">
                  <span className="info-label">Dernière soumission:</span>
                  <span className="info-value">
                    {summary.lastSubmission ? summary.lastSubmission.toLocaleDateString('fr-FR') : 'N/A'}
                  </span>
                </div>

                <div className="summary-categories">
                  <strong>Catégories:</strong>
                  {Object.entries(summary.activitiesByCategory).map(([cat, count]) => (
                    <div key={cat} className="category-stat">
                      <span>{cat}:</span>
                      <span className="category-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDepartmentSummaryView = () => {
    if (departmentSummaries.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>Aucun résumé département</h3>
          <p>Chargez des données pour voir les résumés par département</p>
        </div>
      );
    }

    return (
      <div className="summary-view">
        <div className="summary-header">
          <h3>🏢 Résumé par Département ({departmentSummaries.length} département(s))</h3>
        </div>

        <div className="department-summaries">
          {departmentSummaries.map((deptSummary, index) => (
            <div key={index} className="department-summary-card">
              <div className="department-summary-header">
                <h4>🏢 {deptSummary.departmentName}</h4>
                <div className="department-stats">
                  <span className="stat-item">
                    <strong>{deptSummary.totalUsers}</strong> utilisateur(s)
                  </span>
                  <span className="stat-item">
                    <strong>{deptSummary.totalActivities}</strong> activité(s)
                  </span>
                </div>
              </div>

              <div className="department-users">
                <h5>Utilisateurs:</h5>
                <div className="users-list">
                  {deptSummary.activitiesByUser.map((user, userIndex) => (
                    <div key={userIndex} className="user-item">
                      <div className="user-info">
                        <strong>{user.userName}</strong>
                        <small>{user.userEmail}</small>
                      </div>
                      <div className="user-activities">
                        {user.totalActivities} activité(s)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="activity-synthesis-container">
      <div className="synthesis-header">
        <h1>📊 Synthèse des Activités</h1>
        <p>Vue complète des activités soumises par tous les utilisateurs</p>
        
        {userProfile && (
          <div className="user-role-badge">
            {userProfile.isDirecteur ? '👔 Directeur - Vue globale' : 
             userProfile.fonction?.toLowerCase().includes('chef') ? '🏢 Chef de département' :
             '👤 Agent'}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="filters-section">
        <h2>🔍 Filtres</h2>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>📅 Date début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>

          <div className="filter-group">
            <label>📅 Date fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="filter-group">
            <label>🏢 Département</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              disabled={!userProfile?.isDirecteur && !!userProfile?.departement}
            >
              <option value="">Tous</option>
              {departments
                .filter(dept => {
                  if (userProfile?.isDirecteur) return true;
                  return dept.id === userProfile?.departement;
                })
                .map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>📂 Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!selectedDepartment}
            >
              <option value="">Toutes</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>🎯 Activité</label>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">Toutes</option>
              {activities.map(act => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>

          {(userProfile?.isDirecteur || userProfile?.fonction?.toLowerCase().includes('chef')) && (
            <div className="filter-group">
              <label>👤 Agent</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Tous les agents</option>
                {teamMembers.map(member => (
                  <option key={member.email} value={member.email}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="filter-group filter-search">
            <label>🔎 Recherche</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Rechercher dans les données..."
            />
          </div>
        </div>

        <div className="filters-actions">
          <button
            className="btn btn-primary"
            onClick={loadData}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Chargement...' : '📊 Charger les données'}
          </button>
          
          <button
            className="btn btn-secondary"
            onClick={resetFilters}
            disabled={isLoading}
          >
            🔄 Réinitialiser
          </button>

          <button
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={isLoading || allRecords.length === 0}
          >
            📥 Exporter CSV
          </button>
        </div>
      </div>

      {/* Filtres actifs */}
      {allRecords.length > 0 && (selectedDepartment || selectedCategory || selectedActivity || selectedUser || searchText) && (
        <div className="active-filters">
          <div className="active-filters-header">
            <strong>🔍 Filtres actifs:</strong>
            <button 
              className="btn-clear-all" 
              onClick={resetFilters}
              title="Supprimer tous les filtres"
            >
              ✕ Tout effacer
            </button>
          </div>
          <div className="active-filters-list">
            {selectedDepartment && (
              <div className="filter-tag">
                <span>🏢 Département: {departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment}</span>
                <button onClick={() => setSelectedDepartment('')}>✕</button>
              </div>
            )}
            {selectedCategory && (
              <div className="filter-tag">
                <span>📂 Catégorie: {selectedCategory}</span>
                <button onClick={() => setSelectedCategory('')}>✕</button>
              </div>
            )}
            {selectedActivity && (
              <div className="filter-tag">
                <span>🎯 Activité: {selectedActivity}</span>
                <button onClick={() => setSelectedActivity('')}>✕</button>
              </div>
            )}
            {selectedUser && (
              <div className="filter-tag">
                <span>👤 Utilisateur: {teamMembers.find(m => m.email === selectedUser)?.name || selectedUser}</span>
                <button onClick={() => setSelectedUser('')}>✕</button>
              </div>
            )}
            {searchText && (
              <div className="filter-tag">
                <span>🔎 Recherche: "{searchText}"</span>
                <button onClick={() => setSearchText('')}>✕</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      {isLoading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid #FEE2E2',
            borderTop: '4px solid #DC2626',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}></div>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Chargement des données...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Statistiques rapides */}
      {!isLoading && allRecords.length > 0 && (
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{allRecords.length}</div>
              <div className="stat-label">Total activités</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{userSummaries.length}</div>
              <div className="stat-label">Utilisateurs</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <div className="stat-value">{departmentSummaries.length}</div>
              <div className="stat-label">Départements</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="stat-label">Jours</div>
            </div>
          </div>
        </div>
      )}

      {/* Onglets de vue */}
      {!isLoading && allRecords.length > 0 && (
        <div className="view-tabs">
          <button
            className={`view-tab ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
          >
            📋 Vue détaillée
          </button>
          <button
            className={`view-tab ${viewMode === 'user-summary' ? 'active' : ''}`}
            onClick={() => setViewMode('user-summary')}
          >
            👥 Par utilisateur
          </button>
          <button
            className={`view-tab ${viewMode === 'department-summary' ? 'active' : ''}`}
            onClick={() => setViewMode('department-summary')}
          >
            🏢 Par département
          </button>
        </div>
      )}

      {/* Contenu principal */}
      <div className="synthesis-content">
        {!isLoading && allRecords.length === 0 && (
          <div className="empty-state" style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ color: '#1F2937', marginBottom: '8px' }}>Aucune donnée disponible</h3>
            <p style={{ color: '#6B7280' }}>Chargez des données en cliquant sur "Charger les données"</p>
          </div>
        )}
        {!isLoading && allRecords.length > 0 && (
          <>
            {viewMode === 'detailed' && renderDetailedView()}
            {viewMode === 'user-summary' && renderUserSummaryView()}
            {viewMode === 'department-summary' && renderDepartmentSummaryView()}
          </>
        )}
      </div>

      {/* Modal de détails */}
      {showDetailsModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔍 Détails - {selectedRecord.activityName}</h2>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              {(() => {
                const fields = getActivityFields(selectedRecord.activityName);
                const userData = extractUserFields(selectedRecord.data, selectedRecord.activityName);
                
                if (fields.length === 0 && Object.keys(userData).length === 0) {
                  return (
                    <div className="empty-state">
                      <p>Aucune donnée spécifique disponible pour cette activité.</p>
                    </div>
                  );
                }

                return (
                  <div className="details-content-simple">
                    {/* En-tête avec les infos principales */}
                    <div className="details-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🎯</span>
                        <strong>{selectedRecord.activityName}</strong>
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📂</span>
                        {selectedRecord.categoryName}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {selectedRecord.createdDate.toLocaleDateString('fr-FR')} à {selectedRecord.createdDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">👤</span>
                        {selectedRecord.authorName}
                      </span>
                    </div>

                    {/* Tableau simple des données */}
                    <table className="details-table">
                      <thead>
                        <tr>
                          <th>Champ</th>
                          <th>Valeur</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fields.length > 0 ? (
                          fields.map((field) => {
                            const value = selectedRecord.data[field.key];
                            if (value === undefined || value === null || value === '') return null;
                            
                            return (
                              <tr key={field.key}>
                                <td className="field-name">{field.label}</td>
                                <td className="field-value">{formatFieldValue(value, field)}</td>
                              </tr>
                            );
                          })
                        ) : (
                          Object.entries(userData).map(([key, value]) => {
                            if (value === undefined || value === null || value === '') return null;
                            return (
                              <tr key={key}>
                                <td className="field-name">{key}</td>
                                <td className="field-value">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Fermer
              </button>
            </div>
          </div>
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

export default ActivitySynthesisView;
