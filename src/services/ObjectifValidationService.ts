/**
 * Service de validation des objectifs
 * Vérifie qu'un objectif existe avant de permettre la soumission d'une activité
 */

import { ObjectifService } from './ObjectifService';
import { UserProfileService } from './UserProfileService';
import type { Objectif } from '../Models/ObjectifModel';
import { extractCleanEmail, extractAuthorEmail } from '../utils/emailUtils';

export class ObjectifValidationService {
  /**
   * Vérifie si un objectif existe pour une activité à une date donnée
   * Filtre automatiquement par utilisateur connecté (Created By)
   */
  static async hasObjectifForActivity(activityName: string, date: Date): Promise<boolean> {
    try {
      // Récupérer le profil utilisateur pour filtrer par email
      const profile = await UserProfileService.getCurrentUserProfile();
      const userEmail = extractCleanEmail(profile.email);
      
      // Récupérer TOUS les objectifs (sans filtre serveur pour éviter erreur 400)
      const result = await ObjectifService.getAll();
      const allObjectifs: Objectif[] = result?.data || result?.value || [];
      
      // Filtrer par utilisateur côté client
      const objectifs = allObjectifs.filter(obj => {
        const authorEmail = extractAuthorEmail(obj);
        return authorEmail === userEmail;
      });
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Chercher un objectif pour cette activité à cette date
      const found = objectifs.some(obj => {
        if (!obj.Title || !obj.Date) return false;
        
        const objDate = new Date(obj.Date).toISOString().split('T')[0];
        return obj.Title === activityName && objDate === dateStr;
      });
      
      return found;
    } catch (error) {
      console.error('Erreur vérification objectif:', error);
      return false;
    }
  }

  /**
   * Récupère l'objectif pour une activité à une date donnée
   * Filtre automatiquement par utilisateur connecté (Created By)
   */
  static async getObjectifForActivity(activityName: string, date: Date): Promise<Objectif | null> {
    try {
      // Récupérer le profil utilisateur pour filtrer par email
      const profile = await UserProfileService.getCurrentUserProfile();
      const userEmail = extractCleanEmail(profile.email);
      
      // Récupérer TOUS les objectifs (sans filtre serveur pour éviter erreur 400)
      const result = await ObjectifService.getAll();
      const allObjectifs: Objectif[] = result?.data || result?.value || [];
      
      // Filtrer par utilisateur côté client
      const objectifs = allObjectifs.filter(obj => {
        const authorEmail = extractAuthorEmail(obj);
        return authorEmail === userEmail;
      });
      
      const dateStr = date.toISOString().split('T')[0];
      
      const found = objectifs.find(obj => {
        if (!obj.Title || !obj.Date) return false;
        
        const objDate = new Date(obj.Date).toISOString().split('T')[0];
        return obj.Title === activityName && objDate === dateStr;
      });
      
      return found || null;
    } catch (error) {
      console.error('Erreur récupération objectif:', error);
      return null;
    }
  }

  /**
   * Compte combien de soumissions ont déjà été faites pour cet objectif
   */
  static async getSubmissionsCountForObjectif(
    activityName: string, 
    date: Date,
    getAllSubmissionsCallback: () => Promise<any[]>
  ): Promise<number> {
    try {
      const submissions = await getAllSubmissionsCallback();
      const dateStr = date.toISOString().split('T')[0];
      
      const count = submissions.filter(sub => {
        const subDate = new Date(sub.DateReception || sub.Created).toISOString().split('T')[0];
        return sub.Title === activityName && subDate === dateStr;
      }).length;
      
      return count;
    } catch (error) {
      console.error('Erreur comptage soumissions:', error);
      return 0;
    }
  }

  /**
   * Valide qu'une activité peut être soumise
   * Retourne { valid: boolean, message: string, objectif?: Objectif }
   */
  static async validateActivitySubmission(
    activityName: string,
    date: Date
  ): Promise<{ valid: boolean; message: string; objectif?: Objectif }> {
    // Vérifier si un objectif existe
    const objectif = await this.getObjectifForActivity(activityName, date);
    
    if (!objectif) {
      return {
        valid: false,
        message: `⚠️ Aucun objectif défini pour l'activité "${activityName}" à la date ${date.toLocaleDateString('fr-FR')}.\n\nVeuillez d'abord définir un objectif dans la section "🎯 Objectifs" avant de soumettre cette activité.`
      };
    }

    return {
      valid: true,
      message: `✓ Objectif trouvé : ${objectif.Nombre} attendu(s)`,
      objectif
    };
  }
}
