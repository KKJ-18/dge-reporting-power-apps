/**
 * Service pour générer des rapports et statistiques
 * Calcul du taux de complétude basé sur les objectifs définis
 */

import { AnalyseDossiersComitesService } from './AnalyseDossiersComitesService';
import { AnalyseSuiviTransmissionService } from './AnalyseSuiviTransmissionService';
import { AnalyseDelaisCreditService } from './AnalyseDelaisCreditService';
import { AnalyseSuiviMEPService } from './AnalyseSuiviMEPService';
import { AnalyseEngagementsService } from './AnalyseEngagementsService';
import { VisiteClienteleService } from './VisiteClienteleService';
import { FormationsService } from './FormationsService';
import { ActivitesTransversalesService } from './ActivitesTransversalesService';
import { DepartmentActivitiesService } from './DepartmentActivitiesService';
import { ObjectifService } from './ObjectifService';
import type { Objectif } from '../Models/ObjectifModel';
import type { ActivityFrequency } from '../config/departmentsData';

export interface ActivitySubmission {
  id: string;
  activityId: string;
  activityName: string;
  categoryId: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  submittedDate: Date;
  frequency: ActivityFrequency;
  value?: number;
  status: 'completed' | 'pending' | 'overdue';
  submittedBy?: string; // Email de l'utilisateur qui a soumis
  submittedByName?: string; // Nom de l'utilisateur
}

export interface CompletionStats {
  date: string;
  totalActivities: number;
  completedActivities: number;
  completionRate: number; // Pourcentage 0-100
  expectedActivities: number; // Nombre d'activités attendues ce jour selon fréquence
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  totalActivities: number;
  completedActivities: number;
  completionRate: number;
  submissions: number;
}

export interface ActivityStats {
  activityId: string;
  activityName: string;
  frequency: ActivityFrequency;
  expectedSubmissions: number; // Attendu sur la période
  actualSubmissions: number;
  completionRate: number;
  lastSubmission?: Date;
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  departmentId?: string;
  categoryId?: string;
  activityId?: string;
  userId?: string; // Filtrer par utilisateur spécifique
}

export class ReportsService {
  /**
   * Récupère toutes les soumissions d'activités depuis SharePoint
   */
  private static async getAllSubmissions(filters: ReportFilters): Promise<ActivitySubmission[]> {
    const submissions: ActivitySubmission[] = [];

    try {
      // Récupérer la configuration des départements pour avoir les fréquences
      const departmentsRecord = await DepartmentActivitiesService.getAllDepartments();
      const departments = Object.values(departmentsRecord);

      // Créer un mapping: NomActivité -> {fréquence, catégorie, département}
      const activityConfigMap = new Map<string, { 
        frequency: ActivityFrequency; 
        categoryId: string; 
        categoryName: string; 
        departmentId: string; 
        departmentName: string 
      }>();
      
      departments.forEach(dept => {
        dept.categories.forEach(cat => {
          cat.activities.forEach(act => {
            // Utiliser le nom de l'activité comme clé
            activityConfigMap.set(act.name, {
              frequency: act.frequency,
              categoryId: cat.id,
              categoryName: cat.name,
              departmentId: dept.id,
              departmentName: dept.name
            });
          });
        });
      });

      // Récupérer les données de DA depuis SharePoint
      const [dossiersComites, suiviTransmission, delaisCredit, suiviMEP, engagements] = await Promise.all([
        AnalyseDossiersComitesService.getAll(),
        AnalyseSuiviTransmissionService.getAll(),
        AnalyseDelaisCreditService.getAll(),
        AnalyseSuiviMEPService.getAll(),
        AnalyseEngagementsService.getAll()
      ]);

      // Récupérer les activités annexes depuis SharePoint
      const [visites, formations, activitesTransv] = await Promise.all([
        VisiteClienteleService.getAll(),
        FormationsService.getAll(),
        ActivitesTransversalesService.getAll()
      ]);

      // Fonction pour traiter les enregistrements SharePoint
      const processRecords = (records: any) => {
        const data = records?.data || records?.value || [];
        
        data.forEach((record: any) => {
          // Le nom de l'activité est dans Title
          const activityName = record.Title;
          if (!activityName) return;

          // Chercher la configuration de cette activité
          const activityConfig = activityConfigMap.get(activityName);
          if (!activityConfig) {
            console.warn(`⚠️ Activité "${activityName}" non trouvée dans la configuration`);
            return;
          }

          // Date de soumission
          const submittedDate = record.DateReception 
            ? new Date(record.DateReception) 
            : new Date(record.Created || Date.now());
          
          // Informations sur l'auteur (qui a soumis)
          const authorEmail = record.Author?.Email || record.Author?.EMail || record.CreatedBy;
          const authorName = record.Author?.Title || record.Author?.DisplayName || authorEmail || 'Inconnu';
          
          // Filtrer par date
          if (submittedDate >= filters.startDate && submittedDate <= filters.endDate) {
            // Filtrer par département/catégorie/activité si spécifié
            if (filters.departmentId && activityConfig.departmentId !== filters.departmentId) return;
            if (filters.categoryId && activityConfig.categoryId !== filters.categoryId) return;
            if (filters.activityId && activityName !== filters.activityId) return;
            
            // Filtrer par utilisateur si spécifié (pour directeur)
            if (filters.userId && authorEmail !== filters.userId) return;

            submissions.push({
              id: record.ID?.toString() || record.id?.toString() || `${activityName}-${submittedDate.getTime()}`,
              activityId: activityName, // Utiliser le nom comme ID
              activityName: activityName,
              categoryId: activityConfig.categoryId,
              categoryName: activityConfig.categoryName,
              departmentId: activityConfig.departmentId,
              departmentName: activityConfig.departmentName,
              submittedDate,
              frequency: activityConfig.frequency,
              value: record.Montant || record.Nombre,
              status: 'completed',
              submittedBy: authorEmail,
              submittedByName: authorName
            });
          }
        });
      };

      // Traiter toutes les sources de données SharePoint
      processRecords(dossiersComites);
      processRecords(suiviTransmission);
      processRecords(delaisCredit);
      processRecords(suiviMEP);
      processRecords(engagements);
      processRecords(visites);
      processRecords(formations);
      processRecords(activitesTransv);

      console.log(`✅ ${submissions.length} soumissions récupérées depuis SharePoint`);

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des soumissions:', error);
    }

    return submissions;
  }

  /**
   * Récupère tous les objectifs définis pour la période
   */
  private static async getObjectifsForPeriod(filters: ReportFilters): Promise<Objectif[]> {
    try {
      const result = await ObjectifService.getAll();
      const data: Objectif[] = result?.data || result?.value || [];

      // Filtrer par période
      return data.filter((obj: Objectif) => {
        if (!obj.Date) return false;
        const objDate = new Date(obj.Date);
        return objDate >= filters.startDate && objDate <= filters.endDate;
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des objectifs:', error);
      return [];
    }
  }

  
  /**
   * Génère les statistiques de complétude par jour basées sur les objectifs
   */
  static async getDailyCompletionStats(filters: ReportFilters): Promise<CompletionStats[]> {
    const submissions = await this.getAllSubmissions(filters);
    const objectifs = await this.getObjectifsForPeriod(filters);
    
    const stats: CompletionStats[] = [];
    const currentDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Objectifs pour cette date
      const dayObjectifs = objectifs.filter(obj => {
        if (!obj.Date) return false;
        const objDate = new Date(obj.Date).toISOString().split('T')[0];
        return objDate === dateStr;
      });
      
      // Soumissions pour cette date
      const daySubmissions = submissions.filter(sub => {
        const subDate = new Date(sub.submittedDate);
        return subDate.toISOString().split('T')[0] === dateStr;
      });

      // Activités uniques soumises
      const uniqueActivities = new Set(daySubmissions.map(s => s.activityName));
      const completed = uniqueActivities.size;
      const expected = dayObjectifs.length;

      stats.push({
        date: dateStr,
        totalActivities: expected,
        completedActivities: completed,
        completionRate: expected > 0 ? Math.min(100, Math.round((completed / expected) * 100)) : 0,
        expectedActivities: expected
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return stats;
  }

  /**
   * Génère les statistiques par catégorie
   */
  static async getCategoryStats(filters: ReportFilters): Promise<CategoryStats[]> {
    const submissions = await this.getAllSubmissions(filters);
    const objectifs = await this.getObjectifsForPeriod(filters);
    const departmentsRecord = await DepartmentActivitiesService.getAllDepartments();
    const departments = Object.values(departmentsRecord);
    
    // Récupérer les noms d'activités qui ont des objectifs
    const activitiesWithObjectifs = new Set<string>();
    objectifs.forEach(obj => {
      if (obj.Title) {
        activitiesWithObjectifs.add(obj.Title);
      }
    });

    const categoryMap = new Map<string, CategoryStats>();

    departments.forEach(dept => {
      if (filters.departmentId && dept.id !== filters.departmentId) return;
      
      dept.categories.forEach(cat => {
        if (filters.categoryId && cat.id !== filters.categoryId) return;

        // Vérifier si cette catégorie a au moins une activité avec un objectif
        const categoryActivitiesWithObjectifs = cat.activities.filter(act => 
          activitiesWithObjectifs.has(act.name)
        );

        // Ne pas inclure cette catégorie si aucune de ses activités n'a d'objectif
        if (categoryActivitiesWithObjectifs.length === 0) return;

        const categorySubmissions = submissions.filter(s => s.categoryId === cat.id);
        const uniqueActivities = new Set(categorySubmissions.map(s => s.activityId));

        // Calculer le taux de complétion et le plafonner à 100%
        const completionRate = categoryActivitiesWithObjectifs.length > 0 
          ? Math.min(100, Math.round((uniqueActivities.size / categoryActivitiesWithObjectifs.length) * 100))
          : 0;

        categoryMap.set(cat.id, {
          categoryId: cat.id,
          categoryName: cat.name,
          totalActivities: categoryActivitiesWithObjectifs.length, // Utiliser seulement les activités avec objectifs
          completedActivities: uniqueActivities.size,
          completionRate,
          submissions: categorySubmissions.length
        });
      });
    });

    return Array.from(categoryMap.values());
  }

  /**
   * Génère les statistiques par activité basées sur les objectifs
   */
  static async getActivityStats(filters: ReportFilters): Promise<ActivityStats[]> {
    const submissions = await this.getAllSubmissions(filters);
    const objectifs = await this.getObjectifsForPeriod(filters);
    const departmentsRecord = await DepartmentActivitiesService.getAllDepartments();
    const departments = Object.values(departmentsRecord);
    
    const stats: ActivityStats[] = [];
    
    // Grouper les objectifs par nom d'activité
    const objectifsByActivity = new Map<string, Objectif[]>();
    objectifs.forEach(obj => {
      if (!obj.Title) return;
      if (!objectifsByActivity.has(obj.Title)) {
        objectifsByActivity.set(obj.Title, []);
      }
      objectifsByActivity.get(obj.Title)!.push(obj);
    });

    // Pour chaque activité ayant des objectifs
    objectifsByActivity.forEach((activityObjectifs, activityName) => {
      // Trouver la configuration de l'activité
      let activityConfig: any = null;
      let frequency: ActivityFrequency = 'Journalière';
      
      departments.forEach(dept => {
        dept.categories.forEach(cat => {
          cat.activities.forEach(act => {
            if (act.name === activityName) {
              activityConfig = act;
              frequency = act.frequency;
            }
          });
        });
      });

      // Soumissions pour cette activité
      const activitySubmissions = submissions.filter(s => s.activityName === activityName);
      
      // Nombre attendu = somme des objectifs.Nombre
      const expected = activityObjectifs.reduce((sum, obj) => sum + (obj.Nombre || 0), 0);
      const actual = activitySubmissions.length;

      // Dernière soumission
      const lastSub = activitySubmissions.length > 0
        ? activitySubmissions.reduce((latest, sub) => 
            sub.submittedDate > latest.submittedDate ? sub : latest
          )
        : undefined;

      stats.push({
        activityId: activityConfig?.id || activityName,
        activityName: activityName,
        frequency: frequency,
        expectedSubmissions: expected,
        actualSubmissions: actual,
        completionRate: expected > 0 ? Math.min(100, Math.round((actual / expected) * 100)) : 0,
        lastSubmission: lastSub?.submittedDate
      });
    });

    return stats;
  }

  /**
   * Récupère un résumé global basé sur les objectifs
   */
  static async getOverallStats(filters: ReportFilters) {
    const submissions = await this.getAllSubmissions(filters);
    const objectifs = await this.getObjectifsForPeriod(filters);

    // Activités uniques ayant des objectifs
    const uniqueActivitiesWithObjectifs = new Set(objectifs.map(o => o.Title).filter(Boolean));
    const totalActivities = uniqueActivitiesWithObjectifs.size;

    // Total attendu = somme de tous les Nombre des objectifs
    const totalExpected = objectifs.reduce((sum, obj) => sum + (obj.Nombre || 0), 0);

    // Activités uniques soumises
    const uniqueActivitiesSubmitted = new Set(submissions.map(s => s.activityName)).size;
    const totalSubmissions = submissions.length;

    return {
      totalActivities,
      uniqueActivitiesSubmitted,
      activityCompletionRate: totalActivities > 0 
        ? Math.round((uniqueActivitiesSubmitted / totalActivities) * 100) 
        : 0,
      totalExpectedSubmissions: totalExpected,
      totalActualSubmissions: totalSubmissions,
      submissionCompletionRate: totalExpected > 0 
        ? Math.round((totalSubmissions / totalExpected) * 100) 
        : 0,
      period: {
        start: filters.startDate,
        end: filters.endDate,
        days: Math.ceil((filters.endDate.getTime() - filters.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      }
    };
  }

  /**
   * Récupère la liste des utilisateurs ayant soumis des activités
   * Utile pour le filtre du directeur
   */
  static async getSubmittingUsers(filters: Omit<ReportFilters, 'userId'>): Promise<Array<{ email: string; name: string; submissionsCount: number }>> {
    const submissions = await this.getAllSubmissions({ ...filters, userId: undefined });
    
    // Grouper par utilisateur
    const userMap = new Map<string, { email: string; name: string; count: number }>();
    
    submissions.forEach(sub => {
      if (sub.submittedBy) {
        const existing = userMap.get(sub.submittedBy);
        if (existing) {
          existing.count++;
        } else {
          userMap.set(sub.submittedBy, {
            email: sub.submittedBy,
            name: sub.submittedByName || sub.submittedBy,
            count: 1
          });
        }
      }
    });
    
    // Convertir en tableau et trier par nombre de soumissions
    return Array.from(userMap.values())
      .map(user => ({
        email: user.email,
        name: user.name,
        submissionsCount: user.count
      }))
      .sort((a, b) => b.submissionsCount - a.submissionsCount);
  }
}
