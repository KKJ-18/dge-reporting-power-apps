# 📚 Guide des Champs Lookup SharePoint

## ⚠️ Problème Courant

Lors de la création ou mise à jour d'enregistrements avec des champs **Lookup** dans SharePoint via Power Apps Code SDK, vous pouvez rencontrer cette erreur :

```json
{
  "status": 400,
  "message": "The passed-in field \"IdRubrique#Id\" could not be found"
}
```

## ✅ Solution

SharePoint utilise **deux notations différentes** pour les champs Lookup selon le contexte :

### 🔍 En Lecture (GET)

Utilisez la notation avec `#Id` pour **lire** la valeur de l'ID du lookup :

```typescript
// Lecture d'une activité
const activity = await ActivityService.get(id);
const categoryId = activity['IdRubrique#Id'];  // ✅ Correct pour lire
```

### ✏️ En Écriture (CREATE/UPDATE)

Utilisez la notation **sans** `#` (suffixe `Id` uniquement) pour **écrire** la valeur :

```typescript
// Création d'une activité
const newActivity = {
  Title: 'Ma nouvelle activité',
  IdRubriqueId: 5  // ✅ Correct pour écrire (sans le #)
};
await ActivityService.create(newActivity);

// Mise à jour d'une activité
const updates = {
  Title: 'Titre modifié',
  IdRubriqueId: 8  // ✅ Correct pour écrire (sans le #)
};
await ActivityService.update(activityId, updates);
```

## 📋 Tableau Récapitulatif

| Opération | Notation | Exemple | Usage |
|-----------|----------|---------|-------|
| **Lecture** | `FieldName#Id` | `activity['IdRubrique#Id']` | Obtenir l'ID de la catégorie liée |
| **Écriture** | `FieldNameId` | `{ IdRubriqueId: 5 }` | Définir l'ID de la catégorie à lier |

## 🔧 Exemple Complet (ActivityManager)

```typescript
// État du formulaire
const [formData, setFormData] = useState({ 
  Title: '', 
  IdRubriqueId: undefined  // ✅ Pour l'écriture
});

// Ouvrir le modal d'édition
const openEditModal = (activity: Activity) => {
  setFormData({ 
    Title: activity.Title || '', 
    IdRubriqueId: activity['IdRubrique#Id']  // ✅ Lecture avec #
  });
};

// Créer une activité
const handleCreate = async () => {
  const result = await ActivityService.create({
    Title: formData.Title,
    IdRubriqueId: formData.IdRubriqueId  // ✅ Écriture sans #
  });
};

// Mettre à jour une activité
const handleUpdate = async () => {
  const result = await ActivityService.update(id, {
    Title: formData.Title,
    IdRubriqueId: formData.IdRubriqueId  // ✅ Écriture sans #
  });
};
```

## 🎯 Règle à Retenir

> **Lecture** : `FieldName#Id` (avec `#`)  
> **Écriture** : `FieldNameId` (sans `#`)

## 📝 Modèle TypeScript

Voici comment structurer votre interface TypeScript pour un champ Lookup :

```typescript
export interface Activity {
  ID?: number;
  Title?: string;
  
  // Pour la LECTURE uniquement
  'IdRubrique#Id'?: number;
  IdRubrique?: Record<string, unknown>;  // Objet lookup complet
  
  // Pour l'ÉCRITURE, utilisez une interface séparée ou ajoutez :
  IdRubriqueId?: number;  // ⚠️ Non présent dans les données reçues
  
  Created?: string;
  Modified?: string;
  Author?: Record<string, unknown>;
  Editor?: Record<string, unknown>;
}
```

## 🚨 Erreurs Fréquentes

### ❌ Erreur 1 : Utiliser `#Id` en écriture
```typescript
// ❌ INCORRECT
await ActivityService.create({
  Title: 'Test',
  'IdRubrique#Id': 5  // ❌ Erreur 400
});
```

### ❌ Erreur 2 : Omettre le suffixe `Id` en écriture
```typescript
// ❌ INCORRECT
await ActivityService.create({
  Title: 'Test',
  IdRubrique: 5  // ❌ Ne fonctionnera pas
});
```

### ✅ Correct
```typescript
// ✅ CORRECT
await ActivityService.create({
  Title: 'Test',
  IdRubriqueId: 5  // ✅ Fonctionne
});
```

## 🔗 Références

- [SharePoint REST API - Working with Lists and List Items](https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)
- [Power Apps Code SDK Documentation](https://learn.microsoft.com/en-us/power-apps/developer/code-first/overview)

---

**Date de création** : 31 octobre 2025  
**Projet** : DGE Reporting - Afriland First Bank  
**Auteur** : Jordan KAMSU KOM
