import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import Modal from './Modal';
import SuiviRecouvrementGFC from './SuiviRecouvrementGFC';
import './DepartmentDashboard.css';

interface DepartmentDashboardProps {
  department: DepartmentData;
  userProfile: UserProfile;
}

interface ActivityEntry {
  id?: string;
  categoryId: string;
  activityId: string;
  value: string | number;
  date: string;
  period: string; // Format: YYYY-MM
  userId: string;
  departmentId: string;
}

const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({ department, userProfile }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRecouvrementView, setShowRecouvrementView] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCategoryClick = (category: CategoryData) => {
    // Vérifier si c'est la catégorie "Suivi des actions de recouvrement pour les GFC"
    console.log('🔍 Catégorie cliquée:', { id: category.id, name: category.name });
    
    if (category.id === 'suivi-recouvrement-gfc' || 
        category.id === 'suivi-des-actions-de-recouvrement-pour-les-gfc' ||
        category.name === 'Suivi des actions de recouvrement pour les GFC' ||
        category.name.toLowerCase().includes('suivi des actions de recouvrement')) {
      console.log('✅ Redirection vers SuiviRecouvrementGFC');
      setShowRecouvrementView(true);
      return;
    }
    
    setSelectedCategory(category);
    setIsModalOpen(true);
    setError(null);
    // Charger les données existantes pour cette période si disponibles
    loadCategoryEntries(category);
  };

  const loadCategoryEntries = async (category: CategoryData) => {
    // TODO: Charger les données depuis SharePoint
    // Pour l'instant, initialiser vide
    const initialEntries: Record<string, string> = {};
    category.activities.forEach(activity => {
      initialEntries[activity.id] = '';
    });
    setEntries(initialEntries);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
    setEntries({});
    setError(null);
  };

  const handleInputChange = (activityId: string, value: string) => {
    setEntries(prev => ({
      ...prev,
      [activityId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    setSaving(true);
    setError(null);

    try {
      // TODO: Sauvegarder dans SharePoint
      const activitiesToSave: ActivityEntry[] = [];
      
      Object.entries(entries).forEach(([activityId, value]) => {
        if (value && value.toString().trim() !== '') {
          activitiesToSave.push({
            categoryId: selectedCategory.id,
            activityId,
            value,
            date: new Date().toISOString(),
            period: currentPeriod,
            userId: userProfile.email,
            departmentId: department.id
          });
        }
      });

      console.log('Données à sauvegarder:', activitiesToSave);
      
      // Simuler la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleCloseModal();
      // TODO: Afficher notification de succès
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const renderInputField = (activity: ActivityItem) => {
    const value = entries[activity.id] || '';

    switch (activity.type) {
      case 'number':
        return (
          <input
            type="number"
            className="form-input"
            value={value}
            onChange={(e) => handleInputChange(activity.id, e.target.value)}
            placeholder="0"
            min="0"
          />
        );
      
      case 'amount':
        return (
          <div className="input-with-unit">
            <input
              type="number"
              className="form-input"
              value={value}
              onChange={(e) => handleInputChange(activity.id, e.target.value)}
              placeholder="0"
              min="0"
              step="0.01"
            />
            <span className="input-unit">FCFA</span>
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={value}
            onChange={(e) => handleInputChange(activity.id, e.target.value)}
          />
        );
      
      case 'text':
      default:
        return (
          <textarea
            className="form-textarea"
            value={value}
            onChange={(e) => handleInputChange(activity.id, e.target.value)}
            placeholder="Saisir les détails..."
            rows={3}
          />
        );
    }
  };

  return (
    <div className="department-dashboard">
      {/* Afficher la vue de suivi de recouvrement si sélectionnée */}
      {showRecouvrementView ? (
        <SuiviRecouvrementGFC onClose={() => setShowRecouvrementView(false)} />
      ) : (
        <>
          {/* Header */}
          <div className="dashboard-header" style={{ borderLeftColor: department.color }}>
            <div className="header-content">
              <div className="header-icon" style={{ backgroundColor: `${department.color}15` }}>
                <span style={{ fontSize: '3rem' }}>{department.icon}</span>
              </div>
              <div className="header-info">
                <h1 className="dashboard-title">{department.fullName}</h1>
                <p className="dashboard-subtitle">
                  {department.categories.length} catégories • {' '}
                  {department.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités
                </p>
              </div>
            </div>
            
            <div className="period-selector">
              <label htmlFor="period">Période de reporting:</label>
              <input
                type="month"
                id="period"
                value={currentPeriod}
                onChange={(e) => setCurrentPeriod(e.target.value)}
                className="period-input"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="categories-grid">
            {department.categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                onClick={() => handleCategoryClick(category)}
                style={{ borderTopColor: department.color }}
              >
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <h3 className="category-name">{category.name}</h3>
                </div>
                
                <div className="category-stats">
                  <div className="stat-item">
                    <span className="stat-value">{category.activities.length}</span>
                    <span className="stat-label">Activités</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">0</span>
                    <span className="stat-label">Saisies</span>
                  </div>
                </div>

                <div className="category-footer">
                  <button className="btn-view-category">
                    📝 Saisir les données
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal pour la saisie des activités */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="activity-form">
              {error && (
                <div className="alert alert-error">
                  <span>⚠️ {error}</span>
                  <button type="button" onClick={() => setError(null)}>✕</button>
                </div>
              )}

              <div className="form-period-info">
                <span className="period-badge">
                  📅 Période: {new Date(currentPeriod + '-01').toLocaleDateString('fr-FR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>

              <div className="activities-list">
                {selectedCategory?.activities.map((activity, index) => (
                  <div key={activity.id} className="activity-item">
                    <label className="activity-label">
                      <span className="activity-number">{index + 1}.</span>
                      {activity.label}
                      {activity.unit && <span className="activity-unit">({activity.unit})</span>}
                    </label>
                    {renderInputField(activity)}
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-small"></span>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      💾 Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DepartmentDashboard;
