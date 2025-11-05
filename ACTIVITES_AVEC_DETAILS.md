# Configuration des Activités avec Détails de Dossiers

## 📋 Activités Modifiées

Les 8 activités suivantes nécessitent maintenant des **détails de dossiers** :

### 1. Dossiers présentés aux différents comités de crédit
- **Type de détails** : `comite`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Type comité (CC1, CC2, CC3, CC4, CCCA)
  - Décision comité (Accord, Avis favorable, À représenter, Stand by, Rejet)
  - Détail décision, Commentaire

### 2. Note de circulation
- **Type de détails** : `note`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Décision (Accord, Rejeter)
  - Détail décision, Commentaire

### 3. Dossiers en cours d'analyse
- **Type de détails** : `analyse`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Commentaire

### 4. Dossiers en attente de l'avis de risque
- **Type de détails** : `risque`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Commentaire

### 5. Dossiers renvoyés
- **Type de détails** : `renvoye`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Type comité (CC1, CC2, CC3, CC4, CCCA)
  - Commentaire

### 6. Dossiers en attente de l'avis de la conformité
- **Type de détails** : `conformite`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Type comité (CC1, CC2, CC3, CC4, CCCA)
  - Commentaire

### 7. Dossiers en attente du comité de crédit
- **Type de détails** : `attente_comite`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Type comité (CC1, CC2, CC3, CC4, CCCA)
  - Commentaire

### 8. Dossiers CONSEIL en attente avis du SCRG
- **Type de détails** : `scrg`
- **Champs** : 
  - Nom client, Matricule, Montant sollicité
  - Comité (CC1, CC2, CC3, SCRG, CC4)
  - Objet commentaire
  - Date CC3, Date transmission SCRG

## 🔄 Logique de Fonctionnement

Pour chaque activité avec détails :

1. **Saisir le NOMBRE de dossiers** (ex: 5)
2. **Le système génère automatiquement 5 formulaires** de détails
3. **L'utilisateur remplit chaque formulaire** avec les informations du dossier
4. **Le montant total est calculé automatiquement** (somme des montants individuels)

## 📊 Interface ActivityItem

```typescript
export interface ActivityItem {
  id: string;
  name: string;
  frequency: 'Journalière' | 'Hebdomadaire' | 'Mensuelle' | 'Semestrielle';
  requiresAmount?: boolean;
  requiresCount?: boolean;
  requiresComment?: boolean;
  requiresDetails?: boolean; // ✅ NOUVEAU
  detailsType?: 'comite' | 'note' | 'analyse' | 'risque' | 'renvoye' | 'conformite' | 'attente_comite' | 'scrg'; // ✅ NOUVEAU
}
```

## 🎯 Fichiers Modifiés

1. **DepartmentActivitiesService.ts**
   - Ajout de `requiresDetails` et `detailsType` dans `ActivityItem`
   - Ajout du mapping `ACTIVITIES_WITH_DETAILS`
   - Mise à jour de `createCategory()` pour identifier les activités avec détails

2. **CreditClassiqueForm.tsx**
   - Restructuration complète avec 8 sections
   - Intégration de `DossiersDetailsInput` pour chaque activité
   - Calcul automatique des montants totaux

3. **DossiersDetailsInput.tsx** (NOUVEAU)
   - Composant réutilisable pour la saisie des détails
   - Support de 8 types différents d'activités
   - Validation des champs obligatoires

## ✅ Résultat

Les activités sont maintenant correctement configurées pour distinguer :
- ❌ Activités simples (juste nombre + montant)
- ✅ Activités avec détails de dossiers (nombre → formulaires détaillés → montant total calculé)

## 🚀 Prochaines Étapes

Pour appliquer cette même logique aux autres formulaires :
- CreditProgrammeForm
- AdminEngagementsForm
- Etc.

Utiliser le même pattern avec `DossiersDetailsInput` selon le `detailsType` de l'activité.
