# 📁 Guide d'Intégration SharePoint - Application DGE

## Vue d'ensemble

L'application DGE Reporting est maintenant connectée à **SharePoint Online**, vous permettant de :
- Lire et écrire des données dans des listes SharePoint
- Gérer des documents dans des bibliothèques SharePoint
- Synchroniser automatiquement les rapports avec SharePoint
- Centraliser le stockage des données de reporting

---

## 🔌 Configuration de la Connexion

### Connexion Active
```
✅ Connecté à SharePoint Online
📧 Utilisateur: jordan_kamsu@afrilandfirstbank.com
🔗 ID de connexion: 7f6f26afaf97425c88cdfcc6af3cee53
```

### Source de Données Ajoutée
```bash
pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53"
[addDataSourceAsync] Successfully added data source 'sharepointonline'
```

### Fichiers Générés
```
✨ src/generated/models/SharePointModel.ts        (537 lignes) - Types TypeScript
✨ src/generated/services/SharePointService.ts    (2247 lignes) - API Service
✨ src/components/SharePointExample.tsx           (400 lignes) - Composant exemple
```

---

## 🚀 Utilisation du Service SharePoint

### Import du Service

```typescript
import { SharePointService } from '../generated';
```

### Méthodes Disponibles

Toutes les méthodes sont **statiques** et retournent une `Promise<IOperationResult<T>>`.

---

## 📖 Opérations CRUD

### 1. Lister les Sites SharePoint

```typescript
// Récupérer les métadonnées des sites
const result = await SharePointService.GetDataSetsMetadata();

if (result.ok && result.data) {
  console.log('Métadonnées:', result.data);
}
```

### 2. Lister les Listes d'un Site

```typescript
const siteUrl = 'https://votreorganisation.sharepoint.com/sites/VotreSite';

// Récupérer toutes les listes
const result = await SharePointService.GetTables(siteUrl);

if (result.ok && result.data?.value) {
  result.data.value.forEach((list: any) => {
    console.log(`📋 Liste: ${list.displayName}`);
    console.log(`   ID: ${list.id}`);
    console.log(`   Éléments: ${list.itemCount}`);
  });
}
```

### 3. Créer un Élément

```typescript
const siteUrl = 'https://votreorganisation.sharepoint.com/sites/VotreSite';
const listId = 'ListeRapportsHebdomadaires';

const newItem = {
  Title: 'Rapport Semaine 43 - 2025',
  Description: 'Rapport hebdomadaire DGE',
  Statut: 'En cours',
  DateCreation: new Date().toISOString(),
  Montant: 1250000,
  NombreDossiers: 15
};

const result = await SharePointService.PostItem(siteUrl, listId, newItem);

if (result.ok) {
  console.log('✅ Élément créé:', result.data);
  console.log('ID:', result.data?.Id);
} else {
  console.error('❌ Erreur:', result.error);
}
```

### 4. Lire les Éléments

```typescript
// Récupérer tous les éléments
const result = await SharePointService.GetItems(siteUrl, listId);

if (result.ok && result.data?.value) {
  console.log(`✅ ${result.data.value.length} éléments trouvés`);
  
  result.data.value.forEach((item: any) => {
    console.log(`- ${item.Title} (ID: ${item.Id})`);
  });
}

// Avec filtres OData
const filtered = await SharePointService.GetItems(
  siteUrl, 
  listId,
  "$filter=Statut eq 'Validé'",  // Filtrer
  "$orderby=DateCreation desc",   // Trier
  10                               // Top 10
);
```

### 5. Mettre à Jour un Élément

```typescript
const itemId = 42; // ID de l'élément SharePoint

const updates = {
  Statut: 'Validé',
  Commentaires: 'Rapport validé par le manager',
  DateValidation: new Date().toISOString()
};

const result = await SharePointService.PatchItem(siteUrl, listId, itemId, updates);

if (result.ok) {
  console.log('✅ Élément mis à jour');
} else {
  console.error('❌ Erreur:', result.error);
}
```

### 6. Supprimer un Élément

```typescript
const itemId = 42;

const result = await SharePointService.DeleteItem(siteUrl, listId, itemId);

if (result.ok) {
  console.log('✅ Élément supprimé');
} else {
  console.error('❌ Erreur:', result.error);
}
```

---

## 📚 Gestion des Bibliothèques de Documents

### Lister les Documents

```typescript
const libraryId = 'Documents';

const result = await SharePointService.GetItems(siteUrl, libraryId);

if (result.ok && result.data?.value) {
  result.data.value.forEach((doc: any) => {
    console.log(`📄 ${doc.FileLeafRef}`);
    console.log(`   Taille: ${doc.File_x0020_Size} bytes`);
    console.log(`   Modifié: ${doc.Modified}`);
  });
}
```

### Créer un Dossier

```typescript
const folderData = {
  Title: 'Rapports 2025',
  ContentTypeId: '0x0120' // Content Type ID pour dossier
};

const result = await SharePointService.PostItem(siteUrl, libraryId, folderData);
```

---

## 🔍 Filtres et Requêtes Avancées

### Syntaxe OData

```typescript
// Filtrer par statut
$filter = "Statut eq 'Validé'";

// Filtrer par date
$filter = "DateCreation gt '2025-10-01T00:00:00Z'";

// Filtrer par nombre
$filter = "Montant gt 100000";

// Combiner plusieurs conditions
$filter = "Statut eq 'Validé' and Montant gt 100000";

// Trier
$orderby = "DateCreation desc";

// Limiter
$top = 50;

// Exemple complet
const result = await SharePointService.GetItems(
  siteUrl,
  listId,
  "Statut eq 'En cours' and Montant gt 50000",
  "DateCreation desc",
  20
);
```

---

## 💾 Sauvegarde Automatique vers SharePoint

### Exemple : Sauvegarder un Rapport

```typescript
import { SharePointService } from '../generated';

async function sauvegarderRapport(formData: any) {
  const siteUrl = 'https://votreorganisation.sharepoint.com/sites/DGE';
  const listId = 'RapportsHebdomadaires';

  const rapportItem = {
    Title: `Rapport ${formData.semaine}`,
    Semaine: formData.semaine,
    
    // Crédit Classique
    CreditClassique_NombreDossiers: formData.creditClassique_nombre,
    CreditClassique_Montant: formData.creditClassique_montant,
    
    // Crédit Programme
    CreditProgramme_DossiersRecus: formData.dossiersRecus_nombre,
    CreditProgramme_Montant: formData.dossiersRecus_montant,
    
    // Méta
    DateCreation: new Date().toISOString(),
    Statut: 'Brouillon',
    Auteur: 'jordan_kamsu@afrilandfirstbank.com'
  };

  try {
    const result = await SharePointService.PostItem(siteUrl, listId, rapportItem);
    
    if (result.ok) {
      console.log('✅ Rapport sauvegardé dans SharePoint');
      return result.data?.Id;
    } else {
      console.error('❌ Erreur:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Exception:', error);
    return null;
  }
}
```

---

## 🔄 Synchronisation Bidirectionnelle

### Charger depuis SharePoint

```typescript
async function chargerRapport(rapportId: number) {
  const siteUrl = 'https://votreorganisation.sharepoint.com/sites/DGE';
  const listId = 'RapportsHebdomadaires';

  // Récupérer l'élément spécifique
  const result = await SharePointService.GetItems(
    siteUrl,
    listId,
    `Id eq ${rapportId}`
  );

  if (result.ok && result.data?.value?.[0]) {
    const item = result.data.value[0];
    
    // Mapper vers le formulaire
    return {
      semaine: item.Semaine,
      creditClassique_nombre: item.CreditClassique_NombreDossiers,
      creditClassique_montant: item.CreditClassique_Montant,
      dossiersRecus_nombre: item.CreditProgramme_DossiersRecus,
      dossiersRecus_montant: item.CreditProgramme_Montant,
      // ... autres champs
    };
  }
  
  return null;
}
```

---

## 📋 Schéma de Liste SharePoint Recommandé

### Liste "RapportsHebdomadaires"

| Colonne | Type | Description |
|---------|------|-------------|
| Title | Ligne de texte | Titre du rapport |
| Semaine | Ligne de texte | Semaine (ex: "S43-2025") |
| DateCreation | Date et heure | Date de création |
| Statut | Choix | Brouillon, En validation, Validé |
| Auteur | Personne | Créateur du rapport |
| **Crédit Classique** |
| CC_NombreDossiers | Nombre | Nombre de dossiers |
| CC_Montant | Devise | Montant total |
| CC_TauxApprobation | Nombre | Taux % |
| **Crédit Programme** |
| CP_DossiersRecus | Nombre | Dossiers reçus |
| CP_Montant | Devise | Montant |
| CP_DelaiMoyen | Nombre | Délai en jours |
| **Admin Engagements** |
| AE_Stock | Nombre | Stock actuel |
| AE_Evolution | Nombre | Évolution % |
| **Suivi MEP** |
| MEP_Traites | Nombre | MEP traités |
| MEP_EnCours | Nombre | MEP en cours |
| **Activités Annexes** |
| AA_Nombre | Nombre | Nombre d'activités |
| **Validation** |
| DateValidation | Date et heure | Date validation |
| ValidateurCommentaires | Lignes de texte | Commentaires |

### Script PowerShell pour Créer la Liste

```powershell
# Se connecter à SharePoint
Connect-PnPOnline -Url "https://votreorganisation.sharepoint.com/sites/DGE"

# Créer la liste
New-PnPList -Title "RapportsHebdomadaires" -Template GenericList

# Ajouter les colonnes
Add-PnPField -List "RapportsHebdomadaires" -DisplayName "Semaine" -InternalName "Semaine" -Type Text
Add-PnPField -List "RapportsHebdomadaires" -DisplayName "Statut" -InternalName "Statut" -Type Choice -Choices "Brouillon","En validation","Validé"
Add-PnPField -List "RapportsHebdomadaires" -DisplayName "CC_NombreDossiers" -InternalName "CC_NombreDossiers" -Type Number
Add-PnPField -List "RapportsHebdomadaires" -DisplayName "CC_Montant" -InternalName "CC_Montant" -Type Currency
# ... autres colonnes
```

---

## 🎯 Cas d'Usage Pratiques

### 1. Workflow de Validation

```typescript
// Soumettre pour validation
async function soumettreValidation(rapportId: number) {
  return await SharePointService.PatchItem(
    siteUrl,
    listId,
    rapportId,
    {
      Statut: 'En validation',
      DateSoumission: new Date().toISOString()
    }
  );
}

// Valider
async function validerRapport(rapportId: number, commentaires: string) {
  return await SharePointService.PatchItem(
    siteUrl,
    listId,
    rapportId,
    {
      Statut: 'Validé',
      DateValidation: new Date().toISOString(),
      ValidateurCommentaires: commentaires
    }
  );
}
```

### 2. Historique des Rapports

```typescript
async function obtenirHistorique(nombreSemaines: number = 10) {
  const result = await SharePointService.GetItems(
    siteUrl,
    listId,
    undefined, // Pas de filtre
    "DateCreation desc", // Tri par date
    nombreSemaines
  );

  if (result.ok && result.data?.value) {
    return result.data.value.map((item: any) => ({
      id: item.Id,
      semaine: item.Semaine,
      statut: item.Statut,
      dateCreation: new Date(item.DateCreation),
      montantTotal: 
        (item.CC_Montant || 0) + 
        (item.CP_Montant || 0)
    }));
  }
  
  return [];
}
```

### 3. Statistiques Agrégées

```typescript
async function calculerStatistiques() {
  const result = await SharePointService.GetItems(
    siteUrl,
    listId,
    "Statut eq 'Validé'",
    "DateCreation desc",
    100
  );

  if (result.ok && result.data?.value) {
    const rapports = result.data.value;
    
    return {
      total: rapports.length,
      montantTotal: rapports.reduce((sum: number, r: any) => 
        sum + (r.CC_Montant || 0) + (r.CP_Montant || 0), 0),
      dossiersTotal: rapports.reduce((sum: number, r: any) => 
        sum + (r.CC_NombreDossiers || 0) + (r.CP_DossiersRecus || 0), 0),
      delaiMoyen: rapports.reduce((sum: number, r: any) => 
        sum + (r.CP_DelaiMoyen || 0), 0) / rapports.length
    };
  }
  
  return null;
}
```

---

## 🔐 Permissions et Sécurité

### Vérifier les Permissions

```typescript
const result = await SharePointService.GetItemPermissions(
  siteUrl,
  listId,
  itemId
);

if (result.ok && result.data?.value) {
  console.log('Permissions:', result.data.value);
}
```

### Partager un Élément

```typescript
const shareData = {
  recipients: ['manager@afrilandfirstbank.com'],
  message: 'Rapport prêt pour validation',
  sendEmail: true
};

const result = await SharePointService.ItemGrantAccess(
  siteUrl,
  listId,
  itemId,
  shareData
);
```

---

## ⚡ Optimisations et Bonnes Pratiques

### 1. Pagination

```typescript
async function getAllItemsPaginated(siteUrl: string, listId: string) {
  const pageSize = 100;
  let allItems: any[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await SharePointService.GetItems(
      siteUrl,
      listId,
      undefined,
      "Id asc",
      pageSize
    );

    if (result.ok && result.data?.value) {
      allItems = allItems.concat(result.data.value);
      hasMore = result.data.value.length === pageSize;
      skip += pageSize;
    } else {
      hasMore = false;
    }
  }

  return allItems;
}
```

### 2. Mise en Cache

```typescript
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedItems(siteUrl: string, listId: string) {
  const key = `${siteUrl}-${listId}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await SharePointService.GetItems(siteUrl, listId);
  
  if (result.ok && result.data?.value) {
    cache.set(key, {
      data: result.data.value,
      timestamp: Date.now()
    });
    return result.data.value;
  }

  return [];
}
```

### 3. Gestion d'Erreurs

```typescript
async function safeSharePointOperation<T>(
  operation: () => Promise<IOperationResult<T>>
): Promise<T | null> {
  try {
    const result = await operation();
    
    if (result.ok) {
      return result.data ?? null;
    } else {
      console.error('Erreur SharePoint:', result.error);
      // Logger l'erreur dans un système de monitoring
      return null;
    }
  } catch (error) {
    console.error('Exception SharePoint:', error);
    // Logger l'exception
    return null;
  }
}

// Utilisation
const items = await safeSharePointOperation(() =>
  SharePointService.GetItems(siteUrl, listId)
);
```

---

## 📊 Monitoring et Logs

### Logger les Opérations

```typescript
class SharePointLogger {
  static log(operation: string, params: any, result: any) {
    console.log({
      timestamp: new Date().toISOString(),
      operation,
      params,
      success: result.ok,
      error: result.error,
      duration: /* calculer */
    });
  }
}

// Utilisation
const startTime = Date.now();
const result = await SharePointService.GetItems(siteUrl, listId);
SharePointLogger.log('GetItems', { siteUrl, listId }, result);
```

---

## 🛠️ Dépannage

### Problèmes Courants

**1. Erreur "Access Denied"**
- Vérifier les permissions sur la liste SharePoint
- S'assurer que l'utilisateur connecté a les droits nécessaires

**2. Erreur "List not found"**
- Vérifier l'URL du site et l'ID de la liste
- Utiliser le nom interne de la liste, pas le titre affiché

**3. Erreur "Invalid column"**
- Vérifier les noms internes des colonnes
- Utiliser PnP PowerShell : `Get-PnPField -List "VotreListe"`

**4. Timeout**
- Réduire la taille des requêtes ($top)
- Utiliser la pagination
- Optimiser les filtres OData

---

## 📚 Ressources

- [Documentation SharePointService](./src/generated/services/SharePointService.ts)
- [Modèles TypeScript](./src/generated/models/SharePointModel.ts)
- [Exemple d'utilisation](./src/components/SharePointExample.tsx)
- [OData Query Options](https://docs.microsoft.com/en-us/odata/concepts/queryoptions-overview)

---

**Version**: 2.0.0  
**Date**: 29 Octobre 2025  
**Status**: ✅ SharePoint Online connecté et opérationnel
