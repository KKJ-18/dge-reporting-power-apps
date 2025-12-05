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
      id: 'situation-mep',
      name: 'Situation Mise en Place',
      icon: '✅',
      activities: [
        { id: 'mep-amortissables', label: 'Crédits amortissables', frequency: 'Journalière' },
        { id: 'mep-restructuration', label: 'Restructuration', frequency: 'Journalière' },
        { id: 'mep-caution', label: 'Cautions', frequency: 'Journalière' },
      ]
    },
    {
      id: 'accords-classement',
      name: 'Accords de Classement',
      icon: '📋',
      activities: [
        { id: 'autorisation-mobilisation', label: 'Autorisations de mobilisation', frequency: 'Journalière' },
        { id: 'accords-classement', label: 'Accords de classement', frequency: 'Journalière' },
      ]
    },
    {
      id: 'contrats',
      name: 'Contrats',
      icon: '📄',
      activities: [
        { id: 'avance-facture', label: 'Avance sur facture', frequency: 'Journalière' },
        { id: 'prefinancement', label: 'Préfinancement', frequency: 'Journalière' },
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
  DPNP: [
    {
      id: 'analyse-restructuration',
      name: 'Analyse des dossiers de restructuration',
      icon: '🔄',
      activities: [
        { id: 'restructuration', label: 'Analyse restructuration', frequency: 'Journalière' },
      ]
    },
    {
      id: 'suivi-anomalies',
      name: 'Suivi des anomalies engagements',
      icon: '⚠️',
      activities: [
        { id: 'anomalies-tresorerie', label: 'Anomalies trésorerie', frequency: 'Journalière' },
      ]
    },
    {
      id: 'recouvrement',
      name: 'Recouvrement par versement',
      icon: '💸',
      activities: [
        { id: 'versements', label: 'Suivi versements', frequency: 'Journalière' },
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
    
    if (hasDSEData) {
      DEPARTMENTS_MAP.DSE = {
        ...DEPARTMENTS_MAP.DSE,
        categories: convertCategories(departments.DSE.categories)
      };
    }
    
    if (hasDPNPData) {
      DEPARTMENTS_MAP.DPNP = {
        ...DEPARTMENTS_MAP.DPNP,
        categories: convertCategories(departments.DPNP.categories)
      };
    }
    
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
