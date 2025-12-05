# 🎯 Guide d'Intégration des Formulaires Département Analyse

## ✅ Statut de l'Intégration

### Département Analyse (DA) - **100% INTÉGRÉ**

Les formulaires du département Analyse sont **entièrement intégrés** dans l'application et fonctionnels.

## 📐 Architecture d'Intégration

### Flux de Navigation

```
HomePage
   ↓
Sélectionner Département DA
   ↓
DepartmentDashboardAnalyse
   ↓
Affichage des Catégories (grille de cartes)
   ↓
Clic sur une Catégorie
   ↓
Modal avec Liste des Activités
   ↓
Clic sur une Activité
   ↓
Affichage du Formulaire Spécialisé (selon NomActivity)
```

### Composants Créés

#### 1. **DepartmentDashboardAnalyse.tsx**
- Composant principal pour le département Analyse
- Gère l'affichage des catégories et activités
- Routing intelligent des formulaires selon `NomActivity`

#### 2. **AuthContext.tsx**
- Context Provider pour la gestion de l'utilisateur connecté
- Fournit `currentUser` à tous les formulaires
- Charge automatiquement le profil utilisateur

#### 3. **6 Formulaires Spécialisés**
| Formulaire | Activités Gérées | Table SharePoint |
|------------|------------------|------------------|
| CreditClassiqueFormNew | 12 activités crédit classique | analyse_dossiers_comites<br>analyse_details_dossiers |
| FormSuiviTransmission | 4 activités crédit programme | analyse_suivi_transmission |
| FormEvaluationDelais | Évaluation délais | analyse_delais_credit |
| FormAdminEngagementsAnalyse | 6 types engagements | analyse_engagements |
| FormSuiviMEP | Suivi MEP | analyse_suivi_mep |
| FormActivitesAnnexes | 4 types activités annexes | analyse_visites_clientele<br>analyse_formations<br>analyse_activites_transversales |

## 🗺️ Mapping Activités → Formulaires

### Configuration dans DepartmentDashboardAnalyse.tsx

```typescript
const ACTIVITY_FORM_CONFIG: Record<string, {...}> = {
  // Crédit Classique
  'Dossiers reçus des unités': { 
    formType: 'credit-classique', 
    props: { requiresComite: false, requiresDetails: false } 
  },
  'Dossiers présentés au CC1': { 
    formType: 'credit-classique', 
    props: { requiresComite: true, requiresDetails: true } 
  },
  // ... 10 autres activités crédit classique
  
  // Crédit Programme
  'Transmission SCRG': { 
    formType: 'suivi-transmission', 
    props: { requiresComite: false } 
  },
  // ... 3 autres activités
  
  'Évaluation délais crédit': { formType: 'evaluation-delais' },
  
  // Administration des Engagements (6 types)
  'Engagements globaux': { formType: 'admin-engagements' },
  // ... 5 autres types
  
  // Suivi MEP
  'Suivi des crédits mis en place': { formType: 'suivi-mep' },
  
  // Activités Annexes
  'Visites clientèle': { 
    formType: 'activites-annexes', 
    props: { activityType: 'visites' } 
  },
  // ... 3 autres types
};
```

## 🔧 Comment Fonctionne l'Intégration

### 1. Chargement des Départements

Dans `departmentsData.ts`, les départements sont chargés depuis SharePoint via `DepartmentActivitiesService`:

```typescript
export async function loadDepartments(): Promise<void> {
  // Charge Activity table depuis SharePoint
  // Groupe par Département et Catégorie
  // Extrait les activités avec leur NomActivity
}
```

### 2. Affichage des Catégories

`DepartmentDashboardAnalyse` reçoit le département chargé:

```typescript
<DepartmentDashboardAnalyse
  department={getDepartment('DA')}
  userProfile={userProfile}
/>
```

Affiche une grille de cartes pour chaque catégorie.

### 3. Sélection d'une Activité

Quand l'utilisateur clique sur une activité:

```typescript
const handleActivityClick = (activity: ActivityItem) => {
  setSelectedActivity(activity);
  setIsActivityModalOpen(true);
};
```

### 4. Rendu du Formulaire Approprié

La fonction `renderActivityForm()` :
1. Lit `selectedActivity.label` (= NomActivity)
2. Cherche dans `ACTIVITY_FORM_CONFIG`
3. Instancie le bon formulaire avec les bonnes props

```typescript
const renderActivityForm = () => {
  const config = ACTIVITY_FORM_CONFIG[selectedActivity.label];
  
  switch (config.formType) {
    case 'credit-classique':
      return <CreditClassiqueFormNew {...props} />;
    case 'suivi-transmission':
      return <FormSuiviTransmission {...props} />;
    // ... etc
  }
};
```

### 5. Sauvegarde dans SharePoint

Chaque formulaire appelle son service avec `NomActivity`:

```typescript
const dataToSave = {
  NomActivity: activityName,  // ← Clé pour différencier les activités
  Nombre: formData.nombre,
  Montant: formData.montant,
  // ... autres champs spécifiques
  UserId: currentUser?.email,
  Mois: '2025-11',
  Annee: '2025'
};

await AnalyseDossiersComitesService.create(dataToSave);
```

## 📊 Tables SharePoint Utilisées

### Structure Commune à Toutes les Tables

Toutes les tables d'analyse contiennent :
- **NomActivity** (Text) - Nom exact de l'activité
- **Mois** (Text) - Format YYYY-MM
- **Annee** (Text) - Année
- **UserId** (Text) - Email de l'utilisateur
- **Champs spécifiques** selon le type d'activité

### Exemple: analyse_dossiers_comites

| Colonne | Type | Description |
|---------|------|-------------|
| ID | Number | Auto-généré |
| NomActivity | Text | "Dossiers reçus des unités", "Dossiers présentés au CC1", etc. |
| Nombre | Number | Nombre de dossiers |
| Montant | Currency | Montant en FCFA |
| DateReception | Date | Date de réception |
| TypeComite | Choice | CC1, CC2, CC3, CC4, CCCA |
| Mois | Text | 2025-11 |
| Annee | Text | 2025 |
| UserId | Text | user@domain.com |

## 🎨 Expérience Utilisateur

### Étape 1: Page d'accueil
```
┌─────────────────────────────────────┐
│  📊 Département Analyse             │
│  3 catégories • 28 activités        │
│  [Accéder au département]           │
└─────────────────────────────────────┘
```

### Étape 2: Tableau de bord du département
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 💰 Crédit        │  │ 💳 Crédit        │  │ 🏦 Administration│
│ Classique        │  │ Programme        │  │                  │
│ 12 activités     │  │ 5 activités      │  │ 6 activités      │
│ [Voir activités] │  │ [Voir activités] │  │ [Voir activités] │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### Étape 3: Liste des activités (Modal)
```
Crédit Classique

1. Dossiers reçus des unités                    →
2. Dossiers présentés au CC1                    →
3. Dossiers présentés au CC2                    →
...
```

### Étape 4: Formulaire spécialisé (Modal plein écran)
```
┌────────────────────────────────────────────┐
│ Dossiers présentés au CC1                 ✕│
├────────────────────────────────────────────┤
│ 📊 Informations Générales                  │
│ Nombre de dossiers: [____]                 │
│ Montant (millions): [____]                 │
│                                            │
│ 📅 Date de réception: [____]               │
│ Type de comité: [CC1 ▼]                   │
│                                            │
│ 📋 Dossiers Détaillés (Optionnel)         │
│ [+ Ajouter un dossier]                     │
│                                            │
│               [Annuler]  [💾 Enregistrer]  │
└────────────────────────────────────────────┘
```

## 🔑 Points Clés de l'Architecture

### 1. **Props Modulaires**
Les formulaires utilisent des props pour gérer les variations:
- `requiresComite` : affiche/masque les champs de comité
- `requiresDetails` : active/désactive le mode détaillé
- `activityType` : change le type de formulaire d'activité annexe

### 2. **Champ NomActivity**
**Cruciale** pour distinguer les activités qui partagent une table:
```typescript
// 12 activités différentes utilisent analyse_dossiers_comites
// On les différencie par NomActivity:
{ NomActivity: "Dossiers reçus des unités", ... }
{ NomActivity: "Dossiers présentés au CC1", ... }
{ NomActivity: "FAR", ... }
```

### 3. **Services Auto-Générés**
Tous les services sont auto-générés par Power Apps Code SDK:
- AnalyseDossiersComitesService
- AnalyseSuiviTransmissionService
- Etc.

Ils offrent: `create()`, `update()`, `delete()`, `get()`, `getAll()`

### 4. **AuthContext**
Fournit l'utilisateur connecté à tous les formulaires:
```typescript
const { currentUser } = useAuth();
// currentUser.email utilisé comme UserId
```

## 📝 Ajouter une Nouvelle Activité

### 1. Dans SharePoint (Table Activity)
Créer une nouvelle ligne:
- **Title**: "Nouvelle activité"
- **NomRubrique**: Nom de la catégorie
- **NomDepartement**: "DA"
- **Frequency**: "Mensuelle"

### 2. Dans le Code
Ajouter dans `ACTIVITY_FORM_CONFIG`:

```typescript
'Nouvelle activité': {
  formType: 'credit-classique',  // ou autre type existant
  props: { requiresComite: true, requiresDetails: false }
}
```

### 3. Si Nouveau Type de Formulaire Nécessaire
1. Créer `FormNouveauType.tsx` et `.css`
2. Créer le service SharePoint correspondant
3. Ajouter dans le switch de `renderActivityForm()`

## 🚀 Prochaines Étapes

### Pour les Autres Départements (DSE, DPNP)

1. **Créer les tables SharePoint** avec NomActivity
2. **Générer les services** via `pac code add-data-source`
3. **Créer les formulaires** spécialisés
4. **Créer DepartmentDashboard[Nom]** avec mapping
5. **Mettre à jour AppModern.tsx** pour router vers le bon dashboard

### Exemple pour DSE:

```typescript
case 'department-DSE':
  return (
    <DepartmentDashboardSurveillance
      department={getDepartment('DSE')}
      userProfile={userProfile}
    />
  );
```

## ✅ Checklist de Vérification

- [x] AuthContext créé et fonctionnel
- [x] 6 formulaires DA créés avec CSS
- [x] DepartmentDashboardAnalyse intégré
- [x] Mapping activités → formulaires configuré
- [x] Modal sans header pour formulaires plein écran
- [x] Services SharePoint auto-générés
- [x] Build réussi sans erreurs
- [x] NomActivity utilisé dans tous les formulaires
- [x] UserId = email de l'utilisateur

## 🎯 Résultat Final

**L'utilisateur peut maintenant** :
1. ✅ Accéder au département Analyse
2. ✅ Voir toutes les catégories d'activités
3. ✅ Cliquer sur une catégorie pour voir ses activités
4. ✅ Cliquer sur une activité pour ouvrir le formulaire adapté
5. ✅ Remplir et sauvegarder les données dans SharePoint
6. ✅ Les données sont automatiquement taguées avec NomActivity, Mois, Annee, UserId

---

**Documentation créée le** : 2 novembre 2025  
**Version** : 1.0  
**Statut** : ✅ Production Ready pour Département Analyse
