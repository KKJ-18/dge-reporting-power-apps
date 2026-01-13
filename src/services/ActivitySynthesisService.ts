/**
 * Service pour la synthèse complète des activités
 * Optimisé pour charger les données avec filtrage par utilisateur
 * Support multi-niveaux: Agent, Chef de département, Directeur
 */

import { AnalyseDossiersComitesService } from './AnalyseDossiersComitesService';
import { AnalyseSuiviTransmissionService } from './AnalyseSuiviTransmissionService';
import { AnalyseDelaisCreditService } from './AnalyseDelaisCreditService';
import { AnalyseSuiviMEPService } from './AnalyseSuiviMEPService';
import { AnalyseEngagementsService } from './AnalyseEngagementsService';
import { VisiteClienteleService } from './VisiteClienteleService';
import { FormationsService } from './FormationsService';
import { ActivitesTransversalesService } from './ActivitesTransversalesService';
import { AccordsService } from './AccordsService';
import { ContratsService } from './ContratsService';
import { DetailsDossiersService } from './DetailsDossiersService';
import { DetailSurMepClientService } from './DetailSurMepClientService';
import { SuiviClientAppeleService } from './SuiviClientAppeleService';
import { SuiviDossiersRestructurationService } from './SuiviDossiersRestructurationService';
import { VolumeProvisionsService } from './VolumeProvisionsService';
import { AgenceResauService } from './AgenceResauService';
import { UtilisateursService } from './UtilisateursService';
import { DepartmentActivitiesService } from './DepartmentActivitiesService';
import type { UserProfile } from './UserProfileService';

export interface ActivityRecord {
  id: string;
  activityName: string;
  categoryName: string;
  departmentName: string;
  tableName: string; // Nom de la table SharePoint source
  submittedDate: Date;
  createdDate: Date;
  authorEmail: string;
  authorName: string;
  data: Record<string, any>; // Données brutes du record
  frequency?: string;
}

export interface SynthesisFilters {
  startDate: Date;
  endDate: Date;
  departmentId?: string;
  categoryId?: string;
  activityName?: string;
  userEmail?: string; // Pour filtrer par utilisateur spécifique
  searchText?: string; // Recherche textuelle dans les données
}

export interface PaginationOptions {
  page: number; // 1-indexed
  pageSize: number;
  sortBy?: 'date' | 'activity' | 'user' | 'department';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResults<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface UserActivitySummary {
  userEmail: string;
  userName: string;
  department: string;
  totalActivities: number;
  activitiesByCategory: Record<string, number>;
  lastSubmission: Date | null;
  submissionDates: string[]; // Liste des dates de soumission
}

export interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  totalUsers: number;
  totalActivities: number;
  activitiesByUser: UserActivitySummary[];
}

/**
 * Configuration des tables SharePoint à interroger
 */
const SHAREPOINT_TABLES = [
  { service: AnalyseDossiersComitesService, name: 'Analyse Dossiers Comités', category: 'Analyse' },
  { service: AnalyseSuiviTransmissionService, name: 'Suivi Transmission', category: 'Analyse' },
  { service: AnalyseDelaisCreditService, name: 'Délais Crédit', category: 'Analyse' },
  { service: AnalyseSuiviMEPService, name: 'Suivi MEP', category: 'Analyse' },
  { service: AnalyseEngagementsService, name: 'Engagements', category: 'Analyse' },
  { service: VisiteClienteleService, name: 'Visites Clientèle', category: 'Commercial' },
  { service: FormationsService, name: 'Formations', category: 'RH' },
  { service: ActivitesTransversalesService, name: 'Activités Transversales', category: 'Transversal' },
  { service: AccordsService, name: 'Accords', category: 'Crédit' },
  { service: ContratsService, name: 'Contrats', category: 'Crédit' },
  { service: DetailsDossiersService, name: 'Détails Dossiers', category: 'Crédit' },
  { service: DetailSurMepClientService, name: 'Détails MEP Client', category: 'Crédit' },
  { service: SuiviClientAppeleService, name: 'Clients Appelés', category: 'Commercial' },
  { service: SuiviDossiersRestructurationService, name: 'Restructurations', category: 'Crédit' },
  { service: VolumeProvisionsService, name: 'Volume Provisions', category: 'Finance' },
  { service: AgenceResauService, name: 'Agences Réseau', category: 'Réseau' }
] as const;

export class ActivitySynthesisService {
  /**
   * Récupère tous les utilisateurs d'un département
   * Optimisation: cache les résultats par département
   */
  private static departmentUsersCache = new Map<string, Array<{ email: string; name: string }>>();

  static async getDepartmentUsers(departmentId: string): Promise<Array<{ email: string; name: string }>> {
    // Vérifier le cache
    if (this.departmentUsersCache.has(departmentId)) {
      return this.departmentUsersCache.get(departmentId)!;
    }

    try {
      // Si pas de département ou "all", récupérer tous les utilisateurs
      const options: any = {};
      
      if (departmentId && departmentId !== '' && departmentId !== 'all') {
        // Les départements sont DA, DSE, DPNP (valeurs simples)
        // Essayer d'abord sans lookup (champ direct)
        options.filter = `Departement eq '${departmentId}'`;
      }

      let result = await UtilisateursService.getAll(options);
      let allUsers = result?.data || result?.value || [];

      // Si aucun résultat avec le filtre direct, essayer avec lookup
      if (departmentId && departmentId !== '' && departmentId !== 'all' && allUsers.length === 0) {
        console.log(`⚠️ Aucun résultat avec filtre direct, essai avec lookup Departement/Value...`);
        options.filter = `Departement/Value eq '${departmentId}'`;
        result = await UtilisateursService.getAll(options);
        allUsers = result?.data || result?.value || [];
      }

      // Si toujours aucun résultat, récupérer tous et filtrer côté client
      let users = allUsers;
      if (departmentId && departmentId !== '' && departmentId !== 'all' && allUsers.length === 0) {
        console.log(`⚠️ Aucun utilisateur trouvé avec les filtres, récupération de tous les utilisateurs...`);
        const allResult = await UtilisateursService.getAll();
        const allData = allResult?.data || allResult?.value || [];
        console.log(`📋 ${allData.length} utilisateurs totaux récupérés`);
        
        // Afficher les départements disponibles pour debug
        const deptSample = allData.slice(0, 5).map((u: any) => ({
          email: u.Email,
          title: u.Title,
          dept: u.Departement?.Value || u.Departement || u['Departement#Id'] || 'N/A'
        }));
        console.log('🔍 Exemple d\'utilisateurs:', deptSample);
        
        users = allData.filter((u: any) => {
          // Essayer plusieurs propriétés pour le département
          const userDept = u.Departement?.Value || u.Departement || u['Departement#Id'] || '';
          const match = userDept === departmentId || String(userDept).toLowerCase() === departmentId.toLowerCase();
          return match;
        });
        console.log(`✅ ${users.length} utilisateurs trouvés après filtrage côté client pour ${departmentId}`);
      }

      const mappedUsers = users.map((u: any) => ({
        email: (u.Email || '').toLowerCase(),
        name: u.Title || u.Nom || u.Email || 'Inconnu'
      })).filter((u: { email: string; name: string }) => u.email); // Filtrer les utilisateurs sans email

      // Mettre en cache
      this.departmentUsersCache.set(departmentId, mappedUsers);
      console.log(`✅ ${mappedUsers.length} utilisateurs chargés pour département: ${departmentId || 'tous'}`);
      if (mappedUsers.length > 0) {
        console.log('📧 Emails:', mappedUsers.slice(0, 3).map((u: { email: string; name: string }) => u.email));
      }
      return mappedUsers;
    } catch (error) {
      console.error(`Erreur récupération utilisateurs département ${departmentId}:`, error);
      return [];
    }
  }

  /**
   * Réinitialise le cache des utilisateurs
   */
  static clearUserCache(): void {
    this.departmentUsersCache.clear();
  }

  /**
   * Extrait les informations d'auteur d'un record SharePoint
   */
  private static extractAuthorInfo(record: any): { email: string; name: string } {
    // Essayer différentes propriétés pour l'auteur
    let authorEmail = 
      record['Author#Claims'] ||
      record.Author?.Email ||
      record.Author?.EMail ||
      record.CreatedBy?.Email ||
      record.CreatedBy?.EMail ||
      record.Author ||
      '';

    // Nettoyer les préfixes SharePoint d'authentification
    // Formats possibles: 
    // - i:0#.f|membership|email@domain.com
    // - i:0#.w|domain\username
    const emailStr = String(authorEmail).toLowerCase();
    
    // Extraire l'email si préfixe SharePoint détecté
    if (emailStr.includes('|')) {
      const parts = emailStr.split('|');
      authorEmail = parts[parts.length - 1]; // Prendre la dernière partie
    } else {
      authorEmail = emailStr;
    }

    const authorName = 
      record.Author?.Title ||
      record.Author?.DisplayName ||
      record.CreatedBy?.Title ||
      record.CreatedBy?.DisplayName ||
      authorEmail ||
      'Inconnu';

    return {
      email: authorEmail,
      name: String(authorName)
    };
  }

  /**
   * Récupère toutes les activités depuis les tables SharePoint
   * Optimisé avec filtrage côté client par Created et CreatedBy
   */
  static async getAllActivities(
    filters: SynthesisFilters,
    userProfile: UserProfile
  ): Promise<ActivityRecord[]> {
    const records: ActivityRecord[] = [];

    try {
      console.log('🔍 Récupération des activités avec filtres:', filters);
      console.log('👤 Profil utilisateur:', userProfile);

      // Étape 1: Déterminer les utilisateurs autorisés
      let authorizedUserEmails: Set<string>;

      if (userProfile.isDirecteur) {
        // Directeur: tous les utilisateurs
        if (filters.departmentId) {
          // Si un département est filtré, récupérer ses utilisateurs
          const deptUsers = await this.getDepartmentUsers(filters.departmentId);
          authorizedUserEmails = new Set(deptUsers.map(u => u.email));
          console.log(`👔 Directeur - ${authorizedUserEmails.size} utilisateurs du département ${filters.departmentId}`);
          console.log('📧 Emails autorisés:', Array.from(authorizedUserEmails).slice(0, 5));
          
          // Si aucun utilisateur trouvé, ne pas bloquer - utiliser un Set vide (tous autorisés)
          if (authorizedUserEmails.size === 0) {
            console.warn(`⚠️ Aucun utilisateur trouvé pour ${filters.departmentId}, autorisation de tous les utilisateurs`);
            authorizedUserEmails = new Set(); // Vide = tous autorisés
          }
        } else {
          // Sinon, pas de filtre (tous les utilisateurs)
          authorizedUserEmails = new Set(); // Vide = tous autorisés
          console.log('👔 Directeur - Tous les départements');
        }
      } else if (userProfile.fonction?.toLowerCase().includes('chef') && userProfile.departement) {
        // Chef de département: uniquement son département
        const deptUsers = await this.getDepartmentUsers(userProfile.departement);
        authorizedUserEmails = new Set(deptUsers.map(u => u.email));
        console.log(`🏢 Chef de département - ${authorizedUserEmails.size} utilisateurs`);
      } else {
        // Agent: uniquement lui-même
        authorizedUserEmails = new Set([userProfile.email.toLowerCase()]);
        console.log('👤 Agent - Uniquement ses propres données');
      }

      // Étape 2: Récupérer la configuration des activités
      const departmentsRecord = await DepartmentActivitiesService.getAllDepartments();
      const departments = Object.values(departmentsRecord);

      const activityConfigMap = new Map<string, {
        categoryName: string;
        departmentId: string;
        departmentName: string;
        frequency: string;
      }>();

      departments.forEach(dept => {
        dept.categories.forEach(cat => {
          cat.activities.forEach(act => {
            activityConfigMap.set(act.name, {
              categoryName: cat.name,
              departmentId: dept.id,
              departmentName: dept.fullName || dept.name,
              frequency: act.frequency
            });
          });
        });
      });

      // Étape 3: Récupérer les données en parallèle (optimisation)
      console.log(`📊 Interrogation de ${SHAREPOINT_TABLES.length} tables SharePoint...`);

      const fetchPromises = SHAREPOINT_TABLES.map(async ({ service, name, category }) => {
        try {
          // Récupérer TOUTES les données (pas de filtre serveur Created - non supporté partout)
          const result = await service.getAll();
          const data = result?.data || result?.value || [];
          
          console.log(`✅ ${name}: ${data.length} records`);

          // Filtrer côté client
          const processed = data
            .map((record: any) => {
              const author = this.extractAuthorInfo(record);
              const createdDate = record.Created ? new Date(record.Created) : new Date();
              const submittedDate = record.DateReception 
                ? new Date(record.DateReception) 
                : createdDate;

              return {
                record,
                author,
                createdDate,
                submittedDate,
                tableName: name,
                categoryName: category
              };
            })
            .filter((item: {
              record: any;
              author: { email: string; name: string };
              createdDate: Date;
              submittedDate: Date;
              tableName: string;
              categoryName: string;
            }) => {
              const { author, createdDate } = item;
              // Filtre 1: Date de création dans la période
              if (createdDate < filters.startDate || createdDate > filters.endDate) {
                return false;
              }

              // Filtre 2: Utilisateur autorisé
              if (authorizedUserEmails.size > 0 && !authorizedUserEmails.has(author.email)) {
                return false;
              }

              // Filtre 3: Utilisateur spécifique (si sélectionné dans le filtre)
              if (filters.userEmail && author.email !== filters.userEmail.toLowerCase()) {
                return false;
              }

              return true;
            });
          
          // Log pour debug
          if (data.length > 0) {
            console.log(`   → ${name}: ${data.length} records bruts → ${processed.length} après filtrage`);
            if (processed.length === 0 && data.length > 0) {
              const sampleAuthor = this.extractAuthorInfo(data[0]);
              console.warn(`   ⚠️ Aucun record retenu pour ${name}. Exemple auteur: "${sampleAuthor.email}"`);
              if (authorizedUserEmails.size > 0) {
                console.warn(`   ⚠️ Emails autorisés (${authorizedUserEmails.size}): ${Array.from(authorizedUserEmails).slice(0, 3).join(', ')}`);
              }
            } else if (processed.length > 0) {
              const sampleAuthors = processed.slice(0, 2).map((p: any) => p.author.email);
              console.log(`   ✅ Emails retenus: ${sampleAuthors.join(', ')}`);
            }
          }
          
          return processed;
        } catch (error) {
          console.error(`❌ Erreur sur ${name}:`, error);
          return [];
        }
      });

      const allResults = await Promise.all(fetchPromises);

      // Étape 4: Traiter les résultats
      type ProcessedItem = {
        record: any;
        author: { email: string; name: string };
        createdDate: Date;
        submittedDate: Date;
        tableName: string;
        categoryName: string;
      };

      allResults.flat().forEach((item: ProcessedItem) => {
        const { record, author, createdDate, submittedDate, tableName, categoryName } = item;
        const activityName = record.Title || 'Sans titre';
        const activityConfig = activityConfigMap.get(activityName);

        // Appliquer les filtres supplémentaires
        // Note: Le filtre département est déjà appliqué via authorizedUserEmails
        // Pas besoin de filtrer à nouveau par activityConfig.departmentId
        
        if (filters.categoryId && activityConfig?.categoryName !== filters.categoryId) {
          return;
        }

        if (filters.activityName && activityName !== filters.activityName) {
          return;
        }

        // Recherche textuelle dans les données
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          const recordStr = JSON.stringify(record).toLowerCase();
          if (!recordStr.includes(searchLower)) {
            return;
          }
        }

        records.push({
          id: record.ID?.toString() || record.id?.toString() || `${tableName}-${Date.now()}`,
          activityName,
          categoryName: activityConfig?.categoryName || categoryName,
          departmentName: activityConfig?.departmentName || 'N/A',
          tableName,
          submittedDate,
          createdDate,
          authorEmail: author.email,
          authorName: author.name,
          data: record,
          frequency: activityConfig?.frequency
        });
      });

      console.log(`✅ Total: ${records.length} activités récupérées`);
      return records;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des activités:', error);
      throw error;
    }
  }

  /**
   * Applique la pagination sur les résultats
   */
  static paginateResults<T>(
    data: T[],
    options: PaginationOptions
  ): PaginatedResults<T> {
    const { page, pageSize, sortBy = 'date', sortOrder = 'desc' } = options;

    // Tri
    let sortedData = [...data];
    if (sortBy === 'date') {
      sortedData.sort((a: any, b: any) => {
        const dateA = new Date(a.createdDate).getTime();
        const dateB = new Date(b.createdDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'activity') {
      sortedData.sort((a: any, b: any) => {
        const compare = a.activityName.localeCompare(b.activityName);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'user') {
      sortedData.sort((a: any, b: any) => {
        const compare = a.authorName.localeCompare(b.authorName);
        return sortOrder === 'asc' ? compare : -compare;
      });
    } else if (sortBy === 'department') {
      sortedData.sort((a: any, b: any) => {
        const compare = a.departmentName.localeCompare(b.departmentName);
        return sortOrder === 'asc' ? compare : -compare;
      });
    }

    // Pagination
    const totalRecords = sortedData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      totalRecords,
      totalPages,
      currentPage: page,
      pageSize
    };
  }

  /**
   * Génère un résumé par utilisateur
   */
  static generateUserSummaries(records: ActivityRecord[]): UserActivitySummary[] {
    const userMap = new Map<string, UserActivitySummary>();

    records.forEach(record => {
      const key = record.authorEmail;

      if (!userMap.has(key)) {
        userMap.set(key, {
          userEmail: record.authorEmail,
          userName: record.authorName,
          department: record.departmentName,
          totalActivities: 0,
          activitiesByCategory: {},
          lastSubmission: null,
          submissionDates: []
        });
      }

      const summary = userMap.get(key)!;
      summary.totalActivities++;

      // Compter par catégorie
      if (!summary.activitiesByCategory[record.categoryName]) {
        summary.activitiesByCategory[record.categoryName] = 0;
      }
      summary.activitiesByCategory[record.categoryName]++;

      // Dernière soumission
      if (!summary.lastSubmission || record.submittedDate > summary.lastSubmission) {
        summary.lastSubmission = record.submittedDate;
      }

      // Dates de soumission uniques
      const dateStr = record.submittedDate.toISOString().split('T')[0];
      if (!summary.submissionDates.includes(dateStr)) {
        summary.submissionDates.push(dateStr);
      }
    });

    return Array.from(userMap.values()).sort((a, b) => b.totalActivities - a.totalActivities);
  }

  /**
   * Génère un résumé par département
   */
  static generateDepartmentSummaries(records: ActivityRecord[]): DepartmentSummary[] {
    const deptMap = new Map<string, DepartmentSummary>();
    const usersByDept = new Map<string, Set<string>>();

    records.forEach(record => {
      const deptKey = record.departmentName;

      if (!deptMap.has(deptKey)) {
        deptMap.set(deptKey, {
          departmentId: deptKey,
          departmentName: deptKey,
          totalUsers: 0,
          totalActivities: 0,
          activitiesByUser: []
        });
        usersByDept.set(deptKey, new Set());
      }

      deptMap.get(deptKey)!.totalActivities++;
      usersByDept.get(deptKey)!.add(record.authorEmail);
    });

    // Calculer le nombre d'utilisateurs uniques par département
    deptMap.forEach((summary, key) => {
      summary.totalUsers = usersByDept.get(key)!.size;
      
      // Générer les résumés par utilisateur pour ce département
      const deptRecords = records.filter(r => r.departmentName === key);
      summary.activitiesByUser = this.generateUserSummaries(deptRecords);
    });

    return Array.from(deptMap.values()).sort((a, b) => b.totalActivities - a.totalActivities);
  }

  /**
   * Exporte les données en CSV
   */
  static exportToCSV(records: ActivityRecord[]): string {
    const headers = [
      'Date Création',
      'Date Soumission',
      'Activité',
      'Catégorie',
      'Département',
      'Table Source',
      'Utilisateur',
      'Email',
      'Fréquence'
    ];

    const rows = records.map(r => [
      r.createdDate.toLocaleDateString('fr-FR'),
      r.submittedDate.toLocaleDateString('fr-FR'),
      r.activityName,
      r.categoryName,
      r.departmentName,
      r.tableName,
      r.authorName,
      r.authorEmail,
      r.frequency || 'N/A'
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    return csvContent;
  }

  /**
   * Télécharge un fichier CSV
   */
  static downloadCSV(content: string, filename: string): void {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Exporte les résumés utilisateur en CSV
   */
  static exportUserSummariesToCSV(summaries: UserActivitySummary[]): string {
    const headers = [
      'Utilisateur',
      'Email',
      'Département',
      'Total Activités',
      'Dernière Soumission',
      'Jours Actifs',
      'Catégories'
    ];

    const rows = summaries.map(s => [
      s.userName,
      s.userEmail,
      s.department,
      s.totalActivities.toString(),
      s.lastSubmission ? s.lastSubmission.toLocaleDateString('fr-FR') : 'N/A',
      s.submissionDates.length.toString(),
      Object.entries(s.activitiesByCategory)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join(', ')
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    return csvContent;
  }
}
