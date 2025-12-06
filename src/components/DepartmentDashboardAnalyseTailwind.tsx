import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import ModalTailwind from './ModalTailwind';

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

  // Crédit Classique - Mapping individuel
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

const DepartmentDashboardAnalyseTailwind: React.FC<DepartmentDashboardAnalyseProps> = ({ 
  department
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
  };

  const renderActivityForm = () => {
    if (!selectedActivity || !selectedCategory) return null;

    const config = detectFormType(selectedCategory.name, selectedActivity.label);
    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
    };

    switch (config.formType) {
      case 'credit-classique':
        switch (config.creditClassiqueType) {
          case 'dossiers-recus': return <FormDossiersRecus {...commonProps} />;
          case 'dossiers-comites': return <FormDossiersComites {...commonProps} />;
          case 'far': return <FormFAR {...commonProps} />;
          case 'notes-circulation': return <FormNotesCirculation {...commonProps} />;
          case 'dossiers-analyse': return <FormDossiersAnalyse {...commonProps} />;
          case 'dossiers-risque': return <FormDossiersRisque {...commonProps} />;
          case 'dossiers-renvoyes': return <FormDossiersRenvoyes {...commonProps} />;
          case 'dossiers-conformite': return <FormDossiersConformite {...commonProps} />;
          case 'dossiers-attente-comite': return <FormDossiersAttenteComite {...commonProps} />;
          case 'scrg': return <FormSCRG {...commonProps} />;
          case 'suivi-regularisation': return <FormSuiviRegularisation {...commonProps} />;
          case 'delais-credit': return <FormDelaisCreditClassique {...commonProps} />;
          default: return <FormDossiersRecus {...commonProps} />;
        }
      case 'suivi-transmission':
        return <FormSuiviTransmission {...commonProps} requiresComite={config.props?.requiresComite || false} />;
      case 'evaluation-delais':
        return <FormEvaluationDelais {...commonProps} />;
      case 'admin-engagements':
        return <FormAdminEngagementsAnalyse {...commonProps} />;
      case 'suivi-mep':
        return <FormSuiviMEP {...commonProps} />;
      case 'activites-annexes':
        return <FormActivitesAnnexes {...commonProps} activityType={config.props?.activityType || 'visites'} />;
      default:
        return (
          <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-400 rounded-xl">
            <p className="text-yellow-800">⚠️ Type de formulaire inconnu: {config.formType}</p>
          </div>
        );
    }
  };

  // Déterminer la couleur du département
  const getDepartmentColorClass = () => {
    const id = department.id.toLowerCase();
    if (id.includes('da') || id.includes('analyse')) return 'da';
    if (id.includes('dse') || id.includes('suivi')) return 'dse';
    if (id.includes('dpnp') || id.includes('partenariat')) return 'dpnp';
    return 'primary';
  };

  const colorClass = getDepartmentColorClass();
  const borderColors: Record<string, string> = {
    da: 'border-da-500',
    dse: 'border-dse-500',
    dpnp: 'border-dpnp-500',
    primary: 'border-primary-500'
  };
  const bgColors: Record<string, string> = {
    da: 'bg-da-50',
    dse: 'bg-dse-50',
    dpnp: 'bg-dpnp-50',
    primary: 'bg-primary-50'
  };
  const gradientColors: Record<string, string> = {
    da: 'from-da-500 to-da-600',
    dse: 'from-dse-500 to-dse-600',
    dpnp: 'from-dpnp-500 to-dpnp-600',
    primary: 'from-primary-500 to-primary-600'
  };
  const textColors: Record<string, string> = {
    da: 'text-da-600',
    dse: 'text-dse-600',
    dpnp: 'text-dpnp-600',
    primary: 'text-primary-600'
  };

  return (
    <DepartmentFormWrapper departmentColor={department.color}>
      <div className="space-y-6">
        {/* Header */}
        <div className={`
          bg-white rounded-2xl p-5 lg:p-6
          shadow-md border-l-4 ${borderColors[colorClass]}
          flex flex-wrap items-center gap-4 lg:gap-6
        `}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`
              w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center flex-shrink-0
              ${bgColors[colorClass]}
            `}>
              <span className="text-3xl lg:text-4xl">{department.icon}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-neutral-800 mb-1 truncate">
                {department.fullName}
              </h1>
              <p className="text-neutral-500 text-sm lg:text-base">
                {department.categories.length} catégories • {' '}
                {department.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {department.categories.map((category) => (
            <div
              key={category.id}
              className={`
                bg-white rounded-xl p-5 cursor-pointer
                border-t-4 ${borderColors[colorClass]}
                shadow-md hover:shadow-xl
                transform hover:-translate-y-1
                transition-all duration-300
                flex flex-col gap-4
              `}
              onClick={() => handleCategoryClick(category)}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <h3 className="text-lg font-semibold text-neutral-800 flex-1 leading-tight">
                  {category.name}
                </h3>
              </div>

              {/* Stats */}
              <div className="py-4 border-y border-neutral-100">
                <div className="text-center">
                  <span className={`text-3xl font-bold ${textColors[colorClass]}`}>
                    {category.activities.length}
                  </span>
                  <span className="block text-sm text-neutral-500 font-medium mt-1">
                    Activités
                  </span>
                </div>
              </div>

              {/* Footer Button */}
              <button className={`
                w-full py-3 px-4 rounded-lg
                bg-gradient-to-r ${gradientColors[colorClass]}
                text-white font-semibold
                hover:opacity-90 hover:scale-[1.02]
                transition-all duration-200
                flex items-center justify-center gap-2
              `}>
                <span>📝</span>
                <span>Voir les activités</span>
              </button>
            </div>
          ))}
        </div>

        {/* Modal: Activities List */}
        <ModalTailwind
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
          size="lg"
          departmentColor={colorClass as any}
        >
          <div className="py-4">
            <p className="text-center text-neutral-600 mb-6">
              Sélectionnez une activité pour saisir les données
            </p>
            
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-3 scrollbar-thin">
              {selectedCategory?.activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={`
                    flex items-center gap-4 p-4
                    bg-gradient-to-r from-neutral-50 to-white
                    border-2 border-neutral-200 rounded-xl
                    cursor-pointer group
                    hover:border-da-400 hover:translate-x-2 hover:shadow-lg hover:bg-da-50/50
                    transition-all duration-300 ease-out
                  `}
                  onClick={() => handleActivityClick(activity)}
                >
                  {/* Number Badge */}
                  <div className={`
                    w-11 h-11 rounded-full flex-shrink-0
                    bg-gradient-to-br ${gradientColors[colorClass]}
                    text-white font-bold flex items-center justify-center
                    text-lg shadow-md group-hover:scale-110 transition-transform
                  `}>
                    {index + 1}
                  </div>

                  {/* Activity Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-800 group-hover:text-da-700 transition-colors">
                      {activity.label}
                    </h4>
                    {activity.frequency && (
                      <span className="text-sm text-neutral-500 flex items-center gap-1">
                        🕒 {activity.frequency}
                      </span>
                    )}
                  </div>

                  {/* Arrow */}
                  <span className={`text-2xl ${textColors[colorClass]} group-hover:translate-x-1 transition-all`}>
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ModalTailwind>

        {/* Modal: Activity Form */}
        <ModalTailwind
          isOpen={isActivityModalOpen}
          onClose={handleCloseActivityModal}
          title=""
          size="xl"
          hideHeader
          departmentColor={colorClass as any}
        >
          {renderActivityForm()}
        </ModalTailwind>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardAnalyseTailwind;
