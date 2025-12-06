import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import Modal from './Modal';

// Import des formulaires spécialisés pour autres catégories
import FormSuiviTransmission from './forms/FormSuiviTransmission';
import FormEvaluationDelais from './forms/FormEvaluationDelais';
import FormAdminEngagementsAnalyse from './forms/FormAdminEngagementsAnalyse';
import FormSuiviMEP from './forms/FormSuiviMEP';
import FormActivitesAnnexes from './forms/FormActivitesAnnexes';

// Import des formulaires individuels pour Crédit Classique
import FormDossiersRecus from './forms/FormDossiersRecus';
import FormDossiersComites from './forms/FormDossiersComites';
import FormFAR from './forms/FormFAR';
import FormNotesCirculation from './forms/FormNotesCirculation';
import FormDossiersAnalyse from './forms/FormDossiersAnalyse';
import FormDossiersRisque from './forms/FormDossiersRisque';
import FormDossiersRenvoyes from './forms/FormDossiersRenvoyes';
import FormDossiersConformite from './forms/FormDossiersConformite';
import FormDossiersAttenteComite from './forms/FormDossiersAttenteComite';
import FormSCRG from './forms/FormSCRG';
import FormSuiviRegularisation from './forms/FormSuiviRegularisation';
import FormDelaisCreditClassique from './forms/FormDelaisCreditClassique';

import './DepartmentDashboard.css';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardAnalyseProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

type ActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';
type CreditClassiqueFormType = 'dossiers-recus' | 'dossiers-comites' | 'far' | 'notes-circulation' | 
  'dossiers-analyse' | 'dossiers-risque' | 'dossiers-renvoyes' | 'dossiers-conformite' | 
  'dossiers-attente-comite' | 'scrg' | 'suivi-regularisation' | 'delais-credit';

/**
 * Détecte automatiquement le type de formulaire basé sur la catégorie et le nom de l'activité
 */
function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'credit-classique' | 'suivi-transmission' | 'evaluation-delais' | 'admin-engagements' | 'suivi-mep' | 'activites-annexes';
  creditClassiqueType?: CreditClassiqueFormType;
  props?: {
    requiresComite?: boolean;
    requiresDetails?: boolean;
    activityType?: ActivityType;
  };
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // Crédit Classique - Mapping individuel pour chaque activité
  if (categoryLower.includes('crédit classique') || categoryLower.includes('credit classique')) {
    // Dossiers reçus des unités
    if (activityLower.includes('reçu') || activityLower.includes('recu')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
    }
    // Dossiers présentés aux comités
    if (activityLower.includes('comité') || activityLower.includes('comite') || activityLower.includes('présenté')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-comites' };
    }
    // FAR
    if (activityLower.includes('far')) {
      return { formType: 'credit-classique', creditClassiqueType: 'far' };
    }
    // Notes de circulation
    if (activityLower.includes('note')) {
      return { formType: 'credit-classique', creditClassiqueType: 'notes-circulation' };
    }
    // Dossiers en cours d'analyse
    if (activityLower.includes('analyse') || activityLower.includes('cours')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-analyse' };
    }
    // Dossiers en attente avis risque
    if (activityLower.includes('risque')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-risque' };
    }
    // Dossiers renvoyés
    if (activityLower.includes('renvoy')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-renvoyes' };
    }
    // Dossiers en attente conformité
    if (activityLower.includes('conformit')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-conformite' };
    }
    // Dossiers en attente du comité de crédit
    if (activityLower.includes('attente') && (activityLower.includes('comité') || activityLower.includes('comite'))) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-attente-comite' };
    }
    // SCRG CONSEIL
    if (activityLower.includes('scrg') || activityLower.includes('conseil')) {
      return { formType: 'credit-classique', creditClassiqueType: 'scrg' };
    }
    // Suivi dossiers à régulariser CC4/CCCA
    if (activityLower.includes('régularis') || activityLower.includes('regularis') || activityLower.includes('cc4') || activityLower.includes('ccca')) {
      return { formType: 'credit-classique', creditClassiqueType: 'suivi-regularisation' };
    }
    // Évaluation délai moyen
    if (activityLower.includes('délai') || activityLower.includes('delai') || activityLower.includes('evaluation')) {
      return { formType: 'credit-classique', creditClassiqueType: 'delais-credit' };
    }
    // Par défaut pour autres activités Crédit Classique
    return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
  }

  // Crédit Programme
  if (categoryLower.includes('crédit programme') || categoryLower.includes('credit programme')) {
    if (activityLower.includes('délai') || activityLower.includes('delai')) {
      return { formType: 'evaluation-delais' };
    }
    const requiresComite = activityLower.includes('comité') || activityLower.includes('comite');
    return { formType: 'suivi-transmission', props: { requiresComite } };
  }

  // Administration des Engagements
  if (categoryLower.includes('administration') || categoryLower.includes('engagement')) {
    return { formType: 'admin-engagements' };
  }

  // Suivi MEP
  if (categoryLower.includes('suivi') && (activityLower.includes('mep') || activityLower.includes('mis en place'))) {
    return { formType: 'suivi-mep' };
  }

  // Activités Annexes
  if (categoryLower.includes('annexe') || categoryLower.includes('transversal')) {
    let activityType: ActivityType = 'visites';
    if (activityLower.includes('formation')) activityType = 'formations';
    else if (activityLower.includes('procédure') || activityLower.includes('procedure')) activityType = 'procedures';
    else if (activityLower.includes('étude') || activityLower.includes('etude')) activityType = 'etudes';
    else if (activityLower.includes('visite')) activityType = 'visites';
    
    return { formType: 'activites-annexes', props: { activityType } };
  }

  // Par défaut, utiliser le formulaire crédit classique sans options spéciales
  return { formType: 'credit-classique', props: { requiresComite: false, requiresDetails: false } };
}

const DepartmentDashboardAnalyse: React.FC<DepartmentDashboardAnalyseProps> = ({ 
  department
  // userProfile est disponible si nécessaire pour des contrôles futurs
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const handleCategoryClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setIsCategoryModalOpen(false);
    setIsActivityModalOpen(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
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
    };

    switch (config.formType) {
      case 'credit-classique':
        // Router vers le bon formulaire spécifique selon l'activité
        switch (config.creditClassiqueType) {
          case 'dossiers-recus':
            return <FormDossiersRecus {...commonProps} />;
          case 'dossiers-comites':
            return <FormDossiersComites {...commonProps} />;
          case 'far':
            return <FormFAR {...commonProps} />;
          case 'notes-circulation':
            return <FormNotesCirculation {...commonProps} />;
          case 'dossiers-analyse':
            return <FormDossiersAnalyse {...commonProps} />;
          case 'dossiers-risque':
            return <FormDossiersRisque {...commonProps} />;
          case 'dossiers-renvoyes':
            return <FormDossiersRenvoyes {...commonProps} />;
          case 'dossiers-conformite':
            return <FormDossiersConformite {...commonProps} />;
          case 'dossiers-attente-comite':
            return <FormDossiersAttenteComite {...commonProps} />;
          case 'scrg':
            return <FormSCRG {...commonProps} />;
          case 'suivi-regularisation':
            return <FormSuiviRegularisation {...commonProps} />;
          case 'delais-credit':
            return <FormDelaisCreditClassique {...commonProps} />;
          default:
            return <FormDossiersRecus {...commonProps} />;
        }

      case 'suivi-transmission':
        return (
          <FormSuiviTransmission
            {...commonProps}
            requiresComite={config.props?.requiresComite || false}
          />
        );

      case 'evaluation-delais':
        return <FormEvaluationDelais {...commonProps} />;

      case 'admin-engagements':
        return <FormAdminEngagementsAnalyse {...commonProps} />;

      case 'suivi-mep':
        return <FormSuiviMEP {...commonProps} />;

      case 'activites-annexes':
        return (
          <FormActivitesAnnexes
            {...commonProps}
            activityType={config.props?.activityType || 'visites'}
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
            </div>

            <div className="category-footer">
              <button className="btn-view-category">
                📝 Voir les activités
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal pour la liste des activités */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
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
                style={{
                  cursor: 'pointer',
                }}
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
        isOpen={isActivityModalOpen}
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

export default DepartmentDashboardAnalyse;
