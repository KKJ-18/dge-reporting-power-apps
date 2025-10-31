/*!
 * Extension du modèle Activity pour supporter un champ texte au lieu de Lookup
 * Workaround pour la limitation du SDK : Lookup fields not supported
 */

import { Activity as ActivityBase } from './ActivityModel';

export interface ActivityExtended extends ActivityBase {
  CategorieNom?: string;  // Champ texte temporaire pour la catégorie
}
