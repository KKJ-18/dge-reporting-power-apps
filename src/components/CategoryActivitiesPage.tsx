import React, { useState } from 'react';
import { CategoryData, ActivityItem, DepartmentData } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import Modal from './Modal';
import { useObjectifValidation } from '../hooks/useObjectifValidation';

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

import './CategoryActivitiesPage.css';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface CategoryActivitiesPageProps {
  category: CategoryData;
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
  onBack?: () => void;
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
    if (activityLower.includes('reçu') || activityLower.includes('recu')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
    }
    if (activityLower.includes('comité') || activityLower.includes('comite') || activityLower.includes('présenté')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-comites' };
    }
    if (activityLower.includes('far')) {
      return { formType: 'credit-classique', creditClassiqueType: 'far' };
    }
    if (activityLower.includes('note')) {
      return { formType: 'credit-classique', creditClassiqueType: 'notes-circulation' };
    }
    if (activityLower.includes('analyse') || activityLower.includes('cours')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-analyse' };
    }
    if (activityLower.includes('risque')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-risque' };
    }
    if (activityLower.includes('renvoy')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-renvoyes' };
    }
    if (activityLower.includes('conformit')) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-conformite' };
    }
    if (activityLower.includes('attente') && (activityLower.includes('comité') || activityLower.includes('comite'))) {
      return { formType: 'credit-classique', creditClassiqueType: 'dossiers-attente-comite' };
    }
    if (activityLower.includes('scrg') || activityLower.includes('conseil')) {
      return { formType: 'credit-classique', creditClassiqueType: 'scrg' };
    }
    if (activityLower.includes('régularis') || activityLower.includes('regularis') || activityLower.includes('cc4') || activityLower.includes('ccca')) {
      return { formType: 'credit-classique', creditClassiqueType: 'suivi-regularisation' };
    }
    if (activityLower.includes('délai') || activityLower.includes('delai') || activityLower.includes('evaluation')) {
      return { formType: 'credit-classique', creditClassiqueType: 'delais-credit' };
    }
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

  return { formType: 'credit-classique', props: { requiresComite: false, requiresDetails: false } };
}

const CategoryActivitiesPage: React.FC<CategoryActivitiesPageProps> = ({ 
  category,
  department,
  userProfile,
  onNavigateToObjectifs,
  onBack
}) => {
  const { isValidating, validateBeforeSubmit } = useObjectifValidation();
  const [showObjectifAlert, setShowObjectifAlert] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  // Déterminer la classe de département pour le thème
  const getDeptClass = () => {
    switch (department.id) {
      case 'DA': return 'dept-da';
      case 'DSE': return 'dept-dse';
      case 'DPNP': return 'dept-dpnp';
      default: return '';
    }
  };

  const handleActivityClickWithValidation = async (activity: ActivityItem) => {
    const today = new Date();
    const isValid = await validateBeforeSubmit(activity.label as any, today);
    
    if (!isValid) {
      setShowObjectifAlert(true);
      return;
    }

    setSelectedActivity(activity);
    setIsActivityModalOpen(true);
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false);
    setSelectedActivity(null);
  };

  const handleActivitySave = () => {
    handleCloseActivityModal();
  };

  const renderActivityForm = () => {
    if (!selectedActivity) return null;

    const config = detectFormType(category.name, selectedActivity.label);

    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
    };

    switch (config.formType) {
      case 'credit-classique':
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
      <div className={`category-activities-page ${getDeptClass()}`}>
        {/* Header avec navigation */}
        <div className="page-header-nav">
          {onBack && (
            <button className="btn-back" onClick={onBack}>
              ← Retour
            </button>
          )}
          <div className="breadcrumb">
            <span className="breadcrumb-item">{department.name}</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{category.name}</span>
          </div>
        </div>

        {/* Header de la catégorie */}
        <div className="category-header-banner" style={{ borderLeftColor: department.color }}>
          <div className="category-header-content">
            <div className="category-icon-large" style={{ backgroundColor: `${department.color}15` }}>
              <span>{category.icon}</span>
            </div>
            <div className="category-info">
              <h1 className="category-title">{category.name}</h1>
              <p className="category-description">
                {category.activities.length} activités disponibles • {department.fullName}
              </p>
            </div>
          </div>
        </div>

        {/* Liste des activités */}
        <div className="activities-section">
          <h2 className="section-title">📝 Sélectionnez une activité</h2>
          
          <div className="activities-grid">
            {category.activities.map((activity, index) => (
              <div
                key={activity.id}
                className="activity-card"
                onClick={() => handleActivityClickWithValidation(activity)}
                style={{
                  cursor: isValidating ? 'wait' : 'pointer',
                  opacity: isValidating ? 0.6 : 1,
                  borderLeftColor: department.color,
                }}
              >
                <div className="activity-number" style={{ backgroundColor: department.color }}>
                  {index + 1}
                </div>
                <div className="activity-content">
                  <h3 className="activity-title">{activity.label}</h3>
                  {activity.frequency && (
                    <span className="activity-frequency">
                      🕒 {activity.frequency}
                    </span>
                  )}
                </div>
                <div className="activity-action">
                  <span className="action-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profil utilisateur info */}
        <div className="user-info-banner">
          <div className="user-info-content">
            <span className="user-icon">👤</span>
            <div className="user-details">
              <span className="user-name">{userProfile.email}</span>
              <span className="user-role">{userProfile.fonction || 'Agent'} • {department.name}</span>
            </div>
          </div>
        </div>

        {/* Modal pour le formulaire */}
        <Modal
          isOpen={isActivityModalOpen}
          onClose={handleCloseActivityModal}
          title=""
          size="xl"
          hideHeader
        >
          {renderActivityForm()}
        </Modal>

        {/* Modal: Alerte Objectifs Manquants */}
        {showObjectifAlert && (
          <div className="objectif-alert-overlay">
            <div className="objectif-alert-modal">
              <div className="alert-icon">⚠️</div>
              <h3 className="alert-title">Objectifs Requis</h3>
              <p className="alert-message">
                Vous devez <strong>définir vos objectifs de la journée</strong> avant de remplir vos activités.
              </p>
              <div className="alert-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowObjectifAlert(false)}
                >
                  Annuler
                </button>
                <button
                  className="btn-objectifs"
                  onClick={() => {
                    setShowObjectifAlert(false);
                    if (onNavigateToObjectifs) {
                      onNavigateToObjectifs();
                    }
                  }}
                >
                  📋 Définir mes objectifs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de chargement */}
        {isValidating && (
          <div className="loading-overlay">
            <div className="loading-modal">
              <div className="spinner"></div>
              <p>Vérification des objectifs...</p>
            </div>
          </div>
        )}
      </div>
    </DepartmentFormWrapper>
  );
};

export default CategoryActivitiesPage;
