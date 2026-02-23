import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';

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
import DepartmentCategoriesSection from './DepartmentCategoriesSection';
import ActivitySelectionModal from './ActivitySelectionModal';
import ActivityFormModal from './ActivityFormModal';
import { resolveAnalyseFormType } from '../config/formResolver';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardAnalyseProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
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

    const config = resolveAnalyseFormType(selectedCategory.name, selectedActivity.label);
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

  return (
    <DepartmentFormWrapper>
      <div className="space-y-6">
        <DepartmentCategoriesSection
          department={department}
          onCategoryClick={handleCategoryClick}
        />

        <ActivitySelectionModal
          isOpen={isCategoryModalOpen}
          onClose={handleCloseCategoryModal}
          title={selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : ''}
          activities={selectedCategory?.activities || []}
          onSelect={handleActivityClick}
        />

        <ActivityFormModal
          isOpen={isActivityModalOpen}
          onClose={handleCloseActivityModal}
          title={selectedActivity?.label || 'Saisie activité'}
        >
          {renderActivityForm()}
        </ActivityFormModal>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardAnalyseTailwind;
