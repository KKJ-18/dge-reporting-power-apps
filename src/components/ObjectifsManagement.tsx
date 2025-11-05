import React, { useState, useEffect } from 'react';
import { ObjectifService } from '../services/ObjectifService';
import { DepartmentActivitiesService } from '../services/DepartmentActivitiesService';
// UserProfileService not required here (profil non utilisé)
import { useNotification } from '../hooks/useNotification';
import NotificationModal from './NotificationModal';
import type { Objectif } from '../Models/ObjectifModel';
import './ObjectifsManagement.css';

interface ObjectifForm {
  Title: string;
  Date: string;
  Nombre: number | '';
}

interface Template {
  id: string;
  name: string;
  objectifs: ObjectifForm[];
}

interface ActivityGroup {
  category: string;
  categoryIcon: string;
  activities: string[];
}

const ObjectifsManagement: React.FC = () => {
  const { notification, showSuccess, showError, closeNotification } = useNotification();
  
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [activitiesByCategory, setActivitiesByCategory] = useState<ActivityGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);
  
  // Formulaire pour nouvel objectif
  const [newObjectif, setNewObjectif] = useState<ObjectifForm>({
    Title: '',
    Date: new Date().toISOString().split('T')[0],
    Nombre: ''
  });

  // Templates
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadObjectifsForDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadTemplatesFromLocalStorage();
  }, []);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        setIsActivityDropdownOpen(false);
      }
    };

    if (isActivityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActivityDropdownOpen]);

  // (profil non utilisé actuellement)

  const loadActivities = async () => {
    try {
      const deptsRecord = await DepartmentActivitiesService.getAllDepartments();
      const depts = Object.values(deptsRecord);
      
      const grouped: ActivityGroup[] = [];
      depts.forEach(dept => {
        dept.categories.forEach(cat => {
          const categoryActivities: string[] = [];
          cat.activities.forEach(act => {
            if (!categoryActivities.includes(act.name)) {
              categoryActivities.push(act.name);
            }
          });
          
          if (categoryActivities.length > 0) {
            grouped.push({
              category: cat.name,
              categoryIcon: cat.icon || '📋',
              activities: categoryActivities.sort()
            });
          }
        });
      });
      
      setActivitiesByCategory(grouped);
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const loadObjectifsForDate = async (date: string) => {
    setLoading(true);
    try {
      const result = await ObjectifService.getAll();
      const data: Objectif[] = result?.data || result?.value || [];

      // Filtrer par date sélectionnée
      const filtered = data.filter((obj: Objectif) => {
        if (!obj.Date) return false;
        const objDate = new Date(obj.Date).toISOString().split('T')[0];
        return objDate === date;
      });
      
      setObjectifs(filtered);
    } catch (error: any) {
      showError('Erreur', 'Impossible de charger les objectifs');
      console.error('Erreur chargement objectifs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjectif = async () => {
    if (!newObjectif.Title || !newObjectif.Date || !newObjectif.Nombre || newObjectif.Nombre <= 0) {
      showError('Validation', 'Veuillez remplir tous les champs correctement');
      return;
    }

    setLoading(true);
    try {
      await ObjectifService.create({
        Title: newObjectif.Title,
        Date: new Date(newObjectif.Date).toISOString(),
        Nombre: Number(newObjectif.Nombre)
      });

      showSuccess('Succès', 'Objectif ajouté avec succès');
      
      // Réinitialiser le formulaire
      setNewObjectif({
        Title: '',
        Date: selectedDate,
        Nombre: ''
      });
      setIsAddingNew(false);
      
      // Recharger les objectifs
      await loadObjectifsForDate(selectedDate);
    } catch (error: any) {
      showError('Erreur', 'Impossible d\'ajouter l\'objectif');
      console.error('Erreur ajout objectif:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateObjectif = async (id: number, changes: Partial<Objectif>) => {
    setLoading(true);
    try {
      await ObjectifService.update(id.toString(), changes);
      showSuccess('Succès', 'Objectif mis à jour');
      await loadObjectifsForDate(selectedDate);
    } catch (error: any) {
      showError('Erreur', 'Impossible de modifier l\'objectif');
      console.error('Erreur modification objectif:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteObjectif = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) return;

    setLoading(true);
    try {
      await ObjectifService.delete(id.toString());
      showSuccess('Succès', 'Objectif supprimé');
      await loadObjectifsForDate(selectedDate);
    } catch (error: any) {
      showError('Erreur', 'Impossible de supprimer l\'objectif');
      console.error('Erreur suppression objectif:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTemplate = () => {
    if (objectifs.length === 0) {
      showError('Erreur', 'Aucun objectif à sauvegarder en template');
      return;
    }
    setShowTemplateModal(true);
  };

  const handleCreateTemplate = () => {
    if (!templateName.trim()) {
      showError('Validation', 'Veuillez donner un nom au template');
      return;
    }

    const template: Template = {
      id: Date.now().toString(),
      name: templateName,
      objectifs: objectifs.map(obj => ({
        Title: obj.Title || '',
        Date: selectedDate,
        Nombre: obj.Nombre || 1
      }))
    };

    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    localStorage.setItem('objectifs_templates', JSON.stringify(newTemplates));

    showSuccess('Succès', `Template "${templateName}" créé avec ${objectifs.length} objectif(s)`);
    setShowTemplateModal(false);
    setTemplateName('');
  };

  const handleApplyTemplate = async (template: Template) => {
    if (!confirm(`Appliquer le template "${template.name}" pour le ${selectedDate} ?\nCela créera ${template.objectifs.length} objectif(s).`)) {
      return;
    }

    setLoading(true);
    try {
      // Créer tous les objectifs du template
      for (const obj of template.objectifs) {
        await ObjectifService.create({
          Title: obj.Title,
          Date: new Date(selectedDate).toISOString(),
          Nombre: typeof obj.Nombre === 'number' ? obj.Nombre : parseInt(String(obj.Nombre)) || 1
        });
      }

      showSuccess('Succès', `Template "${template.name}" appliqué avec succès`);
      await loadObjectifsForDate(selectedDate);
    } catch (error: any) {
      showError('Erreur', 'Impossible d\'appliquer le template');
      console.error('Erreur application template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Supprimer ce template ?')) return;

    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    localStorage.setItem('objectifs_templates', JSON.stringify(newTemplates));
    showSuccess('Succès', 'Template supprimé');
  };

  const loadTemplatesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('objectifs_templates');
      if (stored) {
        setTemplates(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  return (
    <div className="objectifs-management-container">
      <div className="objectifs-header">
        <h1>🎯 Gestion des Objectifs</h1>
        <p>Définissez vos objectifs quotidiens pour suivre vos performances</p>
      </div>

      {/* Sélection de date */}
      <div className="date-selector">
        <div className="date-selector-group">
          <label>📅 Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          />
        </div>
        <div className="date-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div className="templates-section">
          <h3>📋 Templates disponibles</h3>
          <div className="templates-grid">
            {templates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-info">
                  <strong>{template.name}</strong>
                  <span>{template.objectifs.length} objectif(s)</span>
                </div>
                <div className="template-actions">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleApplyTemplate(template)}
                    disabled={loading}
                  >
                    ✓ Appliquer
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des objectifs */}
      <div className="objectifs-section">
        <div className="section-header">
          <h2>Objectifs pour le {new Date(selectedDate).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</h2>
          <div className="section-actions">
            {objectifs.length > 0 && (
              <button
                className="btn btn-secondary"
                onClick={handleSaveAsTemplate}
                disabled={loading}
              >
                💾 Sauver comme template
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={() => setIsAddingNew(true)}
              disabled={isAddingNew || loading}
            >
              ➕ Ajouter un objectif
            </button>
          </div>
        </div>

        {loading && <div className="loading-spinner">⏳ Chargement...</div>}

        {/* Formulaire ajout */}
        {isAddingNew && (
          <div className="objectif-form">
            <h3>➕ Nouvel objectif</h3>
            <div className="form-grid">
              <div className="form-group activity-selector">
                <label>Activité *</label>
                <div className="custom-dropdown">
                  <div 
                    className="dropdown-trigger"
                    onClick={() => setIsActivityDropdownOpen(!isActivityDropdownOpen)}
                  >
                    <span className={newObjectif.Title ? 'selected-value' : 'placeholder'}>
                      {newObjectif.Title || '-- Sélectionner une activité --'}
                    </span>
                    <span className="dropdown-arrow">{isActivityDropdownOpen ? '▲' : '▼'}</span>
                  </div>
                  
                  {isActivityDropdownOpen && (
                    <div className="activity-dropdown">
                      <div className="dropdown-search-wrapper">
                        <input
                          type="text"
                          placeholder="🔍 Rechercher..."
                          value={activitySearchTerm}
                          onChange={(e) => setActivitySearchTerm(e.target.value)}
                          className="dropdown-search-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div className="dropdown-content">
                        {activitiesByCategory
                          .filter(group => 
                            group.activities.some(act => 
                              act.toLowerCase().includes(activitySearchTerm.toLowerCase())
                            )
                          )
                          .map(group => (
                            <div key={group.category} className="activity-category-group">
                              <div className="activity-category-header">
                                {group.categoryIcon} {group.category}
                              </div>
                              <div className="activity-category-items">
                                {group.activities
                                  .filter(act => 
                                    act.toLowerCase().includes(activitySearchTerm.toLowerCase())
                                  )
                                  .map(act => (
                                    <div
                                      key={act}
                                      className={`activity-item ${newObjectif.Title === act ? 'selected' : ''}`}
                                      onClick={() => {
                                        setNewObjectif({ ...newObjectif, Title: act });
                                        setActivitySearchTerm('');
                                        setIsActivityDropdownOpen(false);
                                      }}
                                    >
                                      {act}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                        {activitiesByCategory.every(group => 
                          !group.activities.some(act => 
                            act.toLowerCase().includes(activitySearchTerm.toLowerCase())
                          )
                        ) && activitySearchTerm && (
                          <div className="activity-no-results">
                            Aucune activité trouvée pour "{activitySearchTerm}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={newObjectif.Date}
                  onChange={(e) => setNewObjectif({ ...newObjectif, Date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Nombre attendu *</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 5"
                  value={newObjectif.Nombre}
                  onChange={(e) => setNewObjectif({ ...newObjectif, Nombre: e.target.value === '' ? '' : parseInt(e.target.value) || '' })}
                  onFocus={(e) => {
                    if (e.target.value === '0') {
                      setNewObjectif({ ...newObjectif, Nombre: '' });
                    }
                  }}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleAddObjectif}
                disabled={loading}
              >
                ✓ Enregistrer
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewObjectif({ Title: '', Date: selectedDate, Nombre: '' });
                  setActivitySearchTerm('');
                }}
                disabled={loading}
              >
                ✗ Annuler
              </button>
            </div>
          </div>
        )}

        {/* Liste des objectifs */}
        {!loading && objectifs.length === 0 && !isAddingNew && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Aucun objectif défini</h3>
            <p>Ajoutez des objectifs pour cette journée ou appliquez un template</p>
          </div>
        )}

        {objectifs.length > 0 && (
          <div className="objectifs-table-wrapper">
            <table className="objectifs-table">
              <thead>
                <tr>
                  <th>Activité</th>
                  <th>Date</th>
                  <th>Nombre attendu</th>
                  <th>Créé par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {objectifs.map(obj => (
                  <tr key={obj.ID}>
                    <td className="activity-name">{obj.Title}</td>
                    <td>{obj.Date ? new Date(obj.Date).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={obj.Nombre || 1}
                        onChange={(e) => handleUpdateObjectif(obj.ID!, { Nombre: parseInt(e.target.value) || 1 })}
                        className="inline-input"
                      />
                    </td>
                    <td>
                      {(obj.Author as any)?.Title || 
                       (obj.Author as any)?.DisplayName || 
                       (obj.Author as any)?.Email || 
                       ((obj as any).CreatedBy) || 
                       'N/A'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteObjectif(obj.ID!)}
                        disabled={loading}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal template */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>💾 Sauvegarder comme template</h3>
            <p>Donnez un nom à ce template pour le réutiliser facilement</p>
            <div className="form-group">
              <label>Nom du template *</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Objectifs hebdomadaires standard"
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCreateTemplate}>
                ✓ Créer le template
              </button>
              <button className="btn btn-secondary" onClick={() => {
                setShowTemplateModal(false);
                setTemplateName('');
              }}>
                Annuler
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

export default ObjectifsManagement;
