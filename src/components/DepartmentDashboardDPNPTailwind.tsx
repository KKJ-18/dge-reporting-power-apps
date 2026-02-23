import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';

// Import des formulaires spécialisés DPNP
import FormDossiersRestructurationV2 from './forms/FormDossiersRestructurationV2';
import FormSuiviAnomalies from './forms/FormSuiviAnomalies';
import FormFormationUnites from './forms/FormFormationUnites';
import FormSuiviCreancesRestructurees from './forms/FormSuiviCreancesRestructurees';
import FormSuiviClientAppele from './forms/FormSuiviClientAppele';
import FormRepriseProvision from './forms/FormRepriseProvision';
import FormRechercherClientAnomalie from './forms/FormRechercherClientAnomalie';
import FormVisiteClientele from './forms/FormVisiteClientele';
import FormActivitesAnnexes from './forms/FormActivitesAnnexes';
import SuiviRecouvrementGFC from './SuiviRecouvrementGFC';
import DepartmentCategoriesSection from './DepartmentCategoriesSection';
import ActivitySelectionModal from './ActivitySelectionModal';
import ActivityFormModal from './ActivityFormModal';
import { resolveDPNPFormType } from '../config/formResolver';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDPNPProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

type AnomaliesType = 'anomalies-leasing' | 'parc-auto' | 'tracking' | 'anomalies-proximite';

const DepartmentDashboardDPNPTailwind: React.FC<DepartmentDashboardDPNPProps> = ({ 
  department
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showActivityFormModal, setShowActivityFormModal] = useState(false);
  const [showRecouvrementView, setShowRecouvrementView] = useState(false);

  const handleCategoryClick = (category: CategoryData) => {
    // Vérifier si c'est la catégorie "Suivi des actions de recouvrement pour les GFC"

    if (category.id === 'suivi-recouvrement-gfc' || 
        category.id === 'suivi-des-actions-de-recouvrement-pour-les-gfc' ||
        category.name === 'Suivi des actions de recouvrement pour les GFC' ||
        category.name.toLowerCase().includes('suivi des actions de recouvrement')) {
      setShowRecouvrementView(true);
      return;
    }
    
    setSelectedCategory(category);
    setShowActivitiesModal(true);
  };

  const handleActivityClick = (activity: ActivityItem) => {
    // Vérifier si l'activité appartient à la catégorie recouvrement
    if (selectedCategory && 
        (selectedCategory.id === 'suivi-recouvrement-gfc' || 
         selectedCategory.name.toLowerCase().includes('suivi des actions de recouvrement'))) {
      // Fermer tous les modals et réinitialiser les états
      setShowActivitiesModal(false);
      setShowActivityFormModal(false);
      setSelectedCategory(null);
      setSelectedActivity(null);
      // Puis afficher la vue recouvrement
      setShowRecouvrementView(true);
      return;
    }
    
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

    const config = resolveDPNPFormType(selectedCategory.name, selectedActivity.label);
    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onClose: handleCloseActivityModal,
      departmentColor: '#CC0000',
    };

    switch (config.formType) {
      case 'dossiers-restructuration':
        return <FormDossiersRestructurationV2 {...commonProps} specificType={config.specificType || 'reception-dossiers'} />;
      case 'suivi-anomalies':
        return <FormSuiviAnomalies {...commonProps} specificType={config.specificType as AnomaliesType} />;
      case 'formation-unites':
        return <FormFormationUnites {...commonProps} />;
      case 'suivi-creances-restructurees':
        return <FormSuiviCreancesRestructurees {...commonProps} />;
      case 'suivi-client-appele':
        return <FormSuiviClientAppele {...commonProps} />;
      case 'reprise-provision':
        return <FormRepriseProvision {...commonProps} specificType={config.specificType as string} />;
      case 'rechercher-client-anomalie':
        return <FormRechercherClientAnomalie {...commonProps} specificType={config.specificType as string} />;
      case 'visite-clientele':
        return <FormVisiteClientele {...commonProps} />;
      case 'activites-annexes':
        return <FormActivitesAnnexes 
          activityName={selectedActivity.label}
          onSave={handleActivitySave}
          onCancel={handleCloseActivityModal}
          activityType={(config.specificType as string === 'visites-clienteles' ? 'visites' : config.specificType) as 'visites' | 'procedures' | 'etudes' | 'autres-activites'} 
        />;
      default:
        return (
          <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-400 rounded-xl">
            <p className="text-yellow-800">⚠️ Type de formulaire inconnu: {config.formType}</p>
          </div>
        );
    }
  };

  // Afficher SuiviRecouvrementGFC si sélectionné
  if (showRecouvrementView) {
    return <SuiviRecouvrementGFC onClose={() => setShowRecouvrementView(false)} />;
  }

  return (
    <DepartmentFormWrapper>
      <div className="space-y-6">
        <DepartmentCategoriesSection
          department={department}
          onCategoryClick={handleCategoryClick}
        />

        <ActivitySelectionModal
          isOpen={showActivitiesModal}
          onClose={handleCloseActivitiesModal}
          title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
          activities={selectedCategory?.activities || []}
          onSelect={handleActivityClick}
        />

        <ActivityFormModal
          isOpen={showActivityFormModal}
          onClose={handleCloseActivityModal}
          title={selectedActivity?.label || 'Saisie activité'}
        >
          {renderActivityForm()}
        </ActivityFormModal>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardDPNPTailwind;
