/**
 * Service de gestion du profil utilisateur
 * Gère la récupération et le filtrage basé sur le département/fonction
 */

import { Office365UsersService } from './Office365UsersService'
import { UtilisateursService } from './UtilisateursService'

export type Departement = 'DA' | 'DPNP' | 'DSE' | null

export interface UserProfile {
  email: string
  fonction: string | null
  departement: Departement
  isDirecteur: boolean
  isAssistantDCE: boolean
  hasGlobalView: boolean
}

export class UserProfileService {
  private static cachedProfile: UserProfile | null = null

  /**
   * Récupère le profil de l'utilisateur connecté
   * Utilise le cache pour éviter les appels répétés
   */
  public static async getCurrentUserProfile(): Promise<UserProfile> {
    // Retourner le cache si disponible
    if (this.cachedProfile) {
      console.log('📋 Utilisation du profil en cache:', this.cachedProfile);
      return this.cachedProfile
    }

    try {
      console.log('🔄 Chargement du profil utilisateur...');
      
      // 1. Récupérer l'email de l'utilisateur connecté via Office 365
      console.log('📧 Récupération de l\'email depuis Office 365...');
      const office365Result = await Office365UsersService.MyProfile_V2('mail,userPrincipalName,displayName,givenName,surname,jobTitle,department');
      
      console.log('✅ Résultat Office 365:', office365Result);
      console.log('📦 Type de résultat:', typeof office365Result);
      console.log('🔑 Clés disponibles:', Object.keys(office365Result || {}));
      
      // Extraire l'email depuis la structure de réponse
      let userEmail: string | undefined;
      
      // Essayer différentes sources possibles pour l'email
      if (office365Result) {
        // Si c'est un objet avec .data ou .result
        const data = (office365Result as any).data || (office365Result as any).result || office365Result;
        
        userEmail = data.mail || 
                   data.userPrincipalName || 
                   data.Mail || 
                   data.UserPrincipalName ||
                   data.email ||
                   data.Email;
      }

      console.log('📧 Email extrait:', userEmail);

      if (!userEmail) {
        console.error('❌ Impossible d\'extraire l\'email depuis:', office365Result);
        throw new Error('Impossible de récupérer l\'email de l\'utilisateur connecté')
      }

      // 2. Chercher l'utilisateur dans la table Utilisateurs par email
      console.log(`🔍 Recherche de l'utilisateur avec email: ${userEmail}`);
      
      // Recherche directe avec filtre OData simple sur Email
      let utilisateursResult: any;
      
      try {
        utilisateursResult = await UtilisateursService.getAll({
          filter: `Email eq '${userEmail}'`
        });
        
        console.log('📊 Résultat recherche:', utilisateursResult);
        console.log('� Nombre de résultats:', utilisateursResult?.value?.length || 0);
        
        if (utilisateursResult?.value && utilisateursResult.value.length > 0) {
          console.log('✅ Utilisateur trouvé:', utilisateursResult.value[0]);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la recherche:', error);
        throw error;
      }

      console.log('📋 Résultat final recherche Utilisateurs:', utilisateursResult);
      
      // Le service retourne {success: true, data: Array} et non {value: Array}
      const foundUsers = utilisateursResult?.data || utilisateursResult?.value || [];
      console.log('📊 Nombre de résultats:', foundUsers.length);

      // Afficher tous les emails trouvés pour debug
      if (foundUsers.length > 0) {
        console.log('📧 Utilisateurs trouvés:');
        foundUsers.forEach((u: any, index: number) => {
          console.log(`  ${index + 1}. ${u.Email} (Fonction: ${u.Fonction}, Dept: ${u.Departement?.Value || u.Departement})`);
        });
      }

      if (foundUsers.length === 0) {
        // Utilisateur non trouvé dans la table - accès par défaut sans département
        console.warn(`⚠️ Utilisateur ${userEmail} non trouvé dans la table Utilisateurs`);
        console.warn(`⚠️ Vérifiez que l'email existe bien dans SharePoint`);
        this.cachedProfile = {
          email: userEmail,
          fonction: null,
          departement: null,
          isDirecteur: false,
          isAssistantDCE: false,
          hasGlobalView: false
        }
        console.log('📝 Profil par défaut créé:', this.cachedProfile);
        return this.cachedProfile
      }

      const utilisateur = foundUsers[0]
      console.log('👤 Utilisateur trouvé:', utilisateur);

      // 3. Déterminer le rôle et les permissions
      const fonction = utilisateur.Fonction?.trim() || null
      const isDirecteur = fonction?.toLowerCase() === 'directeur'
      const isAssistantDCE = this.isAssistantDCERole(fonction)
      
      console.log('💼 Fonction:', fonction);
      console.log('👔 Est Directeur?', isDirecteur);
      console.log('🗂️ Est Assistant DCE?', isAssistantDCE);

      // 4. Récupérer le département (si pas directeur)
      let departement: Departement = null
      if (!isDirecteur && utilisateur.Departement) {
        console.log('🏢 Département (objet brut):', utilisateur.Departement);
        console.log('🏢 Type du département:', typeof utilisateur.Departement);
        console.log('🏢 Clés du département:', Object.keys(utilisateur.Departement || {}));
        
        // Le champ Departement est un objet SharePoint Choice avec structure:
        // { @odata.type: "...", Id: 0, Value: "DA" }
        let deptValue: any;
        
        if (typeof utilisateur.Departement === 'object' && utilisateur.Departement !== null) {
          // Cas 1: Objet SharePoint avec propriété Value
          deptValue = utilisateur.Departement.Value;
          console.log('🏢 Département.Value:', deptValue);
        } else if (typeof utilisateur.Departement === 'string') {
          // Cas 2: Déjà une string
          deptValue = utilisateur.Departement;
          console.log('🏢 Département (string):', deptValue);
        }
        
        if (deptValue) {
          departement = this.normalizeDepartement(deptValue);
          console.log('🏢 Département normalisé:', departement);
        } else {
          console.warn('⚠️ Impossible d\'extraire la valeur du département');
        }
      } else if (!isDirecteur) {
        console.log('🏢 Pas de département défini pour cet utilisateur');
      } else {
        console.log('👔 Directeur - pas de département assigné');
      }

      // 5. Construire le profil
      this.cachedProfile = {
        email: userEmail,
        fonction,
        departement,
        isDirecteur,
        isAssistantDCE,
        hasGlobalView: isDirecteur // Directeur a la vue globale
      }

      console.log('✅ Profil utilisateur construit:');
      console.log('   - Email:', this.cachedProfile.email);
      console.log('   - Fonction:', this.cachedProfile.fonction);
      console.log('   - Département:', this.cachedProfile.departement);
      console.log('   - Est Directeur:', this.cachedProfile.isDirecteur);
      console.log('   - Est Assistant DCE:', this.cachedProfile.isAssistantDCE);
      console.log('   - Vue globale:', this.cachedProfile.hasGlobalView);
      console.log('🔍 Profil complet:', JSON.stringify(this.cachedProfile, null, 2));
      
      return this.cachedProfile

    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil utilisateur:', error)
      throw new Error('Impossible de charger le profil utilisateur')
    }
  }

  private static isAssistantDCERole(fonction: string | null): boolean {
    if (!fonction) return false
    const value = fonction
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    return value.includes('assistant') && value.includes('dce')
  }

  /**
   * Normalise la valeur du département
   */
  private static normalizeDepartement(value: any): Departement {
    if (!value) return null
    
    const normalized = String(value).trim().toUpperCase()
    
    if (normalized === 'DA' || normalized.includes('ANALYSE')) {
      return 'DA'
    }
    if (normalized === 'DPNP' || normalized.includes('NON PERFORMANT')) {
      return 'DPNP'
    }
    if (normalized === 'DSE' || normalized.includes('SURVEILLANCE')) {
      return 'DSE'
    }
    
    return null
  }

  /**
   * Réinitialise le cache du profil
   */
  public static clearCache(): void {
    this.cachedProfile = null
  }

  /**
   * Génère un filtre OData pour les activités basé sur le profil
   */
  public static getActivityFilter(profile: UserProfile): string | undefined {
    // Directeur = vue globale, pas de filtre
    if (profile.hasGlobalView) {
      return undefined
    }

    // Si département défini, filtrer par département
    if (profile.departement) {
      // Adapter selon la structure de votre table Activités
      // Exemple: return `Departement eq '${profile.departement}'`
      return `Departement/Value eq '${profile.departement}'`
    }

    // Pas de département = pas d'accès aux activités
    return "ID eq -1" // Filtre qui ne retourne rien
  }

  /**
   * Vérifie si l'utilisateur peut créer une activité
   */
  public static canCreateActivity(profile: UserProfile): boolean {
    return profile.isDirecteur || profile.isAssistantDCE || profile.departement !== null
  }

  /**
   * Vérifie si l'utilisateur peut modifier/supprimer une activité
   */
  public static canModifyActivity(profile: UserProfile, activityDepartement?: string): boolean {
    // Directeur peut tout modifier
    if (profile.isDirecteur) {
      return true
    }

    // Utilisateur ne peut modifier que les activités de son département
    if (profile.departement && activityDepartement) {
      return profile.departement === activityDepartement
    }

    return false
  }

  /**
   * Obtient le label du département
   */
  public static getDepartementLabel(dept: Departement): string {
    switch (dept) {
      case 'DA':
        return 'Département Analyse'
      case 'DPNP':
        return 'Département des Prêts Non Performants'
      case 'DSE':
        return 'Département Surveillance des Engagements'
      default:
        return 'Non défini'
    }
  }
}
