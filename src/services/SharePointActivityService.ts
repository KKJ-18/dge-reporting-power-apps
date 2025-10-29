import { SharePointService as GeneratedService } from '../generated/services/SharePointService'
import type { ItemsList } from '../generated/models/SharePointModel'
import { getClient } from '@microsoft/power-apps/data'
import { dataSourcesInfo } from '../../.power/appschemas/dataSourcesInfo'

// Configuration SharePoint
const SITE_URL = 'https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity'
const LIST_NAME = 'Activity'

export type ActivityItem = {
  ID?: number
  Title?: string
  IdRubrique?: string
  [key: string]: any
}

export class SharePointActivityService {
  /**
   * Vérifie et initialise la connexion SharePoint
   */
  private static async ensureConnection(): Promise<void> {
    try {
      console.log('🔐 Vérification de la connexion SharePoint...');
      const client = getClient(dataSourcesInfo);
      
      // Tester la connexion avec GetDataSetsMetadata (plus simple)
      const testResult = await Promise.race([
        client.executeAsync({
          connectorOperation: {
            tableName: 'sharepointonline',
            operationName: 'GetDataSetsMetadata',
            parameters: {}
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout connexion')), 5000))
      ]);
      
      console.log('✅ Connexion SharePoint OK:', testResult);
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      throw new Error('Impossible de se connecter à SharePoint. Veuillez autoriser la connexion dans Power Apps.');
    }
  }

  /**
   * Récupère tous les éléments de la liste Activity
   */
  public static async getActivities(): Promise<ActivityItem[]> {
    try {
      console.log('📞 START getActivities');
      
      // Vérifier la connexion d'abord
      await this.ensureConnection();
      
      console.log('📞 Appel SharePoint.GetItems');
      console.log('  SITE_URL:', SITE_URL);
      console.log('  LIST_NAME:', LIST_NAME);
      
      // Timeout de 15 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La requête SharePoint a pris plus de 15 secondes')), 15000)
      );
      
      // Appel au service généré avec timeout
      const resultPromise = GeneratedService.GetItems(SITE_URL, LIST_NAME);
      
      console.log('⏳ En attente du résultat...');
      const result = await Promise.race([resultPromise, timeoutPromise]) as any;
      
      console.log('📦 Type du résultat:', typeof result);
      console.log('📦 Clés du résultat:', Object.keys(result));
      console.log('📦 Résultat.success:', result.success);
      console.log('📦 Résultat.error:', result.error);
      console.log('📦 Résultat.data:', result.data);
      console.log('📦 Résultat complet:', JSON.stringify(result, null, 2));
      
      // Vérifier les erreurs
      if (result.error) {
        console.error('❌ Erreur dans result.error:', result.error);
        throw new Error(result.error.message || JSON.stringify(result.error));
      }
      
      if (result.success === false) {
        console.error('❌ Success=false');
        throw new Error('La requête SharePoint a échoué');
      }
      
      // Extraire les données - essayer plusieurs chemins
      let itemsList: ItemsList | null = null;
      
      if (result.data) {
        console.log('✅ Extraction depuis result.data');
        itemsList = result.data;
      } else if (result.value) {
        console.log('✅ Extraction depuis result.value');
        itemsList = result;
      } else {
        console.log('✅ Utilisation directe du résultat');
        itemsList = result;
      }
      
      console.log('📊 ItemsList type:', typeof itemsList);
      console.log('📊 ItemsList keys:', itemsList ? Object.keys(itemsList) : 'null');
      console.log('📊 ItemsList.value:', itemsList?.value);
      
      const items = itemsList?.value || [];
      console.log('📋 Items array length:', items.length);
      console.log('📋 Items array:', items);
      
      if (items.length === 0) {
        console.warn('⚠️ Aucun item retourné - la liste est peut-être vide');
        return [];
      }
      
      if (items.length > 0) {
        console.log('📄 Premier item brut:', JSON.stringify(items[0], null, 2));
        console.log('📄 Clés du premier item:', Object.keys(items[0]));
      }
      
      // Mapper les items
      const mapped = items.map((item: any, index: number) => {
        console.log(`🔄 Mapping item ${index}:`, item);
        
        const activity: ActivityItem = {
          ID: item.ID || item.Id || item.id || item['odata.id'],
          Title: item.Title || item.title,
          IdRubrique: item.IdRubrique || item.idRubrique
        };
        
        // Ajouter les propriétés dynamiques
        if (item.dynamicProperties) {
          Object.assign(activity, item.dynamicProperties);
        }
        
        console.log(`✅ Item ${index} mappé:`, activity);
        return activity;
      });
      
      console.log('✅ Total activities mapped:', mapped.length);
      console.log('✅ Activities:', mapped);
      return mapped;
      
    } catch (error: any) {
      console.error('❌ ERREUR CATCH:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Error complet:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Gestion des erreurs spécifiques
      if (error.message?.includes('Timeout')) {
        throw new Error('La requête SharePoint prend trop de temps. Vérifiez votre connexion.');
      }
      
      if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
        throw new Error('Accès refusé. Veuillez autoriser la connexion SharePoint dans Power Apps.');
      }
      
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
        throw new Error(`Liste "${LIST_NAME}" introuvable sur le site ${SITE_URL}`);
      }
      
      throw new Error(`Erreur SharePoint: ${error.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Crée une nouvelle activité
   */
  public static async createActivity(activity: Omit<ActivityItem, 'ID'>): Promise<ActivityItem> {
    try {
      console.log('📞 Create Activity:', activity);
      
      const result = await GeneratedService.PostItem(SITE_URL, LIST_NAME, activity as any);
      const item = (result as any).data || result;
      
      return {
        ID: item.ID || item.Id,
        Title: item.Title,
        IdRubrique: item.IdRubrique,
        ...item.dynamicProperties
      };
    } catch (error: any) {
      console.error('❌ Erreur création:', error);
      throw new Error(`Impossible de créer l'activité: ${error.message}`);
    }
  }

  /**
   * Met à jour une activité
   */
  public static async updateActivity(id: number, updates: Partial<ActivityItem>): Promise<ActivityItem> {
    try {
      console.log('📞 Update Activity:', id, updates);
      
      const result = await GeneratedService.PatchItem(SITE_URL, LIST_NAME, id, updates as any);
      const item = (result as any).data || result;
      
      return {
        ID: item.ID || item.Id,
        Title: item.Title,
        IdRubrique: item.IdRubrique,
        ...item.dynamicProperties
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour:', error);
      throw new Error(`Impossible de mettre à jour: ${error.message}`);
    }
  }

  /**
   * Supprime une activité
   */
  public static async deleteActivity(id: number): Promise<void> {
    try {
      console.log('📞 Delete Activity:', id);
      await GeneratedService.DeleteItem(SITE_URL, LIST_NAME, id);
      console.log('✅ Suppression réussie');
    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      throw new Error(`Impossible de supprimer: ${error.message}`);
    }
  }

  /**
   * Récupère une activité par ID
   */
  public static async getActivityById(id: number): Promise<ActivityItem | null> {
    try {
      console.log('📞 Get Activity By ID:', id);
      
      const result = await GeneratedService.GetItem(SITE_URL, LIST_NAME, id);
      const item = (result as any).data || result;
      
      if (!item) return null;
      
      return {
        ID: item.ID || item.Id,
        Title: item.Title,
        IdRubrique: item.IdRubrique,
        ...item.dynamicProperties
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération:', error);
      return null;
    }
  }
}
