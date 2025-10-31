# 🔧 Configuration SharePoint Requise pour ActivityManager

## ⚠️ Problème Actuel

Le **Power Apps Code SDK ne supporte PAS les champs Lookup** (voir [documentation Microsoft](https://github.com/MicrosoftDocs/powerapps-docs/blob/main/powerapps-docs/developer/code-apps/how-to/connect-to-dataverse.md)).

## ✅ Solution Implémentée

L'application utilise maintenant un **champ texte `CategorieNom`** au lieu du Lookup `IdRubrique`.

## 📋 Étapes de Configuration SharePoint

### 1. Accéder à la liste Activity

1. Ouvrez SharePoint : https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity
2. Cliquez sur la liste **Activity**
3. Cliquez sur l'icône **⚙️ Paramètres** (en haut à droite)
4. Sélectionnez **Paramètres de la liste**

### 2. Ajouter la colonne CategorieNom

1. Dans la section **Colonnes**, cliquez sur **Créer une colonne**

2. Configurez la nouvelle colonne :
   - **Nom de colonne** : `CategorieNom`
   - **Type** : **Single line of text** (Texte d'une seule ligne)
   - **Description** : `Nom de la catégorie de l'activité`
   - **Requis** : ☑️ Oui
   - **Valeur par défaut** : _(laisser vide)_

3. Cliquez sur **OK**

### 3. (Optionnel) Supprimer l'ancienne colonne Lookup

Si vous n'avez pas de données existantes utilisant le champ `IdRubrique` :

1. Dans **Paramètres de la liste** > **Colonnes**
2. Cliquez sur la colonne **IdRubrique**
3. Cliquez sur **Supprimer cette colonne**
4. Confirmez la suppression

⚠️ **Attention** : Si vous avez déjà des données, NE SUPPRIMEZ PAS cette colonne. Les deux colonnes peuvent coexister.

### 4. Régénérer les modèles Power Apps Code

Après avoir ajouté la colonne dans SharePoint, régénérez les modèles :

```bash
pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53" -t "1ecbbdd1-db27-4370-a30e-b51b6d95d9d1" -d "https%253A%252F%252Fafrilandfirstbankcmr.sharepoint.com%252Fsites%252FDGEReportingActivity"
```

### 5. Vérifier le modèle généré

Ouvrez `src/Models/ActivityModel.ts` et vérifiez que la propriété `CategorieNom` existe :

```typescript
export interface Activity {
  ID?: number;
  Title?: string;
  CategorieNom?: string;  // ✅ Doit être présent
  // ... autres champs
}
```

### 6. Rebuild et redéployer

```bash
npm run build
pac code push
```

## 🎯 Résultat Attendu

Après ces étapes, l'ActivityManager pourra :
- ✅ Créer des activités avec sélection de catégorie
- ✅ Modifier des activités existantes
- ✅ Afficher le nom de la catégorie dans le tableau
- ✅ Exporter les données avec le nom de la catégorie
- ✅ Filtrer par catégorie
- ✅ Rechercher par nom de catégorie

## 🔄 Migration des Données Existantes (si applicable)

Si vous avez déjà des activités avec le champ Lookup `IdRubrique`, vous pouvez migrer les données :

### Option A : Script Power Automate

Créez un flux Power Automate pour copier les valeurs :

1. **Déclencheur** : Manuellement
2. **Action 1** : Obtenir tous les éléments de la liste Activity
3. **Action 2** : Pour chaque élément :
   - Obtenir le nom de la catégorie via `IdRubrique/Title`
   - Mettre à jour `CategorieNom` avec cette valeur

### Option B : Script PowerShell (PnP)

```powershell
# Installer PnP PowerShell si nécessaire
Install-Module -Name "PnP.PowerShell"

# Se connecter au site
Connect-PnPOnline -Url "https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity" -Interactive

# Obtenir toutes les activités
$activities = Get-PnPListItem -List "Activity"

# Migrer chaque activité
foreach ($activity in $activities) {
    if ($activity["IdRubrique"]) {
        $categoryId = $activity["IdRubrique"].LookupId
        $category = Get-PnPListItem -List "Category" -Id $categoryId
        
        if ($category) {
            Set-PnPListItem -List "Activity" -Identity $activity.Id -Values @{
                "CategorieNom" = $category["Title"]
            }
            Write-Host "✅ Migré : Activité #$($activity.Id) -> Catégorie: $($category['Title'])"
        }
    }
}

Write-Host "Migration terminée !"
```

### Option C : Manuellement

Si vous avez peu d'éléments :
1. Ouvrez chaque activité dans SharePoint
2. Copiez le nom de la catégorie du champ Lookup
3. Collez-le dans le nouveau champ `CategorieNom`
4. Enregistrez

## 📚 Documentation Complémentaire

- [Limitations du SDK](./WORKAROUND-Lookup-Not-Supported.md)
- [Guide des champs Lookup SharePoint](./SharePoint-Lookup-Fields.md)

---

**Dernière mise à jour** : 31 octobre 2025  
**Auteur** : Jordan KAMSU KOM  
**Projet** : DGE Reporting - Afriland First Bank
