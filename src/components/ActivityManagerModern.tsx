import React, { useState, useEffect } from 'react';
import { ActivityService } from '../services/ActivityService';
import { CategoryService } from '../services/CategoryService';
import { UserProfileService, UserProfile } from '../services/UserProfileService';
import { Activity } from '../Models/ActivityModel';
import { Category } from '../Models/CategoryModel';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import Modal from './Modal';
import CustomDropdown from './CustomDropdown';
import './ActivityManager.css';

const ActivityManagerModern: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingActivity, setSavingActivity] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    Title: '', 
    NomRubrique: ''
  });
  
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ID' | 'Title' | 'NomRubrique' | 'Created' | 'Modified'>('ID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadUserProfileAndActivities();
    loadCategories();
  }, []);

  const loadUserProfileAndActivities = async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      // Charger le profil utilisateur
      const profile = await UserProfileService.getCurrentUserProfile();
      setUserProfile(profile);
      
      console.log('👤 Profil chargé:', profile);
      console.log('🔒 Vue globale:', profile.hasGlobalView);
      console.log('🏢 Département:', profile.departement);
      
      // Charger les activités avec le filtre approprié
      await loadActivities(profile);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du profil utilisateur');
      console.error('❌ Erreur profil:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadActivities = async (profile?: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const currentProfile = profile || userProfile;
      
      if (!currentProfile) {
        throw new Error('Profil utilisateur non chargé');
      }

      // Obtenir le filtre basé sur le profil
      const filter = UserProfileService.getActivityFilter(currentProfile);
      
      console.log('🔍 Filtre appliqué:', filter || 'Aucun (vue globale)');

      const result = await ActivityService.getAll({
        filter: filter,
        orderBy: ['Modified desc']
      });
      
      const data = result?.data || result?.result || [];
      const activitiesArray = Array.isArray(data) ? data : [];
      
      setActivities(activitiesArray);
      console.log(`✅ ${activitiesArray.length} activité(s) chargée(s)`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des activités');
      console.error('❌ Erreur chargement activités:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await CategoryService.getAll();
      const data = result?.data || result?.result || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erreur de chargement des catégories:', err);
    }
  };

  // Filtrer et trier
  useEffect(() => {
    let filtered = [...activities];

    if (searchTerm.trim()) {
      filtered = filtered.filter(act => 
        act.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.ID?.toString().includes(searchTerm)
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(act => act.NomRubrique === filterCategory);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'Created' || sortBy === 'Modified') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      } else if (sortBy === 'ID') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterCategory, sortBy, sortOrder]);

  const handleOpenCreateModal = () => {
    // Vérifier si l'utilisateur peut créer
    if (userProfile && !UserProfileService.canCreateActivity(userProfile)) {
      setError('Vous n\'avez pas les permissions pour créer une activité');
      return;
    }

    setEditingActivity(null);
    setFormData({ Title: '', NomRubrique: '' });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (activity: Activity) => {
    // Vérifier si l'utilisateur peut modifier cette activité
    if (userProfile && !UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)) {
      setError('Vous n\'avez pas les permissions pour modifier cette activité');
      return;
    }

    setEditingActivity(activity);
    setFormData({
      Title: activity.Title || '',
      NomRubrique: activity.NomRubrique || ''
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
    setFormData({ Title: '', NomRubrique: '' });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.Title.trim() || !formData.NomRubrique) {
      setError('Tous les champs sont requis');
      return;
    }

    setSavingActivity(true);
    setError(null);

    try {
      if (editingActivity) {
        await ActivityService.update(editingActivity.ID!.toString(), formData);
      } else {
        await ActivityService.create(formData);
      }
      
      handleCloseModal();
      await loadActivities();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSavingActivity(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Vérifier les permissions
    const activity = activities.find(a => a.ID === id);
    if (userProfile && activity && !UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)) {
      setError('Vous n\'avez pas les permissions pour supprimer cette activité');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) return;

    setDeletingId(id);
    setError(null);
    
    try {
      await ActivityService.delete(id.toString());
      await loadActivities();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const categoryOptions = [
    { value: 'all', label: 'Toutes les catégories' },
    ...categories.map(cat => ({ value: cat.Title || '', label: cat.Title || '' }))
  ];

  const getCategoryName = (activity: Activity) => activity.NomRubrique || 'N/A';

  // Affichage du chargement du profil
  if (loadingProfile) {
    return (
      <div className="activity-manager-modern">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Affichage si pas de profil
  if (!userProfile) {
    return (
      <div className="activity-manager-modern">
        <div className="error-container">
          <p className="error-message">Impossible de charger votre profil utilisateur.</p>
          <button className="btn btn-primary" onClick={loadUserProfileAndActivities}>
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-manager-modern">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 Gestion des Activités</h1>
          <p className="page-subtitle">
            {userProfile.hasGlobalView 
              ? '🌍 Vue globale de toutes les activités (Directeur)' 
              : `🏢 ${UserProfileService.getDepartementLabel(userProfile.departement)}`
            }
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenCreateModal}
          disabled={!UserProfileService.canCreateActivity(userProfile)}
        >
          ➕ Nouvelle Activité
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="alert alert-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="activity-filters">
        <div className="search-box">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <CustomDropdown
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
            placeholder="Filtrer par catégorie"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="ID">Trier par ID</option>
            <option value="Title">Trier par Titre</option>
            <option value="NomRubrique">Trier par Catégorie</option>
            <option value="Created">Trier par Date création</option>
            <option value="Modified">Trier par Date modification</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        <div className="export-buttons">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportToCSV(filteredActivities, 'activites')}
          >
            📥 CSV
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => exportToExcel(filteredActivities, 'activites')}
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="activity-stats">
        <div className="stat-card">
          <span className="stat-value">{activities.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{filteredActivities.length}</span>
          <span className="stat-label">Affichées</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{categories.length}</span>
          <span className="stat-label">Catégories</span>
        </div>
      </div>

      {/* Error */}
      {error && !isModalOpen && (
        <div className="alert alert-error">
          ⚠️ {error}
        </div>
      )}

      {/* Liste des activités */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des activités...</p>
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>Aucune activité</h3>
          <p>
            {searchTerm || filterCategory !== 'all' 
              ? 'Aucune activité ne correspond à vos critères de recherche'
              : userProfile.hasGlobalView
                ? 'Commencez par créer votre première activité'
                : `Aucune activité pour ${UserProfileService.getDepartementLabel(userProfile.departement)}`
            }
          </p>
          {UserProfileService.canCreateActivity(userProfile) && (
            <button className="btn btn-primary" onClick={handleOpenCreateModal}>
              ➕ Créer une activité
            </button>
          )}
        </div>
      ) : (
        <div className="activities-grid">
          {filteredActivities.map((activity) => (
            <div key={activity.ID} className="activity-card">
              <div className="activity-card-header">
                <h3 className="activity-card-title">{activity.Title}</h3>
                <span className="activity-card-id">#{activity.ID}</span>
              </div>

              <div className="activity-card-body">
                <div className="activity-card-info">
                  <span className="info-label">Catégorie</span>
                  <span className="info-value category-badge">
                    📂 {getCategoryName(activity)}
                  </span>
                </div>

                {activity.Created && (
                  <div className="activity-card-info">
                    <span className="info-label">Créée le</span>
                    <span className="info-value">
                      {new Date(activity.Created).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>

              <div className="activity-card-actions">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => handleOpenEditModal(activity)}
                  title="Modifier"
                  disabled={!UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)}
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(activity.ID!)}
                  title="Supprimer"
                  disabled={deletingId === activity.ID || !UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)}
                >
                  {deletingId === activity.ID ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Formulaire */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingActivity ? '✏️ Modifier l\'activité' : '➕ Nouvelle activité'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="activity-form">
          {error && (
            <div className="alert alert-error">
              ⚠️ {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Titre de l'activité
              <span className="required-asterisk">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.Title}
              onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
              placeholder="Ex: Suivi des dossiers..."
              required
              disabled={savingActivity}
            />
          </div>

          <CustomDropdown
            label="Catégorie"
            options={categories.map(cat => ({
              value: cat.Title || '',
              label: cat.Title || ''
            }))}
            value={formData.NomRubrique}
            onChange={(value) => setFormData({ ...formData, NomRubrique: value })}
            placeholder="Sélectionner une catégorie"
            required
            disabled={savingActivity}
          />

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
              disabled={savingActivity}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingActivity}
            >
              {savingActivity ? (
                <>
                  <span className="spinner-small"></span>
                  {editingActivity ? 'Modification...' : 'Création...'}
                </>
              ) : (
                <>
                  {editingActivity ? '💾 Modifier' : '➕ Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ActivityManagerModern;
