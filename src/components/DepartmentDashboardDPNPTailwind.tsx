import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import ModalTailwind from './ModalTailwind';

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

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDPNPProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

type DossiersRestructurationType = 'dossiers-recus' | 'dossiers-complements' | 'dossier-analyse' | 'dossier-attente-comite' | 'dossier-attente-decision' | 'dossier-accord' | 'dossier-renvoye' | 'dossier-avis-conformite' | 'attente-comite-credit' | 'remboursement-echeance';
type AnomaliesType = 'anomalies-tresorerie' | 'anomalies-leasing';
type DepassementType = 'nombre-depassement' | 'depassement-regularise-72h' | 'depassement-attente-regularisation';

function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'dossiers-restructuration' | 'suivi-anomalies' | 'formation-unites' | 'suivi-depassements' | 'suivi-client-appele' | 'reprise-provision' | 'volume-provisions' | 'rechercher-client-anomalie' | 'visite-clientele' | 'activites-annexes';
  specificType?: string;
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  if (categoryLower.includes('restructuration')) {
    if (activityLower.includes('dossiers reçus') || activityLower.includes('dossiers recus')) return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
    if (activityLower.includes('compléments') || activityLower.includes('complements')) return { formType: 'dossiers-restructuration', specificType: 'dossiers-complements' };
    if (activityLower.includes('cours d\'analyse')) return { formType: 'dossiers-restructuration', specificType: 'dossier-analyse' };
    if (activityLower.includes('attente de comité')) return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-comite' };
    if (activityLower.includes('attente de décision')) return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-decision' };
    if (activityLower.includes('accord') && !activityLower.includes('attente')) return { formType: 'dossiers-restructuration', specificType: 'dossier-accord' };
    if (activityLower.includes('renvoyé') || activityLower.includes('renvoye')) return { formType: 'dossiers-restructuration', specificType: 'dossier-renvoye' };
    if (activityLower.includes('avis') && activityLower.includes('conformité')) return { formType: 'dossiers-restructuration', specificType: 'dossier-avis-conformite' };
    if (activityLower.includes('attente du comité')) return { formType: 'dossiers-restructuration', specificType: 'attente-comite-credit' };
    if (activityLower.includes('remboursement') || activityLower.includes('échéance')) return { formType: 'dossiers-restructuration', specificType: 'remboursement-echeance' };
    return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
  }

  if (categoryLower.includes('recherche') || categoryLower.includes('risque canada')) {
    if (activityLower.includes('pays de résidence')) return { formType: 'rechercher-client-anomalie', specificType: 'pays-residence' };
    if (activityLower.includes('employeur')) return { formType: 'rechercher-client-anomalie', specificType: 'employeur' };
    if (activityLower.includes('ville de résidence')) return { formType: 'rechercher-client-anomalie', specificType: 'ville-residence' };
    return { formType: 'rechercher-client-anomalie', specificType: 'nombre-clients-anomalies' };
  }

  if (categoryLower.includes('anomalie')) {
    if (activityLower.includes('leasing')) return { formType: 'suivi-anomalies', specificType: 'anomalies-leasing' };
    return { formType: 'suivi-anomalies', specificType: 'anomalies-tresorerie' };
  }

  if (categoryLower.includes('proximité') || categoryLower.includes('formation des unités')) {
    return { formType: 'formation-unites' };
  }

  if (categoryLower.includes('débit') || categoryLower.includes('depassement')) {
    if (activityLower.includes('régularisé') || activityLower.includes('72h')) return { formType: 'suivi-depassements', specificType: 'depassement-regularise-72h' };
    if (activityLower.includes('attente de régularisation')) return { formType: 'suivi-depassements', specificType: 'depassement-attente-regularisation' };
    return { formType: 'suivi-depassements', specificType: 'nombre-depassement' };
  }

  if (categoryLower.includes('recouvrement') || activityLower.includes('clients appelés')) {
    return { formType: 'suivi-client-appele' };
  }

  if (categoryLower.includes('contagion')) {
    if (activityLower.includes('comptes à nettoyer')) return { formType: 'reprise-provision', specificType: 'comptes-nettoyer' };
    if (activityLower.includes('montant global à verser')) return { formType: 'reprise-provision', specificType: 'montant-regulariser' };
    if (activityLower.includes('reprise de provision')) return { formType: 'reprise-provision', specificType: 'reprise-provision' };
    return { formType: 'reprise-provision', specificType: 'comptes-nettoyer' };
  }

  if (categoryLower.includes('provision')) {
    if (activityLower.includes('reprise')) return { formType: 'volume-provisions', specificType: 'volume-reprises-provision' };
    return { formType: 'volume-provisions', specificType: 'volume-provisions' };
  }

  if (categoryLower.includes('activités annexes')) {
    if (activityLower.includes('visite')) return { formType: 'activites-annexes', specificType: 'visites-clienteles' };
    if (activityLower.includes('formation')) return { formType: 'activites-annexes', specificType: 'formations' };
    if (activityLower.includes('procédure') || activityLower.includes('procedure')) return { formType: 'activites-annexes', specificType: 'procedures' };
    if (activityLower.includes('étude') || activityLower.includes('etude')) return { formType: 'activites-annexes', specificType: 'etudes' };
    return { formType: 'activites-annexes', specificType: 'autres-activites' };
  }

  return { formType: 'dossiers-restructuration', specificType: 'dossiers-recus' };
}

const DepartmentDashboardDPNPTailwind: React.FC<DepartmentDashboardDPNPProps> = ({ 
  department
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
  };

  const renderActivityForm = () => {
    if (!selectedActivity || !selectedCategory) return null;

    const config = detectFormType(selectedCategory.name, selectedActivity.label);
    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onClose: handleCloseActivityModal,
      departmentColor: department.color,
    };

    switch (config.formType) {
      case 'dossiers-restructuration':
        return <FormDossiersRestructuration {...commonProps} specificType={config.specificType as DossiersRestructurationType} />;
      case 'suivi-anomalies':
        return <FormSuiviAnomalies {...commonProps} specificType={config.specificType as AnomaliesType} />;
      case 'formation-unites':
        return <FormFormationUnites {...commonProps} />;
      case 'suivi-depassements':
        return <FormSuiviDepassements {...commonProps} specificType={config.specificType as DepassementType} />;
      case 'suivi-client-appele':
        return <FormSuiviClientAppele {...commonProps} />;
      case 'reprise-provision':
        return <FormRepriseProvision {...commonProps} specificType={config.specificType as string} />;
      case 'volume-provisions':
        return <FormVolumeProvisions {...commonProps} specificType={config.specificType as string} />;
      case 'rechercher-client-anomalie':
        return <FormRechercherClientAnomalie {...commonProps} specificType={config.specificType as string} />;
      case 'visite-clientele':
        return <FormVisiteClientele {...commonProps} />;
      case 'activites-annexes':
        return <FormActivitesAnnexes 
          activityName={selectedActivity.label}
          onSave={handleActivitySave}
          onCancel={handleCloseActivityModal}
          activityType={(config.specificType as string === 'visites-clienteles' ? 'visites' : config.specificType) as 'visites' | 'formations' | 'procedures' | 'etudes'} 
        />;
      default:
        return (
          <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-400 rounded-xl">
            <p className="text-yellow-800">⚠️ Type de formulaire inconnu: {config.formType}</p>
          </div>
        );
    }
  };

  return (
    <DepartmentFormWrapper departmentColor={department.color}>
      <div className="space-y-6">
        {/* Header */}
        <div className="
          bg-white rounded-2xl p-5 lg:p-6
          shadow-md border-l-4 border-dpnp-500
          flex flex-wrap items-center gap-4 lg:gap-6
        ">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center bg-dpnp-50 flex-shrink-0">
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
              className="
                bg-white rounded-xl p-5 cursor-pointer
                border-t-4 border-dpnp-500
                shadow-md hover:shadow-xl
                transform hover:-translate-y-1
                transition-all duration-300
                flex flex-col gap-4
              "
              onClick={() => handleCategoryClick(category)}
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl">{category.icon}</span>
                <h3 className="text-lg font-semibold text-neutral-800 flex-1 leading-tight">
                  {category.name}
                </h3>
              </div>

              <div className="py-4 border-y border-neutral-100">
                <div className="text-center">
                  <span className="text-3xl font-bold text-dpnp-600">{category.activities.length}</span>
                  <span className="block text-sm text-neutral-500 font-medium mt-1">Activités</span>
                </div>
              </div>

              <button className="
                w-full py-3 px-4 rounded-lg
                bg-gradient-to-r from-dpnp-500 to-dpnp-600
                text-white font-semibold
                hover:opacity-90 hover:scale-[1.02]
                transition-all duration-200
                flex items-center justify-center gap-2
              ">
                <span>📝</span>
                <span>Voir les activités</span>
              </button>
            </div>
          ))}
        </div>

        {/* Modal: Activities List */}
        <ModalTailwind
          isOpen={showActivitiesModal}
          onClose={handleCloseActivitiesModal}
          title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
          size="lg"
          departmentColor="dpnp"
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
                    hover:border-dpnp-400 hover:translate-x-2 hover:shadow-lg hover:bg-dpnp-50/50
                    transition-all duration-300 ease-out
                  `}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-dpnp-500 to-dpnp-600 text-white font-bold flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-800 group-hover:text-dpnp-700 transition-colors">{activity.label}</h4>
                    {activity.frequency && (
                      <span className="text-sm text-neutral-500 flex items-center gap-1">🕒 {activity.frequency}</span>
                    )}
                  </div>
                  <span className="text-2xl text-dpnp-500 group-hover:text-dpnp-600 group-hover:translate-x-1 transition-all">→</span>
                </div>
              ))}
            </div>
          </div>
        </ModalTailwind>

        {/* Modal: Activity Form */}
        <ModalTailwind
          isOpen={showActivityFormModal}
          onClose={handleCloseActivityModal}
          title=""
          size="xl"
          hideHeader
          departmentColor="dpnp"
        >
          {renderActivityForm()}
        </ModalTailwind>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardDPNPTailwind;
