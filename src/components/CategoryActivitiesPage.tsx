import React, { useState } from 'react';
import { CategoryData, ActivityItem, DepartmentData } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import ModalTailwind from './ModalTailwind';

// Import du formulaire universel pour les dossiers avec détails clients
import FormDossiersRestructurationV2 from './forms/FormDossiersRestructurationV2';

// Import des formulaires DA (Département Analyse)
import FormAdminEngagementsAnalyse from './forms/FormAdminEngagementsAnalyse';
import FormSuiviMEP from './forms/FormSuiviMEP';
import FormActivitesAnnexes from './forms/FormActivitesAnnexes';

// Import des formulaires Crédit Classique spécifiques (non-dossiers)
import FormFAR from './forms/FormFAR';
import FormNotesCirculation from './forms/FormNotesCirculation';
import FormSCRG from './forms/FormSCRG';
import FormSuiviRegularisation from './forms/FormSuiviRegularisation';
import FormDelaisCreditClassique from './forms/FormDelaisCreditClassique';

// Formulaire générique pour les autres activités
import SimpleActivityForm from './forms/SimpleActivityForm';

import './CategoryActivitiesPage.css';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';
import { resolveAnalyseFormType, resolveDSEFormType, resolveDPNPFormType } from '../config/formResolver';


interface CategoryActivitiesPageProps {
  category: CategoryData;
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
  onBack?: () => void;
}

type ActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';
type FormType = 'credit-classique' | 'credit-programme' | 'admin-engagements' | 'suivi-mep' | 'activites-annexes' |
  'situation-mep-dse' | 'accords-dse' | 'contrats-dse' | 'restructuration-dpnp' | 'anomalies-dpnp' |
  'visite-clientele' | 'formation-unites' | 'recherche-anomalie';

type CreditClassiqueFormType = 'dossiers-recus' | 'dossiers-comites' | 'far' | 'notes-circulation' | 
  'dossiers-analyse' | 'dossiers-risque' | 'dossiers-renvoyes' | 'dossiers-conformite' | 
  'dossiers-attente-comite' | 'scrg' | 'suivi-regularisation' | 'delais-credit';

/**
 * Mapping exact des activités SharePoint vers les formulaires
 * Basé sur les noms exacts qui viennent de la base de données
 */
const ACTIVITY_TO_FORM_MAP: Record<string, {
  formType: FormType;
  creditClassiqueType?: CreditClassiqueFormType;
  props?: any;
}> = {
  // ========== DÉPARTEMENT DA: CRÉDIT CLASSIQUE ==========
  'Dossiers reçus des unités': { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' },
  'Dossiers présentés aux différents comités de crédit': { formType: 'credit-classique', creditClassiqueType: 'dossiers-comites' },
  'FAR': { formType: 'credit-classique', creditClassiqueType: 'far' },
  'Note de circulation': { formType: 'credit-classique', creditClassiqueType: 'notes-circulation' },
  'Dossiers en cours d\'analyse': { formType: 'credit-classique', creditClassiqueType: 'dossiers-analyse' },
  'Dossiers en attente de l\'avis de risque': { formType: 'credit-classique', creditClassiqueType: 'dossiers-risque' },
  'Dossiers renvoyés': { formType: 'credit-classique', creditClassiqueType: 'dossiers-renvoyes' },
  'Dossiers en attente de l\'avis de la conformité': { formType: 'credit-classique', creditClassiqueType: 'dossiers-conformite' },
  'Dossiers en attente du comité de crédit': { formType: 'credit-classique', creditClassiqueType: 'dossiers-attente-comite' },
  'Dossiers CONSEIL en attente avis du SCRG': { formType: 'credit-classique', creditClassiqueType: 'scrg' },
  'Suivi de la régularisation CC4, CCCA': { formType: 'credit-classique', creditClassiqueType: 'suivi-regularisation' },
  'Evaluation des délais de traitement des crédits classiques': { formType: 'credit-classique', creditClassiqueType: 'delais-credit' },
  
  // ========== DÉPARTEMENT DA: CRÉDIT PROGRAMME ==========
  'Dossiers de programme reçus des unités': { formType: 'credit-programme' },
  'Dossiers de programme présentés aux différents comités de crédit': { formType: 'credit-programme', props: { requiresComite: true } },
  'Dossiers de programme transmis à la DSE': { formType: 'credit-programme' },
  'Evaluation des délais de traitement des crédits programmes': { formType: 'credit-programme' },
  
  // ========== DÉPARTEMENT DA: ADMINISTRATION DES ENGAGEMENTS ==========
  'Mise à jour des montants des engagements après versements': { formType: 'admin-engagements' },
  'Levée des réserves': { formType: 'admin-engagements' },
  'Avenant': { formType: 'admin-engagements' },
  'Mise en place partielle': { formType: 'admin-engagements' },
  'Caducité': { formType: 'admin-engagements' },
  'Mainlevée': { formType: 'admin-engagements' },
  
  // ========== DÉPARTEMENT DA: SUIVI MEP ==========
  'Dossiers de crédits classiques en cours de MEP': { formType: 'suivi-mep' },
  'Dossiers de crédit programme en cours de MEP': { formType: 'suivi-mep' },
  
  // ========== DÉPARTEMENT DSE: SITUATION MISE EN PLACE ==========
  'Crédits amortissables': { formType: 'situation-mep-dse' },
  'Découvert': { formType: 'situation-mep-dse' },
  'Acceptations': { formType: 'situation-mep-dse' },
  'Cautions': { formType: 'situation-mep-dse' },
  'Affacturage': { formType: 'situation-mep-dse' },
  'Restructuration': { formType: 'situation-mep-dse' },
  
  // ========== DÉPARTEMENT DSE: ACCORDS DE CLASSEMENT ==========
  'Autorisation de mobilisation de créances commerciales': { formType: 'accords-dse' },
  'Accord de classement': { formType: 'accords-dse' },
  
  // ========== DÉPARTEMENT DSE: CONTRATS ==========
  'Avance sur facture': { formType: 'contrats-dse' },
  'Préfinancement': { formType: 'contrats-dse' },
  
  // ========== DÉPARTEMENT DPNP: RESTRUCTURATION ==========
  'Dossiers de restructuration reçus': { formType: 'restructuration-dpnp' },
  'Dossiers de restructuration présentés aux différents comités': { formType: 'restructuration-dpnp' },
  'Dossiers de restructuration transmis à la DSE': { formType: 'restructuration-dpnp' },
  
  // ========== DÉPARTEMENT DPNP: ANOMALIES ==========
  'Suivi des anomalies clients sur les engagements par trésorerie': { formType: 'anomalies-dpnp' },
  'Suivi des anomalies clients leasing': { formType: 'anomalies-dpnp' },
  'Clients appelés pour régularisation': { formType: 'anomalies-dpnp' },
  'Clients régularisés': { formType: 'anomalies-dpnp' },
  
  // ========== DÉPARTEMENT DPNP: RECHERCHE CLIENTS ==========
  'Clients en anomalie': { formType: 'recherche-anomalie' },
  
  // ========== DÉPARTEMENT DPNP: VISITES ==========
  'Visites de proximité auprès des unités': { formType: 'visite-clientele' },
  
  // ========== DÉPARTEMENT DPNP: FORMATIONS ==========
  'Formations auprès des unités': { formType: 'formation-unites' },
  
  // ========== ACTIVITÉS ANNEXES (Tous départements) ==========
  'Visites terrain': { formType: 'activites-annexes', props: { activityType: 'visites' } },
  'Formations': { formType: 'activites-annexes', props: { activityType: 'formations' } },
  'Elaboration de procédures': { formType: 'activites-annexes', props: { activityType: 'procedures' } },
  'Etudes': { formType: 'activites-annexes', props: { activityType: 'etudes' } },
};

/**
 * Détecte automatiquement le type de formulaire basé sur la catégorie et le nom de l'activité
 */
function detectFormType(departmentId: string, categoryName: string, activityLabel: string): {
  formType: FormType;
  creditClassiqueType?: CreditClassiqueFormType;
  props?: {
    requiresComite?: boolean;
    requiresDetails?: boolean;
    activityType?: ActivityType;
  };
} {
  // 1. Essayer d'abord le mapping exact
  if (ACTIVITY_TO_FORM_MAP[activityLabel]) {
    return ACTIVITY_TO_FORM_MAP[activityLabel];
  }
  
  // 2. RÈGLE AUTOMATIQUE : Si l'activité contient "dossier(s)", utiliser le formulaire avec détails clients
  const activityLower = activityLabel.toLowerCase();
  if (activityLower.includes('dossier') || activityLower.includes('dossiers')) {
    return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus', props: { requiresDetails: true } };
  }
  
  // 3. Fallback via registre central par département
  if (departmentId === 'DA') {
    const config = resolveAnalyseFormType(categoryName, activityLabel);
    switch (config.formType) {
      case 'credit-classique':
        return {
          formType: 'credit-classique',
          creditClassiqueType: config.creditClassiqueType,
          props: config.props
        };
      case 'suivi-transmission':
      case 'evaluation-delais':
        return { formType: 'credit-programme' };
      case 'admin-engagements':
        return { formType: 'admin-engagements' };
      case 'suivi-mep':
        return { formType: 'suivi-mep' };
      case 'activites-annexes':
        return { formType: 'activites-annexes', props: config.props };
      default:
        return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
    }
  }

  if (departmentId === 'DSE') {
    const config = resolveDSEFormType(categoryName, activityLabel);
    switch (config.formType) {
      case 'suivi-mises-en-place':
        return { formType: 'situation-mep-dse' };
      case 'aim':
        return { formType: 'accords-dse' };
      case 'contrats':
        return { formType: 'contrats-dse' };
      case 'projets':
        return { formType: 'situation-mep-dse' };
      case 'declaration-reglementaire':
        return { formType: 'contrats-dse' };
      case 'autres-activites':
        return { formType: 'situation-mep-dse' };
      default:
        return { formType: 'situation-mep-dse' };
    }
  }

  if (departmentId === 'DPNP') {
    const config = resolveDPNPFormType(categoryName, activityLabel);
    switch (config.formType) {
      case 'dossiers-restructuration':
        return { formType: 'restructuration-dpnp' };
      case 'formation-unites':
        return { formType: 'formation-unites' };
      case 'rechercher-client-anomalie':
        return { formType: 'recherche-anomalie' };
      case 'visite-clientele':
        return { formType: 'visite-clientele' };
      case 'activites-annexes': {
        const activityType = config.specificType as ActivityType | undefined;
        return { formType: 'activites-annexes', props: { activityType: activityType || 'visites' } };
      }
      default:
        return { formType: 'anomalies-dpnp' };
    }
  }

  return { formType: 'credit-classique', props: { requiresComite: false, requiresDetails: false } };
}

const CategoryActivitiesPage: React.FC<CategoryActivitiesPageProps> = ({ 
  category,
  department,
  userProfile,
  onBack
}) => {
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

  const handleActivityClick = (activity: ActivityItem) => {
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

    const config = detectFormType(department.id, category.name, selectedActivity.label);

    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
    };

    switch (config.formType) {
      // ========== CRÉDIT CLASSIQUE (DA) ==========
      case 'credit-classique':
        // Si requiresDetails est true, utiliser le formulaire avec détails clients
        if (config.props?.requiresDetails) {
          return (
            <FormDossiersRestructurationV2
              activityName={selectedActivity.label}
              onClose={handleCloseActivityModal}
              onSave={handleActivitySave}
            />
          );
        }
        
        // Sinon utiliser les formulaires spécifiques
        switch (config.creditClassiqueType) {
          case 'dossiers-recus':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-comites':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-analyse':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-risque':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-renvoyes':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-conformite':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'dossiers-attente-comite':
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
          case 'far':
            return <FormFAR {...commonProps} />;
          case 'notes-circulation':
            return <FormNotesCirculation {...commonProps} />;
          case 'scrg':
            return <FormSCRG {...commonProps} />;
          case 'suivi-regularisation':
            return <FormSuiviRegularisation {...commonProps} />;
          case 'delais-credit':
            return <FormDelaisCreditClassique {...commonProps} />;
          default:
            return (
              <FormDossiersRestructurationV2
                activityName={selectedActivity.label}
                onClose={handleCloseActivityModal}
                onSave={handleActivitySave}
              />
            );
        }

      // ========== CRÉDIT PROGRAMME (DA) ==========
      case 'credit-programme':
        return (
          <FormDossiersRestructurationV2
            activityName={selectedActivity.label}
            onClose={handleCloseActivityModal}
            onSave={handleActivitySave}
          />
        );

      // ========== ADMINISTRATION ENGAGEMENTS (DA) ==========
      case 'admin-engagements':
        return <FormAdminEngagementsAnalyse {...commonProps} />;

      // ========== SUIVI MEP (DA) ==========
      case 'suivi-mep':
        return <FormSuiviMEP {...commonProps} />;

      // ========== SITUATION MEP (DSE) ==========
      case 'situation-mep-dse':
        return <SimpleActivityForm {...commonProps} />;

      // ========== ACCORDS (DSE) ==========
      case 'accords-dse':
        return <SimpleActivityForm {...commonProps} />;

      // ========== CONTRATS (DSE) ==========
      case 'contrats-dse':
        return <SimpleActivityForm {...commonProps} />;

      // ========== RESTRUCTURATION (DPNP) ==========
      case 'restructuration-dpnp':
        return (
          <FormDossiersRestructurationV2
            activityName={selectedActivity.label}
            onClose={handleCloseActivityModal}
            onSave={handleActivitySave}
          />
        );

      // ========== ANOMALIES (DPNP) ==========
      case 'anomalies-dpnp':
        return <SimpleActivityForm {...commonProps} />;

      // ========== VISITE CLIENTÈLE (DPNP) ==========
      case 'visite-clientele':
        return <SimpleActivityForm {...commonProps} />;

      // ========== FORMATION UNITÉS (DPNP) ==========
      case 'formation-unites':
        return <SimpleActivityForm {...commonProps} />;

      // ========== RECHERCHE ANOMALIE (DPNP) ==========
      case 'recherche-anomalie':
        return <SimpleActivityForm {...commonProps} />;

      // ========== ACTIVITÉS ANNEXES (Tous départements) ==========
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
            <p style={{ fontSize: '12px', color: '#666' }}>
              Catégorie: {category.name}<br />
              Activité: {selectedActivity.label}
            </p>
          </div>
        );
    }
  };

  return (
    <DepartmentFormWrapper>
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
        <div className="category-header-banner" style={{ borderLeftColor: '#CC0000' }}>
          <div className="category-header-content">
            <div className="category-icon-large" style={{ backgroundColor: 'rgba(204, 0, 0, 0.06)' }}>
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
                onClick={() => handleActivityClick(activity)}
                style={{
                  cursor: 'pointer',
                  borderLeftColor: '#CC0000',
                }}
              >
                <div className="activity-number" style={{ backgroundColor: '#CC0000' }}>
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
        <ModalTailwind
          isOpen={isActivityModalOpen}
          onClose={handleCloseActivityModal}
          title={selectedActivity?.label || category.name}
          size="xl"
          departmentColor="primary"
        >
          {renderActivityForm()}
        </ModalTailwind>
      </div>
    </DepartmentFormWrapper>
  );
};

export default CategoryActivitiesPage;
