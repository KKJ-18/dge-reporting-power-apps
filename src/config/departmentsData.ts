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
 * Map des départements - chargée dynamiquement depuis SharePoint
 */
export let DEPARTMENTS_MAP: Record<'DA' | 'DSE' | 'DPNP', DepartmentData> = {
  DA: {
    id: 'DA',
    name: 'DA',
    fullName: 'Département Analyse',
    icon: '📊',
    color: '#0078d4',
    categories: []
  },
  DSE: {
    id: 'DSE',
    name: 'DSE',
    fullName: 'Département Surveillance des Engagements',
    icon: '🏦',
    color: '#107c10',
    categories: []
  },
  DPNP: {
    id: 'DPNP',
    name: 'DPNP',
    fullName: 'Département des Prêts Non Performants',
    icon: '🏛️',
    color: '#d83b01',
    categories: []
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
    
    // Convertir au format legacy
    DEPARTMENTS_MAP.DA = {
      ...DEPARTMENTS_MAP.DA,
      categories: convertCategories(departments.DA.categories)
    };
    
    DEPARTMENTS_MAP.DSE = {
      ...DEPARTMENTS_MAP.DSE,
      categories: convertCategories(departments.DSE.categories)
    };
    
    DEPARTMENTS_MAP.DPNP = {
      ...DEPARTMENTS_MAP.DPNP,
      categories: convertCategories(departments.DPNP.categories)
    };
    
    console.log('✅ Départements chargés:');
    console.log(`  DA: ${DEPARTMENTS_MAP.DA.categories.length} catégories, ${DEPARTMENTS_MAP.DA.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités`);
    console.log(`  DSE: ${DEPARTMENTS_MAP.DSE.categories.length} catégories, ${DEPARTMENTS_MAP.DSE.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités`);
    console.log(`  DPNP: ${DEPARTMENTS_MAP.DPNP.categories.length} catégories, ${DEPARTMENTS_MAP.DPNP.categories.reduce((sum, cat) => sum + cat.activities.length, 0)} activités`);
  } catch (error) {
    console.error('❌ Erreur chargement départements:', error);
    // En cas d'erreur, garder la structure vide
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
