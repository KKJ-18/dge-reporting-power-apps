import React, { useState } from 'react';
import { DepartmentData, CategoryData, ActivityItem } from '../config/departmentsData';
import { UserProfile } from '../services/UserProfileService';
import { useObjectifValidation } from '../hooks/useObjectifValidation';
import Modal from './Modal';

// Import des formulaires spécialisés DSE
import FormSituationMEP from '../components/forms/FormSituationMEP';
import FormAccordsDSE from '../components/forms/FormAccordsDSE';
import FormContratsDSE from '../components/forms/FormContratsDSE';
import FormActivitesAnnexes from '../components/forms/FormActivitesAnnexes';

import './DepartmentDashboard.css';

import { DepartmentFormWrapper } from './forms/DepartmentFormWrapper';

interface DepartmentDashboardDSEProps {
  department: DepartmentData;
  userProfile: UserProfile;
  onNavigateToObjectifs?: () => void;
}

/**
 * Type pour les activités annexes (compatible avec FormActivitesAnnexes)
 */
type AnnexesActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';

/**
 * Mapping des types de Situation MEP
 */
type SituationMEPType = 
  | 'amortissables'
  | 'restructuration'
  | 'caution'
  | 'credoc'
  | 'leasing'
  | 'ligne-decouvert'
  | 'lignes-autres'
  | 'finance-islamique';

/**
 * Mapping des types d'Accords
 */
type AccordType = 
  | 'autorisation-mobilisation'
  | 'accords-classement'
  | 'accords-liste';

/**
 * Mapping des types de Contrats (inclut aussi Projets qui utilise la même table)
 */
type ContratType = 
  | 'avance-facture'
  | 'prefinancement'
  | 'cautions'
  | 'pv-comite';  // ✅ PV du comité de crédit (Projets)

/**
 * Détecte automatiquement le type de formulaire basé sur la catégorie et le nom de l'activité
 */
function detectFormType(categoryName: string, activityLabel: string): {
  formType: 'situation-mep' | 'accords' | 'contrats' | 'declaration-reglementaire' | 'activites-annexes';
  specificType?: SituationMEPType | AccordType | ContratType | AnnexesActivityType;
} {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // ========================================
  // SITUATION MISE EN PLACE (8 types)
  // ========================================
  if (categoryLower.includes('situation') && categoryLower.includes('place')) {
    if (activityLower.includes('amortissable')) {
      return { formType: 'situation-mep', specificType: 'amortissables' };
    }
    if (activityLower.includes('restructuration')) {
      return { formType: 'situation-mep', specificType: 'restructuration' };
    }
    if (activityLower.includes('caution')) {
      return { formType: 'situation-mep', specificType: 'caution' };
    }
    if (activityLower.includes('crédoc') || activityLower.includes('credoc')) {
      return { formType: 'situation-mep', specificType: 'credoc' };
    }
    if (activityLower.includes('leasing')) {
      return { formType: 'situation-mep', specificType: 'leasing' };
    }
    if (activityLower.includes('ligne') && activityLower.includes('découvert')) {
      return { formType: 'situation-mep', specificType: 'ligne-decouvert' };
    }
    if (activityLower.includes('ligne') && activityLower.includes('autre')) {
      return { formType: 'situation-mep', specificType: 'lignes-autres' };
    }
    if (activityLower.includes('islamique') || activityLower.includes('finance')) {
      return { formType: 'situation-mep', specificType: 'finance-islamique' };
    }
    // Par défaut
    return { formType: 'situation-mep', specificType: 'amortissables' };
  }

  // ========================================
  // ACCORDS DE CLASSEMENT (3 types)
  // ========================================
  if (categoryLower.includes('accord')) {
    if (activityLower.includes('autorisation') && activityLower.includes('mobilisation')) {
      return { formType: 'accords', specificType: 'autorisation-mobilisation' };
    }
    if (activityLower.includes('liste')) {
      return { formType: 'accords', specificType: 'accords-liste' };
    }
    // Par défaut : Accords de Classement
    return { formType: 'accords', specificType: 'accords-classement' };
  }

  // ========================================
  // CONTRATS (3 types)
  // ========================================
  if (categoryLower.includes('contrat')) {
    if (activityLower.includes('avance') && activityLower.includes('facture')) {
      return { formType: 'contrats', specificType: 'avance-facture' };
    }
    if (activityLower.includes('préfinancement') || activityLower.includes('prefinancement')) {
      return { formType: 'contrats', specificType: 'prefinancement' };
    }
    if (activityLower.includes('caution')) {
      return { formType: 'contrats', specificType: 'cautions' };
    }
    return { formType: 'contrats', specificType: 'avance-facture' };
  }

  // ========================================
  // PROJETS (PV comité de crédit) - utilise la table Contrats
  // ========================================
  if (categoryLower.includes('projet')) {
    return { formType: 'contrats', specificType: 'pv-comite' };  // ✅ Utilise FormContratsDSE avec type pv-comite
  }

  // ========================================
  // DÉCLARATION RÉGLEMENTAIRE
  // ========================================
  if (categoryLower.includes('déclaration') || categoryLower.includes('reglementaire')) {
    return { formType: 'declaration-reglementaire' };
  }

  // ========================================
  // AUTRES ACTIVITÉS (Visites, Formations, Etudes, etc.)
  // ========================================
  if (categoryLower.includes('autre') || categoryLower.includes('activité')) {
    let activityType: AnnexesActivityType = 'etudes';
    
    if (activityLower.includes('visite')) activityType = 'visites';
    else if (activityLower.includes('formation')) activityType = 'formations';
    else if (activityLower.includes('étude') || activityLower.includes('etude')) activityType = 'etudes';
    else if (activityLower.includes('procédure') || activityLower.includes('procedure')) activityType = 'procedures';

    return { formType: 'activites-annexes', specificType: activityType };
  }

  // Par défaut
  return { formType: 'situation-mep', specificType: 'amortissables' };
}

const DepartmentDashboardDSE: React.FC<DepartmentDashboardDSEProps> = ({ 
  department,
  onNavigateToObjectifs
  // userProfile disponible mais non utilisé pour l'instant
}) => {
  const { isValidating, validateBeforeSubmit } = useObjectifValidation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [showActivityFormModal, setShowActivityFormModal] = useState(false);
  const [showObjectifAlert, setShowObjectifAlert] = useState(false);

  const handleCategoryClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setShowActivitiesModal(true);
  };

  const handleActivityClickWithValidation = async (activity: ActivityItem) => {
    // Valider les objectifs avant d'ouvrir le formulaire
    const today = new Date();
    const isValid = await validateBeforeSubmit(activity.label as any, today);
    
    if (!isValid) {
      setShowObjectifAlert(true);
      return; // ❌ Bloquer l'ouverture du formulaire
    }

    // ✅ Objectifs validés - Ouvrir le formulaire
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
      onSave: handleActivitySave,
      onCancel: handleCloseActivityModal,
      departmentColor: department.color,  // ✅ Passer la couleur
    };

    switch (config.formType) {
      case 'situation-mep':
        return (
          <FormSituationMEP
            {...commonProps}
            mepType={config.specificType as SituationMEPType}
          />
        );

      case 'accords':
        return (
          <FormAccordsDSE
            {...commonProps}
            accordType={config.specificType as AccordType}
          />
        );

      case 'contrats':
        // Gère aussi 'pv-comite' (Projets) car ils utilisent la même table
        return (
          <FormContratsDSE
            {...commonProps}
            contratType={config.specificType as ContratType}
          />
        );

      case 'declaration-reglementaire':
        // TODO: Créer un formulaire spécifique pour les déclarations
        return (
          <div className="form-info">
            <p>📋 Formulaire Déclaration Réglementaire</p>
            <p>Plateforme CNEF - TEG, FIBANE, Douane, CRE</p>
            <button onClick={handleCloseActivityModal}>Fermer</button>
          </div>
        );

      case 'activites-annexes':
        return (
          <FormActivitesAnnexes
            {...commonProps}
            activityType={config.specificType as AnnexesActivityType}
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
                onClick={() => handleActivityClickWithValidation(activity)}
                style={{ cursor: isValidating ? 'wait' : 'pointer', opacity: isValidating ? 0.6 : 1 }}
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
        isOpen={showActivityFormModal}
        onClose={handleCloseActivityModal}
        title=""
        size="xl"
        hideHeader
      >
        {renderActivityForm()}
      </Modal>

      {/* Modal: Alerte Objectifs Manquants */}
      {showObjectifAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem)',
            maxWidth: '550px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '3px solid #F59E0B',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <div style={{ 
              fontSize: '5rem', 
              marginBottom: '1.5rem',
              animation: 'bounce 0.6s ease-in-out',
            }}>⚠️</div>
            <h3 style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', 
              fontWeight: '800', 
              color: '#F59E0B',
              marginBottom: '1rem',
              letterSpacing: '-0.02em',
            }}>
              Objectifs Requis
            </h3>
            <p style={{ 
              color: '#6B7280', 
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              lineHeight: '1.7',
              marginBottom: '2.5rem',
              maxWidth: '420px',
              margin: '0 auto 2.5rem',
            }}>
              Vous devez <strong style={{ color: '#374151' }}>définir vos objectifs de la journée</strong> avant de remplir vos activités. 
              Accédez au module Objectifs pour commencer.
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center', 
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setShowObjectifAlert(false)}
                style={{
                  padding: '1rem 2rem',
                  border: '2px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: '#F9FAFB',
                  color: '#6B7280',
                  transition: 'all 0.2s ease',
                  minWidth: '120px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowObjectifAlert(false);
                  if (onNavigateToObjectifs) {
                    onNavigateToObjectifs();
                  }
                }}
                style={{
                  padding: '1rem 2.5rem',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: '#F59E0B',
                  color: '#FFFFFF',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
                  minWidth: '180px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F59E0B';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.3)';
                }}
              >
                📋 Définir mes objectifs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de chargement pendant validation */}
      {isValidating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '2rem 3rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #F3F4F6',
              borderTop: '4px solid #F59E0B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ 
              color: '#6B7280', 
              fontSize: '1rem',
              fontWeight: '600',
              margin: 0,
            }}>
              Vérification des objectifs...
            </p>
          </div>
        </div>
      )}
      </div>
    </DepartmentFormWrapper>
  );
};

export default DepartmentDashboardDSE;
