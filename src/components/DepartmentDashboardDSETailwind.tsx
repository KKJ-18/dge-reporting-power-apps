import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';

// Import des formulaires spécialisés DSE (réforme)
import FormSuiviMisesEnPlace from './forms/FormSuiviMisesEnPlace';
import FormAIMDSE from './forms/FormAIMDSE';
import FormContratsDSE from './forms/FormContratsDSE';
import FormProjetsDSE from './forms/FormProjetsDSE';
import FormDeclarationReglementaire from './forms/FormDeclarationReglementaire';
import FormAutresActivitesDSE from './forms/FormAutresActivitesDSE';
import DepartmentCategoriesSection from './DepartmentCategoriesSection';
import ActivitySelectionModal from './ActivitySelectionModal';
import ActivityFormModal from './ActivityFormModal';
import { resolveDSEFormType } from '../config/formResolver';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDSEProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

const DepartmentDashboardDSETailwind: React.FC<DepartmentDashboardDSEProps> = ({ 
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

    const config = resolveDSEFormType(selectedCategory.name, selectedActivity.label);
    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onClose: handleCloseActivityModal,
      departmentColor: '#107c10',
    };

    switch (config.formType) {
      case 'suivi-mises-en-place':
        return <FormSuiviMisesEnPlace {...commonProps} specificType={config.specificType as any} />;
      case 'aim':
        return <FormAIMDSE {...commonProps} specificType={config.specificType as any} />;
      case 'contrats':
        return <FormContratsDSE 
          activityName={selectedActivity.label}
          contratType={config.specificType as any}
          onSave={handleActivitySave}
          onClose={handleCloseActivityModal}
          departmentColor="#107c10"
        />;
      case 'projets':
        return <FormProjetsDSE {...commonProps} specificType={config.specificType as any} />;
      case 'declaration-reglementaire':
        return <FormDeclarationReglementaire {...commonProps} specificType={config.specificType as any} />;
      case 'autres-activites':
        return <FormAutresActivitesDSE {...commonProps} specificType={config.specificType as any} />;
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

export default DepartmentDashboardDSETailwind;
