import React, { useState, useEffect } from 'react';
import { ActivityService } from '../services/ActivityService';
import { CategoryService } from '../services/CategoryService';
import { Activity } from '../Models/ActivityModel';
import { Category } from '../Models/CategoryModel';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';

const ActivityManager: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ Le modèle Activity a maintenant le champ NomRubrique (texte) au lieu de IdRubrique (Lookup)
  const [formData, setFormData] = useState({ 
    Title: '', 
    NomRubrique: ''
  });
  
  // États pour la recherche et le filtrage
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'ID' | 'Title' | 'NomRubrique' | 'Created' | 'Modified'>('ID');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Charger toutes les activités
  const loadActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📋 Chargement des activités...');
      const result = await ActivityService.getAll();
      console.log('✅ Résultat:', result);
      
      const data = result?.data || result?.result || [];
      setActivities(Array.isArray(data) ? data : []);
      console.log('✅ Activités chargées:', data);
    } catch (err: any) {
      console.error('❌ Erreur de chargement:', err);
      setError(err.message || 'Erreur lors du chargement des activités');
    } finally {
      setLoading(false);
    }
  };

  // Charger toutes les catégories
  const loadCategories = async () => {
    try {
      console.log('📂 Chargement des catégories...');
      const result = await CategoryService.getAll();
      const data = result?.data || result?.result || [];
      setCategories(Array.isArray(data) ? data : []);
      console.log('✅ Catégories chargées:', data);
    } catch (err: any) {
      console.error('❌ Erreur de chargement des catégories:', err);
    }
  };

  // Filtrer et trier les activités
  useEffect(() => {
    let filtered = [...activities];

    // Appliquer la recherche
    if (searchTerm.trim()) {
      filtered = filtered.filter(act => 
        act.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.ID?.toString().includes(searchTerm)
      );
    }

    // Appliquer le filtre par catégorie
    if (filterCategory !== 'all') {
      filtered = filtered.filter(act => act.NomRubrique === filterCategory);
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Gestion des dates
      if (sortBy === 'Created' || sortBy === 'Modified') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Gestion des nombres
      if (sortBy === 'ID') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      // Gestion des strings
      if (sortBy === 'Title' || sortBy === 'NomRubrique') {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterCategory, sortBy, sortOrder]);

  // Créer une nouvelle activité
  const handleCreate = async () => {
    if (!formData.Title.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!formData.NomRubrique) {
      setError('La catégorie est requise');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('➕ Création de l\'activité:', formData);
      const result = await ActivityService.create(formData);
      console.log('✅ Activité créée:', result);
      
      setIsModalOpen(false);
      setFormData({ Title: '', NomRubrique: '' });
      await loadActivities();
    } catch (err: any) {
      console.error('❌ Erreur de création:', err);
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour une activité
  const handleUpdate = async () => {
    if (!editingActivity || !formData.Title.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!formData.NomRubrique) {
      setError('La catégorie est requise');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('✏️ Mise à jour de l\'activité:', editingActivity.ID, formData);
      const result = await ActivityService.update(editingActivity.ID!.toString(), formData);
      console.log('✅ Activité mise à jour:', result);
      
      setIsModalOpen(false);
      setEditingActivity(null);
      setFormData({ Title: '', NomRubrique: '' });
      await loadActivities();
    } catch (err: any) {
      console.error('❌ Erreur de mise à jour:', err);
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une activité
  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('🗑️ Suppression de l\'activité:', id);
      await ActivityService.delete(id.toString());
      console.log('✅ Activité supprimée');
      
      await loadActivities();
    } catch (err: any) {
      console.error('❌ Erreur de suppression:', err);
      setError(err.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le modal pour créer
  const openCreateModal = () => {
    setEditingActivity(null);
    setFormData({ Title: '', NomRubrique: '' });
    setIsModalOpen(true);
    setError(null);
  };

  // Ouvrir le modal pour éditer
  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({ 
      Title: activity.Title || '', 
      NomRubrique: getCategoryName(activity)
    });
    setIsModalOpen(true);
    setError(null);
  };

  // Obtenir le nom de la catégorie
  const getCategoryName = (activity: Activity): string => {
    // Priorité : NomRubrique (texte) > N/A
    if (activity.NomRubrique) return activity.NomRubrique;
    return 'N/A';
  };

  // Exporter en CSV
  const handleExportCSV = () => {
    if (filteredActivities.length === 0) {
      setError('Aucune donnée à exporter');
      return;
    }

    const exportData = filteredActivities.map(act => ({
      ID: act.ID,
      Titre: act.Title,
      Catégorie: getCategoryName(act),
      'Créé le': act.Created ? new Date(act.Created).toLocaleString('fr-FR') : '',
      'Modifié le': act.Modified ? new Date(act.Modified).toLocaleString('fr-FR') : ''
    }));

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToCSV(exportData, `activites_${timestamp}.csv`);
    console.log('✅ Export CSV réussi');
  };

  // Exporter en Excel
  const handleExportExcel = () => {
    if (filteredActivities.length === 0) {
      setError('Aucune donnée à exporter');
      return;
    }

    const exportData = filteredActivities.map(act => ({
      ID: act.ID,
      Titre: act.Title,
      Catégorie: getCategoryName(act),
      'Créé le': act.Created ? new Date(act.Created).toLocaleString('fr-FR') : '',
      'Modifié le': act.Modified ? new Date(act.Modified).toLocaleString('fr-FR') : ''
    }));

    const timestamp = new Date().toISOString().slice(0, 10);
    exportToExcel(exportData, `activites_${timestamp}.xls`);
    console.log('✅ Export Excel réussi');
  };

  // Charger au démarrage
  useEffect(() => {
    loadCategories();
    loadActivities();
  }, []);

  return (
    <div className="page-header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">📝 Gestion des Activités</h1>
          <p className="page-subtitle">CRUD complet pour la liste SharePoint Activity</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleExportCSV}
            disabled={loading || filteredActivities.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: filteredActivities.length === 0 ? '#9CA3AF' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: (loading || filteredActivities.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              boxShadow: filteredActivities.length === 0 ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            📥 Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            disabled={loading || filteredActivities.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              background: filteredActivities.length === 0 ? '#9CA3AF' : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: (loading || filteredActivities.length === 0) ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              boxShadow: filteredActivities.length === 0 ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            📊 Export Excel
          </button>
          <button
            onClick={openCreateModal}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              boxShadow: '0 2px 8px rgba(204, 0, 0, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            ➕ Nouvelle Activité
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Barre de recherche */}
        <div style={{ flex: '1 1 300px', minWidth: '250px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.25rem'
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par titre ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                border: '1px solid rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border 0.2s'
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  padding: '0.25rem'
                }}
              >
                ❌
              </button>
            )}
          </div>
        </div>

        {/* Filtre par catégorie */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#6B7280'
          }}>
            Catégorie:
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="all">Toutes</option>
            {categories.map(cat => (
              <option key={cat.ID} value={cat.ID}>
                {cat.Title}
              </option>
            ))}
          </select>
        </div>

        {/* Tri par */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#6B7280'
          }}>
            Trier par:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ID">ID</option>
            <option value="Title">Titre</option>
            <option value="IdRubrique#Id">Catégorie</option>
            <option value="Created">Date création</option>
            <option value="Modified">Date modification</option>
          </select>
        </div>

        {/* Ordre de tri */}
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(0, 0, 0, 0.2)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
          }}
        >
          {sortOrder === 'asc' ? '⬆️ Croissant' : '⬇️ Décroissant'}
        </button>

        {/* Compteur */}
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          marginLeft: 'auto'
        }}>
          {filteredActivities.length} / {activities.length} activité(s)
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.1)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#991B1B',
          fontSize: '0.875rem'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Indicateur de chargement */}
      {loading && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '12px',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#1E40AF',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          🔄 Chargement en cours...
        </div>
      )}

      {/* Liste des activités */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{
              background: 'rgba(0, 0, 0, 0.02)',
              borderBottom: '2px solid rgba(0, 0, 0, 0.08)'
            }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Titre</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Catégorie</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Créé le</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Modifié le</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', fontSize: '0.875rem', color: '#6B7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                  {searchTerm || filterCategory !== 'all' ? 
                    'Aucune activité trouvée avec ces critères' : 
                    'Aucune activité trouvée. Cliquez sur "Nouvelle Activité" pour commencer.'
                  }
                </td>
              </tr>
            ) : (
              filteredActivities.map((activity) => (
                <tr key={activity.ID} style={{
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>{activity.ID}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#1A1A1A' }}>{activity.Title}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    <span style={{
                      background: 'rgba(204, 0, 0, 0.1)',
                      color: '#CC0000',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {getCategoryName(activity)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    {activity.Created ? new Date(activity.Created).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6B7280' }}>
                    {activity.Modified ? new Date(activity.Modified).toLocaleDateString('fr-FR') : '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button
                      onClick={() => openEditModal(activity)}
                      disabled={loading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#2563EB',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        marginRight: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(activity.ID!)}
                      disabled={loading}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(220, 38, 38, 0.1)',
                        color: '#DC2626',
                        border: '1px solid rgba(220, 38, 38, 0.3)',
                        borderRadius: '6px',
                        fontWeight: '500',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Créer/Éditer */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1A1A1A',
              marginBottom: '1.5rem'
            }}>
              {editingActivity ? '✏️ Modifier l\'Activité' : '➕ Nouvelle Activité'}
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                Titre *
              </label>
              <input
                type="text"
                value={formData.Title}
                onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                placeholder="Entrez le titre de l'activité"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1A1A1A',
                marginBottom: '0.5rem'
              }}>
                Catégorie *
              </label>
              <select
                value={formData.NomRubrique || ''}
                onChange={(e) => setFormData({ ...formData, NomRubrique: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border 0.2s',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Sélectionnez une catégorie --</option>
                {categories.map(cat => (
                  <option key={cat.ID} value={cat.Title}>
                    {cat.Title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingActivity(null);
                  setFormData({ Title: '', NomRubrique: '' });
                  setError(null);
                }}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(0, 0, 0, 0.05)',
                  color: '#6B7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s'
                }}
              >
                Annuler
              </button>
              <button
                onClick={editingActivity ? handleUpdate : handleCreate}
                disabled={loading || !formData.Title.trim() || !formData.NomRubrique}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: (loading || !formData.Title.trim() || !formData.NomRubrique)
                    ? '#9CA3AF' 
                    : 'linear-gradient(135deg, #CC0000 0%, #990000 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: (loading || !formData.Title.trim() || !formData.NomRubrique) ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  boxShadow: (loading || !formData.Title.trim() || !formData.NomRubrique) ? 'none' : '0 2px 8px rgba(204, 0, 0, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                {loading ? '⏳ En cours...' : (editingActivity ? '💾 Enregistrer' : '➕ Créer')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManager;
