# ⚠️ Limitation : Champs Lookup Non Supportés dans Power Apps Code SDK

## 🚨 Problème Identifié

Selon la [documentation officielle Microsoft](https://github.com/MicrosoftDocs/powerapps-docs/blob/main/powerapps-docs/developer/code-apps/how-to/connect-to-dataverse.md), les **champs Lookup ne sont PAS supportés** dans le Power Apps Code SDK :

> **Unsupported scenarios**  
> The following features aren't yet supported:
> - Retrieving formatted values/display names for option sets
> - **Lookup fields (including polymorphic lookups)** ❌
> - Dataverse actions and functions
> - Deleting Dataverse datasources via PAC CLI
> - Schema definition (entity metadata) CRUD
> - FetchXML support
> - Alternate key support

## 💡 Solutions de Contournement

### Option 1 : Modifier la Colonne SharePoint (RECOMMANDÉ)

**Changez le champ `IdRubrique` de Lookup vers Choice ou Text**

#### Étapes dans SharePoint :

1. **Aller sur le site SharePoint** :
   - URL : https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity

2. **Ouvrir la liste Activity** :
   - Paramètres de la liste → Colonnes

3. **Supprimer la colonne Lookup `IdRubrique`**

4. **Créer une nouvelle colonne `Categorie`** :
   - Type : **Choice** (Choix)
   - Ou Type : **Single line of text** (Texte simple)

5. **Pour Choice** - Ajouter les valeurs :
   ```
   Crédit Classique
   Crédit Programme
   Administration Engagements
   Suivi MEP
   Activités Annexes
   ```

6. **Régénérer les modèles** :
   ```bash
   pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53" -t "1ecbbdd1-db27-4370-a30e-b51b6d95d9d1" -d "https%253A%252F%252Fafrilandfirstbankcmr.sharepoint.com%252Fsites%252FDGEReportingActivity"
   ```

### Option 2 : Utiliser un Champ Texte Simple

**Si vous ne pouvez pas modifier SharePoint**, utilisez un champ texte pour stocker le nom de la catégorie :

```typescript
// ActivityManager.tsx
const [formData, setFormData] = useState({ 
  Title: '', 
  Categorie: ''  // Texte simple au lieu de Lookup
});

// Dans le formulaire
<select
  value={formData.Categorie}
  onChange={(e) => setFormData({ ...formData, Categorie: e.target.value })}
>
  <option value="">-- Sélectionnez une catégorie --</option>
  {categories.map(cat => (
    <option key={cat.ID} value={cat.Title}>
      {cat.Title}
    </option>
  ))}
</select>
```

### Option 3 : Utiliser l'API REST SharePoint Directement

**Contourner le SDK Power Apps et utiliser directement l'API REST SharePoint** :

```typescript
// services/SharePointDirectService.ts
export class SharePointDirectService {
  private static baseUrl = 'https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity';
  
  static async createActivity(activity: { Title: string; IdRubriqueId: number }) {
    const response = await fetch(
      `${this.baseUrl}/_api/web/lists/getbytitle('Activity')/items`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': await this.getFormDigest()
        },
        body: JSON.stringify({
          __metadata: { type: 'SP.Data.ActivityListItem' },
          Title: activity.Title,
          IdRubriqueId: activity.IdRubriqueId
        })
      }
    );
    return response.json();
  }
  
  private static async getFormDigest(): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/_api/contextinfo`,
      { method: 'POST' }
    );
    const data = await response.json();
    return data.d.GetContextWebInformation.FormDigestValue;
  }
}
```

**⚠️ Attention** : Cette approche nécessite une authentification SharePoint supplémentaire.

### Option 4 : Attendre la Mise à Jour du SDK

Power Apps Code SDK est en **preview**. Microsoft pourrait ajouter le support des Lookups dans une future version.

## 🎯 Recommandation

**Utilisez l'Option 1 : Modifier la colonne SharePoint**

C'est la solution **la plus simple et la plus fiable** :

1. ✅ Pas de code complexe
2. ✅ Fonctionne avec le SDK actuel
3. ✅ Pas besoin d'API REST custom
4. ✅ Performance optimale

### Nouvelle Structure SharePoint Recommandée

**Liste Activity** :
- `Title` : Single line of text
- `Categorie` : **Choice** avec les valeurs :
  - Crédit Classique
  - Crédit Programme
  - Administration Engagements
  - Suivi MEP
  - Activités Annexes

**Liste Category** :
- Peut rester telle quelle ou être supprimée si vous utilisez Choice

## 🔄 Prochaines Étapes

1. **Modifier SharePoint** :
   - Supprimer colonne Lookup `IdRubrique`
   - Créer colonne Choice `Categorie`

2. **Régénérer les modèles** :
   ```bash
   pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53" -t "1ecbbdd1-db27-4370-a30e-b51b6d95d9d1" -d "https%253A%252F%252Fafrilandfirstbankcmr.sharepoint.com%252Fsites%252FDGEReportingActivity"
   ```

3. **Mettre à jour ActivityManager.tsx** :
   ```typescript
   const [formData, setFormData] = useState({ 
     Title: '', 
     Categorie: ''
   });
   ```

---

**Date** : 31 octobre 2025  
**Statut** : Limitation du SDK - Workaround requis  
**Référence** : [Microsoft Docs - Unsupported Scenarios](https://github.com/MicrosoftDocs/powerapps-docs/blob/main/powerapps-docs/developer/code-apps/how-to/connect-to-dataverse.md)
