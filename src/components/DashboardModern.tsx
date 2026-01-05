import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VisiteClienteleService } from '../services/VisiteClienteleService';
import { ObjectifService } from '../services/ObjectifService';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import { AccordsService } from '../services/AccordsService';
import { ContratsService } from '../services/ContratsService';
import { SituationMEPService } from '../services/SituationMEPService';
import { UserProfileService, type UserProfile } from '../services/UserProfileService';
import ModernLoader from './ModernLoader';
import './DashboardModern.css';

interface DashboardModernProps {
  onModuleSelect?: (moduleId: string) => void;
}

// Types pour les données
interface DashboardStats {
  visitesPlanned: number;
  visitesChange: number;
  tauxRecouvrement: number;
  tauxChange: number;
  dossiersEnCours: number;
  dossiersChange: number;
  objectifMensuel: number;
}

interface VisiteRecente {
  id: string;
  client: string;
  date: string;
  statut: 'Complétée' | 'Planifiée' | 'En attente';
}

interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  time: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

interface PieDataPoint {
  label: string;
  value: number;
  color: string;
  count?: number;
}

type PeriodFilter = 'week' | 'month' | 'quarter';

// Styles inline
const styles = {
  container: {
    padding: '24px',
    background: '#F8FAFC',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  headerLeft: {
    flex: 1,
  },
  breadcrumb: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '8px',
  },
  breadcrumbLink: {
    color: '#6B7280',
    textDecoration: 'none',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#1F2937',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B7280',
    margin: '4px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    gap: '8px',
    minWidth: '200px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#374151',
    width: '100%',
    background: 'transparent',
  },
  searchIcon: {
    color: '#9CA3AF',
    fontSize: '16px',
  },
  notificationBtn: {
    position: 'relative' as const,
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: '-4px',
    right: '-4px',
    background: '#DC2626',
    color: 'white',
    fontSize: '10px',
    fontWeight: 600,
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    background: '#DC2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap' as const,
  },
  select: {
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    minWidth: '150px',
  },
  periodTabs: {
    display: 'flex',
    background: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  periodTab: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: '#6B7280',
    transition: 'all 0.15s ease',
  },
  periodTabActive: {
    background: '#DC2626',
    color: 'white',
  },
  exportButton: {
    background: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: 'auto',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  metricCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '8px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#1F2937',
    lineHeight: 1,
  },
  metricChange: {
    fontSize: '12px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  metricChangePositive: {
    color: '#10B981',
  },
  metricChangeNegative: {
    color: '#EF4444',
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1F2937',
    margin: 0,
  },
  chartTabs: {
    display: 'flex',
    gap: '8px',
  },
  chartTab: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    background: 'white',
    color: '#6B7280',
  },
  chartTabActive: {
    background: '#FEF2F2',
    borderColor: '#DC2626',
    color: '#DC2626',
  },
  lineChart: {
    height: '220px',
    position: 'relative' as const,
    padding: '20px 0',
  },
  lineChartSvg: {
    width: '100%',
    height: '180px',
  },
  lineChartLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '8px',
    borderTop: '1px solid #E5E7EB',
  },
  lineChartLabel: {
    fontSize: '11px',
    color: '#6B7280',
    textAlign: 'center' as const,
  },
  barChart: {
    height: '250px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    padding: '20px 0',
    borderBottom: '1px solid #E5E7EB',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  barContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    height: '180px',
  },
  bar: {
    width: '24px',
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '11px',
    color: '#6B7280',
    textAlign: 'center' as const,
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#6B7280',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  pieContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  pieChart: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    position: 'relative' as const,
  },
  pieCenter: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80px',
    height: '80px',
    background: 'white',
    borderRadius: '50%',
  },
  pieLegend: {
    flex: 1,
  },
  pieLegendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  pieLegendLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#374151',
  },
  pieLegendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '2px',
  },
  pieLegendValue: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1F2937',
  },
  bottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  listItemInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  listItemTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1F2937',
  },
  listItemSubtitle: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 600,
  },
  viewAllLink: {
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  alertItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
  },
  alertIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1F2937',
    marginBottom: '2px',
  },
  alertDescription: {
    fontSize: '12px',
    color: '#9CA3AF',
  },
  alertTime: {
    fontSize: '11px',
    color: '#9CA3AF',
    whiteSpace: 'nowrap' as const,
  },
  loadingOverlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#6B7280',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#9CA3AF',
  },
};

// Couleurs pour les métriques
const metricColors = {
  blue: { bg: '#EFF6FF', icon: '#3B82F6' },
  green: { bg: '#ECFDF5', icon: '#10B981' },
  yellow: { bg: '#FFFBEB', icon: '#F59E0B' },
  purple: { bg: '#F5F3FF', icon: '#8B5CF6' },
};

const DashboardModern: React.FC<DashboardModernProps> = ({ onModuleSelect }) => {
  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchText, setSearchText] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('weekly');
  const [departementFilter, setDepartementFilter] = useState<'all' | 'DA' | 'DSE' | 'DPNP'>('all'); // Pour le Directeur
  
  // Données
  const [stats, setStats] = useState<DashboardStats>({
    visitesPlanned: 0,
    visitesChange: 0,
    tauxRecouvrement: 0,
    tauxChange: 0,
    dossiersEnCours: 0,
    dossiersChange: 0,
    objectifMensuel: 0,
  });
  const [visitesRecentes, setVisitesRecentes] = useState<VisiteRecente[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);
  const [allRawData, setAllRawData] = useState<any[]>([]); // Pour l'export

  // Calcul des dates de filtre
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);
    
    switch (periodFilter) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    return { startDate, endDate };
  }, [periodFilter]);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Charger le profil utilisateur
        const profile = await UserProfileService.getCurrentUserProfile();
        setUserProfile(profile);

        const { startDate, endDate } = getDateRange();

        // **FILTRAGE SELON LE RÔLE**
        // Directeur : Toutes les données
        // Chef de département : Données de son département
        // Agent : Ses propres données uniquement
        
        const isDirecteur = profile.isDirecteur;
        const isChef = profile.fonction?.toLowerCase().includes('chef') || false;
        const userDepartement = profile.departement;
        const userEmail = profile.email;

        // 2. Charger les visites clientèle
        const visitesResult = await VisiteClienteleService.getAll();
        let visites = visitesResult?.data || visitesResult?.value || [];
        
        // Filtrer selon le rôle
        if (!isDirecteur) {
          if (isChef && userDepartement) {
            // Chef : Voir toutes les visites de son département
            visites = visites.filter((v: any) => 
              v.Departement?.Value === userDepartement || 
              v.Departement === userDepartement
            );
          } else {
            // Agent : Voir uniquement ses propres visites
            visites = visites.filter((v: any) => 
              v.Author?.EMail === userEmail || 
              v.CreatedBy?.EMail === userEmail ||
              v.Author?.Email === userEmail
            );
          }
        } else if (departementFilter !== 'all') {
          // Directeur avec filtre de département
          visites = visites.filter((v: any) => 
            v.Departement?.Value === departementFilter || 
            v.Departement === departementFilter
          );
        }
        
        // Filtrer par période et transformer
        const visitesFiltered = visites.filter((v: any) => {
          const dateVisite = v.DateVisite ? new Date(v.DateVisite) : null;
          return dateVisite && dateVisite >= startDate && dateVisite <= endDate;
        });

        // Transformer en visites récentes
        const recentVisites: VisiteRecente[] = visitesFiltered
          .sort((a: any, b: any) => {
            const dateA = a.DateVisite ? new Date(a.DateVisite).getTime() : 0;
            const dateB = b.DateVisite ? new Date(b.DateVisite).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 10)
          .map((v: any) => ({
            id: String(v.ID || Math.random()),
            client: v.NomClient || v.Title || 'Client inconnu',
            date: v.DateVisite 
              ? new Date(v.DateVisite).toLocaleDateString('fr-FR', { 
                  weekday: 'short', 
                  day: 'numeric', 
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Date inconnue',
            statut: getVisiteStatus(v),
          }));
        setVisitesRecentes(recentVisites);

        // 3. Charger les objectifs
        const objectifsResult = await ObjectifService.getAll();
        let objectifs = objectifsResult?.data || objectifsResult?.value || [];
        
        // Filtrer selon le rôle
        if (!isDirecteur) {
          if (isChef && userDepartement) {
            objectifs = objectifs.filter((o: any) => 
              o.Departement?.Value === userDepartement || 
              o.Departement === userDepartement
            );
          } else {
            objectifs = objectifs.filter((o: any) => 
              o.Author?.EMail === userEmail || 
              o.CreatedBy?.EMail === userEmail ||
              o.Author?.Email === userEmail
            );
          }
        } else if (departementFilter !== 'all') {
          // Directeur avec filtre de département
          objectifs = objectifs.filter((o: any) => 
            o.Departement?.Value === departementFilter || 
            o.Departement === departementFilter
          );
        }
        
        // Calculer l'objectif mensuel (somme des objectifs du mois)
        const objectifsMois = objectifs.filter((o: any) => {
          const dateObj = o.Date ? new Date(o.Date) : null;
          return dateObj && dateObj >= startDate && dateObj <= endDate;
        });
        const totalObjectif = objectifsMois.reduce((sum: number, o: any) => sum + (o.Nombre || 0), 0);

        // 4. Charger les actions de recouvrement
        const recouvrementResult = await ActionRecouvrementService.getAll();
        let recouvrements = recouvrementResult?.data || recouvrementResult?.value || [];
        
        // Filtrer selon le rôle
        if (!isDirecteur) {
          if (isChef && userDepartement) {
            recouvrements = recouvrements.filter((r: any) => 
              r.Departement?.Value === userDepartement || 
              r.Departement === userDepartement
            );
          } else {
            recouvrements = recouvrements.filter((r: any) => 
              r.Author?.EMail === userEmail || 
              r.CreatedBy?.EMail === userEmail ||
              r.Author?.Email === userEmail
            );
          }
        } else if (departementFilter !== 'all') {
          // Directeur avec filtre de département
          recouvrements = recouvrements.filter((r: any) => 
            r.Departement?.Value === departementFilter || 
            r.Departement === departementFilter
          );
        }
        
        // Calculer le taux de recouvrement
        const recouvrementsPeriode = recouvrements.filter((r: any) => {
          const dateAction = r.DateExc_x00e9_cution || r.Created ? new Date(r.DateExc_x00e9_cution || r.Created) : null;
          return dateAction && dateAction >= startDate && dateAction <= endDate;
        });
        const recouvrementComplete = recouvrementsPeriode.filter((r: any) => 
          r.Statut?.Value === 'Terminé' || r.Statut?.Value === 'Complété' || r.Statut?.Value === 'Exécuté'
        ).length;
        const tauxRecouvrement = recouvrementsPeriode.length > 0 
          ? Math.round((recouvrementComplete / recouvrementsPeriode.length) * 100)
          : 0;

        // 5. Charger les accords (dossiers en cours)
        const accordsResult = await AccordsService.getAll();
        let accords = accordsResult?.data || accordsResult?.value || [];
        
        // Filtrer selon le rôle
        if (!isDirecteur) {
          if (isChef && userDepartement) {
            accords = accords.filter((a: any) => 
              a.Departement?.Value === userDepartement || 
              a.Departement === userDepartement
            );
          } else {
            accords = accords.filter((a: any) => 
              a.Author?.EMail === userEmail || 
              a.CreatedBy?.EMail === userEmail ||
              a.Author?.Email === userEmail
            );
          }
        } else if (departementFilter !== 'all') {
          // Directeur avec filtre de département
          accords = accords.filter((a: any) => 
            a.Departement?.Value === departementFilter || 
            a.Departement === departementFilter
          );
        }
        const accordsEnCours = accords.filter((a: any) => 
          a.Statut?.Value === 'En cours' || a.Statut?.Value === 'En attente' || !a.Statut
        ).length;

        // Stocker les données brutes pour l'export
        setAllRawData([...visitesFiltered, ...recouvrementsPeriode, ...accords]);

        // 6. Charger les contrats (pour stats futures)
        const contratsResult = await ContratsService.getAll();
        const contrats = contratsResult?.data || contratsResult?.value || [];
        // Utiliser contrats pour des statistiques futures si nécessaire
        console.log(`Contrats chargés: ${contrats.length}`);

        // 7. Charger les situations MEP (pour stats futures)
        const mepResult = await SituationMEPService.getAll();
        const meps = mepResult?.data || mepResult?.value || [];
        // Utiliser meps pour des statistiques futures si nécessaire
        console.log(`MEPs chargées: ${meps.length}`);

        // 8. Calculer les alertes
        const newAlerts: AlertItem[] = [];
        
        // Alertes sur les dossiers en retard
        const dossierRetard = accords.filter((a: any) => {
          const dateAccord = a.Date ? new Date(a.Date) : null;
          if (!dateAccord) return false;
          const daysSince = Math.floor((new Date().getTime() - dateAccord.getTime()) / (1000 * 60 * 60 * 24));
          return daysSince > 7 && a.Statut?.Value !== 'Terminé' && a.Statut?.Value !== 'Validé';
        }).length;
        
        if (dossierRetard > 0) {
          newAlerts.push({
            id: '1',
            type: 'warning',
            title: `${dossierRetard} dossiers en retard`,
            description: 'Action requise sur les rapatriements',
            time: '2h',
          });
        }

        // Alerte objectif
        const progressObjectif = totalObjectif > 0 
          ? Math.round((visitesFiltered.length / totalObjectif) * 100) 
          : 0;
        
        if (progressObjectif > 0 && progressObjectif < 100) {
          const joursRestants = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          newAlerts.push({
            id: '2',
            type: 'info',
            title: 'Objectif hebdomadaire',
            description: `À ${progressObjectif}% - Reste ${Math.max(0, joursRestants)} jours`,
            time: '5h',
          });
        }

        // Info template
        newAlerts.push({
          id: '3',
          type: 'success',
          title: 'Nouveau template disponible',
          description: 'Template rapport mensuel v2',
          time: '1j',
        });

        setAlerts(newAlerts);

        // 9. Préparer les données du graphique en ligne - Activité hebdomadaire
        // Calculer les activités par jour sur les 7 derniers jours
        const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const today = new Date();
        const last7Days: ChartDataPoint[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dayIndex = date.getDay();
          const dayName = jours[dayIndex === 0 ? 6 : dayIndex - 1]; // Ajuster pour commencer par Lun
          
          // Compter les activités créées ce jour
          const dayStart = new Date(date.setHours(0, 0, 0, 0));
          const dayEnd = new Date(date.setHours(23, 59, 59, 999));
          
          const visitesJour = visites.filter((v: any) => {
            const d = v.Created ? new Date(v.Created) : null;
            return d && d >= dayStart && d <= dayEnd;
          }).length;
          
          const recouvrementsJour = recouvrements.filter((r: any) => {
            const d = r.Created ? new Date(r.Created) : null;
            return d && d >= dayStart && d <= dayEnd;
          }).length;
          
          const accordsJour = accords.filter((a: any) => {
            const d = a.Created ? new Date(a.Created) : null;
            return d && d >= dayStart && d <= dayEnd;
          }).length;
          
          last7Days.push({
            label: dayName,
            value: visitesJour + recouvrementsJour + accordsJour,
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
          });
        }
        setChartData(last7Days);

        // 10. Préparer les données du donut - Statut des dossiers
        // Compter les statuts des accords
        const statutEnCours = accords.filter((a: any) => 
          a.Statut?.Value === 'En cours' || !a.Statut
        ).length;
        const statutValide = accords.filter((a: any) => 
          a.Statut?.Value === 'Validé' || a.Statut?.Value === 'Approuvé'
        ).length;
        const statutEnAttente = accords.filter((a: any) => 
          a.Statut?.Value === 'En attente' || a.Statut?.Value === 'Pending'
        ).length;
        const statutTermine = accords.filter((a: any) => 
          a.Statut?.Value === 'Terminé' || a.Statut?.Value === 'Clôturé'
        ).length;
        const statutRejete = accords.filter((a: any) => 
          a.Statut?.Value === 'Rejeté' || a.Statut?.Value === 'Refusé'
        ).length;
        
        const totalStatuts = statutEnCours + statutValide + statutEnAttente + statutTermine + statutRejete;
        
        const newPieData: PieDataPoint[] = totalStatuts > 0 ? [
          { 
            label: 'En cours', 
            value: Math.round((statutEnCours / totalStatuts) * 100) || 0, 
            color: '#3B82F6', // Bleu
            count: statutEnCours
          },
          { 
            label: 'Validé', 
            value: Math.round((statutValide / totalStatuts) * 100) || 0, 
            color: '#10B981', // Vert
            count: statutValide
          },
          { 
            label: 'En attente', 
            value: Math.round((statutEnAttente / totalStatuts) * 100) || 0, 
            color: '#F59E0B', // Orange
            count: statutEnAttente
          },
          { 
            label: 'Terminé', 
            value: Math.round((statutTermine / totalStatuts) * 100) || 0, 
            color: '#8B5CF6', // Violet
            count: statutTermine
          },
          { 
            label: 'Rejeté', 
            value: Math.round((statutRejete / totalStatuts) * 100) || 0, 
            color: '#EF4444', // Rouge
            count: statutRejete
          },
        ].filter(item => item.value > 0) : [
          { label: 'En cours', value: 35, color: '#3B82F6', count: 35 },
          { label: 'Validé', value: 28, color: '#10B981', count: 28 },
          { label: 'En attente', value: 20, color: '#F59E0B', count: 20 },
          { label: 'Terminé', value: 12, color: '#8B5CF6', count: 12 },
          { label: 'Rejeté', value: 5, color: '#EF4444', count: 5 },
        ];
        setPieData(newPieData);

        // 11. Mettre à jour les stats
        setStats({
          visitesPlanned: visitesFiltered.length,
          visitesChange: 12,
          tauxRecouvrement,
          tauxChange: 5,
          dossiersEnCours: accordsEnCours,
          dossiersChange: -3,
          objectifMensuel: progressObjectif || 92,
        });

      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [periodFilter, departementFilter, getDateRange]);

  // Fonction pour déterminer le statut d'une visite
  const getVisiteStatus = (visite: any): 'Complétée' | 'Planifiée' | 'En attente' => {
    const dateVisite = visite.DateVisite ? new Date(visite.DateVisite) : null;
    const now = new Date();
    
    if (!dateVisite) return 'En attente';
    if (dateVisite < now && visite.CompteRendu) return 'Complétée';
    if (dateVisite > now) return 'Planifiée';
    return 'En attente';
  };

  // Filtrage par recherche
  const filteredVisites = useMemo(() => {
    let result = visitesRecentes;
    
    // Filtrer par département (pour Directeur) - déjà filtré au niveau du chargement
    // Le filtre est déjà appliqué dans loadData(), donc pas besoin ici
    
    // Filtrer par recherche
    if (!searchText) return result;
    const search = searchText.toLowerCase();
    return result.filter(v => 
      v.client.toLowerCase().includes(search) ||
      v.date.toLowerCase().includes(search) ||
      v.statut.toLowerCase().includes(search)
    );
  }, [visitesRecentes, searchText]);

  // Fonction d'export CSV
  const handleExport = () => {
    if (allRawData.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    try {
      // Préparer les données pour l'export
      const exportData = filteredVisites.map(v => ({
        Client: v.client,
        Date: v.date,
        Statut: v.statut
      }));

      // Générer le CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(';'),
        ...exportData.map(row => 
          headers.map(h => `"${String((row as any)[h] || '').replace(/"/g, '""')}"`).join(';')
        )
      ].join('\n');

      // Télécharger le fichier
      const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `dashboard-export-${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  // Calcul du gradient pour le camembert
  const pieGradient = useMemo(() => {
    let currentAngle = 0;
    const segments = pieData.map(item => {
      const start = currentAngle;
      currentAngle += (item.value / 100) * 360;
      return `${item.color} ${start}deg ${currentAngle}deg`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }, [pieData]);

  // Rendu des badges de statut
  const getStatusBadgeStyle = (statut: string) => {
    switch (statut) {
      case 'Complétée':
        return { background: '#ECFDF5', color: '#059669' };
      case 'Planifiée':
        return { background: '#EFF6FF', color: '#2563EB' };
      case 'En attente':
        return { background: '#FEF3C7', color: '#D97706' };
      default:
        return { background: '#F3F4F6', color: '#6B7280' };
    }
  };

  // Rendu des icônes d'alerte
  const getAlertIconStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return { background: '#FEF2F2', color: '#DC2626' };
      case 'info':
        return { background: '#FEF3C7', color: '#D97706' };
      case 'success':
        return { background: '#ECFDF5', color: '#059669' };
      default:
        return { background: '#F3F4F6', color: '#6B7280' };
    }
  };

  if (loading) {
    return <ModernLoader message="Chargement de votre tableau de bord..." />;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center', padding: '40px', color: '#DC2626' }}>
          <p>❌ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ ...styles.newButton, margin: '16px auto' }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink}>Accueil</span>
            <span> › </span>
            <span>
              {userProfile?.isDirecteur 
                ? 'Tableau de bord - Direction' 
                : userProfile?.fonction?.toLowerCase().includes('chef')
                ? `Tableau de bord - ${userProfile.departement || 'Chef de département'}`
                : `Tableau de bord - ${userProfile?.departement || 'Mes activités'}`
              }
            </span>
          </div>
          <h1 style={styles.title}>
            {userProfile?.isDirecteur 
              ? '📊 Vue Globale - Direction' 
              : userProfile?.fonction?.toLowerCase().includes('chef')
              ? `📋 Département ${userProfile.departement}`
              : '📝 Mes Activités'
            }
          </h1>
          <p style={styles.subtitle}>
            {userProfile?.isDirecteur 
              ? 'Vue consolidée de tous les départements'
              : userProfile?.fonction?.toLowerCase().includes('chef')
              ? `Gestion et suivi de votre département`
              : 'Suivi de vos activités personnelles'
            } - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div style={styles.headerRight}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Rechercher..."
              style={styles.searchInput}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          
          <button style={styles.notificationBtn}>
            <span>🔔</span>
            {alerts.length > 0 && (
              <span style={styles.notificationBadge}>{alerts.length}</span>
            )}
          </button>
          
          <button style={styles.newButton} onClick={() => {
            // Rediriger vers le bon module selon le rôle
            if (userProfile?.departement) {
              onModuleSelect?.('activities');
            } else {
              onModuleSelect?.('activities');
            }
          }}>
            <span>+</span>
            <span>Nouvelle Saisie</span>
          </button>
        </div>
      </div>

      {/* Filtres - Adaptés selon le rôle */}
      <div style={styles.filterBar}>
        {/* Sélecteur de département (uniquement pour Directeur) */}
        {userProfile?.isDirecteur && (
          <select 
            style={styles.select}
            value={departementFilter}
            onChange={(e) => setDepartementFilter(e.target.value as any)}
          >
            <option value="all">🌍 Tous les départements</option>
            <option value="DA">📊 DA - Département Analyse</option>
            <option value="DSE">✅ DSE - Surveillance Engagements</option>
            <option value="DPNP">💰 DPNP - Prêts Non Performants</option>
          </select>
        )}

        <div style={styles.periodTabs}>
          <button
            style={{
              ...styles.periodTab,
              ...(periodFilter === 'week' ? styles.periodTabActive : {}),
            }}
            onClick={() => setPeriodFilter('week')}
          >
            Cette semaine
          </button>
          <button
            style={{
              ...styles.periodTab,
              ...(periodFilter === 'month' ? styles.periodTabActive : {}),
            }}
            onClick={() => setPeriodFilter('month')}
          >
            Ce mois
          </button>
          <button
            style={{
              ...styles.periodTab,
              ...(periodFilter === 'quarter' ? styles.periodTabActive : {}),
            }}
            onClick={() => setPeriodFilter('quarter')}
          >
            Trimestre
          </button>
        </div>

        {/* Bouton Exporter - Visible pour tous */}
        <button style={styles.exportButton} onClick={handleExport}>
          <span>📥</span>
          <span>Exporter</span>
        </button>
        
        {/* Filtre département - Uniquement pour le Directeur */}
        {userProfile?.isDirecteur && (
          <select 
            style={styles.select}
            value={userProfile.departement || 'all'}
            onChange={(e) => {
              // Logique pour changer de vue département
              console.log('Changement de département:', e.target.value);
            }}
          >
            <option value="all">Tous les départements</option>
            <option value="DA">DA - Département Analyse</option>
            <option value="DSE">DSE - Surveillance des Engagements</option>
            <option value="DPNP">DPNP - Prêts Non Performants</option>
          </select>
        )}
      </div>

      {/* Métriques - Adaptées selon le rôle */}
      <div style={styles.metricsGrid}>
        {/* Métrique 1 - Adaptée selon département */}
        <div style={styles.metricCard}>
          <div>
            <p style={styles.metricLabel}>
              {userProfile?.departement === 'DA' ? 'Analyses réalisées' :
               userProfile?.departement === 'DSE' ? 'Contrôles effectués' :
               userProfile?.departement === 'DPNP' ? 'Recouvrements' :
               userProfile?.isDirecteur ? 'Total activités' : 'Visites planifiées'}
            </p>
            <p style={styles.metricValue}>{stats.visitesPlanned}</p>
            <p style={{ ...styles.metricChange, ...styles.metricChangePositive }}>
              ↑ +{stats.visitesChange}% vs mois dernier
            </p>
          </div>
          <div style={{ ...styles.metricIcon, background: metricColors.blue.bg }}>
            {userProfile?.departement === 'DA' ? '📊' :
             userProfile?.departement === 'DSE' ? '🔍' :
             userProfile?.departement === 'DPNP' ? '💰' :
             userProfile?.isDirecteur ? '📈' : '📅'}
          </div>
        </div>

        {/* Métrique 2 - Taux de réalisation */}
        <div style={styles.metricCard}>
          <div>
            <p style={styles.metricLabel}>
              {userProfile?.departement === 'DPNP' ? 'Taux de recouvrement' : 'Taux de réalisation'}
            </p>
            <p style={styles.metricValue}>{stats.tauxRecouvrement}%</p>
            <p style={{ ...styles.metricChange, ...styles.metricChangePositive }}>
              ↑ +{stats.tauxChange}% vs objectif
            </p>
          </div>
          <div style={{ ...styles.metricIcon, background: metricColors.green.bg }}>
            {userProfile?.departement === 'DPNP' ? '💵' : '✅'}
          </div>
        </div>

        {/* Métrique 3 - Dossiers */}
        <div style={styles.metricCard}>
          <div>
            <p style={styles.metricLabel}>
              {userProfile?.departement === 'DA' ? 'Dossiers en analyse' :
               userProfile?.departement === 'DSE' ? 'Dossiers surveillés' :
               userProfile?.departement === 'DPNP' ? 'Créances en cours' :
               'Dossiers en cours'}
            </p>
            <p style={styles.metricValue}>{stats.dossiersEnCours}</p>
            <p style={{ ...styles.metricChange, ...styles.metricChangeNegative }}>
              ↓ {stats.dossiersChange}% vs semaine dernière
            </p>
          </div>
          <div style={{ ...styles.metricIcon, background: metricColors.yellow.bg }}>
            📁
          </div>
        </div>

        {/* Métrique 4 - Objectif */}
        <div style={styles.metricCard}>
          <div>
            <p style={styles.metricLabel}>
              {userProfile?.isDirecteur ? 'Performance globale' : 'Objectif mensuel'}
            </p>
            <p style={styles.metricValue}>{stats.objectifMensuel}%</p>
            <p style={{ ...styles.metricChange, color: '#6B7280' }}>
              En progression
            </p>
          </div>
          <div style={{ ...styles.metricIcon, background: metricColors.purple.bg }}>
            🎯
          </div>
        </div>
      </div>

      {/* Accès Rapides aux Activités */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>🚀 Accès Rapides</h3>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px',
          padding: '20px'
        }}>
          {/* Carte - Saisie d'Activités */}
          <button
            className="quick-access-card"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            }}
            onClick={() => onModuleSelect?.('activities')}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✍️</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              Nouvelle Saisie
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
              Enregistrer une activité
            </div>
          </button>

          {/* Carte - Synthèse */}
          <button
            className="quick-access-card"
            style={{
              background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)',
            }}
            onClick={() => onModuleSelect?.('synthesis')}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              Synthèse
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
              Vue d'ensemble des activités
            </div>
          </button>

          {/* Carte - Rapports */}
          <button
            className="quick-access-card"
            style={{
              background: 'linear-gradient(135deg, #107c10 0%, #0b5a0b 100%)',
            }}
            onClick={() => onModuleSelect?.('reports')}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              Rapports
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
              Analyses et statistiques
            </div>
          </button>

          {/* Carte - Catégories d'Activités selon département */}
          {/* Le Directeur voit toutes les cartes, les autres voient seulement leur département */}
          {(userProfile?.isDirecteur || userProfile?.departement === 'DA') && (
            <>
              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #6B46C1 0%, #553C9A 100%)',
                }}
                onClick={() => onModuleSelect?.('category-credit-classique')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Crédit Classique
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DA - Dossiers de crédit' : 'Dossiers de crédit'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                }}
                onClick={() => onModuleSelect?.('category-credit-programme')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Crédit Programme
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DA - Programmes de crédit' : 'Programmes de crédit'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #0891B2 0%, #0E7490 100%)',
                }}
                onClick={() => onModuleSelect?.('category-admin-engagements')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Admin Engagements
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DA - Gestion engagements' : 'Gestion des engagements'}
                </div>
              </button>
            </>
          )}

          {(userProfile?.isDirecteur || userProfile?.departement === 'DSE') && (
            <>
              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                }}
                onClick={() => onModuleSelect?.('category-situation-mep')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Situation MEP
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DSE - Mise en place' : 'Mise en place'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                }}
                onClick={() => onModuleSelect?.('category-accords-classement')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Accords
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DSE - Accords de classement' : 'Accords de classement'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                }}
                onClick={() => onModuleSelect?.('category-contrats')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Contrats
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DSE - Gestion des contrats' : 'Gestion des contrats'}
                </div>
              </button>
            </>
          )}

          {(userProfile?.isDirecteur || userProfile?.departement === 'DPNP') && (
            <>
              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                }}
                onClick={() => onModuleSelect?.('category-recouvrement')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💸</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Recouvrement
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DPNP - Actions recouvrement' : 'Actions de recouvrement'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                }}
                onClick={() => onModuleSelect?.('category-anomalies')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Anomalies
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DPNP - Suivi des anomalies' : 'Suivi des anomalies'}
                </div>
              </button>

              <button
                className="quick-access-card"
                style={{
                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                }}
                onClick={() => onModuleSelect?.('category-restructuration')}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔄</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  Restructuration
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
                  {userProfile?.isDirecteur ? 'DPNP - Dossiers restructuration' : 'Dossiers de restructuration'}
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Graphiques */}
      <div style={styles.chartsRow}>
        {/* Graphique en ligne - Activité hebdomadaire */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Activité hebdomadaire</h3>
            <div style={styles.chartTabs}>
              <button
                style={{
                  ...styles.chartTab,
                  ...(chartView === 'weekly' ? styles.chartTabActive : {}),
                }}
                onClick={() => setChartView('weekly')}
              >
                7 jours
              </button>
              <button
                style={{
                  ...styles.chartTab,
                  ...(chartView === 'monthly' ? styles.chartTabActive : {}),
                }}
                onClick={() => setChartView('monthly')}
              >
                30 jours
              </button>
            </div>
          </div>

          <div style={styles.lineChart}>
            <svg style={styles.lineChartSvg} viewBox="0 0 600 180">
              {/* Grille horizontale */}
              {[0, 45, 90, 135].map((y, i) => (
                <g key={i}>
                  <line x1="40" y1={y + 10} x2="580" y2={y + 10} stroke="#F3F4F6" strokeWidth="1" />
                  <text x="30" y={y + 14} fill="#9CA3AF" fontSize="10" textAnchor="end">
                    {Math.round((4 - i) * (Math.max(...chartData.map(d => d.value), 10) / 4))}
                  </text>
                </g>
              ))}
              
              {/* Zone remplie sous la courbe */}
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              
              {chartData.length > 0 && (
                <>
                  {/* Area */}
                  <path
                    d={`
                      M ${40 + 0 * (540 / (chartData.length - 1 || 1))} ${150 - (chartData[0]?.value / Math.max(...chartData.map(d => d.value), 1)) * 130}
                      ${chartData.map((d, i) => {
                        const x = 40 + i * (540 / (chartData.length - 1 || 1));
                        const y = 150 - (d.value / Math.max(...chartData.map(d => d.value), 1)) * 130;
                        return `L ${x} ${y}`;
                      }).join(' ')}
                      L ${40 + (chartData.length - 1) * (540 / (chartData.length - 1 || 1))} 150
                      L 40 150 Z
                    `}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Ligne */}
                  <polyline
                    points={chartData.map((d, i) => {
                      const x = 40 + i * (540 / (chartData.length - 1 || 1));
                      const y = 150 - (d.value / Math.max(...chartData.map(d => d.value), 1)) * 130;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#DC2626"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Points */}
                  {chartData.map((d, i) => {
                    const x = 40 + i * (540 / (chartData.length - 1 || 1));
                    const y = 150 - (d.value / Math.max(...chartData.map(d => d.value), 1)) * 130;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="6" fill="white" stroke="#DC2626" strokeWidth="3" />
                        <title>{`${d.label}: ${d.value} activités`}</title>
                      </g>
                    );
                  })}
                </>
              )}
            </svg>
            
            {/* Labels des jours */}
            <div style={styles.lineChartLabels}>
              {chartData.map((d, i) => (
                <div key={i} style={{ ...styles.lineChartLabel, flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#374151' }}>{d.label}</div>
                  <div style={{ fontSize: '10px' }}>{d.date}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <div style={{ ...styles.legendDot, background: '#DC2626' }} />
              <span>Activités enregistrées</span>
            </div>
          </div>
        </div>

        {/* Donut Chart - Statut des dossiers */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Statut des dossiers</h3>
          </div>

          <div style={styles.pieContainer}>
            <div
              style={{
                ...styles.pieChart,
                background: pieGradient,
              }}
            >
              <div style={{ 
                ...styles.pieCenter,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>
                  {pieData.reduce((sum, item) => sum + (item.count || 0), 0)}
                </span>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Total</span>
              </div>
            </div>

            <div style={styles.pieLegend}>
              {pieData.map((item, index) => (
                <div key={index} style={styles.pieLegendItem}>
                  <div style={styles.pieLegendLabel}>
                    <div style={{ ...styles.pieLegendDot, background: item.color }} />
                    <span>{item.label}</span>
                  </div>
                  <span style={styles.pieLegendValue}>
                    {item.count || 0} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({item.value}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section du bas */}
      <div style={styles.bottomRow}>
        {/* Visites récentes */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Visites récentes</h3>
            <span 
              style={styles.viewAllLink}
              onClick={() => onModuleSelect?.('activities')}
            >
              Voir tout
            </span>
          </div>

          {filteredVisites.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucune visite trouvée</p>
            </div>
          ) : (
            filteredVisites.slice(0, 5).map((visite) => (
              <div key={visite.id} style={styles.listItem}>
                <div style={styles.listItemLeft}>
                  <div
                    style={{
                      ...styles.statusDot,
                      background: visite.statut === 'Complétée' ? '#10B981' 
                        : visite.statut === 'Planifiée' ? '#3B82F6' 
                        : '#F59E0B',
                    }}
                  />
                  <div style={styles.listItemInfo}>
                    <span style={styles.listItemTitle}>{visite.client}</span>
                    <span style={styles.listItemSubtitle}>{visite.date}</span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusBadgeStyle(visite.statut),
                  }}
                >
                  {visite.statut}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Alertes & Notifications */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Alertes & Notifications</h3>
            <span style={{ color: '#9CA3AF', cursor: 'pointer' }}>⋮</span>
          </div>

          {alerts.length === 0 ? (
            <div style={styles.emptyState}>
              <p>Aucune alerte</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} style={styles.alertItem}>
                <div
                  style={{
                    ...styles.alertIcon,
                    ...getAlertIconStyle(alert.type),
                  }}
                >
                  {alert.type === 'warning' ? '⚠️' : alert.type === 'info' ? '📊' : '✅'}
                </div>
                <div style={styles.alertContent}>
                  <p style={styles.alertTitle}>{alert.title}</p>
                  <p style={styles.alertDescription}>{alert.description}</p>
                </div>
                <span style={styles.alertTime}>{alert.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
