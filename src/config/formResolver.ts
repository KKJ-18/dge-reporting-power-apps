export type ActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';

export type CreditClassiqueFormType =
  | 'dossiers-recus'
  | 'dossiers-comites'
  | 'far'
  | 'notes-circulation'
  | 'dossiers-analyse'
  | 'dossiers-risque'
  | 'dossiers-renvoyes'
  | 'dossiers-conformite'
  | 'dossiers-attente-comite'
  | 'scrg'
  | 'suivi-regularisation'
  | 'delais-credit';

export interface AnalyseFormConfig {
  formType: 'credit-classique' | 'suivi-transmission' | 'evaluation-delais' | 'admin-engagements' | 'suivi-mep' | 'activites-annexes';
  creditClassiqueType?: CreditClassiqueFormType;
  props?: {
    requiresComite?: boolean;
    requiresDetails?: boolean;
    activityType?: ActivityType;
  };
}

export type AnnexesActivityType = 'visites' | 'formations' | 'procedures' | 'etudes';
export type SuiviMEPType = 'particulier-identifier' | 'particulier-regulariser' | 'entreprise-identifier' | 'entreprise-regulariser';
export type AIMType = 'aim-analyse' | 'aim-depot-beac' | 'aim-reponses-beac' | 'aim-maj-beac';
export type ContratType = 'avance-facture' | 'prefinancement' | 'cautions';
export type ProjetsType = 'recensement-projets' | 'suivi-decaissements' | 'suivi-taux-avancement';
export type DeclarationType = 'teg' | 'fibane' | 'douane' | 'cre';
export type AutresActivitesType = 'visite-unite' | 'etudes-dse' | 'validation-dossiers' | 'formation-dse' | 'gestion-relations' | 'projets-dri-dsi' | 'redaction-procedures';

export interface DSEFormConfig {
  formType: 'suivi-mises-en-place' | 'aim' | 'contrats' | 'projets' | 'declaration-reglementaire' | 'autres-activites';
  specificType?: SuiviMEPType | AIMType | ContratType | ProjetsType | DeclarationType | AutresActivitesType | AnnexesActivityType;
}

export interface DPNPFormConfig {
  formType:
    | 'dossiers-restructuration'
    | 'suivi-anomalies'
    | 'formation-unites'
    | 'suivi-creances-restructurees'
    | 'suivi-client-appele'
    | 'reprise-provision'
    | 'rechercher-client-anomalie'
    | 'visite-clientele'
    | 'activites-annexes';
  specificType?: string;
}

export function resolveAnalyseFormType(categoryName: string, activityLabel: string): AnalyseFormConfig {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  if (categoryLower.includes('crédit classique') || categoryLower.includes('credit classique')) {
    if (activityLower.includes('reçu') || activityLower.includes('recu')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
    if (activityLower.includes('comité') || activityLower.includes('comite') || activityLower.includes('présenté')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-comites' };
    if (activityLower.includes('far')) return { formType: 'credit-classique', creditClassiqueType: 'far' };
    if (activityLower.includes('note')) return { formType: 'credit-classique', creditClassiqueType: 'notes-circulation' };
    if (activityLower.includes('analyse') || activityLower.includes('cours')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-analyse' };
    if (activityLower.includes('risque')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-risque' };
    if (activityLower.includes('renvoy')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-renvoyes' };
    if (activityLower.includes('conformit')) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-conformite' };
    if (activityLower.includes('attente') && (activityLower.includes('comité') || activityLower.includes('comite'))) return { formType: 'credit-classique', creditClassiqueType: 'dossiers-attente-comite' };
    if (activityLower.includes('scrg') || activityLower.includes('conseil')) return { formType: 'credit-classique', creditClassiqueType: 'scrg' };
    if (activityLower.includes('régularis') || activityLower.includes('regularis') || activityLower.includes('cc4') || activityLower.includes('ccca')) return { formType: 'credit-classique', creditClassiqueType: 'suivi-regularisation' };
    if (activityLower.includes('délai') || activityLower.includes('delai') || activityLower.includes('evaluation')) return { formType: 'credit-classique', creditClassiqueType: 'delais-credit' };
    return { formType: 'credit-classique', creditClassiqueType: 'dossiers-recus' };
  }

  if (categoryLower.includes('crédit programme') || categoryLower.includes('credit programme')) {
    if (activityLower.includes('délai') || activityLower.includes('delai')) return { formType: 'evaluation-delais' };
    const requiresComite = activityLower.includes('comité') || activityLower.includes('comite');
    return { formType: 'suivi-transmission', props: { requiresComite } };
  }

  if (categoryLower.includes('administration') || categoryLower.includes('engagement')) {
    return { formType: 'admin-engagements' };
  }

  if (categoryLower.includes('suivi') && (activityLower.includes('mep') || activityLower.includes('mis en place'))) {
    return { formType: 'suivi-mep' };
  }

  if (categoryLower.includes('annexe') || categoryLower.includes('transversal')) {
    let activityType: ActivityType = 'visites';
    if (activityLower.includes('formation')) activityType = 'formations';
    else if (activityLower.includes('procédure') || activityLower.includes('procedure')) activityType = 'procedures';
    else if (activityLower.includes('étude') || activityLower.includes('etude')) activityType = 'etudes';
    else if (activityLower.includes('visite')) activityType = 'visites';
    return { formType: 'activites-annexes', props: { activityType } };
  }

  return { formType: 'credit-classique', props: { requiresComite: false, requiresDetails: false } };
}

export function resolveDSEFormType(categoryName: string, activityLabel: string): DSEFormConfig {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // ── Cat. 1 : Suivi des mises en place ──────────────────────────────────
  if (categoryLower.includes('suivi') && categoryLower.includes('mise') && categoryLower.includes('place')) {
    if (activityLower.includes('particulier') && activityLower.includes('identifier'))
      return { formType: 'suivi-mises-en-place', specificType: 'particulier-identifier' };
    if (activityLower.includes('particulier') && activityLower.includes('régularis'))
      return { formType: 'suivi-mises-en-place', specificType: 'particulier-regulariser' };
    if (activityLower.includes('entreprise') && activityLower.includes('identifier'))
      return { formType: 'suivi-mises-en-place', specificType: 'entreprise-identifier' };
    if (activityLower.includes('entreprise') && activityLower.includes('régularis'))
      return { formType: 'suivi-mises-en-place', specificType: 'entreprise-regulariser' };
    return { formType: 'suivi-mises-en-place', specificType: 'particulier-identifier' };
  }

  // ── Cat. 2 : AIM ───────────────────────────────────────────────────────
  if (categoryLower.includes('aim') || categoryLower.includes('autorisation individuelle')) {
    if (activityLower.includes('analyse')) return { formType: 'aim', specificType: 'aim-analyse' };
    if (activityLower.includes('dépôt') || activityLower.includes('depot'))
      return { formType: 'aim', specificType: 'aim-depot-beac' };
    if (activityLower.includes('réponse') || activityLower.includes('reponse'))
      return { formType: 'aim', specificType: 'aim-reponses-beac' };
    if (activityLower.includes('mise à jour') || activityLower.includes('maj'))
      return { formType: 'aim', specificType: 'aim-maj-beac' };
    return { formType: 'aim', specificType: 'aim-analyse' };
  }

  // ── Cat. 3 : Contrats ──────────────────────────────────────────────────
  if (categoryLower.includes('contrat')) {
    if (activityLower.includes('avance') && activityLower.includes('facture'))
      return { formType: 'contrats', specificType: 'avance-facture' };
    if (activityLower.includes('préfinancement') || activityLower.includes('prefinancement'))
      return { formType: 'contrats', specificType: 'prefinancement' };
    if (activityLower.includes('caution'))
      return { formType: 'contrats', specificType: 'cautions' };
    return { formType: 'contrats', specificType: 'avance-facture' };
  }

  // ── Cat. 4 : Projets ──────────────────────────────────────────────────
  if (categoryLower.includes('projet') && !categoryLower.includes('autre')) {
    if (activityLower.includes('recensement'))
      return { formType: 'projets', specificType: 'recensement-projets' };
    if (activityLower.includes('décaissement') || activityLower.includes('decaissement'))
      return { formType: 'projets', specificType: 'suivi-decaissements' };
    if (activityLower.includes('taux') || activityLower.includes('avancement'))
      return { formType: 'projets', specificType: 'suivi-taux-avancement' };
    return { formType: 'projets', specificType: 'recensement-projets' };
  }

  // ── Cat. 5 : Déclaration Réglementaire ─────────────────────────────────
  if (categoryLower.includes('déclaration') || categoryLower.includes('declaration') || categoryLower.includes('réglementaire') || categoryLower.includes('reglementaire')) {
    if (activityLower.includes('teg')) return { formType: 'declaration-reglementaire', specificType: 'teg' };
    if (activityLower.includes('fibane')) return { formType: 'declaration-reglementaire', specificType: 'fibane' };
    if (activityLower.includes('douane')) return { formType: 'declaration-reglementaire', specificType: 'douane' };
    if (activityLower.includes('cre')) return { formType: 'declaration-reglementaire', specificType: 'cre' };
    return { formType: 'declaration-reglementaire', specificType: 'teg' };
  }

  // ── Cat. 6 : Autres Activités ──────────────────────────────────────────
  if (categoryLower.includes('autre') || categoryLower.includes('activité') || categoryLower.includes('activite')) {
    if (activityLower.includes('visite'))
      return { formType: 'autres-activites', specificType: 'visite-unite' };
    if (activityLower.includes('étude') || activityLower.includes('etude'))
      return { formType: 'autres-activites', specificType: 'etudes-dse' };
    if (activityLower.includes('validation') || activityLower.includes('dossier'))
      return { formType: 'autres-activites', specificType: 'validation-dossiers' };
    if (activityLower.includes('formation'))
      return { formType: 'autres-activites', specificType: 'formation-dse' };
    if (activityLower.includes('gestion') || activityLower.includes('relation') || activityLower.includes('cnef'))
      return { formType: 'autres-activites', specificType: 'gestion-relations' };
    if (activityLower.includes('dri') || activityLower.includes('dsi'))
      return { formType: 'autres-activites', specificType: 'projets-dri-dsi' };
    if (activityLower.includes('procédure') || activityLower.includes('procedure') || activityLower.includes('rédaction') || activityLower.includes('redaction'))
      return { formType: 'autres-activites', specificType: 'redaction-procedures' };
    return { formType: 'autres-activites', specificType: 'visite-unite' };
  }

  // Fallback
  return { formType: 'suivi-mises-en-place', specificType: 'particulier-identifier' };
}

export function resolveDPNPFormType(categoryName: string, activityLabel: string): DPNPFormConfig {
  const categoryLower = categoryName.toLowerCase();
  const activityLower = activityLabel.toLowerCase();

  // ── Cat. 1 : Analyse des dossiers de restructuration ────────────────────────
  if (categoryLower.includes('restructuration') && !categoryLower.includes('créances')) {
    if (activityLower.includes('réception') || activityLower.includes('reception'))
      return { formType: 'dossiers-restructuration', specificType: 'reception-dossiers' };
    if (activityLower.includes('compléments') || activityLower.includes('complements'))
      return { formType: 'dossiers-restructuration', specificType: 'dossiers-complements' };
    if (activityLower.includes('éléments de l\'unité') || activityLower.includes('elements de l\'unite') || activityLower.includes('nous a reçus'))
      return { formType: 'dossiers-restructuration', specificType: 'dossiers-elements-recus' };
    if (activityLower.includes('cours d\'analyse'))
      return { formType: 'dossiers-restructuration', specificType: 'dossier-analyse' };
    if (activityLower.includes('attente de comité') || activityLower.includes('attente de comite'))
      return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-comite' };
    if (activityLower.includes('attente de décision') || activityLower.includes('attente de decision'))
      return { formType: 'dossiers-restructuration', specificType: 'dossier-attente-decision' };
    if (activityLower.includes('accord') && !activityLower.includes('attente'))
      return { formType: 'dossiers-restructuration', specificType: 'dossier-accord' };
    if (activityLower.includes('rejeté') || activityLower.includes('rejete') || activityLower.includes('rejet'))
      return { formType: 'dossiers-restructuration', specificType: 'dossier-rejete' };
    return { formType: 'dossiers-restructuration', specificType: 'reception-dossiers' };
  }

  // ── Cat. 2 : Suivi des créances restructurées ────────────────────────────────
  if (categoryLower.includes('créances restructurees') || categoryLower.includes('creances restructur'))
    return { formType: 'suivi-creances-restructurees', specificType: 'remboursement-echeance' };

  // ── Cat. 3 : Suivi des anomalies leasing ─────────────────────────────────────
  if (categoryLower.includes('anomalies leasing') || categoryLower.includes('anomalie leasing')) {
    if (activityLower.includes('parc automobile') || activityLower.includes('parc auto'))
      return { formType: 'suivi-anomalies', specificType: 'parc-auto' };
    if (activityLower.includes('tracking'))
      return { formType: 'suivi-anomalies', specificType: 'tracking' };
    return { formType: 'suivi-anomalies', specificType: 'anomalies-leasing' };
  }

  // ── Cat. 4 : Travail de proximité avec les unités ────────────────────────────
  if (categoryLower.includes('proximit') || categoryLower.includes('formation des unit')) {
    if (activityLower.includes('formation'))
      return { formType: 'formation-unites' };
    // Renseigner origine anomalies
    return { formType: 'suivi-anomalies', specificType: 'anomalies-proximite' };
  }

  // ── Cat. 5 : Recouvrement par versement ──────────────────────────────────────
  if (categoryLower.includes('recouvrement') && !categoryLower.includes('gfc')) {
    return { formType: 'suivi-client-appele' };
  }

  // ── Cat. 6 : Suivi de la contagion des comptes ───────────────────────────────
  if (categoryLower.includes('contagion')) {
    if (activityLower.includes('montant global'))
      return { formType: 'reprise-provision', specificType: 'montant-regulariser' };
    return { formType: 'reprise-provision', specificType: 'comptes-nettoyer' };
  }

  // ── Cat. 7 : Recherche clients à l'étranger ──────────────────────────────────
  if (categoryLower.includes('recherche') || categoryLower.includes('risque canada') || categoryLower.includes('étranger')) {
    if (activityLower.includes('ayant répondu') || activityLower.includes('ayant repondu'))
      return { formType: 'rechercher-client-anomalie', specificType: 'clients-ayant-repondu' };
    // clients-contacts est le cas par défaut
    return { formType: 'rechercher-client-anomalie', specificType: 'clients-contacts' };
  }

  // ── Cat. 8 : Activités annexes ────────────────────────────────────────────────
  if (categoryLower.includes('activités annexes') || categoryLower.includes('activites annexes')) {
    if (activityLower.includes('visite'))
      return { formType: 'activites-annexes', specificType: 'visites-clienteles' };
    if (activityLower.includes('procédure') || activityLower.includes('procedure'))
      return { formType: 'activites-annexes', specificType: 'procedures' };
    if (activityLower.includes('étude') || activityLower.includes('etude'))
      return { formType: 'activites-annexes', specificType: 'etudes' };
    if (activityLower.includes('autres'))
      return { formType: 'activites-annexes', specificType: 'autres-activites' };
    return { formType: 'activites-annexes', specificType: 'autres-activites' };
  }

  return { formType: 'dossiers-restructuration', specificType: 'reception-dossiers' };
}
