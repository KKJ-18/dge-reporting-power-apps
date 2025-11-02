import { ActivityService } from './ActivityService';
import type { Activity } from '../Models/ActivityModel';

export interface ActivityItem {
  id: string;
  name: string;
  frequency: 'Journalière' | 'Hebdomadaire' | 'Mensuelle' | 'Semestrielle';
  requiresAmount?: boolean;
  requiresCount?: boolean;
  requiresComment?: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  activities: ActivityItem[];
}

export interface DepartmentData {
  id: 'DA' | 'DSE' | 'DPNP';
  name: string;
  fullName: string;
  color: string;
  icon: string;
  categories: CategoryItem[];
}

/**
 * Mapping des catégories aux départements
 * Basé sur le tableau fourni par l'utilisateur
 */
const CATEGORY_TO_DEPARTMENT: Record<string, 'DA' | 'DSE' | 'DPNP'> = {
  // ========================================
  // Département DA (Direction de l'Analyse)
  // ========================================
  'Crédit classique': 'DA',
  'Crédit programme': 'DA',
  'Administration des engagements': 'DA',
  'Suivi des dossiers en cours de MEP': 'DA',
  
  // ========================================
  // Département DSE (Direction Surveillance des Engagements)
  // ========================================
  'Situation Mise en Place': 'DSE',
  'Accords de Classement': 'DSE',
  'Contrats': 'DSE',
  'Projets': 'DSE',
  'Déclaration Règlementaire': 'DSE',
  
  // ========================================
  // Département DPNP (Direction Portefeuille Non Performant)
  // ========================================
  'Analyse des dossiers de restructuration': 'DPNP',
  'Suivi des anomalies engagements par trésorerie': 'DPNP',
  'Suivi des anomalies leasing': 'DPNP',
  'Travail de proximité avec les unités': 'DPNP',
  'Suivi des débits non autorisés': 'DPNP',
  'Recouvrement par versement': 'DPNP',
  'Suivi de la contagion des comptes': 'DPNP',
  'Suivi des provisions': 'DPNP',
  'Recherche clients en anomalie à l\'étranger': 'DPNP',
  
  // ========================================
  // "Activités annexes" est commune à TOUS les départements
  // Elle sera dupliquée dans DA, DSE et DPNP
  // ========================================
};

/**
 * Mapping des catégories aux icônes
 */
const CATEGORY_ICONS: Record<string, string> = {
  // DA
  'Crédit classique': '💰',
  'Crédit programme': '🎯',
  'Administration des engagements': '📊',
  'Suivi des dossiers en cours de MEP': '📈',
  
  // DSE
  'Situation Mise en Place': '✅',
  'Accords de Classement': '📋',
  'Contrats': '📄',
  'Projets': '🚀',
  'Déclaration Règlementaire': '📑',
  
  // DPNP
  'Analyse des dossiers de restructuration': '🔄',
  'Suivi des anomalies engagements par trésorerie': '⚠️',
  'Suivi des anomalies leasing': '🚗',
  'Travail de proximité avec les unités': '🤝',
  'Suivi des débits non autorisés': '🔴',
  'Recouvrement par versement': '💸',
  'Suivi de la contagion des comptes': '🔍',
  'Suivi des provisions': '💼',
  'Recherche clients en anomalie à l\'étranger': '🌍',
  
  // Commun à tous les départements
  'Activités annexes': '📋',
};

/**
 * Métadonnées des départements
 */
const DEPARTMENT_METADATA = {
  DA: {
    id: 'DA' as const,
    name: 'DA',
    fullName: 'Département Analyse',
    color: '#0078d4',
    icon: '📊'
  },
  DSE: {
    id: 'DSE' as const,
    name: 'DSE',
    fullName: 'Département Surveillance des Engagements',
    color: '#107c10',
    icon: '🏦'
  },
  DPNP: {
    id: 'DPNP' as const,
    name: 'DPNP',
    fullName: 'Département des Prêts Non Performants',
    color: '#d83b01',
    icon: '🏛️'
  }
};

/**
 * Service pour gérer les activités par département
 */
export class DepartmentActivitiesService {
  private static activitiesCache: Activity[] | null = null;
  private static departmentsCache: Map<'DA' | 'DSE' | 'DPNP', DepartmentData> | null = null;

  /**
   * Charge toutes les activités depuis SharePoint
   */
  private static async loadActivities(): Promise<Activity[]> {
    if (this.activitiesCache) {
      return this.activitiesCache;
    }

    console.log('📊 Chargement des activités depuis SharePoint...');
    const result = await ActivityService.getAll();
    
    const activities = result?.data || result?.value || [];
    console.log(`✅ ${activities.length} activités chargées`);
    
    this.activitiesCache = activities;
    return activities;
  }

  /**
   * Normalise le nom d'une catégorie
   */
  private static normalizeCategory(category: string): string {
    return category.trim();
  }

  /**
   * Génère un ID unique pour une catégorie
   */
  private static getCategoryId(categoryName: string): string {
    return categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Génère un ID unique pour une activité
   */
  private static getActivityId(activityName: string, categoryName: string): string {
    const combined = `${categoryName}-${activityName}`;
    return combined
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Organise les activités par département
   */
  private static async organizeDepartments(): Promise<Map<'DA' | 'DSE' | 'DPNP', DepartmentData>> {
    if (this.departmentsCache) {
      return this.departmentsCache;
    }

    const activities = await this.loadActivities();
    
    // Initialiser les départements
    const departments = new Map<'DA' | 'DSE' | 'DPNP', DepartmentData>();
    departments.set('DA', { ...DEPARTMENT_METADATA.DA, categories: [] });
    departments.set('DSE', { ...DEPARTMENT_METADATA.DSE, categories: [] });
    departments.set('DPNP', { ...DEPARTMENT_METADATA.DPNP, categories: [] });

    // Grouper par catégorie
    const categoriesMap = new Map<string, Activity[]>();
    
    activities.forEach(activity => {
      const categoryName = this.normalizeCategory(activity.NomRubrique || '');
      if (!categoryName) return;
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, []);
      }
      categoriesMap.get(categoryName)!.push(activity);
    });

    console.log(`📋 ${categoriesMap.size} catégories trouvées dans SharePoint`);

    // Distribuer les catégories aux départements
    categoriesMap.forEach((categoryActivities, categoryName) => {
      // "Activités annexes" est commune à TOUS les départements (DA, DSE, DPNP)
      if (categoryName === 'Activités annexes') {
        ['DA', 'DSE', 'DPNP'].forEach(deptId => {
          const dept = departments.get(deptId as 'DA' | 'DSE' | 'DPNP')!;
          dept.categories.push(this.createCategory(categoryName, categoryActivities));
        });
        console.log(`  ✅ "${categoryName}" ajoutée à DA, DSE et DPNP (commune)`);
        return;
      }

      // Assigner selon le mapping
      const deptId = CATEGORY_TO_DEPARTMENT[categoryName];
      if (deptId) {
        const dept = departments.get(deptId)!;
        dept.categories.push(this.createCategory(categoryName, categoryActivities));
        console.log(`  ✅ "${categoryName}" assignée à ${deptId}`);
      } else {
        console.warn(`  ⚠️ Catégorie non assignée à un département: "${categoryName}"`);
      }
    });

    console.log('\n✅ Départements organisés:');
    departments.forEach((dept, id) => {
      const totalActivities = dept.categories.reduce((sum, cat) => sum + cat.activities.length, 0);
      console.log(`  ${id}: ${dept.categories.length} catégories, ${totalActivities} activités`);
    });

    this.departmentsCache = departments;
    return departments;
  }

  /**
   * Crée un objet CategoryItem à partir d'activités SharePoint
   */
  private static createCategory(categoryName: string, activities: Activity[]): CategoryItem {
    return {
      id: this.getCategoryId(categoryName),
      name: categoryName,
      icon: CATEGORY_ICONS[categoryName] || '📋',
      activities: activities.map(activity => ({
        id: this.getActivityId(activity.Title || '', categoryName),
        name: activity.Title || '',
        frequency: (activity.FrequenceReporting || 'Journalière') as any,
        requiresAmount: true, // Par défaut, nécessite un montant
        requiresCount: false,
        requiresComment: false
      }))
    };
  }

  /**
   * Récupère les données d'un département
   */
  public static async getDepartment(departmentId: 'DA' | 'DSE' | 'DPNP'): Promise<DepartmentData> {
    const departments = await this.organizeDepartments();
    const dept = departments.get(departmentId);
    
    if (!dept) {
      throw new Error(`Département ${departmentId} non trouvé`);
    }
    
    return dept;
  }

  /**
   * Récupère tous les départements
   */
  public static async getAllDepartments(): Promise<Record<'DA' | 'DSE' | 'DPNP', DepartmentData>> {
    const departments = await this.organizeDepartments();
    return {
      DA: departments.get('DA')!,
      DSE: departments.get('DSE')!,
      DPNP: departments.get('DPNP')!
    };
  }

  /**
   * Récupère une catégorie spécifique
   */
  public static async getCategory(departmentId: 'DA' | 'DSE' | 'DPNP', categoryId: string): Promise<CategoryItem | undefined> {
    const dept = await this.getDepartment(departmentId);
    return dept.categories.find(cat => cat.id === categoryId);
  }

  /**
   * Vide le cache
   */
  public static clearCache(): void {
    this.activitiesCache = null;
    this.departmentsCache = null;
  }

  /**
   * Recharge les données depuis SharePoint
   */
  public static async reload(): Promise<void> {
    this.clearCache();
    await this.organizeDepartments();
  }
}
