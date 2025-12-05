/**
 * Configuration des champs à afficher pour chaque activité
 * Exclut les champs système SharePoint (Author, Editor, Created, Modified, etc.)
 * N'affiche que les champs saisis par l'utilisateur
 */

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'textarea';
  format?: (value: any) => string;
}

/**
 * Champs système SharePoint à exclure
 */
const SYSTEM_FIELDS = [
  'ID',
  'Modified',
  'Created',
  'Author#Claims',
  'Author',
  'Editor#Claims',
  'Editor',
  'OData__ColorTag',
  'ComplianceAssetId',
  '@odata.etag',
  'ItemInternalId',
  '{Identifier}',
  '{IsFolder}',
  '{Thumbnail}',
  '{Link}',
  '{Name}',
  '{FilenameWithExtension}',
  '{Path}',
  '{FullPath}',
  '{ModerationStatus}',
  '{ModerationComment}',
  '{ContentType}#Id',
  '{ContentType}',
  '{HasAttachments}',
  '{Attachments}@odata.type',
  '{Attachments}',
  '{VersionNumber}',
  '{TriggerWindowStartToken}',
  '{TriggerWindowEndToken}'
];

/**
 * Configuration des champs par type d'activité
 */
export const ACTIVITY_FIELDS_CONFIG: Record<string, FieldConfig[]> = {
  'Accords': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'Matricule', label: 'Matricule', type: 'text' },
    { key: 'Statut', label: 'Statut', type: 'text', format: (v) => v?.Title || v?.Value || 'N/A' },
    { key: 'MontantDemande', label: 'Montant Demandé', type: 'currency' },
    { key: 'MontantAccorde', label: 'Montant Accordé', type: 'currency' },
    { key: 'MontanPret', label: 'Montant Prêt', type: 'currency' }
  ],
  'Activités Transversales': [
    { key: 'Title', label: 'Activité', type: 'text' },
    { key: 'TitreOuTheme', label: 'Titre/Thème', type: 'textarea' },
    { key: 'DateValidation', label: 'Date Validation', type: 'date' },
    { key: 'DateTransmissionQualite', label: 'Date Transmission Qualité', type: 'date' },
    { key: 'Resultat', label: 'Résultat', type: 'textarea' }
  ],
  'Analyse Dossiers Comités': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'NombreDossiersAnalyses', label: 'Nombre Dossiers Analysés', type: 'number' },
    { key: 'NombreDossiersTransmis', label: 'Nombre Dossiers Transmis', type: 'number' },
    { key: 'MontantTotal', label: 'Montant Total', type: 'currency' }
  ],
  'Délais Crédit': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'NombreClientsTraites', label: 'Nombre Clients Traités', type: 'number' },
    { key: 'DelaiMoyen', label: 'Délai Moyen (jours)', type: 'number' },
    { key: 'TauxRespect', label: 'Taux de Respect (%)', type: 'number' }
  ],
  'Suivi Transmission': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'NombreDossiers', label: 'Nombre de Dossiers', type: 'number' },
    { key: 'DateTransmission', label: 'Date Transmission', type: 'date' },
    { key: 'Statut', label: 'Statut', type: 'text' }
  ],
  'Suivi MEP': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'NombreClientsAppeles', label: 'Clients Appelés', type: 'number' },
    { key: 'NombreClientsJoints', label: 'Clients Joints', type: 'number' },
    { key: 'DateAppel', label: 'Date Appel', type: 'date' }
  ],
  'Engagements': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'MontantEngagement', label: 'Montant Engagement', type: 'currency' },
    { key: 'TypeEngagement', label: 'Type Engagement', type: 'text' },
    { key: 'DateEngagement', label: 'Date Engagement', type: 'date' }
  ],
  'Visites Clientèle': [
    { key: 'Title', label: 'Client', type: 'text' },
    { key: 'DateVisite', label: 'Date de Visite', type: 'date' },
    { key: 'TypeVisite', label: 'Type de Visite', type: 'text' },
    { key: 'ObjetVisite', label: 'Objet', type: 'textarea' },
    { key: 'Observations', label: 'Observations', type: 'textarea' }
  ],
  'Formations': [
    { key: 'Title', label: 'Formation', type: 'text' },
    { key: 'Theme', label: 'Thème', type: 'text' },
    { key: 'DateFormation', label: 'Date', type: 'date' },
    { key: 'NombreParticipants', label: 'Participants', type: 'number' },
    { key: 'Duree', label: 'Durée (heures)', type: 'number' }
  ],
  'Contrats': [
    { key: 'Title', label: 'Titre', type: 'text' },
    { key: 'NumeroContrat', label: 'N° Contrat', type: 'text' },
    { key: 'DateSignature', label: 'Date Signature', type: 'date' },
    { key: 'Montant', label: 'Montant', type: 'currency' },
    { key: 'TypeContrat', label: 'Type', type: 'text' }
  ],
  'Détails Dossiers': [
    { key: 'Title', label: 'Dossier', type: 'text' },
    { key: 'NumeroDossier', label: 'N° Dossier', type: 'text' },
    { key: 'Client', label: 'Client', type: 'text' },
    { key: 'MontantDemande', label: 'Montant Demandé', type: 'currency' },
    { key: 'Statut', label: 'Statut', type: 'text' }
  ],
  'Détails MEP Client': [
    { key: 'Title', label: 'Client', type: 'text' },
    { key: 'DateMEP', label: 'Date MEP', type: 'date' },
    { key: 'MontantMEP', label: 'Montant', type: 'currency' },
    { key: 'StatutMEP', label: 'Statut', type: 'text' }
  ],
  'Clients Appelés': [
    { key: 'Title', label: 'Client', type: 'text' },
    { key: 'DateAppel', label: 'Date Appel', type: 'date' },
    { key: 'Resultat', label: 'Résultat', type: 'text' },
    { key: 'Observations', label: 'Observations', type: 'textarea' }
  ],
  'Restructurations': [
    { key: 'Title', label: 'Dossier', type: 'text' },
    { key: 'Client', label: 'Client', type: 'text' },
    { key: 'MontantInitial', label: 'Montant Initial', type: 'currency' },
    { key: 'MontantRestructure', label: 'Montant Restructuré', type: 'currency' },
    { key: 'DateRestructuration', label: 'Date', type: 'date' }
  ]
};

/**
 * Obtient les champs configurés pour une activité
 */
export function getActivityFields(activityName: string): FieldConfig[] {
  return ACTIVITY_FIELDS_CONFIG[activityName] || [];
}

/**
 * Vérifie si un champ est un champ système à exclure
 */
export function isSystemField(fieldName: string): boolean {
  return SYSTEM_FIELDS.includes(fieldName);
}

/**
 * Extrait uniquement les champs pertinents d'un objet de données
 */
export function extractUserFields(data: Record<string, any>, activityName: string): Record<string, any> {
  const fields = getActivityFields(activityName);
  
  if (fields.length === 0) {
    // Si pas de config, exclure uniquement les champs système
    const result: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      if (!isSystemField(key) && data[key] !== undefined && data[key] !== null) {
        result[key] = data[key];
      }
    });
    return result;
  }
  
  // Utiliser la config spécifique
  const result: Record<string, any> = {};
  fields.forEach(field => {
    if (data[field.key] !== undefined && data[field.key] !== null) {
      result[field.key] = data[field.key];
    }
  });
  return result;
}

/**
 * Formate une valeur selon son type
 */
export function formatFieldValue(value: any, field: FieldConfig): string {
  if (value === null || value === undefined) return 'N/A';
  
  if (field.format) {
    return field.format(value);
  }
  
  switch (field.type) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'XAF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(value));
      
    case 'date':
      return new Date(value).toLocaleDateString('fr-FR');
      
    case 'number':
      return new Intl.NumberFormat('fr-FR').format(Number(value));
      
    default:
      return String(value);
  }
}
