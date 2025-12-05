/**
 * Modèle de données pour le Rapport Hebdomadaire DGE
 * Basé sur le template AFB_RA_PR04_RAPPORT_ACT_V1.0_2025
 */

// =============================================================================
// 1. CRÉDITS CLASSIQUES
// =============================================================================

export interface CreditClassiqueLigne {
  nature: string;
  nombre: number;
  montant: number; // en millions FCFA
  delaisMoyens?: number; // en jours
}

export interface CreditClassiqueSection {
  titre: string;
  lignes: CreditClassiqueLigne[];
  total: CreditClassiqueLigne;
  commentaire?: string;
}

// =============================================================================
// 2. CRÉDITS PROGRAMMES
// =============================================================================

export interface CreditProgrammeLigne {
  nature: string;
  nombre: number;
  montant: number;
}

export interface CreditProgrammeSection {
  titre: string;
  lignes: CreditProgrammeLigne[];
  total: CreditProgrammeLigne;
  commentaire?: string;
}

// =============================================================================
// 3. AUTRES (FAR, Notes en circulation)
// =============================================================================

export interface AutresLigne {
  nature: string;
  nombre: number;
  montant: number;
}

export interface AutresSection {
  titre: string;
  lignes: AutresLigne[];
  total: AutresLigne;
  commentaire?: string;
}

// =============================================================================
// 4. SITUATION MEP DE LA SEMAINE
// =============================================================================

export interface MEPTypeData {
  nombre: number;
  montantDebloque: number;
  pourcentageEngagement: number;
}

export interface MEPLigne {
  nature: string;
  particulier: MEPTypeData;
  entreprise: MEPTypeData;
}

export interface MEPSection {
  titre: string;
  periode: string; // ex: "du 17 au 24 Octobre 2025"
  lignes: MEPLigne[];
  total: MEPLigne;
  faitsMarquants?: string[];
}

// =============================================================================
// 5. LIGNES ÉCHUES ET VIVANTES
// =============================================================================

export interface LigneEcheance {
  nature: string;
  nombreEchues: number;
  montantEchues: number;
  nombreVivantes: number;
  montantVivantes: number;
}

export interface LignesEcheanceSection {
  titre: string;
  periode: string;
  lignes: LigneEcheance[];
  total: LigneEcheance;
}

// =============================================================================
// 6. ACCORDS DE CLASSEMENT & AIM
// =============================================================================

export interface DossierAccord {
  numero: number;
  entreprise: string;
  montantDemande: number;
  montantAccorde?: number;
}

export interface AccordsSection {
  titre: string;
  description?: string;
  dossiersAccordes: DossierAccord[];
  totalAccordes: { montantDemande: number; montantAccorde: number };
  dossiersCompletsSoumis: DossierAccord[];
  totalCompletsSoumis: { montantDemande: number };
  dossiersIncompletsSoumis: DossierAccord[];
  totalIncompletsSoumis: { montantDemande: number };
}

// =============================================================================
// 7-11. SECTIONS TEXTUELLES (Garanties, Cautions, INTRA, etc.)
// =============================================================================

export interface SectionTextuelle {
  numero: number;
  titre: string;
  contenu: string;
}

// =============================================================================
// 12-16. AUTRES ACTIVITÉS
// =============================================================================

export interface AutreActivite {
  numero: number;
  titre: string;
  contenu: string;
}

// =============================================================================
// 17. ACTIVITÉ DES PRÊTS NON PERFORMANTS
// =============================================================================

export interface ReductionAnomaliesLigne {
  libelle: string;
  montant: number;
  observation?: string;
}

export interface RestructurationLigne {
  libelleCompte: string;
  tresorerieAgios: number;
  observation: string;
}

export interface DecisionCreditLigne {
  libelleCompte: string;
  tresorerieAgios: number;
  observation: string;
}

export interface CourseMEPLigne {
  libelleCompte: string;
  tresorerieAgios: number;
  etat?: string;
  observation?: string;
}

export interface PretsNonPerformantsSection {
  titre: string;
  reductionAnomalies: {
    recouvrement: ReductionAnomaliesLigne[];
    totalRecouvrement: number;
  };
  restructuration: {
    enCoursAnalyse: RestructurationLigne[];
    totalEnCoursAnalyse: number;
    decisionCredit: DecisionCreditLigne[];
    totalDecisionCredit: number;
    enCoursMEP: CourseMEPLigne[];
    totalEnCoursMEP: number;
  };
}

// =============================================================================
// RAPPORT HEBDOMADAIRE COMPLET
// =============================================================================

export interface RapportHebdomadaireMetadata {
  reference: string; // ex: "AFB_RA_PR04_RAPPORT_ACT_V1.0_2025"
  dateCreation: Date;
  auteur: string;
  dateRevision: Date;
  periodeDebut: Date;
  periodeFin: Date;
}

export interface RapportHebdomadaire {
  metadata: RapportHebdomadaireMetadata;
  creditsClassiques: CreditClassiqueSection;
  creditsProgrammes: CreditProgrammeSection;
  autres: AutresSection;
  situationMEP: MEPSection;
  lignesEcheance?: LignesEcheanceSection;
  accords: AccordsSection;
  sectionsTextuelles: SectionTextuelle[];
  autresActivites: AutreActivite[];
  pretsNonPerformants: PretsNonPerformantsSection;
}

// =============================================================================
// NATURES PRÉ-DÉFINIES
// =============================================================================

export const NATURES_CREDITS_CLASSIQUES = [
  'Dossiers reçus des unités',
  'Dossiers en cours d\'analyse',
  'Dossiers de crédit en stand by',
  'Dossiers présentés au comité classique',
  'Dossiers présentés au comité de crédit du Conseil d\'Administration',
  'Dossiers Renvoyés',
  'Dossiers en attente de l\'avis du Risque',
  'Dossiers à convoquer',
  'Dossiers en attente de Comité de crédit',
  'Dossiers niveau Conseil transférés au Sous comité de Risque Groupe',
  'Dossiers en attente au SCRG',
  'Dossiers en attente du Comité de crédit du Conseil d\'Administration',
  'Dossiers niveau Conseil ayant reçu l\'objection du Sous comité de Risque Groupe'
];

export const NATURES_CREDITS_PROGRAMMES = [
  'Credit programme particulier',
  'Crédit programme Entreprise'
];

export const NATURES_AUTRES = [
  'FAR',
  'Notes en circulation'
];

export const NATURES_MEP = [
  'crédit amortissable',
  'structuration/conso',
  'cautions',
  'crédoc',
  'leasing',
  'Ligne découvert',
  'Autre lignes',
  'Finance islamique'
];

export const SECTIONS_TEXTUELLES_TITRES = [
  { numero: 8, titre: 'Grands risques' },
  { numero: 9, titre: 'Gestion de la liquidité' },
  { numero: 10, titre: 'Conformité' },
  { numero: 11, titre: 'Classement/Déclassement' },
  { numero: 12, titre: 'Suivi des garanties' },
  { numero: 13, titre: 'Cautions' },
  { numero: 14, titre: 'Projet de Refonte INTRA & nouvelle nomenclature des comptes dans UP' },
  { numero: 15, titre: 'Résolutions CAC & Audit' },
  { numero: 16, titre: 'AUTRES ACTIVITÉS' }
];
