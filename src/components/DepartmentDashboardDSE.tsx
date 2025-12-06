import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import Modal from './Modal';

// Import des formulaires spécialisés DSE
import FormSituationMEP from '../components/forms/FormSituationMEP';
import FormAccordsDSE from '../components/forms/FormAccordsDSE';
import FormContratsDSE from '../components/forms/FormContratsDSE';
import FormActivitesAnnexes from '../components/forms/FormActivitesAnnexes';

import './DepartmentDashboard.css';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDSEProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

/**
 * Type pour les activités annexes (compatible avec FormActivitesAnnexes)
 */
type AnnexesActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';

/**
 * Mapping des types de Situation MEP
 */
type SituationMEPType = 
  | 'amortissables'
  | 'restructuration'
  | 'caution'
  | 'credoc'
  | 'leasing'
  | 'ligne-decouvert'
  | 'lignes-autres'
  | 'finance-islamique';

/**
 * Mapping des types d'Accords
 */
type AccordType = 
  | 'autorisation-mobilisation'
  | 'accords-classement'
  | 'accords-liste';

/**
 * Mapping des types de Contrats (inclut aussi Projets qui utilise la même table)
 */
type ContratType = 
  | 'avance-facture'
  | 'prefinancement'
  | 'cautions'
  | 'pv-comite';  // ✅ PV du comité de crédit (Projets)

/**
 * Détecte automatiquement le type de formulaire basé sur la catégorie et le nom de l'activité
 */
function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'situation-mep' | 'accords' | 'contrats' | 'declaration-reglementaire' | 'activites-annexes';
  specificType?: SituationMEPType | AccordType | ContratType | AnnexesActivityType;
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // ========================================
  // SITUATION MISE EN PLACE (8 types)
  // ========================================
  if (categoryLower.includes('situation') && categoryLower.includes('place')) {
    if (activityLower.includes('amortissable')) {
      return { formType: 'situation-mep', specificType: 'amortissables' };
    }
    if (activityLower.includes('restructuration')) {
      return { formType: 'situation-mep', specificType: 'restructuration' };
    }
    if (activityLower.includes('caution')) {
      return { formType: 'situation-mep', specificType: 'caution' };
    }
    if (activityLower.includes('crédoc') || activityLower.includes('credoc')) {
      return { formType: 'situation-mep', specificType: 'credoc' };
    }
    if (activityLower.includes('leasing')) {
      return { formType: 'situation-mep', specificType: 'leasing' };
    }
    if (activityLower.includes('ligne') && activityLower.includes('découvert')) {
      return { formType: 'situation-mep', specificType: 'ligne-decouvert' };
    }
    if (activityLower.includes('ligne') && activityLower.includes('autre')) {
      return { formType: 'situation-mep', specificType: 'lignes-autres' };
    }
    if (activityLower.includes('islamique') || activityLower.includes('finance')) {
      return { formType: 'situation-mep', specificType: 'finance-islamique' };
    }
    // Par défaut
    return { formType: 'situation-mep', specificType: 'amortissables' };
  }

  // ========================================
  // ACCORDS DE CLASSEMENT (3 types)
  // ========================================
  if (categoryLower.includes('accord')) {
    if (activityLower.includes('autorisation') && activityLower.includes('mobilisation')) {
      return { formType: 'accords', specificType: 'autorisation-mobilisation' };
    }
    if (activityLower.includes('liste')) {
      return { formType: 'accords', specificType: 'accords-liste' };
    }
    // Par défaut : Accords de Classement
    return { formType: 'accords', specificType: 'accords-classement' };
  }

  // ========================================
  // CONTRATS (3 types)
  // ========================================
  if (categoryLower.includes('contrat')) {
    if (activityLower.includes('avance') && activityLower.includes('facture')) {
      return { formType: 'contrats', specificType: 'avance-facture' };
    }
    if (activityLower.includes('préfinancement') || activityLower.includes('prefinancement')) {
      return { formType: 'contrats', specificType: 'prefinancement' };
    }
    if (activityLower.includes('caution')) {
      return { formType: 'contrats', specificType: 'cautions' };
    }
    return { formType: 'contrats', specificType: 'avance-facture' };
  }

  // ========================================
  // PROJETS (PV comité de crédit) - utilise la table Contrats
  // ========================================
  if (categoryLower.includes('projet')) {
    return { formType: 'contrats', specificType: 'pv-comite' };  // ✅ Utilise FormContratsDSE avec type pv-comite
  }

  // ========================================
  // DÉCLARATION RÉGLEMENTAIRE
  // ========================================
  if (categoryLower.includes('déclaration') || categoryLower.includes('reglementaire')) {
    return { formType: 'declaration-reglementaire' };
  }

  // ========================================
  // AUTRES ACTIVITÉS (Visites, Formations, Etudes, etc.)
  // ========================================
  if (categoryLower.includes('autre') || categoryLower.includes('activité')) {
    let activityType: AnnexesActivityType = 'etudes';
    
    if (activityLower.includes('visite')) activityType = 'visites';
    else if (activityLower.includes('formation')) activityType = 'formations';
    else if (activityLower.includes('étude') || activityLower.includes('etude')) activityType = 'etudes';
    else if (activityLower.includes('procédure') || activityLower.includes('procedure')) activityType = 'procedures';

    return { formType: 'activites-annexes', specificType: activityType };
  }

  // Par défaut
  return { formType: 'situation-mep', specificType: 'amortissables' };
}

const DepartmentDashboardDSE: React.FC<DepartmentDashboardDSEProps> = ({ 
  department
  // userProfile disponible mais non utilisé pour l'instant
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showActivityFormModal, setShowActivityFormModal] = useState(false);

  const handleCategoryClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setShowActivitiesModal(true);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setShowActivitiesModal(false);
    setShowActivityFormModal(true);
  };

  const handleCloseActivitiesModal = () => {
    setShowActivitiesModal(false);
    setSelectedCategory(null);
  };

  const handleCloseActivityModal = () => {
    setShowActivityFormModal(false);
    setSelectedActivity(null);
  };

  const handleActivitySave = () => {
    handleCloseActivityModal();
    // TODO: Recharger les données / rafraîchir les statistiques
  };

  const renderActivityForm = () => {
    if (!selectedActivity || !selectedCategory) return null;

    // Détection automatique du formulaire basé sur la catégorie
    const config = detectFormType(selectedCategory.name, selectedActivity.label);

    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
      departmentColor: department.color,  // ✅ Passer la couleur
    };

    switch (config.formType) {
      case 'situation-mep':
        return (
          <FormSituationMEP
            {...commonProps}
            mepType={config.specificType as SituationMEPType}
          />
        );

      case 'accords':
        return (
          <FormAccordsDSE
            {...commonProps}
            accordType={config.specificType as AccordType}
          />
        );

      case 'contrats':
        // Gère aussi 'pv-comite' (Projets) car ils utilisent la même table
        return (
          <FormContratsDSE
            {...commonProps}
            contratType={config.specificType as ContratType}
          />
        );

      case 'declaration-reglementaire':
        // TODO: Créer un formulaire spécifique pour les déclarations
        return (
          <div className="form-info">
            <p>📋 Formulaire Déclaration Réglementaire</p>
            <p>Plateforme CNEF - TEG, FIBANE, Douane, CRE</p>
            <button onClick={handleCloseActivityModal}>Fermer</button>
          </div>
        );

      case 'activites-annexes':
        return (
          <FormActivitesAnnexes
            {...commonProps}
            activityType={config.specificType as AnnexesActivityType}
          />
        );

      default:
        return (
          <div className="form-error">
            <p>⚠️ Type de formulaire inconnu: {config.formType}</p>
          </div>
        );
    }
  };

  return (
    <DepartmentFormWrapper departmentColor={department.color}>
      <div className="department-dashboard">
        {/* Header - Style DA */}
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
      </div>

      {/* Categories Grid - Style DA */}
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
                <span className="stat-label">ACTIVITÉS</span>
              </div>
            </div>

            <div className="category-footer">
              <button 
                className="btn-view-category"
                style={{ backgroundColor: department.color }}
              >
                📝 Voir les activités
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour la liste des activités - Style DA */}
      <Modal
        isOpen={showActivitiesModal}
        onClose={handleCloseActivitiesModal}
        title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
        size="lg"
      >
        <div className="activities-selector">
          <p className="selector-subtitle">
            Sélectionnez une activité pour saisir les données
          </p>
          
          <div className="activities-list-grid">
            {selectedCategory?.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="activity-selector-card"
                onClick={() => handleActivityClick(activity)}
                style={{ cursor: 'pointer' }}
              >
                <div className="activity-number">{index + 1}</div>
                <div className="activity-info">
                  <h4 className="activity-title">{activity.label}</h4>
                  {activity.frequency && (
                    <span className="activity-frequency">
                      🕒 {activity.frequency}
                    </span>
                  )}
                </div>
                <div className="activity-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal pour le formulaire de l'activité sélectionnée */}
      <Modal
        isOpen={showActivityFormModal}
        onClose={handleCloseActivityModal}
        title=""
        size="xl"
        hideHeader
      >
        {renderActivityForm()}
      </Modal>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardDSE;
