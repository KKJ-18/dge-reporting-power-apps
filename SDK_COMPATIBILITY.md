# Compatibilité SDK Power Apps

## Problème actuel

Les services générés (`SharePointService.ts` et `Office365UsersService.ts`) ont des problèmes de compatibilité avec **Power Apps SDK v0.0.4**.

### Erreur rencontrée

```
Property 'parameters' is missing in type '{ path: string; method: string; responseInfo: { ... } }' 
but required in type 'IApiDefinition'.
```

Cette erreur se produit car le schéma généré pour SharePoint contient des APIs (comme `OnTableUpdatedHook`) sans le champ `parameters` requis par le SDK actuel.

## Solution temporaire

Les fichiers problématiques ont été renommés en `.bak` :
- `src/generated/services/SharePointService.ts` → `SharePointService.ts.bak`
- `src/generated/services/Office365UsersService.ts` → `Office365UsersService.ts.bak`

Les exports dans `src/generated/index.ts` ont été commentés.

## Services de remplacement

Des wrappers fonctionnels ont été créés avec des fallbacks :

### SharePoint
- **Fichier** : `src/utils/sharePointAdapter.ts`
- **URL** : `https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity`
- **Fonctionnalités** : createItem, getItems, updateItem, deleteItem
- **Status** : ✅ Fonctionnel en mode développement

### Office 365 Users
- **Fichier** : `src/services/Office365UsersService.ts`
- **Fonctionnalités** : getMyProfile, getUserProfile, getManager, searchUsers
- **Status** : ✅ Fonctionnel avec données mock

## Comment réactiver les vrais services

Quand Power Apps SDK sera mis à jour (v0.1.0+) :

1. **Renommer les fichiers .bak en .ts**
   ```powershell
   Rename-Item "src\generated\services\SharePointService.ts.bak" -NewName "SharePointService.ts"
   Rename-Item "src\generated\services\Office365UsersService.ts.bak" -NewName "Office365UsersService.ts"
   ```

2. **Décommenter les exports dans `src/generated/index.ts`**
   ```typescript
   export * from './services/Office365UsersService';
   export * from './services/SharePointService';
   ```

3. **Mettre à jour `src/services/Office365UsersService.ts`**
   
   Décommenter les sections TODO et remplacer les données mock par les vrais appels:
   
   ```typescript
   // Décommenter cette ligne:
   const { Office365UsersService: GeneratedService } = await import('../generated/services/Office365UsersService');
   
   // Utiliser l'API comme recommandé par Microsoft:
   const result = await GeneratedService.MyProfile_V2("id,displayName,jobTitle,department,officeLocation,mobilePhone,businessPhones,mail,userPrincipalName");
   
   if (result.data) {
     return {
       displayName: result.data.displayName || '',
       mail: result.data.mail || result.data.userPrincipalName || '',
       jobTitle: result.data.jobTitle,
       department: result.data.department,
       officeLocation: result.data.officeLocation,
       mobilePhone: result.data.mobilePhone,
       businessPhones: result.data.businessPhones,
       userPrincipalName: result.data.userPrincipalName || '',
       id: result.data.id || ''
     };
   }
   ```

4. **Pour la photo de profil**
   
   ```typescript
   const { Office365UsersService: GeneratedService } = await import('../generated/services/Office365UsersService');
   const result = await GeneratedService.UserPhoto_V2(userId);
   
   if (result.data) {
     return `data:image/jpeg;base64,${result.data}`;
   }
   ```

5. **Mettre à jour `src/utils/sharePointAdapter.ts`**
   
   Utiliser SharePointService pour les opérations CRUD:
   
   ```typescript
   // Import du service généré
   import { SharePointService } from '../generated/services/SharePointService';
   
   // Créer un item
   static async createItem(siteUrl: string, listName: string, item: Record<string, any>) {
     const result = await SharePointService.PostItem(siteUrl, listName, item);
     return result.data;
   }
   
   // Récupérer des items
   static async getItems(siteUrl: string, listName: string) {
     const result = await SharePointService.GetItems(siteUrl, listName);
     return result.data;
   }
   
   // Mettre à jour un item
   static async updateItem(siteUrl: string, listName: string, id: number, item: Record<string, any>) {
     const result = await SharePointService.PatchItem(siteUrl, listName, id, item);
     return result.data;
   }
   
   // Supprimer un item
   static async deleteItem(siteUrl: string, listName: string, id: number) {
     await SharePointService.DeleteItem(siteUrl, listName, id);
   }
   ```

6. **Tester la compilation**
   ```bash
   npm run build
   ```

7. **Tester en développement**
   ```bash
   npm run dev
   ```

8. **Déployer sur Power Apps**
   ```bash
   npm run build
   pac code push
   ```

## Modèles disponibles

Les modèles TypeScript sont générés et fonctionnels :
- ✅ `src/generated/models/SharePointModel.ts`
- ✅ `src/generated/models/Office365UsersModel.ts`

Ces fichiers peuvent être utilisés pour le typage même si les services sont désactivés.

## Connexions Power Apps

- **SharePoint** : Connection ID `7f6f26afaf97425c88cdfcc6af3cee53`
- **Office 365 Users** : Connection ID `f34dc658d2394e268cb19b85a14e3caa`

Les connexions sont configurées et prêtes à être utilisées une fois le SDK compatible.
