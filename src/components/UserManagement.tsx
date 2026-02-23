import React, { useState, useEffect } from 'react';
import { UtilisateursService } from '../services/UtilisateursService';
import { debugLog } from '../utils/logger';
import './UserManagement.css';

interface User {
  id?: number;
  Id?: number;
  Title?: string;
  Email: string;
  Nom: string;
  Prenom: string;
  Fonction: string;
  Departement: {
    Value: 'DA' | 'DSE' | 'DPNP';
  };
  Actif?: boolean;
}

interface UserManagementProps {
  onClose: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    Email: '',
    Nom: '',
    Prenom: '',
    Fonction: 'Collaborateur',
    Departement: { Value: 'DA' },
    Actif: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      debugLog('👥 Chargement des utilisateurs...');
      const result = await UtilisateursService.getAll();
      const allUsers = result?.data || result?.value || [];
      debugLog(`✅ ${allUsers.length} utilisateurs chargés`);
      setUsers(allUsers);
    } catch (err) {
      console.error('❌ Erreur chargement utilisateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedUser(null);
    setFormData({
      Email: '',
      Nom: '',
      Prenom: '',
      Fonction: 'Collaborateur',
      Departement: { Value: 'DA' },
      Actif: true
    });
  };

  const handleEdit = (user: User) => {
    setIsEditing(true);
    setIsAdding(false);
    setSelectedUser(user);
    setFormData({
      Email: user.Email,
      Nom: user.Nom,
      Prenom: user.Prenom,
      Fonction: user.Fonction,
      Departement: user.Departement,
      Actif: user.Actif ?? true
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setSelectedUser(null);
    setFormData({
      Email: '',
      Nom: '',
      Prenom: '',
      Fonction: 'Collaborateur',
      Departement: { Value: 'DA' },
      Actif: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // En modification, on vérifie seulement Email et Fonction
      if (!formData.Email || !formData.Fonction) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
    } else {
      // En création, on vérifie Email, Nom, Prénom et Fonction
      if (!formData.Email || !formData.Nom || !formData.Prenom || !formData.Fonction) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
    }

    try {
      setLoading(true);
      
      if (isAdding) {
        // Créer un nouvel utilisateur
        debugLog('➕ Création utilisateur:', formData);
        await UtilisateursService.create({
          Email: formData.Email!,
          Nom: formData.Nom!,
          Prenom: formData.Prenom!,
          Fonction: formData.Fonction!,
          Departement: formData.Departement!,
          Actif: formData.Actif ?? true
        } as any);
        alert('✅ Utilisateur créé avec succès');
      } else if (isEditing && selectedUser) {
        // Mettre à jour l'utilisateur - SEULEMENT Fonction, Département et Actif
        const userId = selectedUser.id || selectedUser.Id;
        if (!userId) {
          throw new Error('ID utilisateur manquant');
        }
        
        debugLog('✏️ Modification utilisateur:', userId, formData);
        await UtilisateursService.update(userId.toString(), {
          Fonction: formData.Fonction!,
          Departement: formData.Departement!,
          Actif: formData.Actif ?? true
        } as any);
        alert('✅ Utilisateur modifié avec succès');
      }
      
      // Recharger la liste
      await loadUsers();
      handleCancel();
    } catch (err) {
      console.error('❌ Erreur sauvegarde:', err);
      alert('❌ Erreur: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user: User) => {
    const userId = user.id || user.Id;
    if (!userId) {
      alert('ID utilisateur manquant');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${user.Prenom} ${user.Nom} ?`)) {
      return;
    }

    try {
      setLoading(true);
      debugLog('🗑️ Suppression utilisateur:', userId);
      await UtilisateursService.delete(userId.toString());
      alert('✅ Utilisateur supprimé avec succès');
      await loadUsers();
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert('❌ Erreur: ' + (err instanceof Error ? err.message : 'Erreur de suppression'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActif = async (user: User) => {
    const userId = user.id || user.Id;
    if (!userId) {
      alert('ID utilisateur manquant');
      return;
    }

    try {
      setLoading(true);
      const newActif = !user.Actif;
      debugLog('🔄 Changement statut:', userId, newActif);
      await UtilisateursService.update(userId.toString(), {
        Actif: newActif
      } as any);
      alert(`✅ Utilisateur ${newActif ? 'activé' : 'désactivé'}`);
      await loadUsers();
    } catch (err) {
      console.error('❌ Erreur changement statut:', err);
      alert('❌ Erreur: ' + (err instanceof Error ? err.message : 'Erreur'));
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentColor = (_dept: string) => {
    return '#CC0000';
  };

  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>👥 Gestion des Utilisateurs</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Actions */}
        {!isEditing && !isAdding && (
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleAdd}>
              ➕ Nouvel Utilisateur
            </button>
            <button className="btn btn-secondary" onClick={loadUsers} disabled={loading}>
              🔄 Actualiser
            </button>
          </div>
        )}

        {/* Formulaire Ajout/Modification */}
        {(isEditing || isAdding) && (
          <form className="user-form" onSubmit={handleSubmit}>
            <h3>{isAdding ? '➕ Nouvel Utilisateur' : '✏️ Modifier Utilisateur'}</h3>
            
            {isEditing && selectedUser && (
              <div style={{
                padding: '1rem',
                background: '#e3f2fd',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                borderLeft: '4px solid #0078d4'
              }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                  Utilisateur: {selectedUser.Prenom} {selectedUser.Nom}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  ℹ️ Le nom et prénom ne peuvent pas être modifiés. Seuls la fonction, le département et le statut peuvent être changés.
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.Email || ''}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  required
                  disabled={isEditing} // Email non modifiable en édition
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  {isEditing ? 'L\'email ne peut pas être modifié' : 'Adresse email de l\'utilisateur'}
                </small>
              </div>
            </div>

            {/* Nom et Prénom uniquement en mode Ajout */}
            {isAdding && (
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.Nom || ''}
                    onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.Prenom || ''}
                    onChange={(e) => setFormData({ ...formData, Prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Fonction *</label>
                <select
                  value={formData.Fonction || 'Collaborateur'}
                  onChange={(e) => setFormData({ ...formData, Fonction: e.target.value })}
                  required
                >
                  <option value="Collaborateur">Collaborateur</option>
                  <option value="Chef de Service">Chef de Service</option>
                  <option value="Assistant DCE">Assistant DCE</option>
                  <option value="Directeur">Directeur</option>
                  <option value="Directeur Général">Directeur Général</option>
                </select>
              </div>
              <div className="form-group">
                <label>Département *</label>
                <select
                  value={formData.Departement?.Value || 'DA'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    Departement: { Value: e.target.value as 'DA' | 'DSE' | 'DPNP' }
                  })}
                  required
                >
                  <option value="DA">📊 Département Analyse</option>
                  <option value="DSE">🏦 Département Surveillance des Engagements</option>
                  <option value="DPNP">🏛️ Département des Prêts Non Performants</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.Actif ?? true}
                    onChange={(e) => setFormData({ ...formData, Actif: e.target.checked })}
                  />
                  {' '}Compte actif
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={loading}>
                ✕ Annuler
              </button>
            </div>
          </form>
        )}

        {/* Liste des utilisateurs */}
        {!isEditing && !isAdding && (
          <div className="users-list">
            {loading && <div className="loading-state">⏳ Chargement...</div>}
            {error && <div className="error-state">❌ {error}</div>}
            
            {!loading && !error && users.length === 0 && (
              <div className="empty-state">Aucun utilisateur trouvé</div>
            )}

            {!loading && !error && users.length > 0 && (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Nom Complet</th>
                      <th>Email</th>
                      <th>Fonction</th>
                      <th>Département</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const userId = user.id || user.Id;
                      return (
                        <tr key={userId || user.Email}>
                          <td>
                            <strong>{user.Prenom} {user.Nom}</strong>
                          </td>
                          <td>{user.Email}</td>
                          <td>{user.Fonction}</td>
                          <td>
                            <span 
                              className="dept-badge"
                              style={{ 
                                backgroundColor: getDepartmentColor(user.Departement?.Value || ''),
                                color: 'white'
                              }}
                            >
                              {user.Departement?.Value}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`status-toggle ${user.Actif === false ? 'inactive' : 'active'}`}
                              onClick={() => handleToggleActif(user)}
                              disabled={loading}
                              title={user.Actif === false ? 'Activer' : 'Désactiver'}
                            >
                              {user.Actif === false ? '⭕ Inactif' : '✅ Actif'}
                            </button>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-icon btn-edit"
                                onClick={() => handleEdit(user)}
                                title="Modifier"
                                disabled={loading}
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon btn-delete"
                                onClick={() => handleDelete(user)}
                                title="Supprimer"
                                disabled={loading}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {!isEditing && !isAdding && !loading && (
          <div className="users-stats">
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value">{users.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Actifs:</span>
              <span className="stat-value">{users.filter(u => u.Actif !== false).length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">DA:</span>
              <span className="stat-value">{users.filter(u => u.Departement?.Value === 'DA').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">DSE:</span>
              <span className="stat-value">{users.filter(u => u.Departement?.Value === 'DSE').length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">DPNP:</span>
              <span className="stat-value">{users.filter(u => u.Departement?.Value === 'DPNP').length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
