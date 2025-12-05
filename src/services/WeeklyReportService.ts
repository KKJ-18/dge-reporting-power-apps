/**
 * Service de génération du Rapport Hebdomadaire DGE
 * Structure comme le template Excel AFB avec les données des activités par département
 * Consolidation au niveau Direction
 */

import { ActivitySynthesisService, type ActivityRecord } from './ActivitySynthesisService';
import { DEPARTMENTS_MAP } from '../config/departmentsData';
import type { UserProfile } from './UserProfileService';
import type {
  RapportHebdomadaire,
  RapportHebdomadaireMetadata,
  CreditClassiqueSection,
  CreditClassiqueLigne,
  CreditProgrammeSection,
  MEPSection,
  MEPLigne,
  MEPTypeData,
  AutresSection,
  AccordsSection,
  DossierAccord,
  PretsNonPerformantsSection,
  SectionTextuelle
} from '../Models/WeeklyReportModel';

// =============================================================================
// TYPES
// =============================================================================

export interface WeeklyReportConfig {
  dateDebut: Date;
  dateFin: Date;
  departementId?: string; // Si vide = consolidation direction entière
  userProfile: UserProfile;
}

export interface DepartmentReportData {
  departmentId: string;
  departmentName: string;
  fullName: string;
  icon: string;
  color: string;
  activities: ActivityRecord[];
  report: RapportHebdomadaire;
}

export interface ConsolidatedReport {
  metadata: RapportHebdomadaireMetadata;
  // Données consolidées toute la direction
  consolidation: RapportHebdomadaire;
  // Données par département
  departements: DepartmentReportData[];
  // Statistiques globales
  stats: {
    totalActivites: number;
    totalUtilisateurs: number;
    activitesParJour: Record<string, number>;
  };
}

// =============================================================================
// UTILITAIRES
// =============================================================================

export function formatCurrency(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant) + ' FCFA';
}

export function formatMillions(montant: number): string {
  const millions = montant / 1_000_000;
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(millions) + ' M';
}

export function formatPeriode(debut: Date, fin: Date): string {
  const debutStr = debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const finStr = fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `du ${debutStr} au ${finStr}`;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function getCurrentWeekDates(): { debut: Date; fin: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const debut = new Date(now);
  debut.setDate(now.getDate() + mondayOffset);
  debut.setHours(0, 0, 0, 0);
  
  const fin = new Date(debut);
  fin.setDate(debut.getDate() + 6);
  fin.setHours(23, 59, 59, 999);
  
  return { debut, fin };
}

function extractMontant(record: any): number {
  const fields = ['Montant', 'MontantPret', 'MontantSollicite', 'MontantAccorde', 
                  'MontantDebloque', 'MontantContrat', 'MontantProvision', 'Valeur'];
  for (const field of fields) {
    if (record[field] !== undefined && record[field] !== null) {
      const val = parseFloat(record[field]);
      if (!isNaN(val)) return val;
    }
  }
  return 0;
}

function extractNombre(record: any): number {
  const fields = ['Nombre', 'NombreDossiers', 'Count', 'Quantite'];
  for (const field of fields) {
    if (record[field] !== undefined && record[field] !== null) {
      const val = parseInt(record[field]);
      if (!isNaN(val)) return val;
    }
  }
  return 1; // Par défaut, chaque enregistrement compte pour 1
}

// =============================================================================
// SERVICE PRINCIPAL
// =============================================================================

export class WeeklyReportService {
  
  /**
   * Génère le rapport consolidé (direction + départements)
   */
  static async generateConsolidatedReport(config: WeeklyReportConfig): Promise<ConsolidatedReport> {
    console.log('📊 Génération du rapport consolidé DGE...');
    
    // 1. Charger toutes les activités de la période
    const allActivities = await ActivitySynthesisService.getAllActivities(
      {
        startDate: config.dateDebut,
        endDate: config.dateFin,
        departmentId: config.departementId
      },
      config.userProfile
    );
    
    console.log(`✅ ${allActivities.length} activités chargées`);
    
    // 2. Grouper par département
    const activitiesByDept = new Map<string, ActivityRecord[]>();
    const deptIds = config.departementId ? [config.departementId] : ['DA', 'DSE', 'DPNP'];
    
    for (const deptId of deptIds) {
      activitiesByDept.set(deptId, []);
    }
    
    for (const activity of allActivities) {
      // Trouver le département de l'activité
      let deptId = 'DA'; // Par défaut
      
      for (const [id, config] of Object.entries(DEPARTMENTS_MAP)) {
        if (activity.departmentName === config.fullName || 
            activity.departmentName === config.name ||
            activity.departmentName === id) {
          deptId = id;
          break;
        }
      }
      
      const deptActivities = activitiesByDept.get(deptId) || [];
      deptActivities.push(activity);
      activitiesByDept.set(deptId, deptActivities);
    }
    
    // 3. Générer le rapport pour chaque département
    const departmentReports: DepartmentReportData[] = [];
    
    for (const [deptId, activities] of activitiesByDept) {
      const deptConfig = DEPARTMENTS_MAP[deptId as keyof typeof DEPARTMENTS_MAP];
      if (!deptConfig) continue;
      
      const report = this.generateDepartmentReport(activities, config, deptId);
      
      departmentReports.push({
        departmentId: deptId,
        departmentName: deptConfig.name,
        fullName: deptConfig.fullName,
        icon: deptConfig.icon,
        color: deptConfig.color,
        activities,
        report
      });
    }
    
    // 4. Générer le rapport consolidé (toute la direction)
    const consolidation = this.generateDepartmentReport(allActivities, config, 'DGE');
    
    // 5. Statistiques globales
    const activitesParJour: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    
    for (const activity of allActivities) {
      const dayKey = activity.createdDate.toISOString().split('T')[0];
      activitesParJour[dayKey] = (activitesParJour[dayKey] || 0) + 1;
      uniqueUsers.add(activity.authorEmail);
    }
    
    return {
      metadata: consolidation.metadata,
      consolidation,
      departements: departmentReports,
      stats: {
        totalActivites: allActivities.length,
        totalUtilisateurs: uniqueUsers.size,
        activitesParJour
      }
    };
  }
  
  /**
   * Génère le rapport d'un département (structure Excel)
   */
  private static generateDepartmentReport(
    activities: ActivityRecord[],
    config: WeeklyReportConfig,
    deptId: string
  ): RapportHebdomadaire {
    
    const metadata: RapportHebdomadaireMetadata = {
      reference: `AFB_RA_DGE_${deptId}_S${getWeekNumber(config.dateDebut)}_${config.dateDebut.getFullYear()}`,
      dateCreation: new Date(),
      auteur: config.userProfile.email,
      dateRevision: new Date(),
      periodeDebut: config.dateDebut,
      periodeFin: config.dateFin
    };
    
    return {
      metadata,
      creditsClassiques: this.buildCreditsClassiques(activities, deptId),
      creditsProgrammes: this.buildCreditsProgrammes(activities),
      autres: this.buildAutres(activities),
      situationMEP: this.buildSituationMEP(activities, config),
      accords: this.buildAccords(activities),
      sectionsTextuelles: this.buildSectionsTextuelles(activities),
      autresActivites: [],
      pretsNonPerformants: this.buildPretsNonPerformants(activities)
    };
  }
  
  /**
   * Section 1: Crédits Classiques (principalement DA)
   */
  private static buildCreditsClassiques(activities: ActivityRecord[], deptId: string): CreditClassiqueSection {
    const natures = [
      'Dossiers reçus des unités',
      'Dossiers en cours d\'analyse',
      'Dossiers de crédit en stand by',
      'Dossiers présentés au comité classique',
      'Dossiers présentés au comité de crédit du CA',
      'Dossiers Renvoyés',
      'Dossiers en attente de l\'avis du Risque',
      'Dossiers à convoquer',
      'Dossiers en attente de Comité de crédit'
    ];
    
    // Filtrer les activités liées aux crédits
    const creditActivities = activities.filter(a => 
      a.categoryName?.toLowerCase().includes('analyse') ||
      a.categoryName?.toLowerCase().includes('crédit') ||
      a.categoryName?.toLowerCase().includes('dossier') ||
      a.categoryName?.toLowerCase().includes('comité') ||
      a.tableName?.toLowerCase().includes('dossier') ||
      a.tableName?.toLowerCase().includes('comite')
    );
    
    // Mapper les activités aux natures
    const lignes: CreditClassiqueLigne[] = natures.map(nature => {
      const matchingActivities = creditActivities.filter(a => {
        const actName = a.activityName?.toLowerCase() || '';
        const natureLower = nature.toLowerCase();
        return actName.includes(natureLower.split(' ')[0]) || 
               natureLower.includes(actName.split(' ')[0]);
      });
      
      return {
        nature,
        nombre: matchingActivities.reduce((sum, a) => sum + extractNombre(a.data), 0),
        montant: matchingActivities.reduce((sum, a) => sum + extractMontant(a.data), 0)
      };
    });
    
    // Ajouter les activités non mappées
    const unmappedActivities = new Map<string, { nombre: number; montant: number }>();
    
    for (const activity of creditActivities) {
      let found = false;
      for (const ligne of lignes) {
        if (ligne.nombre > 0) {
          found = true;
          break;
        }
      }
      
      if (!found && activity.activityName) {
        const existing = unmappedActivities.get(activity.activityName) || { nombre: 0, montant: 0 };
        existing.nombre += extractNombre(activity.data);
        existing.montant += extractMontant(activity.data);
        unmappedActivities.set(activity.activityName, existing);
      }
    }
    
    // Ajouter les activités non mappées comme lignes supplémentaires
    for (const [name, data] of unmappedActivities) {
      if (data.nombre > 0) {
        lignes.push({
          nature: name,
          nombre: data.nombre,
          montant: data.montant
        });
      }
    }
    
    const total: CreditClassiqueLigne = {
      nature: 'TOTAL',
      nombre: lignes.reduce((sum, l) => sum + l.nombre, 0),
      montant: lignes.reduce((sum, l) => sum + l.montant, 0)
    };
    
    return {
      titre: '1. CRÉDITS CLASSIQUES',
      lignes: lignes.filter(l => l.nombre > 0 || natures.includes(l.nature)),
      total,
      commentaire: deptId === 'DA' ? 'Données du Département Analyse' : undefined
    };
  }
  
  /**
   * Section 2: Crédits Programmes
   */
  private static buildCreditsProgrammes(activities: ActivityRecord[]): CreditProgrammeSection {
    const programmeActivities = activities.filter(a =>
      a.categoryName?.toLowerCase().includes('programme') ||
      a.activityName?.toLowerCase().includes('programme')
    );
    
    let nombreParticulier = 0, montantParticulier = 0;
    let nombreEntreprise = 0, montantEntreprise = 0;
    
    for (const activity of programmeActivities) {
      const typeClient = (activity.data.TypeClient || '').toLowerCase();
      const nombre = extractNombre(activity.data);
      const montant = extractMontant(activity.data);
      
      if (typeClient.includes('particulier') || typeClient.includes('individu')) {
        nombreParticulier += nombre;
        montantParticulier += montant;
      } else {
        nombreEntreprise += nombre;
        montantEntreprise += montant;
      }
    }
    
    return {
      titre: '2. CRÉDITS PROGRAMMES',
      lignes: [
        { nature: 'Crédit programme particulier', nombre: nombreParticulier, montant: montantParticulier },
        { nature: 'Crédit programme Entreprise', nombre: nombreEntreprise, montant: montantEntreprise }
      ],
      total: {
        nature: 'TOTAL',
        nombre: nombreParticulier + nombreEntreprise,
        montant: montantParticulier + montantEntreprise
      }
    };
  }
  
  /**
   * Section 3: Autres (FAR, Notes)
   */
  private static buildAutres(activities: ActivityRecord[]): AutresSection {
    const autresActivities = activities.filter(a =>
      a.categoryName?.toLowerCase().includes('autre') ||
      a.categoryName?.toLowerCase().includes('transversal') ||
      a.activityName?.toLowerCase().includes('far') ||
      a.activityName?.toLowerCase().includes('note')
    );
    
    const lignesMap = new Map<string, { nombre: number; montant: number }>();
    lignesMap.set('FAR', { nombre: 0, montant: 0 });
    lignesMap.set('Notes en circulation', { nombre: 0, montant: 0 });
    
    for (const activity of autresActivities) {
      const name = activity.activityName || 'Autres';
      const existing = lignesMap.get(name) || { nombre: 0, montant: 0 };
      existing.nombre += extractNombre(activity.data);
      existing.montant += extractMontant(activity.data);
      lignesMap.set(name, existing);
    }
    
    const lignes = Array.from(lignesMap.entries()).map(([nature, data]) => ({
      nature,
      nombre: data.nombre,
      montant: data.montant
    }));
    
    return {
      titre: '3. AUTRES',
      lignes,
      total: {
        nature: 'TOTAL',
        nombre: lignes.reduce((sum, l) => sum + l.nombre, 0),
        montant: lignes.reduce((sum, l) => sum + l.montant, 0)
      }
    };
  }
  
  /**
   * Section 4: Situation MEP (principalement DSE)
   */
  private static buildSituationMEP(activities: ActivityRecord[], config: WeeklyReportConfig): MEPSection {
    const typesMEP = [
      'crédit amortissable',
      'structuration/conso',
      'cautions',
      'crédoc',
      'leasing',
      'Ligne découvert',
      'Autre lignes',
      'Finance islamique'
    ];
    
    // Filtrer les activités MEP
    const mepActivities = activities.filter(a =>
      a.categoryName?.toLowerCase().includes('mep') ||
      a.categoryName?.toLowerCase().includes('mise en place') ||
      a.categoryName?.toLowerCase().includes('déblocage') ||
      a.tableName?.toLowerCase().includes('mep') ||
      a.activityName?.toLowerCase().includes('mep')
    );
    
    // Initialiser les données par type
    const dataParType = new Map<string, { particulier: MEPTypeData; entreprise: MEPTypeData }>();
    
    for (const type of typesMEP) {
      dataParType.set(type, {
        particulier: { nombre: 0, montantDebloque: 0, pourcentageEngagement: 0 },
        entreprise: { nombre: 0, montantDebloque: 0, pourcentageEngagement: 0 }
      });
    }
    
    // Agréger les données
    for (const activity of mepActivities) {
      let typeMEP = activity.data.TypeMEP || activity.data.TypeCredit || activity.activityName || 'Autre lignes';
      
      // Normaliser le type
      const typeNormalized = typesMEP.find(t => 
        typeMEP.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(typeMEP.toLowerCase())
      ) || 'Autre lignes';
      
      const typeClient = (activity.data.TypeClient || '').toLowerCase();
      const isParticulier = typeClient.includes('particulier') || typeClient.includes('individu');
      
      const data = dataParType.get(typeNormalized)!;
      const target = isParticulier ? data.particulier : data.entreprise;
      
      target.nombre += extractNombre(activity.data);
      target.montantDebloque += extractMontant(activity.data);
    }
    
    const lignes: MEPLigne[] = typesMEP.map(type => {
      const data = dataParType.get(type)!;
      return {
        nature: type,
        particulier: data.particulier,
        entreprise: data.entreprise
      };
    });
    
    // Total
    const totalParticulier: MEPTypeData = {
      nombre: lignes.reduce((sum, l) => sum + l.particulier.nombre, 0),
      montantDebloque: lignes.reduce((sum, l) => sum + l.particulier.montantDebloque, 0),
      pourcentageEngagement: 0
    };
    
    const totalEntreprise: MEPTypeData = {
      nombre: lignes.reduce((sum, l) => sum + l.entreprise.nombre, 0),
      montantDebloque: lignes.reduce((sum, l) => sum + l.entreprise.montantDebloque, 0),
      pourcentageEngagement: 0
    };
    
    return {
      titre: '4. SITUATION MEP DE LA SEMAINE',
      periode: formatPeriode(config.dateDebut, config.dateFin),
      lignes,
      total: {
        nature: 'TOTAL',
        particulier: totalParticulier,
        entreprise: totalEntreprise
      }
    };
  }
  
  /**
   * Section 6: Accords de classement
   */
  private static buildAccords(activities: ActivityRecord[]): AccordsSection {
    const accordsActivities = activities.filter(a =>
      a.categoryName?.toLowerCase().includes('accord') ||
      a.tableName?.toLowerCase().includes('accord') ||
      a.activityName?.toLowerCase().includes('accord') ||
      a.activityName?.toLowerCase().includes('classement')
    );
    
    const dossiersAccordes: DossierAccord[] = [];
    const dossiersCompletsSoumis: DossierAccord[] = [];
    const dossiersIncompletsSoumis: DossierAccord[] = [];
    
    let numero = 1;
    
    for (const activity of accordsActivities) {
      const dossier: DossierAccord = {
        numero: numero++,
        entreprise: activity.data.Title || activity.data.Entreprise || activity.data.Client || `Dossier ${numero}`,
        montantDemande: extractMontant(activity.data),
        montantAccorde: activity.data.MontantAccorde ? parseFloat(activity.data.MontantAccorde) : undefined
      };
      
      const statut = (activity.data.Statut || '').toLowerCase();
      
      if (statut.includes('accord') || statut.includes('approuv')) {
        dossiersAccordes.push(dossier);
      } else if (statut.includes('complet')) {
        dossiersCompletsSoumis.push(dossier);
      } else {
        dossiersIncompletsSoumis.push(dossier);
      }
    }
    
    return {
      titre: '6. ACCORDS DE CLASSEMENT & AIM',
      dossiersAccordes,
      totalAccordes: {
        montantDemande: dossiersAccordes.reduce((sum, d) => sum + d.montantDemande, 0),
        montantAccorde: dossiersAccordes.reduce((sum, d) => sum + (d.montantAccorde || 0), 0)
      },
      dossiersCompletsSoumis,
      totalCompletsSoumis: {
        montantDemande: dossiersCompletsSoumis.reduce((sum, d) => sum + d.montantDemande, 0)
      },
      dossiersIncompletsSoumis,
      totalIncompletsSoumis: {
        montantDemande: dossiersIncompletsSoumis.reduce((sum, d) => sum + d.montantDemande, 0)
      }
    };
  }
  
  /**
   * Sections textuelles (7-16)
   */
  private static buildSectionsTextuelles(_activities: ActivityRecord[]): SectionTextuelle[] {
    return [
      { numero: 7, titre: 'Garanties', contenu: '' },
      { numero: 8, titre: 'Grands risques', contenu: '' },
      { numero: 9, titre: 'Gestion de la liquidité', contenu: '' },
      { numero: 10, titre: 'Conformité', contenu: '' },
      { numero: 11, titre: 'Classement/Déclassement', contenu: '' },
      { numero: 12, titre: 'Suivi des garanties', contenu: '' },
      { numero: 13, titre: 'Cautions', contenu: '' },
      { numero: 14, titre: 'Projet de Refonte INTRA', contenu: '' },
      { numero: 15, titre: 'Résolutions CAC & Audit', contenu: '' },
      { numero: 16, titre: 'AUTRES ACTIVITÉS', contenu: '' }
    ];
  }
  
  /**
   * Section 17: Prêts Non Performants (principalement DPNP)
   */
  private static buildPretsNonPerformants(activities: ActivityRecord[]): PretsNonPerformantsSection {
    const pnpActivities = activities.filter(a =>
      a.categoryName?.toLowerCase().includes('recouvrement') ||
      a.categoryName?.toLowerCase().includes('restructuration') ||
      a.categoryName?.toLowerCase().includes('provision') ||
      a.categoryName?.toLowerCase().includes('contentieux') ||
      a.categoryName?.toLowerCase().includes('pnp') ||
      a.categoryName?.toLowerCase().includes('non performant') ||
      a.tableName?.toLowerCase().includes('restructuration') ||
      a.tableName?.toLowerCase().includes('provision')
    );
    
    // Séparer par type
    const recouvrementActivities = pnpActivities.filter(a =>
      a.categoryName?.toLowerCase().includes('recouvrement') ||
      a.activityName?.toLowerCase().includes('recouvrement')
    );
    
    const restructurationActivities = pnpActivities.filter(a =>
      a.categoryName?.toLowerCase().includes('restructuration') ||
      a.activityName?.toLowerCase().includes('restructuration')
    );
    
    return {
      titre: '17. ACTIVITÉ DES PRÊTS NON PERFORMANTS',
      reductionAnomalies: {
        recouvrement: recouvrementActivities.map(a => ({
          libelle: a.data.Title || a.activityName || 'Recouvrement',
          montant: extractMontant(a.data),
          observation: a.data.Observation || ''
        })),
        totalRecouvrement: recouvrementActivities.reduce((sum, a) => sum + extractMontant(a.data), 0)
      },
      restructuration: {
        enCoursAnalyse: [],
        totalEnCoursAnalyse: 0,
        decisionCredit: [],
        totalDecisionCredit: 0,
        enCoursMEP: restructurationActivities.map(a => ({
          libelleCompte: a.data.Title || a.data.Agence || 'N/A',
          tresorerieAgios: extractMontant(a.data),
          etat: a.data.Etat || '',
          observation: a.data.Observation || ''
        })),
        totalEnCoursMEP: restructurationActivities.reduce((sum, a) => sum + extractMontant(a.data), 0)
      }
    };
  }
  
  /**
   * Export CSV
   */
  static exportToCSV(report: ConsolidatedReport): string {
    const lines: string[] = [];
    
    // En-tête
    lines.push(`RAPPORT HEBDOMADAIRE DGE - ${report.metadata.reference}`);
    lines.push(`Période: ${formatPeriode(report.metadata.periodeDebut, report.metadata.periodeFin)}`);
    lines.push('');
    
    // Crédits classiques
    lines.push('1. CRÉDITS CLASSIQUES');
    lines.push('Nature;Nombre;Montant (FCFA)');
    for (const ligne of report.consolidation.creditsClassiques.lignes) {
      lines.push(`${ligne.nature};${ligne.nombre};${ligne.montant}`);
    }
    lines.push(`TOTAL;${report.consolidation.creditsClassiques.total.nombre};${report.consolidation.creditsClassiques.total.montant}`);
    lines.push('');
    
    // MEP
    lines.push('4. SITUATION MEP');
    lines.push('Nature;Particulier Nbre;Particulier Montant;Entreprise Nbre;Entreprise Montant');
    for (const ligne of report.consolidation.situationMEP.lignes) {
      lines.push(`${ligne.nature};${ligne.particulier.nombre};${ligne.particulier.montantDebloque};${ligne.entreprise.nombre};${ligne.entreprise.montantDebloque}`);
    }
    
    return lines.join('\n');
  }
  
  /**
   * Télécharge le CSV
   */
  static downloadCSV(report: ConsolidatedReport, filename?: string): void {
    const csv = this.exportToCSV(report);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `rapport_hebdo_${report.metadata.reference}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
