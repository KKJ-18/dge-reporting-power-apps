import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import Modal from './Modal';

// Import des formulaires spécialisés DPNP
import FormDossiersRestructuration from './forms/FormDossiersRestructuration';
import FormSuiviAnomalies from './forms/FormSuiviAnomalies';
import FormFormationUnites from './forms/FormFormationUnites';
import FormSuiviDepassements from './forms/FormSuiviDepassements';
import FormSuiviClientAppele from './forms/FormSuiviClientAppele';
import FormRepriseProvision from './forms/FormRepriseProvision';
import FormVolumeProvisions from './forms/FormVolumeProvisions';
import FormRechercherClientAnomalie from './forms/FormRechercherClientAnomalie';
import FormVisiteClientele from './forms/FormVisiteClientele';
import FormActivitesAnnexes from './forms/FormActivitesAnnexes';

import './DepartmentDashboard.css';

interface DepartmentDashboardDPNPProps {
  department: DepartmentData;
  userProfile: UserProfile;
}

/**
 * Types pour les différentes activités DPNP
 */
type DossiersRestructurationType = 
  | 'dossiers-recus'
  | 'dossiers-complements'
  | 'dossier-analyse'
  | 'dossier-attente-comite'
  | 'dossier-attente-decision'
  | 'dossier-accord'
  | 'dossier-renvoye'
  | 'dossier-avis-conformite'
  | 'attente-comite-credit'
  | 'remboursement-echeance';

type AnomaliesType = 
  | 'anomalies-tresorerie'
  | 'anomalies-leasing';

type DepassementType = 
  | 'nombre-depassement'
  | 'depassement-regularise-72h'
  | 'depassement-attente-regularisation';

type ContagionType = 
  | 'comptes-nettoyer'
  | 'montant-regulariser'
  | 'reprise-provision';

type ProvisionsType = 
  | 'volume-provisions'
  | 'volume-reprises-provision';

type RechercheClientType = 
  | 'nombre-clients-anomalies'
  | 'pays-residence'
  | 'employeur'
  | 'ville-residence';

type ActivitesAnnexesType = 
  | 'visites-clienteles'
  | 'formations'
  | 'procedures'
  | 'etudes'
  | 'autres-activites';

/**
 * Détecte automatiquement le type de formulaire basé sur la catégorie et le nom de l'activité
 */
function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'dossiers-restructuration' | 'suivi-anomalies' | 'formation-unites' | 'suivi-depassements' 
    | 'suivi-client-appele' | 'reprise-provision' | 'volume-provisions' | 'rechercher-client-anomalie' 
    | 'visite-clientele' | 'activites-annexes';
  specificType?: DossiersRestructurationType | AnomaliesType | DepassementType | ContagionType 
    | ProvisionsType | RechercheClientType | ActivitesAnnexesType;
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // ========================================
  // ANALYSE DES DOSSIERS DE RESTRUCTURATION (10 types)
  // ========================================
  if (categoryLower.includes('restructuration')) {
    if (activityLower.includes('dossiers reçus') || activityLower.includes('dossiers recus')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
    }
    if (activityLower.includes('compléments') || activityLower.includes('complements')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossiers-complements' };
    }
    if (activityLower.includes('cours d\'analyse') || activityLower.includes('cours d\'analyse')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-analyse' };
    }
    if (activityLower.includes('attente de comité')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-comite' };
    }
    if (activityLower.includes('attente de décision') || activityLower.includes('attente de decision')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-decision' };
    }
    if (activityLower.includes('accord') && !activityLower.includes('attente')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-accord' };
    }
    if (activityLower.includes('renvoyé') || activityLower.includes('renvoye')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-renvoye' };
    }
    if (activityLower.includes('avis') && activityLower.includes('conformité')) {
      return { formType: 'dossiers-restructuration', specificType: 'dossier-avis-conformite' };
    }
    if (activityLower.includes('attente du comité') || activityLower.includes('attente du comite')) {
      return { formType: 'dossiers-restructuration', specificType: 'attente-comite-credit' };
    }
    if (activityLower.includes('remboursement') || activityLower.includes('échéance')) {
      return { formType: 'dossiers-restructuration', specificType: 'remboursement-echeance' };
    }
    return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
  }

  // ========================================
  // SUIVI DES ANOMALIES (2 types)
  // ========================================
  if (categoryLower.includes('anomalie')) {
    if (activityLower.includes('leasing')) {
      return { formType: 'suivi-anomalies', specificType: 'anomalies-leasing' };
    }
    return { formType: 'suivi-anomalies', specificType: 'anomalies-tresorerie' };
  }

  // ========================================
  // TRAVAIL DE PROXIMITÉ (Formation)
  // ========================================
  if (categoryLower.includes('proximité') || categoryLower.includes('formation des unités')) {
    return { formType: 'formation-unites' };
  }

  // ========================================
  // SUIVI DES DÉBITS NON AUTORISÉS (3 types)
  // ========================================
  if (categoryLower.includes('débit') || categoryLower.includes('depassement')) {
    if (activityLower.includes('régularisé') || activityLower.includes('72h')) {
      return { formType: 'suivi-depassements', specificType: 'depassement-regularise-72h' };
    }
    if (activityLower.includes('attente de régularisation')) {
      return { formType: 'suivi-depassements', specificType: 'depassement-attente-regularisation' };
    }
    return { formType: 'suivi-depassements', specificType: 'nombre-depassement' };
  }

  // ========================================
  // RECOUVREMENT PAR VERSEMENT
  // ========================================
  if (categoryLower.includes('recouvrement') || activityLower.includes('clients appelés')) {
    return { formType: 'suivi-client-appele' };
  }

  // ========================================
  // SUIVI DE LA CONTAGION DES COMPTES (3 types)
  // ========================================
  if (categoryLower.includes('contagion')) {
    if (activityLower.includes('comptes à nettoyer')) {
      return { formType: 'reprise-provision', specificType: 'comptes-nettoyer' };
    }
    if (activityLower.includes('montant global à verser')) {
      return { formType: 'reprise-provision', specificType: 'montant-regulariser' };
    }
    if (activityLower.includes('reprise de provision')) {
      return { formType: 'reprise-provision', specificType: 'reprise-provision' };
    }
    return { formType: 'reprise-provision', specificType: 'comptes-nettoyer' };
  }

  // ========================================
  // SUIVI DES PROVISIONS (2 types)
  // ========================================
  if (categoryLower.includes('provision')) {
    if (activityLower.includes('reprise')) {
      return { formType: 'volume-provisions', specificType: 'volume-reprises-provision' };
    }
    return { formType: 'volume-provisions', specificType: 'volume-provisions' };
  }

  // ========================================
  // RECHERCHE DES CLIENTS PARTICULIERS (4 types)
  // ========================================
  if (categoryLower.includes('recherche') || categoryLower.includes('risque canada')) {
    if (activityLower.includes('pays de résidence')) {
      return { formType: 'rechercher-client-anomalie', specificType: 'pays-residence' };
    }
    if (activityLower.includes('employeur')) {
      return { formType: 'rechercher-client-anomalie', specificType: 'employeur' };
    }
    if (activityLower.includes('ville de résidence')) {
      return { formType: 'rechercher-client-anomalie', specificType: 'ville-residence' };
    }
    return { formType: 'rechercher-client-anomalie', specificType: 'nombre-clients-anomalies' };
  }

  // ========================================
  // ACTIVITÉS ANNEXES (5 types)
  // ========================================
  if (categoryLower.includes('activités annexes')) {
    if (activityLower.includes('visite')) {
      return { formType: 'visite-clientele', specificType: 'visites-clienteles' };
    }
    if (activityLower.includes('formation')) {
      return { formType: 'activites-annexes', specificType: 'formations' };
    }
    if (activityLower.includes('procédure') || activityLower.includes('procedure')) {
      return { formType: 'activites-annexes', specificType: 'procedures' };
    }
    if (activityLower.includes('étude') || activityLower.includes('etude')) {
      return { formType: 'activites-annexes', specificType: 'etudes' };
    }
    return { formType: 'activites-annexes', specificType: 'autres-activites' };
  }

  // Par défaut
  return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
}

const DepartmentDashboardDPNP: React.FC<DepartmentDashboardDPNPProps> = ({ 
  department,
  userProfile
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
      categoryName: selectedCategory.name,
      departmentColor: department.color,
      onClose: handleCloseActivityModal,
      onSave: handleActivitySave,
      userProfile
    };

    // Rendu du formulaire approprié selon le type détecté
    switch (config.formType) {
      case 'dossiers-restructuration':
        return (
          <FormDossiersRestructuration
            {...commonProps}
            specificType={config.specificType as DossiersRestructurationType}
          />
        );

      case 'suivi-anomalies':
        return (
          <FormSuiviAnomalies
            {...commonProps}
            specificType={config.specificType as AnomaliesType}
          />
        );

      case 'formation-unites':
        return (
          <FormFormationUnites
            {...commonProps}
          />
        );

      case 'suivi-depassements':
        return (
          <FormSuiviDepassements
            {...commonProps}
            specificType={config.specificType as DepassementType}
          />
        );

      case 'suivi-client-appele':
        return (
          <FormSuiviClientAppele
            {...commonProps}
          />
        );

      case 'reprise-provision':
        return (
          <FormRepriseProvision
            {...commonProps}
            specificType={config.specificType as ContagionType}
          />
        );

      case 'volume-provisions':
        return (
          <FormVolumeProvisions
            {...commonProps}
            specificType={config.specificType as ProvisionsType}
          />
        );

      case 'rechercher-client-anomalie':
        return (
          <FormRechercherClientAnomalie
            {...commonProps}
            specificType={config.specificType as RechercheClientType}
          />
        );

      case 'visite-clientele':
        return (
          <FormVisiteClientele
            {...commonProps}
          />
        );

      case 'activites-annexes':
        return (
          <FormActivitesAnnexes
            {...commonProps}
            onCancel={handleCloseActivityModal}
            activityType={
              (config.specificType === 'visites-clienteles' ? 'visites' :
               config.specificType === 'formations' ? 'formations' :
               config.specificType === 'procedures' ? 'procedures' :
               'etudes') as 'visites' | 'formations' | 'procedures' | 'etudes'
            }
          />
        );

      default:
        return <div>Formulaire non disponible pour cette activité</div>;
    }
  };

  return (
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

      {/* Modal: Formulaire d'activité */}
      <Modal
        isOpen={showActivityFormModal}
        onClose={handleCloseActivityModal}
        title={selectedActivity ? selectedActivity.label : ''}
        size="xl"
        hideHeader={true}
      >
        {renderActivityForm()}
      </Modal>
    </div>
  );
};

export default DepartmentDashboardDPNP;
