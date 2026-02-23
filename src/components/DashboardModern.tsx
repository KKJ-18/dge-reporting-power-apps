import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3, CheckCircle, FolderOpen, Target, Search, Download,
  Calendar, TrendingUp, Activity, FileText, LayoutDashboard,
  Building2, Eye, PenSquare, AlertTriangle, Info, ChevronRight,
} from 'lucide-react';
import { VisiteClienteleService } from '../services/VisiteClienteleService';
import { ObjectifService } from '../services/ObjectifService';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import { AccordsService } from '../services/AccordsService';
import { ContratsService } from '../services/ContratsService';
import { SituationMEPService } from '../services/SituationMEPService';
import { UserProfileService, type UserProfile } from '../services/UserProfileService';
import { canAccessModule } from '../config/navigationAccess';
import { exportTypedExcel } from '../utils/exportUtils';
import { useToast } from './ui/Toast';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationPanel } from './ui/NotificationPanel';
import StatCard from './ui/StatCard';
import { ChartCard, LineChart, DoughnutChart } from './charts';
import ModernLoader from './ModernLoader';
import './DashboardModern.css';

interface DashboardModernProps {
  onModuleSelect?: (moduleId: string) => void;
}

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

// === Quick Access Card Config ===
interface QuickAccessItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  gradient: string;
  module: string;
}

const agentQuickAccess: QuickAccessItem[] = [
  { id: 'qa-saisie', icon: PenSquare, label: 'Nouvelle Saisie', description: 'Enregistrer une activité', gradient: 'from-red-600 to-red-800', module: 'activities' },
  { id: 'qa-synthese', icon: BarChart3, label: 'Synthèse', description: 'Vue d\'ensemble des activités', gradient: 'from-blue-600 to-blue-800', module: 'synthesis' },
  { id: 'qa-rapports', icon: TrendingUp, label: 'Rapports', description: 'Analyses et statistiques', gradient: 'from-green-700 to-green-900', module: 'reports' },
];

const directorQuickAccess: QuickAccessItem[] = [
  { id: 'qa-da', icon: BarChart3, label: 'Département DA', description: 'Direction de l\'Analyse', gradient: 'from-blue-600 to-blue-800', module: 'department-DA' },
  { id: 'qa-dse', icon: Building2, label: 'Département DSE', description: 'Surveillance des Engagements', gradient: 'from-green-700 to-green-900', module: 'department-DSE' },
  { id: 'qa-dpnp', icon: FileText, label: 'Département DPNP', description: 'Prêts Non Performants', gradient: 'from-orange-600 to-orange-800', module: 'department-DPNP' },
];

// === Component ===
const DashboardModern: React.FC<DashboardModernProps> = ({ onModuleSelect }) => {
  const { showToast } = useToast();

  // États
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [searchText, setSearchText] = useState('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [chartView, setChartView] = useState<'monthly' | 'weekly'>('weekly');
  const [departementFilter, setDepartementFilter] = useState<'all' | 'DA' | 'DSE' | 'DPNP'>('all');

  // Données
  const [stats, setStats] = useState<DashboardStats>({ visitesPlanned: 0, visitesChange: 0, tauxRecouvrement: 0, tauxChange: 0, dossiersEnCours: 0, dossiersChange: 0, objectifMensuel: 0 });
  const [visitesRecentes, setVisitesRecentes] = useState<VisiteRecente[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [pieData, setPieData] = useState<PieDataPoint[]>([]);

  // Notifications dynamiques
  const { notifications, unreadCount, refresh: refreshNotifications } = useNotifications(userProfile?.email);

  // Calcul des dates de filtre
  const getDateRange = useCallback(() => {
    const now = new Date();
    let startDate: Date;
    const endDate = new Date(now);
    switch (periodFilter) {
      case 'week': startDate = new Date(now); startDate.setDate(now.getDate() - 7); break;
      case 'quarter': startDate = new Date(now); startDate.setMonth(now.getMonth() - 3); break;
      default: startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
    }
    return { startDate, endDate };
  }, [periodFilter]);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await UserProfileService.getCurrentUserProfile();
        setUserProfile(profile);
        const { startDate, endDate } = getDateRange();
        const isDirecteur = profile.isDirecteur;
        const isChef = profile.fonction?.toLowerCase().includes('chef') || false;
        const userDepartement = profile.departement;
        const userEmail = profile.email;

        // Helper: filtrer par rôle
        const filterByRole = (items: any[], emailField = 'Author') => {
          if (!isDirecteur) {
            if (isChef && userDepartement) {
              return items.filter((v: any) => v.Departement?.Value === userDepartement || v.Departement === userDepartement);
            }
            return items.filter((v: any) => v[emailField]?.EMail === userEmail || v.CreatedBy?.EMail === userEmail || v[emailField]?.Email === userEmail);
          }
          if (departementFilter !== 'all') {
            return items.filter((v: any) => v.Departement?.Value === departementFilter || v.Departement === departementFilter);
          }
          return items;
        };

        // Charger en parallèle
        const [visitesResult, objectifsResult, recouvrementResult, accordsResult, contratsResult, mepResult] = await Promise.all([
          VisiteClienteleService.getAll(),
          ObjectifService.getAll(),
          ActionRecouvrementService.getAll(),
          AccordsService.getAll(),
          ContratsService.getAll(),
          SituationMEPService.getAll(),
        ]);

        let visites = filterByRole(visitesResult?.data || visitesResult?.value || []);
        let objectifs = filterByRole(objectifsResult?.data || objectifsResult?.value || []);
        let recouvrements = filterByRole(recouvrementResult?.data || recouvrementResult?.value || []);
        let accords = filterByRole(accordsResult?.data || accordsResult?.value || []);
        const _contrats = contratsResult?.data || contratsResult?.value || [];
        const _meps = mepResult?.data || mepResult?.value || [];
        void _contrats; void _meps;

        // Filtrer visites par période
        const visitesFiltered = visites.filter((v: any) => {
          const d = v.DateVisite ? new Date(v.DateVisite) : null;
          return d && d >= startDate && d <= endDate;
        });

        // Visites récentes
        setVisitesRecentes(
          visitesFiltered
            .sort((a: any, b: any) => new Date(b.DateVisite || 0).getTime() - new Date(a.DateVisite || 0).getTime())
            .slice(0, 10)
            .map((v: any) => ({
              id: String(v.ID || Math.random()),
              client: v.NomClient || v.Title || 'Client inconnu',
              date: v.DateVisite ? new Date(v.DateVisite).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—',
              statut: getVisiteStatus(v),
            }))
        );

        // Objectif mensuel
        const objectifsMois = objectifs.filter((o: any) => { const d = o.Date ? new Date(o.Date) : null; return d && d >= startDate && d <= endDate; });
        const totalObjectif = objectifsMois.reduce((s: number, o: any) => s + (o.Nombre || 0), 0);
        const progressObjectif = totalObjectif > 0 ? Math.round((visitesFiltered.length / totalObjectif) * 100) : 0;

        // Taux de recouvrement
        const recouvrementsPeriode = recouvrements.filter((r: any) => {
          const d = r.DateExc_x00e9_cution || r.Created ? new Date(r.DateExc_x00e9_cution || r.Created) : null;
          return d && d >= startDate && d <= endDate;
        });
        const recouvrementComplete = recouvrementsPeriode.filter((r: any) => ['Terminé','Complété','Exécuté'].includes(r.Statut?.Value)).length;
        const tauxRecouvrement = recouvrementsPeriode.length > 0 ? Math.round((recouvrementComplete / recouvrementsPeriode.length) * 100) : 0;

        // Dossiers en cours
        const accordsEnCours = accords.filter((a: any) => ['En cours','En attente'].includes(a.Statut?.Value) || !a.Statut).length;

        // Alertes
        const newAlerts: AlertItem[] = [];
        const dossierRetard = accords.filter((a: any) => {
          const d = a.Date ? new Date(a.Date) : null;
          if (!d) return false;
          return (Date.now() - d.getTime()) / 86400000 > 7 && !['Terminé','Validé'].includes(a.Statut?.Value);
        }).length;
        if (dossierRetard > 0) newAlerts.push({ id: '1', type: 'warning', title: `${dossierRetard} dossiers en retard`, description: 'Action requise', time: '2h' });
        if (progressObjectif > 0 && progressObjectif < 100) {
          const joursRestants = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
          newAlerts.push({ id: '2', type: 'info', title: 'Objectif mensuel', description: `À ${progressObjectif}% — Reste ${joursRestants} jours`, time: '5h' });
        }
        setAlerts(newAlerts);

        // Chart data - activité par jour
        const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
        const numPoints = Math.min(daysDiff, 30);
        const chartPts: ChartDataPoint[] = [];
        for (let i = numPoints - 1; i >= 0; i--) {
          const date = new Date(endDate); date.setDate(endDate.getDate() - i);
          const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
          const countDay = (items: any[], field: string) => items.filter((x: any) => { const d = x[field] || x.Created ? new Date(x[field] || x.Created) : null; return d && d >= dayStart && d <= dayEnd; }).length;
          chartPts.push({
            label: jours[(date.getDay() || 7) - 1],
            value: countDay(visitesFiltered, 'DateVisite') + countDay(recouvrementsPeriode, 'DateExc_x00e9_cution') + countDay(accords, 'Created'),
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
          });
        }
        setChartData(chartPts);

        // Pie data - statut dossiers
        const getStatut = (a: any) => (a.Statut?.Value || a.Statut || '').toLowerCase();
        const accordsPeriode = accords.filter((a: any) => { const d = a.Created ? new Date(a.Created) : null; return d && d >= startDate && d <= endDate; });
        const countStatut = (keywords: string[]) => accordsPeriode.filter((a: any) => keywords.includes(getStatut(a)) || (keywords.includes('') && !getStatut(a))).length;
        const rawPie = [
          { label: 'En cours', count: countStatut(['en cours', '']), color: '#3B82F6' },
          { label: 'Validé', count: countStatut(['validé', 'approuvé', 'approuve']), color: '#10B981' },
          { label: 'En attente', count: countStatut(['en attente', 'pending', 'attente']), color: '#F59E0B' },
          { label: 'Terminé', count: countStatut(['terminé', 'clôturé', 'termine', 'cloture']), color: '#8B5CF6' },
          { label: 'Rejeté', count: countStatut(['rejeté', 'refusé', 'rejete', 'refuse']), color: '#EF4444' },
        ];
        const total = rawPie.reduce((s, i) => s + i.count, 0) || 1;
        setPieData(rawPie.filter(i => i.count > 0).map(i => ({ ...i, value: Math.round((i.count / total) * 100) })));

        // Variations période précédente
        const periodDuration = endDate.getTime() - startDate.getTime();
        const prevStart = new Date(startDate.getTime() - periodDuration);
        const prevEnd = new Date(startDate.getTime() - 1);
        const visitesPrev = visites.filter((v: any) => { const d = v.DateVisite ? new Date(v.DateVisite) : null; return d && d >= prevStart && d <= prevEnd; }).length;
        const visitesChange = visitesPrev > 0 ? Math.round(((visitesFiltered.length - visitesPrev) / visitesPrev) * 100) : (visitesFiltered.length > 0 ? 100 : 0);
        const recPrev = recouvrements.filter((r: any) => { const d = r.DateExc_x00e9_cution || r.Created ? new Date(r.DateExc_x00e9_cution || r.Created) : null; return d && d >= prevStart && d <= prevEnd; });
        const recCompPrev = recPrev.filter((r: any) => ['Terminé','Complété','Exécuté'].includes(r.Statut?.Value)).length;
        const tauxPrev = recPrev.length > 0 ? Math.round((recCompPrev / recPrev.length) * 100) : 0;
        const tauxChange = tauxPrev > 0 ? tauxRecouvrement - tauxPrev : tauxRecouvrement;
        const accPrev = accords.filter((a: any) => { const d = a.Created ? new Date(a.Created) : null; return d && d <= prevEnd; });
        const accEnCoursPrev = accPrev.filter((a: any) => ['En cours','En attente'].includes(a.Statut?.Value) || !a.Statut).length;
        const dossiersChange = accEnCoursPrev > 0 ? Math.round(((accordsEnCours - accEnCoursPrev) / accEnCoursPrev) * 100) : (accordsEnCours > 0 ? 100 : 0);

        setStats({ visitesPlanned: visitesFiltered.length, visitesChange, tauxRecouvrement, tauxChange, dossiersEnCours: accordsEnCours, dossiersChange, objectifMensuel: progressObjectif || 0 });
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [periodFilter, departementFilter, getDateRange]);

  const getVisiteStatus = (v: any): 'Complétée' | 'Planifiée' | 'En attente' => {
    const d = v.DateVisite ? new Date(v.DateVisite) : null;
    if (!d) return 'En attente';
    if (d < new Date() && v.CompteRendu) return 'Complétée';
    if (d > new Date()) return 'Planifiée';
    return 'En attente';
  };

  const filteredVisites = useMemo(() => {
    if (!searchText) return visitesRecentes;
    const s = searchText.toLowerCase();
    return visitesRecentes.filter(v => v.client.toLowerCase().includes(s) || v.date.toLowerCase().includes(s) || v.statut.toLowerCase().includes(s));
  }, [visitesRecentes, searchText]);

  // Export
  const handleExport = () => {
    try {
      const period = periodFilter === 'week' ? 'semaine' : periodFilter === 'month' ? 'mois' : 'trimestre';
      exportTypedExcel({
        fileName: `dashboard-export-${period}`,
        sheetName: 'Dashboard',
        columns: [
          { header: 'Client', key: 'client' },
          { header: 'Date', key: 'date' },
          { header: 'Statut', key: 'statut' },
        ],
        data: filteredVisites,
      });
      showToast('Export CSV généré avec succès', 'success');
    } catch {
      showToast('Erreur lors de l\'export', 'error');
    }
  };

  // Chart.js data
  const lineChartData = useMemo(() => ({
    labels: chartData.map(d => d.date || d.label),
    datasets: [{
      label: 'Activités',
      data: chartData.map(d => d.value),
      borderColor: '#DC2626',
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }), [chartData]);

  const doughnutData = useMemo(() => ({
    labels: pieData.map(d => d.label),
    datasets: [{
      data: pieData.map(d => d.count || d.value),
      backgroundColor: pieData.map(d => d.color),
      borderWidth: 0,
    }],
  }), [pieData]);

  // Metric config by role
  const getMetricLabel = (idx: number) => {
    const dept = userProfile?.departement;
    const isDir = userProfile?.isDirecteur;
    if (idx === 0) return dept === 'DA' ? 'Analyses réalisées' : dept === 'DSE' ? 'Contrôles effectués' : dept === 'DPNP' ? 'Recouvrements' : isDir ? 'Total activités' : 'Visites planifiées';
    if (idx === 1) return dept === 'DPNP' ? 'Taux de recouvrement' : 'Taux de réalisation';
    if (idx === 2) return dept === 'DA' ? 'Dossiers en analyse' : dept === 'DSE' ? 'Dossiers surveillés' : dept === 'DPNP' ? 'Créances en cours' : 'Dossiers en cours';
    return isDir ? 'Performance globale' : 'Objectif mensuel';
  };

  // Quick access cards
  const quickAccess = useMemo(() => {
    const items = userProfile?.isDirecteur ? [...directorQuickAccess] : [...agentQuickAccess];
    if (userProfile?.isDirecteur && canAccessModule(userProfile, 'assistant-dce')) {
      items.push({ id: 'qa-dce', icon: FolderOpen, label: 'Assistant DCE', description: 'Suivi et structuration DCE', gradient: 'from-purple-700 to-purple-900', module: 'assistant-dce' });
    }
    return items;
  }, [userProfile]);

  // === RENDER ===
  if (loading) return <ModernLoader message="Chargement de votre tableau de bord..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-modal p-8 text-center max-w-md animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  const titleText = userProfile?.isDirecteur ? 'Vue Globale — Direction' : userProfile?.fonction?.toLowerCase().includes('chef') ? `Département ${userProfile.departement}` : 'Mes Activités';
  const subtitleText = userProfile?.isDirecteur ? 'Vue consolidée de tous les départements' : userProfile?.fonction?.toLowerCase().includes('chef') ? 'Gestion et suivi de votre département' : 'Suivi de vos activités personnelles';

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-neutral-50 to-neutral-100 min-h-screen space-y-6 animate-fade-in">
      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200 p-5 sm:p-6 flex flex-wrap items-start justify-between gap-4 transition-all hover:shadow-card-hover">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-neutral-400 mb-1">
            Accueil <ChevronRight size={12} className="inline" /> {titleText}
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-7 h-7 text-red-600 hidden sm:block" />
            {titleText}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {subtitleText} — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-48 lg:w-64"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </div>
          {/* Notifications */}
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onRefresh={refreshNotifications}
          />
        </div>
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="bg-white rounded-xl shadow-soft border border-neutral-200 px-4 py-3 flex flex-wrap items-center gap-3">
        {userProfile?.isDirecteur && (
          <select
            className="text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 font-medium text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 min-w-[180px]"
            value={departementFilter}
            onChange={e => setDepartementFilter(e.target.value as any)}
          >
            <option value="all">Tous les départements</option>
            <option value="DA">DA — Département Analyse</option>
            <option value="DSE">DSE — Surveillance Engagements</option>
            <option value="DPNP">DPNP — Prêts Non Performants</option>
          </select>
        )}

        <div className="inline-flex bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
          {(['week', 'month', 'quarter'] as PeriodFilter[]).map(p => (
            <button
              key={p}
              className={`px-4 py-2 text-sm font-semibold transition-all ${periodFilter === p ? 'bg-red-600 text-white' : 'text-neutral-500 hover:bg-neutral-100'}`}
              onClick={() => setPeriodFilter(p)}
            >
              {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Trimestre'}
            </button>
          ))}
        </div>

        <button
          className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          onClick={handleExport}
        >
          <Download size={16} />
          Exporter
        </button>
      </div>

      {/* ===== METRICS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Activity} iconColor="blue" value={stats.visitesPlanned} label={getMetricLabel(0)}
          trend={{ value: Math.abs(stats.visitesChange), isPositive: stats.visitesChange >= 0 }} />
        <StatCard icon={CheckCircle} iconColor="green" value={`${stats.tauxRecouvrement}%`} label={getMetricLabel(1)}
          trend={{ value: Math.abs(stats.tauxChange), isPositive: stats.tauxChange >= 0 }} />
        <StatCard icon={FolderOpen} iconColor="orange" value={stats.dossiersEnCours} label={getMetricLabel(2)}
          trend={{ value: Math.abs(stats.dossiersChange), isPositive: stats.dossiersChange <= 0 }} />
        <StatCard icon={Target} iconColor="purple" value={`${stats.objectifMensuel}%`} label={getMetricLabel(3)}
          progress={stats.objectifMensuel} />
      </div>

      {/* ===== CHARTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard
          title="Activité hebdomadaire"
          className="lg:col-span-2"
          actions={
            <div className="inline-flex bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
              <button className={`px-3 py-1 text-xs font-semibold transition-all ${chartView === 'weekly' ? 'bg-red-50 text-red-600 border-red-200' : 'text-neutral-500'}`} onClick={() => setChartView('weekly')}>7 jours</button>
              <button className={`px-3 py-1 text-xs font-semibold transition-all ${chartView === 'monthly' ? 'bg-red-50 text-red-600 border-red-200' : 'text-neutral-500'}`} onClick={() => setChartView('monthly')}>30 jours</button>
            </div>
          }
        >
          <LineChart data={lineChartData} />
        </ChartCard>

        <ChartCard title="Statut des dossiers">
          <DoughnutChart data={doughnutData} />
        </ChartCard>
      </div>

      {/* ===== QUICK ACCESS ===== */}
      <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-5">
        <h3 className="font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-red-500" /> Accès Rapides
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickAccess.map(item => (
            <button
              key={item.id}
              className={`quick-access-card bg-gradient-to-br ${item.gradient} !border-transparent`}
              onClick={() => onModuleSelect?.(item.module)}
            >
              <item.icon className="w-8 h-8 text-white/90 mb-3" />
              <span className="text-base font-semibold text-white">{item.label}</span>
              <span className="text-xs text-white/80 mt-1">{item.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ===== BOTTOM: RECENT + ALERTS ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visites récentes */}
        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
              <Eye size={18} className="text-blue-500" /> Visites récentes
            </h3>
            <button className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors" onClick={() => onModuleSelect?.('activities')}>
              Voir tout
            </button>
          </div>
          {filteredVisites.length === 0 ? (
            <p className="text-center text-neutral-400 py-8 text-sm">Aucune visite trouvée</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredVisites.slice(0, 5).map(v => (
                <div key={v.id} className="flex items-center justify-between py-3 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.statut === 'Complétée' ? 'bg-green-500' : v.statut === 'Planifiée' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                    <div>
                      <span className="text-sm font-medium text-neutral-800 group-hover:text-red-600 transition-colors">{v.client}</span>
                      <span className="text-xs text-neutral-400 block">{v.date}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.statut === 'Complétée' ? 'bg-green-50 text-green-700' : v.statut === 'Planifiée' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {v.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alertes */}
        <div className="bg-white rounded-xl shadow-soft border border-neutral-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Alertes & Notifications
            </h3>
          </div>
          {alerts.length === 0 ? (
            <p className="text-center text-neutral-400 py-8 text-sm">Aucune alerte</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {alerts.map(a => (
                <div key={a.id} className="flex items-start gap-3 py-3">
                  <div className={`mt-0.5 p-2 rounded-lg flex-shrink-0 ${a.type === 'warning' ? 'bg-red-50' : a.type === 'info' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                    {a.type === 'warning' ? <AlertTriangle size={14} className="text-red-500" /> : a.type === 'info' ? <Info size={14} className="text-yellow-600" /> : <CheckCircle size={14} className="text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{a.title}</p>
                    <p className="text-xs text-neutral-400">{a.description}</p>
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModern;
