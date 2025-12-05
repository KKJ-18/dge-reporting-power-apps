# Guide de Test - Module Synthèse des Activités

## 🚀 Démarrage Rapide

### 1. Accéder au Module

1. Connectez-vous à l'application
2. Cliquez sur **"📊 Rapports"** dans le menu latéral
3. Le module de synthèse s'affichera

### 2. Configurer les Filtres

#### Filtres Disponibles :

- **📅 Date début / Date fin** : Période d'analyse (par défaut : 30 derniers jours)
- **🏢 Département** : Filtrer par département spécifique
- **📂 Catégorie** : Filtrer par catégorie d'activité (dépend du département)
- **🎯 Activité** : Filtrer par activité spécifique (dépend de la catégorie)
- **👤 Utilisateur** : Filtrer par agent (visible uniquement pour Directeur/Chef)
- **🔍 Recherche** : Recherche textuelle dans les données

#### Exemple de Filtrage :

**Scénario 1 : Voir toutes les activités d'un département**
```
1. Sélectionner "Département" → "DPNP"
2. Laisser les autres filtres vides
3. Cliquer "🔄 Charger les données"
```

**Scénario 2 : Voir les Accords d'un utilisateur spécifique**
```
1. Sélectionner "Département" → "DPNP"
2. Sélectionner "Catégorie" → "Crédit"
3. Sélectionner "Activité" → "Accords"
4. Sélectionner "Utilisateur" → "Nom de l'agent"
5. Cliquer "🔄 Charger les données"
```

### 3. Charger les Données

Cliquez sur le bouton **"🔄 Charger les données"**

**Indicateurs de chargement :**
- Animation de chargement
- Message "Chargement en cours..."
- Temps estimé : 2-10 secondes selon le volume

### 4. Consulter les Résultats

#### Vue Tableau (par défaut)

**Colonnes affichées :**
- 📅 **Date** : Date et heure de soumission
- 🎯 **Activité** : Nom de l'activité
- 📂 **Catégorie** : Badge coloré
- 👤 **Utilisateur** : Nom de l'agent
- **Actions** : Bouton "🔍 Détails"

**Interactions :**
- ✅ Cliquer sur les en-têtes pour trier
- ✅ Pagination en bas du tableau
- ✅ Ajuster le nombre de lignes par page (10, 20, 50, 100)

#### Exemple de Lecture :

```
┌────────────┬─────────────────────┬──────────┬─────────────┬─────────┐
│ Date       │ Activité            │ Catégo.  │ Utilisateur │ Actions │
├────────────┼─────────────────────┼──────────┼─────────────┼─────────┤
│ 04/12/2025 │ Accords             │ Crédit   │ Jean Dupont │ Détails │
│ 10:30      │                     │          │             │         │
├────────────┼─────────────────────┼──────────┼─────────────┼─────────┤
│ 04/12/2025 │ Formations          │ RH       │ Marie Smith │ Détails │
│ 09:15      │                     │          │             │         │
└────────────┴─────────────────────┴──────────┴─────────────┴─────────┘
```

### 5. Voir les Détails d'une Activité

1. Cliquez sur **"🔍 Détails"** sur une ligne
2. Le modal s'ouvre avec :
   - 🎯 **Nom de l'activité**
   - 📂 **Catégorie**
   - 📅 **Date/Heure de soumission**
   - **Grille de données** : Uniquement les champs saisis par l'utilisateur

#### Exemple de Modal - Accords :

```
┌───────────────────────────────────────────────────────┐
│ 🔍 Détails - Accords                             [X]  │
├───────────────────────────────────────────────────────┤
│ 🎯 Accords   📂 Crédit   📅 04/12/2025 à 10:30        │
├───────────────────────────────────────────────────────┤
│                                                        │
│  Titre:            │ Prêt immobilier                   │
│  ─────────────────────────────────────────────────    │
│  Matricule:        │ EMP001                            │
│  ─────────────────────────────────────────────────    │
│  Statut:           │ Approuvé                          │
│  ─────────────────────────────────────────────────    │
│  Montant Demandé:  │ 5 000 000 XAF                     │
│  ─────────────────────────────────────────────────    │
│  Montant Accordé:  │ 4 500 000 XAF                     │
│  ─────────────────────────────────────────────────    │
│  Montant Prêt:     │ 4 500 000 XAF                     │
│                                                        │
├───────────────────────────────────────────────────────┤
│                                  [Fermer]              │
└───────────────────────────────────────────────────────┘
```

**Note :** Seuls les champs pertinents sont affichés (pas d'ID, Created, Author, etc.)

### 6. Filtres Actifs

Les filtres actifs s'affichent avec des badges supprimables :

```
🏷️ Filtres actifs:
[🏢 DPNP ×]  [📂 Crédit ×]  [🎯 Accords ×]
```

**Pour supprimer un filtre :**
- Cliquez sur le `×` du badge
- OU Resélectionnez "Tous" dans le select

### 7. Modes de Vue

Changez de mode avec les boutons en haut :

- **📊 Vue détaillée** : Tableau complet avec pagination
- **👥 Résumé par utilisateur** : Statistiques agrégées par agent
- **🏢 Résumé par département** : Statistiques agrégées par département

#### Vue Résumé par Utilisateur :

```
┌─────────────────────────────────────────┐
│ 👤 Jean Dupont                          │
│ 📧 jean.dupont@afrilandfirstbank.com    │
│ 🏢 DPNP                                 │
├─────────────────────────────────────────┤
│ 📊 15 activité(s)                       │
│                                         │
│ Catégories:                             │
│   Crédit: 8                             │
│   Analyse: 5                            │
│   Commercial: 2                         │
│                                         │
│ 📅 Dernière soumission: 04/12/2025      │
└─────────────────────────────────────────┘
```

### 8. Exportations

Boutons d'export disponibles en haut à droite :

- **📄 Excel** : Exporte toutes les données en .xlsx
- **📋 CSV** : Exporte en format CSV
- **📑 PDF** : Génère un rapport PDF

**Contenu de l'export :**
- Toutes les lignes visibles (selon filtres)
- Colonnes du tableau principal
- Statistiques de synthèse

### 9. Pagination

**Contrôles en bas du tableau :**

```
[«] [‹] Page 1 sur 5 [›] [»]     Lignes par page: [20 ▼]
```

- **«** : Première page
- **‹** : Page précédente
- **›** : Page suivante
- **»** : Dernière page

**Lignes par page :**
- 10 lignes
- 20 lignes (par défaut)
- 50 lignes
- 100 lignes

### 10. Statistiques

En haut de la vue, les statistiques s'affichent :

```
┌──────────────────────────────────────────────────────┐
│ 📊 Statistiques                                      │
├──────────────────────────────────────────────────────┤
│ 📝 Total activités: 127                              │
│ 👥 Utilisateurs actifs: 12                           │
│ 📅 Période: 04/11/2025 - 04/12/2025                  │
│ 🏢 Départements: 3                                   │
│ 📂 Catégories: 8                                     │
└──────────────────────────────────────────────────────┘
```

## 🎯 Scénarios de Test

### Scénario 1 : Agent consulte ses propres activités

**Contexte :** Utilisateur = Agent DPNP

**Actions :**
1. Accéder au module
2. Le département est pré-sélectionné (DPNP)
3. Charger les données
4. Voir uniquement ses propres soumissions

**Résultat attendu :**
- ✅ Liste filtrée automatiquement par l'agent
- ✅ Pas de filtre "Utilisateur" visible
- ✅ Pagination fonctionnelle

### Scénario 2 : Chef de département consulte son équipe

**Contexte :** Utilisateur = Chef DPNP

**Actions :**
1. Accéder au module
2. Le département est pré-sélectionné (DPNP)
3. Charger les données
4. Voir toutes les activités du département

**Résultat attendu :**
- ✅ Liste complète de tous les agents du département
- ✅ Filtre "Utilisateur" disponible
- ✅ Peut filtrer par agent spécifique

### Scénario 3 : Directeur consulte toute la direction

**Contexte :** Utilisateur = Directeur

**Actions :**
1. Accéder au module
2. Sélectionner un département ou laisser vide (tous)
3. Charger les données
4. Voir toutes les activités de la direction

**Résultat attendu :**
- ✅ Vue globale de tous les départements
- ✅ Tous les filtres disponibles
- ✅ Vue par département et par utilisateur

### Scénario 4 : Recherche textuelle

**Actions :**
1. Charger des données
2. Saisir "prêt" dans la recherche
3. Les résultats se filtrent automatiquement

**Résultat attendu :**
- ✅ Seules les activités contenant "prêt" s'affichent
- ✅ Recherche case-insensitive
- ✅ Recherche dans tous les champs

### Scénario 5 : Tri des colonnes

**Actions :**
1. Charger des données
2. Cliquer sur "📅 Date" → Tri croissant
3. Re-cliquer → Tri décroissant
4. Cliquer sur "🎯 Activité" → Tri alphabétique

**Résultat attendu :**
- ✅ Flèche de tri visible (↑ ou ↓)
- ✅ Données triées correctement
- ✅ Tri conservé lors de la pagination

### Scénario 6 : Export des données

**Actions :**
1. Appliquer des filtres (ex: Département DPNP)
2. Charger les données
3. Cliquer sur "📄 Excel"

**Résultat attendu :**
- ✅ Téléchargement d'un fichier .xlsx
- ✅ Contient uniquement les données filtrées
- ✅ Colonnes correctement formatées

## ❌ Erreurs Possibles

### 1. "Aucune donnée à afficher"

**Causes possibles :**
- Aucune activité dans la période sélectionnée
- Filtres trop restrictifs
- Problème de connexion SharePoint

**Solutions :**
1. Élargir la plage de dates
2. Supprimer les filtres (bouton "🔄 Réinitialiser")
3. Vérifier la connexion

### 2. "Erreur lors du chargement"

**Causes possibles :**
- Timeout SharePoint
- Trop de données à charger

**Solutions :**
1. Réduire la période de dates
2. Appliquer des filtres pour limiter le volume
3. Réessayer après quelques secondes

### 3. Modal de détails vide

**Causes possibles :**
- Activité sans configuration de champs
- Tous les champs sont des champs système

**Solutions :**
1. C'est normal si l'activité n'a pas de données utilisateur
2. Vérifier la configuration dans `activityFieldsConfig.ts`

## ✅ Checklist de Test

### Tests de Base
- [ ] Chargement du module
- [ ] Affichage des filtres
- [ ] Chargement des données
- [ ] Affichage du tableau
- [ ] Pagination fonctionnelle
- [ ] Tri des colonnes
- [ ] Ouverture du modal de détails
- [ ] Fermeture du modal

### Tests des Filtres
- [ ] Filtre par département
- [ ] Filtre par catégorie
- [ ] Filtre par activité
- [ ] Filtre par utilisateur (si applicable)
- [ ] Filtre par date
- [ ] Recherche textuelle
- [ ] Suppression de filtres actifs

### Tests des Vues
- [ ] Vue détaillée
- [ ] Vue résumé par utilisateur
- [ ] Vue résumé par département
- [ ] Basculement entre vues

### Tests d'Export
- [ ] Export Excel
- [ ] Export CSV
- [ ] Export PDF

### Tests de Permissions
- [ ] Agent voit uniquement ses données
- [ ] Chef voit son département
- [ ] Directeur voit tout

## 📞 Support

En cas de problème, vérifier :
1. Console du navigateur (F12) pour les erreurs
2. Onglet "Network" pour les appels API
3. Les logs dans `ActivitySynthesisService.ts`

---

**Dernière mise à jour :** 4 décembre 2025
