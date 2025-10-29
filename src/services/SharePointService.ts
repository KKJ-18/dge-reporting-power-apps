import { SharePointService as GeneratedService } from '../generated/services/SharePointService'
import type { Item, ItemsList, TablesList } from '../generated/models/SharePointModel'

const SITE_URL = 'https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity'
const LIST_NAME = 'Activity'

type ActivityItem = {
  ID?: number
  Title?: string
  IdRubrique?: string
  [key: string]: any
}

function extractOperationData<T>(result: any): T | null {
  if (!result) {
    console.log('⚠️ Résultat null ou undefined');
    return null
  }

  console.log('🔍 Type de résultat:', typeof result);
  console.log('🔍 Clés du résultat:', Object.keys(result));

  // IOperationResult shape: { success, data, error }
  if (typeof result === 'object' && 'data' in result) {
    console.log('✅ Extraction depuis result.data');
    return (result as { data: T }).data ?? null
  }

  console.log('✅ Retour du résultat direct');
  return result as T
}

export class SharePointActivityService {
  /**
   * Récupère tous les sites SharePoint disponibles
   */
  public static async getSites() {
    try {
      const result = await GeneratedService.GetDataSetsMetadata()
      const data = extractOperationData<any>(result)
      
      console.log('Sites SharePoint disponibles:', data)
      return data?.value || []
    } catch (error: any) {
      console.error('Erreur lors de la récupération des sites SharePoint:', error)
      throw new Error(`Impossible de récupérer les sites: ${error.message}`)
    }
  }

  /**
   * Récupère toutes les listes d'un site SharePoint
   */
  public static async getLists(siteUrl: string = SITE_URL) {
    try {
      const result = await GeneratedService.GetTables(siteUrl)
      const data = extractOperationData<TablesList>(result)
      
      console.log('Listes SharePoint disponibles:', data)
      return data?.value || []
    } catch (error: any) {
      console.error('Erreur lors de la récupération des listes SharePoint:', error)
      throw new Error(`Impossible de récupérer les listes: ${error.message}`)
    }
  }

  /**
   * Récupère tous les éléments de la liste Activity
   */
  public static async getActivities(): Promise<ActivityItem[]> {
    try {
      console.log('📞 Appel SharePoint GetItems:', { SITE_URL, LIST_NAME });
      
      const result = await GeneratedService.GetItems(
        SITE_URL,
        LIST_NAME
      )
      
      console.log('📦 Résultat brut GetItems:', result);
      console.log('📦 Type:', typeof result);
      console.log('📦 Success:', (result as any).success);
      console.log('📦 Error:', (result as any).error);
      
      // Vérifier si c'est un IOperationResult avec error
      if ((result as any).error) {
        console.error('❌ Erreur dans IOperationResult:', (result as any).error);
        throw new Error((result as any).error.message || 'Erreur SharePoint');
      }
      
      // Extraire les données
      let itemsList: ItemsList | null = null;
      
      if ((result as any).data) {
        console.log('📊 Extraction depuis result.data');
        itemsList = (result as any).data;
      } else if ((result as any).value) {
        console.log('📊 Extraction depuis result.value');
        itemsList = result as any;
      } else {
        console.log('📊 Utilisation du résultat direct');
        itemsList = result as any;
      }
      
      console.log('📊 ItemsList extraite:', itemsList);
      
      const items = itemsList?.value || []
      console.log('📋 Items finaux:', items);
      console.log('📋 Nombre d\'items:', items.length);
      
      const mappedItems = items.map((item, index) => {
        console.log(`📄 Item ${index}:`, item);
        return {
          ID: (item as any).ID || (item as any).Id || (item as any).id,
          Title: (item as any).Title || (item as any).title,
          IdRubrique: (item as any).IdRubrique,
          ...item.dynamicProperties
        };
      });
      
      console.log('✅ Items mappés:', mappedItems);
      return mappedItems;
    } catch (error: any) {
      console.error('❌ Erreur complète:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      
      if (error.message?.includes('403') || error.message?.toLowerCase().includes('forbidden')) {
        throw new Error('Accès refusé à SharePoint. Veuillez autoriser la connexion dans Power Apps.')
      }
      
      if (error.message?.includes('404') || error.message?.toLowerCase().includes('not found')) {
        throw new Error('Liste SharePoint "Activity" introuvable. Vérifiez le nom et l\'URL du site.')
      }
      
      throw new Error(`Erreur SharePoint: ${error.message || 'Erreur inconnue'}`)
    }
  }

  /**
   * Récupère un élément spécifique par son ID
   */
  public static async getActivityById(id: number): Promise<ActivityItem | null> {
    try {
      const result = await GeneratedService.GetItem(
        SITE_URL,
        LIST_NAME,
        id
      )
      
      const item = extractOperationData<any>(result)
      
      if (!item) {
        return null
      }
      
      return {
        ID: item.ID,
        Title: item.Title,
        IdRubrique: item.IdRubrique,
        ...item.dynamicProperties
      }
    } catch (error: any) {
      console.error(`Erreur lors de la récupération de l'activité ${id}:`, error)
      throw new Error(`Impossible de récupérer l'activité: ${error.message}`)
    }
  }

  /**
   * Crée un nouvel élément dans la liste Activity
   */
  public static async createActivity(activity: Omit<ActivityItem, 'ID'>): Promise<ActivityItem> {
    try {
      const result = await GeneratedService.PostItem(
        SITE_URL,
        LIST_NAME,
        activity as any
      )
      
      const item = extractOperationData<Item>(result)
      
      return {
        ID: (item as any).ID,
        Title: (item as any).Title,
        IdRubrique: (item as any).IdRubrique,
        ...item?.dynamicProperties
      }
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'activité:', error)
      throw new Error(`Impossible de créer l'activité: ${error.message}`)
    }
  }

  /**
   * Met à jour un élément existant
   */
  public static async updateActivity(id: number, updates: Partial<ActivityItem>): Promise<ActivityItem> {
    try {
      const result = await GeneratedService.PatchItem(
        SITE_URL,
        LIST_NAME,
        id,
        updates as any
      )
      
      const item = extractOperationData<any>(result)
      
      return {
        ID: item.ID,
        Title: item.Title,
        IdRubrique: item.IdRubrique,
        ...item?.dynamicProperties
      }
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour de l'activité ${id}:`, error)
      throw new Error(`Impossible de mettre à jour l'activité: ${error.message}`)
    }
  }

  /**
   * Supprime un élément
   */
  public static async deleteActivity(id: number): Promise<void> {
    try {
      await GeneratedService.DeleteItem(
        SITE_URL,
        LIST_NAME,
        id
      )
      
      console.log(`Activité ${id} supprimée avec succès`)
    } catch (error: any) {
      console.error(`Erreur lors de la suppression de l'activité ${id}:`, error)
      throw new Error(`Impossible de supprimer l'activité: ${error.message}`)
    }
  }
}
