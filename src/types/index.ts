// Types pour les données de reporting DGE

export interface User {
  id: string;
  name: string;
  email: string;
  division: 'Crédits' | 'Recouvrement' | 'Risques' | 'Opérations';
  role: 'collaborateur' | 'chef_division' | 'direction' | 'admin';
}

export interface WeeklyReport {
  id: string;
  userId: string;
  week: string; // Format: YYYY-Www (ex: 2025-W43)
  submissionDate: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  
  // Données du rapport
  creditsClassiques: string;
  comitesCredit: string;
  creditsProgrammes: string;
  autresCredits: string;
  mepClassements: string;
  activiteNonPerformants: string;
  projetsInternes: string;
  observations: string;
  
  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface SubmissionStatus {
  userId: string;
  userName: string;
  division: string;
  email: string;
  week: string;
  status: 'submitted' | 'pending' | 'overdue';
  submissionDate?: Date;
  daysPending?: number;
  lastReminderSent?: Date;
}

export interface ConsolidatedMetrics {
  period: string;
  division: string;
  metrics: {
    creditsClassiques: number;
    comitesCredit: number;
    creditsProgrammes: number;
    autresCredits: number;
    mepClassements: number;
    nonPerformants: number;
    projetsInternes: number;
  };
  totalActivities: number;
  completionRate: number;
}

export interface ExportRequest {
  reportIds?: string[];
  period?: {
    startDate: string;
    endDate: string;
  };
  format: 'pdf' | 'csv' | 'excel';
  includeDivisions?: string[];
  includeUsers?: string[];
  consolidated?: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  reminderTime: string; // Format HH:mm
  recipients: string[];
  template: 'standard' | 'urgent' | 'final';
}

export interface PowerBIConfig {
  workspaceId: string;
  reportId: string;
  datasetId: string;
  embedUrl: string;
  accessToken: string;
}

// Configuration pour les connexions Power Platform
export interface PowerPlatformConfig {
  sharepoint: {
    siteUrl: string;
    listName: string;
    libraryName: string;
  };
  powerAutomate: {
    exportFlowUrl: string;
    reminderFlowUrl: string;
    validationFlowUrl: string;
  };
  powerBI: PowerBIConfig;
}