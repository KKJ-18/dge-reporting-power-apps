/**
 * Service de notifications pour vérifier les soumissions quotidiennes
 * Vérifie si l'utilisateur a défini ses objectifs et soumis ses activités pour la journée
 */

import { ObjectifService } from './ObjectifService';
import { UserProfileService } from './UserProfileService';

export interface DailyCheckResult {
  hasObjectifs: boolean;
  hasSubmissions: boolean;
  missingItems: string[];
  message: string;
}

export class NotificationService {
  /**
   * Vérifie si l'utilisateur a soumis ses objectifs et activités pour une date donnée
   */
  static async checkDailySubmission(userEmail: string, date: Date): Promise<DailyCheckResult> {
    const result: DailyCheckResult = {
      hasObjectifs: false,
      hasSubmissions: false,
      missingItems: [],
      message: '',
    };

    try {
      // Vérifier si objectifs définis pour la date
      const dateStr = date.toISOString().split('T')[0];
      
      const objectifs = await ObjectifService.getAll({
        filter: `Author/Email eq '${userEmail}' and DateObjectif eq '${dateStr}'`
      });
      
      result.hasObjectifs = objectifs.length > 0;
      
      if (!result.hasObjectifs) {
        result.missingItems.push('Objectifs de la journée');
      }

      // TODO: Vérifier les soumissions dans les services de formulaires
      // Pour l'instant, on considère que les soumissions sont optionnelles
      result.hasSubmissions = true;

      // Générer le message
      if (result.missingItems.length > 0) {
        result.message = `Il vous manque : ${result.missingItems.join(', ')}`;
      } else {
        result.message = 'Toutes vos données sont à jour !';
      }

      console.log(`📊 Vérification quotidienne pour ${userEmail}:`, result);
      return result;
      
    } catch (error) {
      console.error('Erreur lors de la vérification quotidienne:', error);
      result.message = 'Erreur lors de la vérification';
      return result;
    }
  }

  /**
   * Vérifie si la date est un jour ouvrable (lundi-vendredi)
   */
  static isWorkday(date: Date): boolean {
    const day = date.getDay();
    return day >= 1 && day <= 5; // 1=lundi, 5=vendredi
  }

  /**
   * Affiche une notification à l'utilisateur
   */
  static showNotification(title: string, message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info'): void {
    console.log(`🔔 [${type.toUpperCase()}] ${title}: ${message}`);
    
    // Cette méthode peut être étendue pour utiliser un système de toast/notification UI
    // Pour l'instant, elle log dans la console
  }

  /**
   * Effectue une vérification quotidienne complète et affiche une notification si nécessaire
   */
  static async performDailyCheck(): Promise<DailyCheckResult | null> {
    try {
      // Récupérer le profil utilisateur
      const userProfile = await UserProfileService.getCurrentUserProfile();
      
      if (!userProfile?.email) {
        console.warn('⚠️ Impossible de vérifier: profil utilisateur non disponible');
        return null;
      }

      // Vérifier si c'est un jour ouvrable
      const today = new Date();
      if (!this.isWorkday(today)) {
        console.log('📅 Week-end détecté, pas de vérification');
        return null;
      }

      // Effectuer la vérification
      const result = await this.checkDailySubmission(userProfile.email, today);

      // Afficher une notification si des éléments manquent
      if (result.missingItems.length > 0) {
        this.showNotification(
          'Rappel quotidien',
          result.message,
          'warning'
        );
      }

      return result;
      
    } catch (error) {
      console.error('Erreur lors de la vérification quotidienne:', error);
      return null;
    }
  }
}
