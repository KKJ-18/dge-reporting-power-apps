/**
 * DataContext - Couche de cache globale pour les appels SharePoint
 * Inspiré de ReportingCommercialeV2 : TTL + déduplication des requêtes
 */
import { createContext, useContext, useCallback, useRef, useState, type ReactNode } from 'react';

// Services
import { VisiteClienteleService } from '../services/VisiteClienteleService';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';
import { ObjectifService } from '../services/ObjectifService';
import { AccordsService } from '../services/AccordsService';
import { ContratsService } from '../services/ContratsService';
import { SituationMEPService } from '../services/SituationMEPService';
import { FormationsService } from '../services/FormationsService';
import { ClientsenAnomalieService } from '../services/ClientsenAnomalieService';
import { AgenceResauService } from '../services/AgenceResauService';

// Models
import type { VisiteClientele } from '../Models/VisiteClienteleModel';
import type { ActionRecouvrement } from '../Models/ActionRecouvrementModel';
import type { Objectif } from '../Models/ObjectifModel';
import type { Accords } from '../Models/AccordsModel';
import type { Contrats } from '../Models/ContratsModel';
import type { SituationMEP } from '../Models/SituationMEPModel';
import type { Formations } from '../Models/FormationsModel';
import type { ClientsenAnomalie } from '../Models/ClientsenAnomalieModel';
import type { AgenceResau } from '../Models/AgenceResauModel';

// === Cache Configuration ===
const CACHE_DURATION = 5 * 60 * 1000;        // 5 minutes pour données dynamiques
const STATIC_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes pour données statiques

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  userEmail?: string;
}

interface DataCache {
  visites?: CacheEntry<VisiteClientele[]>;
  recouvrements?: CacheEntry<ActionRecouvrement[]>;
  objectifs?: CacheEntry<Objectif[]>;
  accords?: CacheEntry<Accords[]>;
  contrats?: CacheEntry<Contrats[]>;
  situationMEP?: CacheEntry<SituationMEP[]>;
  formations?: CacheEntry<Formations[]>;
  clientsAnomalie?: CacheEntry<ClientsenAnomalie[]>;
  agences?: CacheEntry<AgenceResau[]>;
}

interface DataContextType {
  // Getters dynamiques (user-scoped)
  getVisites: (userEmail: string, forceRefresh?: boolean) => Promise<VisiteClientele[]>;
  getRecouvrements: (userEmail: string, forceRefresh?: boolean) => Promise<ActionRecouvrement[]>;
  getObjectifs: (userEmail: string, forceRefresh?: boolean) => Promise<Objectif[]>;
  getAccords: (userEmail: string, forceRefresh?: boolean) => Promise<Accords[]>;
  getContrats: (userEmail: string, forceRefresh?: boolean) => Promise<Contrats[]>;
  getSituationMEP: (userEmail: string, forceRefresh?: boolean) => Promise<SituationMEP[]>;
  getFormations: (userEmail: string, forceRefresh?: boolean) => Promise<Formations[]>;
  getClientsAnomalie: (userEmail: string, forceRefresh?: boolean) => Promise<ClientsenAnomalie[]>;
  // Getters statiques (non user-scoped)
  getAgences: (forceRefresh?: boolean) => Promise<AgenceResau[]>;
  // Utilitaires
  invalidateCache: (key?: keyof DataCache) => void;
  refreshAll: (userEmail: string) => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const cache = useRef<DataCache>({});
  const pendingRequests = useRef<Map<string, Promise<unknown>>>(new Map());
  const [isLoading, setIsLoading] = useState(false);

  // Vérifie si une entrée de cache est encore valide
  const isCacheValid = useCallback((
    entry: CacheEntry<unknown> | undefined,
    duration: number,
    userEmail?: string
  ): boolean => {
    if (!entry) return false;
    if (Date.now() - entry.timestamp > duration) return false;
    if (userEmail && entry.userEmail !== userEmail) return false;
    return true;
  }, []);

  // Déduplication : si une requête identique est en cours, réutilise sa promesse
  const dedupeRequest = useCallback(<T,>(key: string, fetcher: () => Promise<T>): Promise<T> => {
    const existing = pendingRequests.current.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher().finally(() => {
      pendingRequests.current.delete(key);
    });
    pendingRequests.current.set(key, promise);
    return promise;
  }, []);

  // === DONNÉES DYNAMIQUES ===

  const getVisites = useCallback(async (userEmail: string, forceRefresh = false): Promise<VisiteClientele[]> => {
    if (!forceRefresh && isCacheValid(cache.current.visites, CACHE_DURATION, userEmail)) {
      return cache.current.visites!.data;
    }
    return dedupeRequest(`visites-${userEmail}`, async () => {
      const result = await VisiteClienteleService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.visites = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getRecouvrements = useCallback(async (userEmail: string, forceRefresh = false): Promise<ActionRecouvrement[]> => {
    if (!forceRefresh && isCacheValid(cache.current.recouvrements, CACHE_DURATION, userEmail)) {
      return cache.current.recouvrements!.data;
    }
    return dedupeRequest(`recouvrements-${userEmail}`, async () => {
      const result = await ActionRecouvrementService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.recouvrements = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getObjectifs = useCallback(async (userEmail: string, forceRefresh = false): Promise<Objectif[]> => {
    if (!forceRefresh && isCacheValid(cache.current.objectifs, CACHE_DURATION, userEmail)) {
      return cache.current.objectifs!.data;
    }
    return dedupeRequest(`objectifs-${userEmail}`, async () => {
      const result = await ObjectifService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.objectifs = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getAccords = useCallback(async (userEmail: string, forceRefresh = false): Promise<Accords[]> => {
    if (!forceRefresh && isCacheValid(cache.current.accords, CACHE_DURATION, userEmail)) {
      return cache.current.accords!.data;
    }
    return dedupeRequest(`accords-${userEmail}`, async () => {
      const result = await AccordsService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.accords = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getContrats = useCallback(async (userEmail: string, forceRefresh = false): Promise<Contrats[]> => {
    if (!forceRefresh && isCacheValid(cache.current.contrats, CACHE_DURATION, userEmail)) {
      return cache.current.contrats!.data;
    }
    return dedupeRequest(`contrats-${userEmail}`, async () => {
      const result = await ContratsService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.contrats = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getSituationMEP = useCallback(async (userEmail: string, forceRefresh = false): Promise<SituationMEP[]> => {
    if (!forceRefresh && isCacheValid(cache.current.situationMEP, CACHE_DURATION, userEmail)) {
      return cache.current.situationMEP!.data;
    }
    return dedupeRequest(`situationMEP-${userEmail}`, async () => {
      const result = await SituationMEPService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.situationMEP = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getFormations = useCallback(async (userEmail: string, forceRefresh = false): Promise<Formations[]> => {
    if (!forceRefresh && isCacheValid(cache.current.formations, CACHE_DURATION, userEmail)) {
      return cache.current.formations!.data;
    }
    return dedupeRequest(`formations-${userEmail}`, async () => {
      const result = await FormationsService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.formations = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  const getClientsAnomalie = useCallback(async (userEmail: string, forceRefresh = false): Promise<ClientsenAnomalie[]> => {
    if (!forceRefresh && isCacheValid(cache.current.clientsAnomalie, CACHE_DURATION, userEmail)) {
      return cache.current.clientsAnomalie!.data;
    }
    return dedupeRequest(`clientsAnomalie-${userEmail}`, async () => {
      const result = await ClientsenAnomalieService.getAll({
        filter: `Author/EMail eq '${userEmail}'`,
        orderBy: ['ID desc'],
        top: 5000
      });
      const data = result.data || [];
      cache.current.clientsAnomalie = { data, timestamp: Date.now(), userEmail };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  // === DONNÉES STATIQUES ===

  const getAgences = useCallback(async (forceRefresh = false): Promise<AgenceResau[]> => {
    if (!forceRefresh && isCacheValid(cache.current.agences, STATIC_CACHE_DURATION)) {
      return cache.current.agences!.data;
    }
    return dedupeRequest('agences', async () => {
      const result = await AgenceResauService.getAll({ top: 1000 });
      const data = result.data || [];
      cache.current.agences = { data, timestamp: Date.now() };
      return data;
    });
  }, [isCacheValid, dedupeRequest]);

  // === UTILITAIRES ===

  const invalidateCache = useCallback((key?: keyof DataCache) => {
    if (key) {
      delete cache.current[key];
    } else {
      cache.current = {};
    }
  }, []);

  const refreshAll = useCallback(async (userEmail: string) => {
    setIsLoading(true);
    invalidateCache();
    try {
      // Groupe 1 : données statiques
      await Promise.all([
        getAgences(true),
      ]);
      // Petit délai anti-throttling
      await new Promise(r => setTimeout(r, 200));
      // Groupe 2 : données dynamiques
      await Promise.all([
        getVisites(userEmail, true),
        getRecouvrements(userEmail, true),
        getObjectifs(userEmail, true),
      ]);
      await new Promise(r => setTimeout(r, 200));
      // Groupe 3
      await Promise.all([
        getAccords(userEmail, true),
        getContrats(userEmail, true),
        getSituationMEP(userEmail, true),
      ]);
      await new Promise(r => setTimeout(r, 200));
      // Groupe 4
      await Promise.all([
        getFormations(userEmail, true),
        getClientsAnomalie(userEmail, true),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [invalidateCache, getAgences, getVisites, getRecouvrements, getObjectifs, getAccords, getContrats, getSituationMEP, getFormations, getClientsAnomalie]);

  return (
    <DataContext.Provider
      value={{
        getVisites,
        getRecouvrements,
        getObjectifs,
        getAccords,
        getContrats,
        getSituationMEP,
        getFormations,
        getClientsAnomalie,
        getAgences,
        invalidateCache,
        refreshAll,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
