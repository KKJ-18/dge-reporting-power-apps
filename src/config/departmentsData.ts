/**
 * Configuration des départements et leurs activités
 * 
 * Les données sont chargées dynamiquement depuis la table SharePoint "Activity"
 * via DepartmentActivitiesService
 */

import { DepartmentActivitiesService } from '../services/DepartmentActivitiesService';

export type Departement = 'DA' | 'DSE' | 'DPNP' | null;

export type ActivityFrequency = 'Journalière' | 'Hebdomadaire' | 'Mensuelle' | 'Semestrielle';

// Compatibilité avec l'ancienne structure
export interface ActivityItem {
  id: string;
  label: string;
  unit?: string;
  type?: 'number' | 'amount' | 'text' | 'date';
  frequency?: ActivityFrequency;
}

export interface CategoryData {
  id: string;
  name: string;
  activities: ActivityItem[];
  icon?: string;
}

export interface DepartmentData {
  id: 'DA' | 'DSE' | 'DPNP';
  name: string;
  fullName: string;
  icon: string;
  color: string;
  categories: CategoryData[];
}

/**
 * Données de fallback pour les catégories (utilisées si SharePoint échoue)
 */
const FALLBACK_CATEGORIES: Record<'DA' | 'DSE' | 'DPNP', CategoryData[]> = {
  DA: [
    {
      id: 'credit-classique',
      name: 'Crédit classique',
      icon: '💰',
      activities: [
        { id: 'dossiers-recus', label: 'Dossiers reçus des unités', frequency: 'Journalière' },
        { id: 'dossiers-comites', label: 'Dossiers présentés aux comités', frequency: 'Hebdomadaire' },
        { id: 'far', label: 'FAR', frequency: 'Journalière' },
        { id: 'notes-circulation', label: 'Notes de circulation', frequency: 'Journalière' },
      ]
    },
    {
      id: 'credit-programme',
      name: 'Crédit programme',
      icon: '🎯',
      activities: [
        { id: 'suivi-programme', label: 'Suivi des programmes', frequency: 'Journalière' },
      ]
    },
    {
      id: 'activites-annexes',
      name: 'Activités annexes',
      icon: '📎',
      activities: [
        { id: 'visites', label: 'Visites terrain', frequency: 'Hebdomadaire' },
        { id: 'formations', label: 'Formations', frequency: 'Mensuelle' },
      ]
    }
  ],
  DSE: [
    {
      id: 'suivi-mises-en-place',
      name: 'Suivi des mises en place',
      icon: '✅',
      activities: [
        { id: 'particulier-identifier', label: 'Particulier — Identifier les non-conformités sur les MEP', frequency: 'Journalière' },
        { id: 'particulier-regulariser', label: 'Particulier — Régulariser les anomalies détectées', frequency: 'Journalière' },
        { id: 'entreprise-identifier', label: 'Entreprise — Identifier les non-conformités sur les MEP', frequency: 'Journalière' },
        { id: 'entreprise-regulariser', label: 'Entreprise — Régulariser les anomalies détectées', frequency: 'Journalière' },
      ]
    },
    {
      id: 'aim',
      name: 'AIM — Autorisation Individuelle de Mobilisation',
      icon: '📝',
      activities: [
        { id: 'aim-analyse', label: 'Analyse', frequency: 'Journalière' },
        { id: 'aim-depot-beac', label: 'Dépôt des dossiers auprès de la BEAC', frequency: 'Journalière' },
        { id: 'aim-reponses-beac', label: 'Réponses courrier de la BEAC', frequency: 'Journalière' },
        { id: 'aim-maj-beac', label: 'Mise à jour des dossiers déposés à la BEAC', frequency: 'Hebdomadaire' },
      ]
    },
    {
      id: 'contrats',
      name: 'Contrats',
      icon: '📄',
      activities: [
        { id: 'avance-facture', label: 'Avance sur facture — Surveillance', frequency: 'Journalière' },
        { id: 'prefinancement', label: 'Préfinancement — Surveillance', frequency: 'Journalière' },
        { id: 'cautions', label: 'Cautions — Surveillance', frequency: 'Journalière' },
      ]
    },
    {
      id: 'projets',
      name: 'Projets',
      icon: '🚀',
      activities: [
        { id: 'recensement-projets', label: 'Recensement des projets (PV comité)', frequency: 'Hebdomadaire' },
        { id: 'suivi-decaissements', label: 'Suivi des décaissements (PV comité)', frequency: 'Hebdomadaire' },
        { id: 'suivi-taux-avancement', label: 'Suivi du taux d\'avancement (PV comité)', frequency: 'Hebdomadaire' },
      ]
    },
    {
      id: 'declaration-reglementaire',
      name: 'Déclaration Réglementaire',
      icon: '📑',
      activities: [
        { id: 'teg', label: 'TEG', frequency: 'Mensuelle' },
        { id: 'fibane', label: 'FIBANE 1/2/3', frequency: 'Mensuelle' },
        { id: 'douane', label: 'Douane', frequency: 'Mensuelle' },
        { id: 'cre', label: 'CRE', frequency: 'Mensuelle' },
      ]
    },
    {
      id: 'autres-activites',
      name: 'Autres Activités',
      icon: '📌',
      activities: [
        { id: 'visite-unite', label: 'Visite unité pour la collecte documentaire', frequency: 'Hebdomadaire' },
        { id: 'etudes-dse', label: 'Études', frequency: 'Semestrielle' },
        { id: 'validation-dossiers', label: 'Autres — Validation des dossiers de crédit', frequency: 'Journalière' },
        { id: 'formation-dse', label: 'Formation', frequency: 'Hebdomadaire' },
        { id: 'gestion-relations', label: 'Gestion des relations avec des entités ext./int.', frequency: 'Hebdomadaire' },
        { id: 'projets-dri-dsi', label: 'Projets avec la DRI et DSI', frequency: 'Hebdomadaire' },
        { id: 'redaction-procedures', label: 'Rédaction des procédures', frequency: 'Semestrielle' },
      ]
    },
  ],
  DPNP: [
    {
      id: 'analyse-restructuration',
      name: 'Analyse des dossiers de restructuration',
      icon: '🔄',
      activities: [
        { id: 'reception-dossiers', label: 'Réception des dossiers', frequency: 'Journalière' },
        { id: 'dossiers-complements', label: 'Dossiers dont les observations ont été envoyées pour compléments d\'informations', frequency: 'Journalière' },
        { id: 'dossiers-elements-recus', label: 'Dossiers dont on nous a reçus les éléments de l\'unité', frequency: 'Journalière' },
        { id: 'dossier-analyse', label: 'Dossier en cours d\'analyse', frequency: 'Journalière' },
        { id: 'dossier-attente-comite', label: 'Dossier en attente de comité', frequency: 'Journalière' },
        { id: 'dossier-attente-decision', label: 'Dossiers en attente de décision', frequency: 'Journalière' },
        { id: 'dossier-accord', label: 'Dossier dont on a eu l\'accord (comité + PV)', frequency: 'Journalière' },
        { id: 'dossier-rejete', label: 'Dossier rejeté', frequency: 'Journalière' },
      ]
    },
    {
      id: 'suivi-creances-restructurees',
      name: 'Suivi des créances restructurées',
      icon: '📊',
      activities: [
        { id: 'remboursement-echeance', label: 'Remboursement d\'échéance (échéances remboursées sur les dossiers restructurés)', frequency: 'Mensuelle' },
      ]
    },
    {
      id: 'suivi-anomalies-leasing',
      name: 'Suivi des anomalies leasing',
      icon: '🚗',
      activities: [
        { id: 'origine-anomalies-leasing', label: 'Renseigner l\'origine des anomalies de chaque client en anomalie', frequency: 'Hebdomadaire' },
        { id: 'suivi-parc-auto', label: 'Suivi du parc automobile', frequency: 'Hebdomadaire' },
        { id: 'tracking', label: 'Tracking', frequency: 'Hebdomadaire' },
      ]
    },
    {
      id: 'travail-proximite',
      name: 'Travail de proximité avec les unités',
      icon: '👥',
      activities: [
        { id: 'origine-anomalies-proximite', label: 'Renseigner l\'origine des anomalies de chaque client en anomalie', frequency: 'Hebdomadaire' },
        { id: 'formation-themes', label: 'Formation sur des thèmes précis', frequency: 'Semestrielle' },
      ]
    },
    {
      id: 'recouvrement-versement',
      name: 'Recouvrement par versement (après actions de la DCE, pas de porte)',
      icon: '📞',
      activities: [
        { id: 'clients-appeles', label: 'Nombre de clients appelés', frequency: 'Journalière' },
      ]
    },
    {
      id: 'suivi-contagion',
      name: 'Suivi de la contagion des comptes',
      icon: '🔗',
      activities: [
        { id: 'comptes-nettoyer', label: 'Nombre de comptes à nettoyer', frequency: 'Journalière' },
        { id: 'montant-regulariser', label: 'Montant global à verser pour régulariser', frequency: 'Journalière' },
      ]
    },
    {
      id: 'recherche-clients-etranger',
      name: 'Recherche des clients particuliers en anomalie à l\'étranger (risque canada)',
      icon: '🌍',
      activities: [
        { id: 'clients-contacts', label: 'Clients contactés', frequency: 'Journalière' },
        { id: 'clients-ayant-repondu', label: 'Client ayant répondu', frequency: 'Journalière' },
      ]
    },
    {
      id: 'activites-annexes',
      name: 'Activités annexes',
      icon: '📎',
      activities: [
        { id: 'visites-clientele', label: 'Visites clientèles effectuées', frequency: 'Hebdomadaire' },
        { id: 'redaction-procedures', label: 'Rédaction/mise à jour des procédures', frequency: 'Mensuelle' },
        { id: 'etudes-realisees', label: 'Études réalisées', frequency: 'Mensuelle' },
        { id: 'autres-activites', label: 'Autres activités', frequency: 'Hebdomadaire' },
      ]
    },
    {
      id: 'suivi-recouvrement-gfc',
      name: 'Suivi des actions de recouvrement pour les GFC',
      icon: '📋',
      activities: [
        { id: 'recherche-clients', label: 'Rechercher clients en anomalie', frequency: 'Journalière' },
        { id: 'actions-recouvrement', label: 'Enregistrer actions de recouvrement', frequency: 'Journalière' },
      ]
    },
  ]
};

/**
 * Map des départements - chargée dynamiquement depuis SharePoint
 */
export let DEPARTMENTS_MAP: Record<'DA' | 'DSE' | 'DPNP', DepartmentData> = {
  DA: {
    id: 'DA',
    name: 'DA',
    fullName: 'Département Analyse',
    icon: '📊',
    color: '#0078d4',
    categories: FALLBACK_CATEGORIES.DA // Utiliser les fallback par défaut
  },
  DSE: {
    id: 'DSE',
    name: 'DSE',
    fullName: 'Département Surveillance des Engagements',
    icon: '🏦',
    color: '#107c10',
    categories: FALLBACK_CATEGORIES.DSE // Utiliser les fallback par défaut
  },
  DPNP: {
    id: 'DPNP',
    name: 'DPNP',
    fullName: 'Département des Prêts Non Performants',
    icon: '🏛️',
    color: '#d83b01',
    categories: FALLBACK_CATEGORIES.DPNP // Utiliser les fallback par défaut
  }
};

/**
 * Convertit les activités du service vers le format legacy
 */
function convertActivities(activities: any[]): ActivityItem[] {
  return activities.map(activity => ({
    id: activity.id,
    label: activity.name,
    frequency: activity.frequency,
    type: 'amount' as const, // Par défaut montant
    unit: 'FCFA'
  }));
}

/**
 * Convertit les catégories du service vers le format legacy
 */
function convertCategories(categories: any[]): CategoryData[] {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    activities: convertActivities(category.activities)
  }));
}

/**
 * Charge les départements depuis SharePoint
 */
export async function loadDepartments(): Promise<void> {
  try {
    console.log('📊 Chargement des départements depuis SharePoint (Activity table)...');
    
    const departments = await DepartmentActivitiesService.getAllDepartments();
    
    // Vérifier si des données ont été chargées
    const hasDAData = departments.DA.categories.length > 0;
    const hasDSEData = departments.DSE.categories.length > 0;
    const hasDPNPData = departments.DPNP.categories.length > 0;
    
    // Convertir au format legacy seulement si des données existent
    if (hasDAData) {
      DEPARTMENTS_MAP.DA = {
        ...DEPARTMENTS_MAP.DA,
        categories: convertCategories(departments.DA.categories)
      };
    }
    
    // DSE: Forcer utilisation des données locales (fallback)
    console.log('🔧 DSE: Utilisation forcée des données locales (fallback)');
    // Les données de fallback sont déjà en place dans DEPARTMENTS_MAP.DSE
    
    // DPNP: Forcer utilisation des données locales (fallback)
    console.log('🔧 DPNP: Utilisation forcée des données locales (fallback)');
    // Les données de fallback sont déjà en place dans DEPARTMENTS_MAP.DPNP
    
    console.log('✅ Départements chargés:');
    console.log(`  DA: ${DEPARTMENTS_MAP.DA.categories.length} catégories, ${DEPARTMENTS_MAP.DA.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités ${!hasDAData ? '(fallback)' : ''}`);
    console.log(`  DSE: ${DEPARTMENTS_MAP.DSE.categories.length} catégories, ${DEPARTMENTS_MAP.DSE.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités ${!hasDSEData ? '(fallback)' : ''}`);
    console.log(`  DPNP: ${DEPARTMENTS_MAP.DPNP.categories.length} catégories, ${DEPARTMENTS_MAP.DPNP.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités ${!hasDPNPData ? '(fallback)' : ''}`);
  } catch (error) {
    console.error('❌ Erreur chargement départements depuis SharePoint:', error);
    console.warn('⚠️ Utilisation des données de fallback pour les départements');
    // Les données de fallback sont déjà en place, rien à faire
  }
}

/**
 * Récupère un département par son ID
 */
export function getDepartment(id: Departement): DepartmentData {
  if (!id || !(id in DEPARTMENTS_MAP)) {
    throw new Error(`Département invalide: ${id}`);
  }
  
  return DEPARTMENTS_MAP[id];
}

/**
 * Récupère une catégorie par son ID
 */
export function getCategory(departmentId: Departement, categoryId: string): CategoryData | undefined {
  if (!departmentId) return undefined;
  
  const department = getDepartment(departmentId);
  return department.categories.find(cat => cat.id === categoryId);
}

/**
 * Recharge les départements depuis SharePoint
 */
export async function reloadDepartments(): Promise<void> {
  DepartmentActivitiesService.clearCache();
  await loadDepartments();
}

// Exports pour compatibilité avec l'ancien code
export const DA_DEPARTMENT = DEPARTMENTS_MAP.DA;
export const DSE_DEPARTMENT = DEPARTMENTS_MAP.DSE;
export const DPNP_DEPARTMENT = DEPARTMENTS_MAP.DPNP;
