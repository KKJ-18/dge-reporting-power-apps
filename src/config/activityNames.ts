/**
 * Mapping des noms d'activités pour la validation des objectifs
 * Ces noms doivent correspondre exactement aux noms dans DepartmentActivitiesService
 */

export const ACTIVITY_NAMES = {
  CREDIT_CLASSIQUE: 'Crédit Classique',
  CREDIT_PROGRAMME: 'Crédit Programme',
  EVALUATION_DELAIS: 'Évaluation Délais Crédit',
  ADMIN_ENGAGEMENTS: 'Admin Engagements',
  SUIVI_MEP: 'Suivi MEP',
  VISITES_CLIENTELE: 'Visites Clientèle',
  FORMATIONS: 'Formations',
  REUNIONS: 'Réunions',
  DEPLACEMENTS: 'Déplacements',
  AUDITS: 'Audits',
  AUTRES_ACTIVITES: 'Autres Activités',
  ACTIVITES_TRANSVERSALES: 'Activités Transversales'
} as const;

export type ActivityName = typeof ACTIVITY_NAMES[keyof typeof ACTIVITY_NAMES];
