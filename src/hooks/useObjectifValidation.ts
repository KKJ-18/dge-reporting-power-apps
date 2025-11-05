/**
 * Hook personnalisé pour valider les objectifs avant soumission
 */

import { useState } from 'react';
import { ObjectifValidationService } from '../services/ObjectifValidationService';
import type { ActivityName } from '../config/activityNames';

export function useObjectifValidation() {
  const [isValidating, setIsValidating] = useState(false);

  const validateBeforeSubmit = async (
    activityName: ActivityName,
    submissionDate: Date
  ): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const validation = await ObjectifValidationService.validateActivitySubmission(
        activityName,
        submissionDate
      );

      if (!validation.valid) {
        alert(validation.message);
        return false;
      }

      // Optionnel : afficher l'objectif trouvé
      if (validation.objectif) {
        console.log(`✓ Objectif validé: ${validation.objectif.Nombre} attendu(s) pour ${activityName}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur validation objectif:', error);
      alert('❌ Erreur lors de la validation de l\'objectif. Veuillez réessayer.');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    validateBeforeSubmit
  };
}
