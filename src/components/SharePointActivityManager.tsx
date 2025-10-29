import React, { useEffect, useState } from 'react';
import { SharePointActivityService } from '../services/SharePointActivityService';

type Activity = {
  ID?: number;
  Title?: string;
  IdRubrique?: string;
}

const SharePointActivityManager: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Activity>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    console.log('🎬 START loadActivities');
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Début chargement des activités SharePoint...');
      const data = await SharePointActivityService.getActivities();
      console.log('✅ Activités chargées:', data);
      console.log('✅ Nombre:', data.length);
      setActivities(data);
    } catch (err: any) {
      console.error('❌ Erreur chargement:', err);
      console.error('❌ Message:', err.message);
      const errorMsg = err.message || 'Erreur inconnue lors du chargement';
      console.error('❌ Message final:', errorMsg);
      setError(errorMsg);
    } finally {
      console.log('🏁 END loadActivities - setLoading(false)');
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.Title || !formData.IdRubrique) {
      setError('Le titre et la rubrique sont obligatoires');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await SharePointActivityService.createActivity(formData as Omit<Activity, 'ID'>);
      setFormData({});
      setShowCreateForm(false);
      await loadActivities();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await SharePointActivityService.updateActivity(id, formData);
      setEditingId(null);
      setFormData({});
      await loadActivities();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await SharePointActivityService.deleteActivity(id);
      await loadActivities();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (activity: Activity) => {
    setEditingId(activity.ID!);
    setFormData({
      Title: activity.Title,
      IdRubrique: activity.IdRubrique
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  return (
    <div className="page-header">
      <h1 className="page-title">📋 Gestion des Activités SharePoint</h1>
      <p className="page-subtitle">Liste "Activity" - CRUD complet</p>

      <div style={{ marginTop: '2rem', maxWidth: '1200px' }}>
        {/* Message d'erreur */}
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: '#991B1B'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Bouton Créer */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setFormData({});
            }}
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
              boxShadow: '0 2px 8px rgba(204, 0, 0, 0.2)'
            }}
          >
            {showCreateForm ? '❌ Annuler' : '➕ Nouvelle Activité'}
          </button>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>
              Nouvelle Activité
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.Title || ''}
                  onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem'
                  }}
                  placeholder="Ex: Visites clientèles"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
                  Rubrique *
                </label>
                <input
                  type="text"
                  value={formData.IdRubrique || ''}
                  onChange={(e) => setFormData({ ...formData, IdRubrique: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    borderRadius: '8px',
                    fontSize: '0.9375rem'
                  }}
                  placeholder="Ex: Activités annexes"
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {loading ? '⏳ Création...' : '✅ Créer'}
            </button>
          </div>
        )}

        {/* Liste des activités */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            background: 'rgba(204, 0, 0, 0.05)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: '600',
            fontSize: '0.875rem',
            display: 'grid',
            gridTemplateColumns: '60px 1fr 1fr 150px',
            gap: '1rem'
          }}>
            <div>ID</div>
            <div>Titre</div>
            <div>Rubrique</div>
            <div>Actions</div>
          </div>

          {loading && activities.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
              ⏳ Chargement...
            </div>
          ) : activities.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
              Aucune activité trouvée
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.ID}
                style={{
                  padding: '1rem 1.5rem',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 1fr 150px',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                {editingId === activity.ID ? (
                  <>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{activity.ID}</div>
                    <input
                      type="text"
                      value={formData.Title || ''}
                      onChange={(e) => setFormData({ ...formData, Title: e.target.value })}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                    <input
                      type="text"
                      value={formData.IdRubrique || ''}
                      onChange={(e) => setFormData({ ...formData, IdRubrique: e.target.value })}
                      style={{
                        padding: '0.5rem',
                        border: '1px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '6px',
                        fontSize: '0.875rem'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleUpdate(activity.ID!)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#10B981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✓
                      </button>
                      <button
                        onClick={cancelEdit}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#6B7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{activity.ID}</div>
                    <div style={{ fontSize: '0.9375rem' }}>{activity.Title}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>{activity.IdRubrique}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => startEdit(activity)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(activity.ID!)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 0.75rem',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bouton Rafraîchir */}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={loadActivities}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem'
            }}
          >
            {loading ? '⏳ Chargement...' : '🔄 Rafraîchir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharePointActivityManager;
