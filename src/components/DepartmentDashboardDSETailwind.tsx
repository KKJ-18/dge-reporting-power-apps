import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import ModalTailwind from './ModalTailwind';

// Import des formulaires spécialisés DSE
import FormSituationMEP from './forms/FormSituationMEP';
import FormAccordsDSE from './forms/FormAccordsDSE';
import FormContratsDSE from './forms/FormContratsDSE';
import FormActivitesAnnexes from './forms/FormActivitesAnnexes';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDSEProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

type AnnexesActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';
type SituationMEPType = 'amortissables' | 'restructuration' | 'caution' | 'credoc' | 'leasing' | 'ligne-decouvert' | 'lignes-autres' | 'finance-islamique';
type AccordType = 'autorisation-mobilisation' | 'accords-classement' | 'accords-liste';
type ContratType = 'avance-facture' | 'prefinancement' | 'cautions' | 'pv-comite';

function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'situation-mep' | 'accords' | 'contrats' | 'declaration-reglementaire' | 'activites-annexes';
  specificType?: SituationMEPType | AccordType | ContratType | AnnexesActivityType;
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  if (categoryLower.includes('situation') && categoryLower.includes('place')) {
    if (activityLower.includes('amortissable')) return { formType: 'situation-mep', specificType: 'amortissables' };
    if (activityLower.includes('restructuration')) return { formType: 'situation-mep', specificType: 'restructuration' };
    if (activityLower.includes('caution')) return { formType: 'situation-mep', specificType: 'caution' };
    if (activityLower.includes('crédoc') || activityLower.includes('credoc')) return { formType: 'situation-mep', specificType: 'credoc' };
    if (activityLower.includes('leasing')) return { formType: 'situation-mep', specificType: 'leasing' };
    if (activityLower.includes('ligne') && activityLower.includes('découvert')) return { formType: 'situation-mep', specificType: 'ligne-decouvert' };
    if (activityLower.includes('ligne') && activityLower.includes('autre')) return { formType: 'situation-mep', specificType: 'lignes-autres' };
    if (activityLower.includes('islamique') || activityLower.includes('finance')) return { formType: 'situation-mep', specificType: 'finance-islamique' };
    return { formType: 'situation-mep', specificType: 'amortissables' };
  }

  if (categoryLower.includes('accord')) {
    if (activityLower.includes('autorisation') && activityLower.includes('mobilisation')) return { formType: 'accords', specificType: 'autorisation-mobilisation' };
    if (activityLower.includes('liste')) return { formType: 'accords', specificType: 'accords-liste' };
    return { formType: 'accords', specificType: 'accords-classement' };
  }

  if (categoryLower.includes('contrat')) {
    if (activityLower.includes('avance') && activityLower.includes('facture')) return { formType: 'contrats', specificType: 'avance-facture' };
    if (activityLower.includes('préfinancement') || activityLower.includes('prefinancement')) return { formType: 'contrats', specificType: 'prefinancement' };
    if (activityLower.includes('caution')) return { formType: 'contrats', specificType: 'cautions' };
    return { formType: 'contrats', specificType: 'avance-facture' };
  }

  if (categoryLower.includes('projet')) {
    return { formType: 'contrats', specificType: 'pv-comite' };
  }

  if (categoryLower.includes('déclaration') || categoryLower.includes('reglementaire')) {
    return { formType: 'declaration-reglementaire' };
  }

  if (categoryLower.includes('autre') || categoryLower.includes('activité')) {
    let activityType: AnnexesActivityType = 'etudes';
    if (activityLower.includes('visite')) activityType = 'visites';
    else if (activityLower.includes('formation')) activityType = 'formations';
    else if (activityLower.includes('étude') || activityLower.includes('etude')) activityType = 'etudes';
    else if (activityLower.includes('procédure') || activityLower.includes('procedure')) activityType = 'procedures';
    return { formType: 'activites-annexes', specificType: activityType };
  }

  return { formType: 'situation-mep', specificType: 'amortissables' };
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

    const config = detectFormType(selectedCategory.name, selectedActivity.label);
    const commonProps = {
      activityName: selectedActivity.label,
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
      departmentColor: department.color,
    };

    switch (config.formType) {
      case 'situation-mep':
        return <FormSituationMEP {...commonProps} mepType={config.specificType as SituationMEPType} />;
      case 'accords':
        return <FormAccordsDSE {...commonProps} accordType={config.specificType as AccordType} />;
      case 'contrats':
        return <FormContratsDSE {...commonProps} contratType={config.specificType as ContratType} />;
      case 'declaration-reglementaire':
        return (
          <div className="p-8 text-center bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-blue-800 font-semibold mb-2">📋 Formulaire Déclaration Réglementaire</p>
            <p className="text-blue-600 mb-4">Plateforme CNEF - TEG, FIBANE, Douane, CRE</p>
            <button 
              onClick={handleCloseActivityModal}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        );
      case 'activites-annexes':
        return <FormActivitesAnnexes {...commonProps} activityType={config.specificType as AnnexesActivityType} />;
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
          shadow-md border-l-4 border-dse-500
          flex flex-wrap items-center gap-4 lg:gap-6
        ">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center bg-dse-50 flex-shrink-0">
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
                border-t-4 border-dse-500
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
                  <span className="text-3xl font-bold text-dse-600">{category.activities.length}</span>
                  <span className="block text-sm text-neutral-500 font-medium mt-1">Activités</span>
                </div>
              </div>

              <button className="
                w-full py-3 px-4 rounded-lg
                bg-gradient-to-r from-dse-500 to-dse-600
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
          departmentColor="dse"
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
                    hover:border-dse-400 hover:translate-x-2 hover:shadow-lg hover:bg-dse-50/50
                    transition-all duration-300 ease-out
                  `}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="w-11 h-11 rounded-full flex-shrink-0 bg-gradient-to-br from-dse-500 to-dse-600 text-white font-bold flex items-center justify-center text-lg shadow-md group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-neutral-800 group-hover:text-dse-700 transition-colors">{activity.label}</h4>
                    {activity.frequency && (
                      <span className="text-sm text-neutral-500 flex items-center gap-1">🕒 {activity.frequency}</span>
                    )}
                  </div>
                  <span className="text-2xl text-dse-500 group-hover:text-dse-600 group-hover:translate-x-1 transition-all">→</span>
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
          departmentColor="dse"
        >
          {renderActivityForm()}
        </ModalTailwind>
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardDSETailwind;
