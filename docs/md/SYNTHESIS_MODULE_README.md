# Module de Synthèse des Activités

## 📊 Vue d'ensemble

Le module **Synthèse des Activités** offre une vue consolidée et optimisée de toutes les activités soumises dans l'application, avec des permissions basées sur les rôles utilisateur.

## 🎯 Objectifs

- Fournir une vue d'ensemble complète des activités de tous les utilisateurs
- Optimiser le chargement des données depuis 16 tables SharePoint
- Supporter 3 niveaux d'accès : Agent, Chef de département, Directeur
- Offrir des exports CSV pour analyse externe
- Permettre la pagination et le tri des résultats

## 👥 Niveaux d'Accès

### 1. Agent (Utilisateur Standard)
- **Permissions** : Voir uniquement ses propres activités
- **Filtre automatique** : `CreatedBy = email utilisateur`
- **Cas d'usage** : Consultation de son historique personnel

### 2. Chef de Département
- **Permissions** : Voir les activités de tous les utilisateurs de son département
- **Filtre automatique** : 
  1. Récupération de la liste des utilisateurs du département via `Utilisateurs` (filtre `Departement/Value eq 'DEPT'`)
  2. Filtrage client-side par emails des utilisateurs du département
- **Cas d'usage** : Suivi de l'équipe, reporting départemental

### 3. Directeur
- **Permissions** : Voir les activités de tous les départements
- **Filtres disponibles** :
  - Par département (optionnel)
  - Par utilisateur spécifique (dropdown avec liste des membres)
- **Cas d'usage** : Vue globale, analyses transversales

## 🗄️ Architecture des Données

### Tables SharePoint Interrogées (16)

Le service interroge en parallèle les tables suivantes :

#### Analyse (DA)
1. `Analyse Dossiers Comités`
2. `Analyse Suivi Transmission`
3. `Analyse Délais Crédit`
4. `Analyse Suivi MEP`
5. `Analyse Engagements`

#### Activités Annexes
6. `Visites Clientèle`
7. `Formations`
8. `Activités Transversales`

#### Crédit
9. `Accords`
10. `Contrats`
11. `Détails Dossiers`
12. `Détail Sur MEP Client`
13. `Suivi Dossiers Restructuration`

#### Autres
14. `Suivi Client Appelé`
15. `Volume Provisions`
16. `Agences Réseau`

### Optimisations Appliquées

#### 1. Filtrage Côté Client (Évite 400 Bad Request)
```typescript
// ❌ AVANT (erreur 400 sur Author/Email)
const result = await Service.getAll({
  filter: `Author/Email eq '${userEmail}'`
});

// ✅ APRÈS (pas de filtre serveur, filter client)
const result = await Service.getAll();
const filtered = data.filter(record => {
  const authorEmail = record['Author#Claims'] || record.Author?.Email;
  return authorEmail.toLowerCase() === userEmail.toLowerCase();
});
```

#### 2. Chargement Parallèle
```typescript
// Toutes les tables sont interrogées en parallèle avec Promise.all
const fetchPromises = SHAREPOINT_TABLES.map(async ({ service }) => {
  return await service.getAll();
});
const allResults = await Promise.all(fetchPromises);
```

#### 3. Cache des Utilisateurs par Département
```typescript
// Cache pour éviter de récupérer la liste des utilisateurs à chaque requête
private static departmentUsersCache = new Map<string, User[]>();
```

#### 4. Filtrage par Date de Création
- Utilise le champ `Created` (date de création SharePoint)
- Filtre côté client : `createdDate >= startDate && createdDate <= endDate`
- Plus fiable que `DateReception` qui peut être absente

## 📑 Fonctionnalités

### 1. Vue Détaillée
- Tableau paginé de toutes les activités
- Colonnes : Date, Activité, Catégorie, Département, Utilisateur, Source, Fréquence
- **Tri** : Par date, activité, utilisateur, département
- **Ordre** : Ascendant / Descendant
- **Pagination** : 10, 20, 50, 100 lignes par page

### 2. Vue Résumé Utilisateur
- Cartes par utilisateur avec :
  - Nom et email
  - Département
  - Nombre total d'activités
  - Répartition par catégorie
  - Dernière soumission
  - Nombre de jours actifs
- **Export CSV** : Résumés utilisateurs

### 3. Vue Résumé Département
- Cartes par département avec :
  - Nombre d'utilisateurs
  - Nombre total d'activités
  - Liste détaillée des utilisateurs et leurs stats
- **Cas d'usage** : Comparaison inter-départements

### 4. Filtres Avancés
- **Période** : Date début / Date fin
- **Département** : Sélection unique (pré-rempli pour non-directeurs)
- **Catégorie** : Chargement dynamique basé sur le département
- **Activité** : Chargement dynamique basé sur la catégorie
- **Utilisateur** : Liste déroulante (directeur uniquement)
- **Recherche textuelle** : Recherche dans toutes les données du record

### 5. Exports CSV
- **Export complet** : Toutes les activités avec détails
- **Export résumés utilisateurs** : Stats agrégées par utilisateur
- **Format** : UTF-8 avec BOM, séparateur `;`, valeurs entre guillemets
- **Nom de fichier** : `synthese_activites_YYYY-MM-DD_YYYY-MM-DD.csv`

## 🎨 Interface Utilisateur

### Design System
- **Couleurs principales** : Rouge DGE (#C8102E)
- **Cartes** : Ombres douces, coins arrondis (8px)
- **Badges** : Catégorie (bleu), Source (violet), Fréquence (vert)
- **Animations** : Transitions 0.2-0.3s, hover effects

### Responsive
- **Desktop** : Grilles multi-colonnes
- **Tablet** : Adaptation automatique
- **Mobile** : Vue en colonne unique, pagination verticale

### Accessibilité
- Labels ARIA sur boutons de pagination
- Couleurs contrastées (WCAG AA)
- Navigation au clavier supportée

## 🔧 Utilisation

### Importer le Module
```tsx
import ActivitySynthesisView from './components/ActivitySynthesisView';

// Dans votre router
case 'synthesis':
  return <ActivitySynthesisView />;
```

### Service API
```typescript
import { ActivitySynthesisService } from './services/ActivitySynthesisService';

// Récupérer toutes les activités
const records = await ActivitySynthesisService.getAllActivities(filters, userProfile);

// Paginer les résultats
const paginated = ActivitySynthesisService.paginateResults(records, options);

// Générer des résumés
const userSummaries = ActivitySynthesisService.generateUserSummaries(records);
const deptSummaries = ActivitySynthesisService.generateDepartmentSummaries(records);

// Export CSV
const csv = ActivitySynthesisService.exportToCSV(records);
ActivitySynthesisService.downloadCSV(csv, 'export.csv');
```

## 📊 Performances

### Temps de Chargement (Estimé)
- **16 tables en parallèle** : ~2-4 secondes
- **Filtrage client** : <100ms pour 1000 records
- **Pagination** : <10ms (calcul côté client)
- **Export CSV** : <500ms pour 1000 records

### Optimisations Futures Possibles
1. **Lazy loading** : Charger les tables à la demande
2. **Virtual scrolling** : Rendu uniquement des lignes visibles
3. **Service Worker** : Cache des données pour accès offline
4. **Web Workers** : Traitement du CSV en arrière-plan

## 🐛 Gestion des Erreurs

### Cas Gérés
- **Table SharePoint indisponible** : Continue avec les autres tables
- **Utilisateur sans département** : Affiche uniquement ses données
- **Aucune donnée** : État vide avec message explicatif
- **Erreur réseau** : Notification d'erreur avec message clair

### Logs
```typescript
console.log('🔍 Récupération des activités avec filtres:', filters);
console.log('✅ Analyse Dossiers Comités: 45 records');
console.error('❌ Erreur sur Formations:', error);
console.log(`✅ Total: ${records.length} activités récupérées`);
```

## 🔐 Sécurité

### Filtrage des Données
- **Agent** : Ne peut voir que ses propres soumissions
- **Chef** : Vérifie l'appartenance au département via `Utilisateurs`
- **Directeur** : Accès total mais avec traçabilité

### Validation
- Dates : Vérification `startDate <= endDate`
- Profil : Vérification de l'existence avant chaque requête
- Filtres : Sanitization des entrées utilisateur

## 📝 TODO / Améliorations Futures

- [ ] Export PDF avec graphiques
- [ ] Filtres sauvegardés (favoris)
- [ ] Comparaison de périodes (mois/mois, année/année)
- [ ] Alertes sur activités manquantes
- [ ] Intégration Power BI pour dashboards avancés
- [ ] API REST pour exports automatisés
- [ ] Notifications par email (résumés hebdomadaires)

## 📞 Support

Pour toute question sur le module :
- **Documentation technique** : Voir `ActivitySynthesisService.ts`
- **Styles** : Voir `ActivitySynthesisView.css`
- **Composant** : Voir `ActivitySynthesisView.tsx`

---

**Développé avec ❤️ pour la DGE**  
Version 1.0.0 - Décembre 2024
