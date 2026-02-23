/**
 * useNotifications - Hook de notifications dynamiques
 * Calcule automatiquement des alertes depuis les données SharePoint (cache DataContext)
 * Inspiré de ReportingCommercialeV2
 */
import { useState, useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';

export interface AppNotification {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  module?: string;
  timestamp: Date;
}

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => void;
  isLoading: boolean;
}

export function useNotifications(userEmail: string | undefined): UseNotificationsReturn {
  const { getVisites, getRecouvrements, getObjectifs, getClientsAnomalie } = useData();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const computeNotifications = useCallback(async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const [visites, recouvrements, objectifs, clientsAnomalie] = await Promise.all([
        getVisites(userEmail),
        getRecouvrements(userEmail),
        getObjectifs(userEmail),
        getClientsAnomalie(userEmail),
      ]);

      const alerts: AppNotification[] = [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Visites de ce mois
      const visitesThisMonth = visites.filter(v => {
        const d = new Date(v.DateVisite || v.Created || '');
        return d >= startOfMonth && d <= now;
      });

      // Alertes basées sur les données
      if (visitesThisMonth.length < 5) {
        alerts.push({
          id: 'visites-low',
          type: visitesThisMonth.length < 2 ? 'high' : 'medium',
          title: 'Visites à rattraper',
          description: `${visitesThisMonth.length} visite(s) ce mois — objectif recommandé: 10`,
          module: 'home',
          timestamp: now,
        });
      }

      // Clients en anomalie
      if (clientsAnomalie.length > 0) {
        alerts.push({
          id: 'anomalies',
          type: clientsAnomalie.length > 10 ? 'high' : 'medium',
          title: `${clientsAnomalie.length} client(s) en anomalie`,
          description: 'Des actions de recouvrement sont nécessaires',
          module: 'category-suivi-recouvrement-gfc',
          timestamp: now,
        });
      }

      // Objectifs
      const recentObjectifs = objectifs.filter(o => {
        const d = new Date(o.Date || o.Created || '');
        return d >= startOfMonth;
      });
      if (recentObjectifs.length === 0) {
        alerts.push({
          id: 'no-objectifs',
          type: 'medium',
          title: 'Pas d\'objectifs ce mois',
          description: 'Définissez vos objectifs mensuels',
          module: 'objectifs',
          timestamp: now,
        });
      }

      // Actions de recouvrement planifiées non exécutées
      const pendingActions = recouvrements.filter(r => {
        const datePlan = r.DatePlanification;
        if (!datePlan) return false;
        const d = new Date(datePlan);
        return d <= now && !r.DateExc_x00e9_cution;
      });
      if (pendingActions.length > 0) {
        alerts.push({
          id: 'pending-recouvrement',
          type: pendingActions.length > 5 ? 'high' : 'medium',
          title: `${pendingActions.length} action(s) de recouvrement en retard`,
          description: 'Actions planifiées non encore exécutées',
          module: 'category-suivi-recouvrement-gfc',
          timestamp: now,
        });
      }

      // Rappel quotidien
      alerts.push({
        id: 'daily-reminder',
        type: 'low',
        title: 'Rappel quotidien',
        description: 'Pensez à compléter vos activités avant la fin de journée',
        timestamp: now,
      });

      setNotifications(alerts);
    } catch {
      // Silencieux en cas d'erreur - les notifications ne sont pas critiques
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, getVisites, getRecouvrements, getObjectifs, getClientsAnomalie]);

  useEffect(() => {
    computeNotifications();
  }, [computeNotifications]);

  return {
    notifications,
    unreadCount: notifications.filter(n => n.type === 'high' || n.type === 'medium').length,
    refresh: computeNotifications,
    isLoading,
  };
}
