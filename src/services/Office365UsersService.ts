import { getClient } from '@microsoft/power-apps/data'
import { dataSourcesInfo } from '../../.power/appschemas/dataSourcesInfo'

type OfficeProfile = {
  displayName?: string
  jobTitle?: string
  mail?: string
  mobilePhone?: string
  officeLocation?: string
  department?: string
  userPrincipalName?: string
}

const DATA_SOURCE_NAME = 'office365users'
const SELECT_FIELDS = 'displayName,jobTitle,mail,mobilePhone,officeLocation,department,userPrincipalName'

let cachedClient: ReturnType<typeof getClient> | null = null

function resolveClient() {
  if (!cachedClient) {
    cachedClient = getClient(dataSourcesInfo)
  }
  return cachedClient
}

function normalizeProfile(data?: OfficeProfile | null) {
  if (!data) {
    return null
  }

  return {
    displayName: data.displayName || data.userPrincipalName || 'Utilisateur',
    jobTitle: data.jobTitle || 'Poste non défini',
    mail: data.mail || data.userPrincipalName || 'Non disponible',
    mobilePhone: data.mobilePhone || 'Non renseigné',
    officeLocation: data.officeLocation || 'Non renseignée',
    department: data.department || 'Non renseigné'
  }
}

// Wrapper pour gérer l'environnement (dev vs Power Apps)
export class Office365UsersService {
  private static isRunningInPowerApps(): boolean {
    return typeof window !== 'undefined' && window.parent !== window
  }

  private static getDevProfile() {
    return {
      displayName: 'Jordan Kamsu',
      jobTitle: 'Analyste DGE',
      mail: 'jordan.kamsu@afrilandfirstbank.cm',
      mobilePhone: '+237 6 XX XX XX XX',
      officeLocation: 'Douala - Siège',
      department: "Direction Générale d'Exploitation"
    }
  }

  private static extractOperationData<T = OfficeProfile>(result: any): T | null {
    if (!result) {
      return null
    }

    // IOperationResult shape: { success, data, error }
    if (typeof result === 'object' && 'data' in result) {
      return (result as { data: T }).data ?? null
    }

    return result as T
  }

  public static async getMyProfile() {
    if (!this.isRunningInPowerApps()) {
      console.info('Mode développement: retour de données mock Office 365')
      return this.getDevProfile()
    }

    try {
      const client = resolveClient()

      const response = await client.executeAsync<{ $select: string }, OfficeProfile>({
        connectorOperation: {
          tableName: DATA_SOURCE_NAME,
          operationName: 'MyProfile_V2',
          parameters: { $select: SELECT_FIELDS }
        }
      })

      const data = this.extractOperationData<OfficeProfile>(response)
      const profile = normalizeProfile(data)

      if (profile) {
        return profile
      }

      throw new Error("La réponse Office 365 ne contient pas de données d'utilisateur.")
    } catch (error: any) {
      const message = error?.message || 'Erreur inconnue lors de la récupération du profil Office 365.'

      if (message.includes('403') || message.toLowerCase().includes('forbidden')) {
        throw new Error('Accès refusé par Office 365. Veuillez autoriser la connexion dans la fenêtre de consentement Power Apps.')
      }

      throw new Error(`Impossible de charger le profil Office 365 : ${message}`)
    }
  }
}
