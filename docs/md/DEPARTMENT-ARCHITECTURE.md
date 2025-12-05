# Architecture Multi-Départements - Guide Complet

## 🎯 Vue d'ensemble

L'application a été complètement restructurée pour proposer des interfaces spécifiques à chaque département avec leurs propres catégories et activités. Le système s'adapte automatiquement au profil de l'utilisateur connecté.

## 🏢 Structure des Départements

### Département Analyse (DA) 📊
**Couleur**: Bleu (#0066CC)
- **5 catégories** • **31 activités**

#### Catégories:
1. **Crédit classique** (12 activités)
   - Dossiers reçus, présentés aux comités
   - FAR, notes de circulation
   - Suivi des dossiers (en cours, en attente)
   - Évaluation du délai moyen

2. **Crédit programme** (4 activités)
   - Crédits Entreprises et Particuliers
   - Évaluation des délais moyens

3. **Administration des engagements** (6 activités)
   - Crédits amortissables, lignes de découvert
   - Crédits restructurés, leasing, islamiques

4. **Suivi des dossiers en cours de MEP** (1 activité)
   - Dossiers en attente de MEP

5. **Activités annexes** (5 activités)
   - Visites clientèle, formations
   - Rédaction procédures, études

---

### Département Surveillance des Engagements (DSE) 🔍
**Couleur**: Vert (#00994C)
- **6 catégories** • **26 activités**

#### Catégories:
1. **Situation Mise en Place** (8 activités)
   - Amortissables, restructuration, cautions
   - CréDoc, leasing, lignes de découvert
   - Finance islamique

2. **Accords de Classement** (3 activités)
   - Autorisation de mobilisation
   - Accords de classement et sur liste

3. **Contrats** (3 activités)
   - Avance sur facture, préfinancement, cautions

4. **Projets** (1 activité)
   - PV du comité de crédit

5. **Déclaration Règlementaire** (4 activités)
   - TEG, FIBANE 1/2/3, Douane, CRE

6. **Autres Activités** (7 activités)
   - Visites unités, études, formations
   - Relations entités, projets DRI/DSI
   - Rédaction procédures

---

### Département des Prêts Non Performants (DPNP) ⚠️
**Couleur**: Rouge (#CC0000)
- **10 catégories** • **42 activités**

#### Catégories:
1. **Analyse des dossiers de restructuration** (10 activités)
   - Dossiers reçus, en cours d'analyse
   - En attente de comité/décision/accord
   - Remboursements d'échéances

2. **Suivi des anomalies engagements par trésorerie** (1 activité)
   - Origine des anomalies clients

3. **Suivi des anomalies leasing** (1 activité)
   - Origine des anomalies leasing

4. **Travail de proximité avec les unités** (1 activité)
   - Formation des unités

5. **Suivi des débits non autorisés** (3 activités)
   - Dépassements et régularisations 72h

6. **Recouvrement par versement** (1 activité)
   - Clients appelés

7. **Suivi de la contagion des comptes** (3 activités)
   - Comptes à nettoyer, montants, reprises

8. **Suivi des provisions** (2 activités)
   - Volume provisions et reprises

9. **Recherche clients à l'étranger** (4 activités)
   - Clients en anomalie, pays, employeur, ville

10. **Activités annexes** (5 activités)
    - Visites, formations, procédures, études

---

## 👥 Gestion des Profils Utilisateurs

### Profil Directeur
**Fonction**: "Directeur"  
**Département**: Non défini (null)

#### Interface affichée:
- **Vue de sélection** des 3 départements
- Accès complet à tous les départements
- Actions rapides globales (rapports, activités, catégories, paramètres)

#### Permissions:
- ✅ Consulter tous les départements
- ✅ Saisir des données pour tous les départements
- ✅ Vue globale des rapports et statistiques
- ✅ Gestion complète (activités, catégories, paramètres)

---

### Profil Chef de Département
**Fonction**: Autre que "Directeur"  
**Département**: DA, DSE ou DPNP

#### Interface affichée:
- **Dashboard spécifique** à son département
- Grille des catégories avec nombre d'activités
- Sélection de période de reporting

#### Permissions:
- ✅ Consulter uniquement son département
- ✅ Saisir des données pour son département
- ✅ Exporter les données
- ❌ Pas d'accès aux autres départements

---

### Profil Sans Département
**Fonction**: Non définie ou autre  
**Département**: Non défini

#### Interface affichée:
- Message "Accès non autorisé"
- Informations de contact

#### Permissions:
- ❌ Aucun accès aux données
- 📧 Invitation à contacter l'administrateur

---

## 🎨 Composants de l'Architecture

### 1. `departmentsData.ts`
**Fichier de configuration centrale**

```typescript
export interface ActivityItem {
  id: string;
  label: string;
  unit?: string;
  type?: 'number' | 'amount' | 'text' | 'date';
}

export interface CategoryData {
  id: string;
  name: string;
  activities: ActivityItem[];
  icon?: string;
}

export interface DepartmentData {
  id: 'DA' | 'DSE' | 'DPNP';
  name: string;
  fullName: string;
  icon: string;
  color: string;
  categories: CategoryData[];
}
```

**Exports**:
- `DA_DEPARTMENT`: Données du département Analyse
- `DSE_DEPARTMENT`: Données du département Surveillance
- `DPNP_DEPARTMENT`: Données du département Prêts Non Performants
- `DEPARTMENTS_MAP`: Map de tous les départements
- `getDepartment(id)`: Récupère un département
- `getCategory(deptId, categoryId)`: Récupère une catégorie
- `getDepartmentActivityCount(deptId)`: Compte les activités

---

### 2. `HomePageModern.tsx`
**Page d'accueil adaptative**

#### Logique de routing:
```typescript
if (userProfile.isDirecteur) {
  // Afficher la vue de sélection des départements
  return <DirectorView />
}

if (userProfile.departement) {
  // Afficher le dashboard du département
  return <DepartmentDashboard department={dept} />
}

// Utilisateur sans accès
return <NoAccessView />
```

#### Vue Directeur:
- Welcome header avec icône 🌍
- Grille des 3 départements (cliquables)
- Actions rapides (4 boutons)

#### Vue Chef de Département:
- Affichage direct du `DepartmentDashboard`

---

### 3. `DepartmentDashboard.tsx`
**Dashboard générique pour tous les départements**

#### Props:
```typescript
interface DepartmentDashboardProps {
  department: DepartmentData;
  userProfile: UserProfile;
}
```

#### Fonctionnalités:
- **Header** avec icône, nom, statistiques du département
- **Sélecteur de période** (mois/année)
- **Grille de catégories** (cards cliquables)
- **Modal de saisie** pour les activités d'une catégorie

#### Interaction:
1. Utilisateur sélectionne une catégorie → Modal s'ouvre
2. Formulaire avec toutes les activités de la catégorie
3. Champs adaptés au type (number, amount, text, date)
4. Sauvegarde → Données envoyées à SharePoint

---

### 4. Formulaire de Saisie

#### Types de champs selon `activity.type`:

**`number`** (défaut):
```tsx
<input type="number" min="0" placeholder="0" />
```

**`amount`** (montant):
```tsx
<input type="number" step="0.01" />
<span>FCFA</span>
```

**`date`**:
```tsx
<input type="date" />
```

**`text`**:
```tsx
<textarea rows={3} placeholder="Saisir les détails..." />
```

---

## 📊 Flux de Données

### Chargement initial

```mermaid
User Login
  ↓
Office365UsersService.MyProfile()
  ↓ (email)
UtilisateursService.getAll(filter: email)
  ↓ (Fonction + Departement)
UserProfile créé
  ↓
  ├─ isDirecteur? → DirectorView
  ├─ departement? → DepartmentDashboard
  └─ else → NoAccessView
```

### Saisie de données

```mermaid
User clicks category card
  ↓
Modal opens with activities
  ↓
User fills inputs
  ↓
Submit → ActivityEntry[] created
  ↓
Save to SharePoint
  ↓
Success → Modal closes
```

### Structure `ActivityEntry`

```typescript
interface ActivityEntry {
  id?: string;
  categoryId: string;
  activityId: string;
  value: string | number;
  date: string;           // ISO date de saisie
  period: string;         // Format: YYYY-MM
  userId: string;         // Email utilisateur
  departmentId: string;   // DA | DSE | DPNP
}
```

---

## 🎨 Design System

### Couleurs Départements

| Département | Couleur Primaire | Usage |
|-------------|-----------------|-------|
| DA | `#0066CC` (Bleu) | Border-top, icons background |
| DSE | `#00994C` (Vert) | Border-top, icons background |
| DPNP | `#CC0000` (Rouge) | Border-top, icons background |

### Spacing

- Cards gap: `1.5rem - 2rem`
- Padding: `1.5rem - 2rem`
- Border-radius: `12px - 16px`

### Typography

- Titles: `2rem - 2.5rem`, weight: `700`
- Subtitles: `1.125rem - 1.25rem`
- Body: `1rem`
- Labels: `0.875rem - 0.9375rem`

### Responsive Breakpoints

- Desktop: > 1024px
- Tablet: 768px - 1024px
- Mobile: < 768px
- Small mobile: < 480px

---

## 🚀 Utilisation

### Pour un Directeur

1. **Login** → Vue d'accueil avec 3 départements
2. **Click sur DA** → Dashboard Département Analyse
3. **Click sur "Crédit classique"** → Modal avec 12 activités
4. **Saisir les valeurs** → Submit
5. **Retour au dashboard** → Peut choisir autre catégorie

### Pour un Chef de Département DA

1. **Login** → Dashboard DA directement affiché
2. **Sélectionner période** → Ex: Novembre 2025
3. **Click sur "Crédit classique"** → Modal s'ouvre
4. **Remplir formulaire** → Enregistrer
5. **Stats mises à jour** → "1 saisie" affichée

---

## 📝 Données à Implémenter

### Table SharePoint: `ActivityEntries`

| Colonne | Type | Description |
|---------|------|-------------|
| ID | Counter | Clé primaire |
| CategoryId | Text | ID de la catégorie |
| ActivityId | Text | ID de l'activité |
| Value | Text/Number | Valeur saisie |
| Period | Text | Format: YYYY-MM |
| Date | DateTime | Date de saisie |
| UserId | Text | Email utilisateur |
| DepartmentId | Choice | DA \| DSE \| DPNP |

### Service à créer: `ActivityEntryService.ts`

```typescript
export class ActivityEntryService {
  static async create(entry: ActivityEntry)
  static async update(id: string, entry: Partial<ActivityEntry>)
  static async delete(id: string)
  static async getByPeriod(period: string, userId: string, deptId: string)
  static async getAll(options?: IGetAllOptions)
}
```

---

## 📈 Extensions Futures

### Ajouter un nouveau département

1. **Définir les données** dans `departmentsData.ts`:
```typescript
export const DXX_DEPARTMENT: DepartmentData = {
  id: 'DXX',
  name: 'DXX',
  fullName: 'Nouveau Département',
  icon: '🏦',
  color: '#FF6600',
  categories: [...]
}
```

2. **Mettre à jour** `DEPARTMENTS_MAP` et types

3. **Ajouter** dans la table `Utilisateurs` le choice "DXX"

4. **Mettre à jour** `UserProfileService.normalizeDepartement()`

### Ajouter une catégorie

Dans le département concerné:
```typescript
{
  id: 'nouvelle-categorie',
  name: 'Nouvelle Catégorie',
  icon: '📌',
  activities: [
    { id: 'activite-1', label: 'Activité 1', type: 'number' },
    ...
  ]
}
```

### Ajouter une activité

Dans la catégorie concernée:
```typescript
{
  id: 'nouvelle-activite',
  label: 'Nouvelle Activité',
  type: 'amount', // ou 'number', 'text', 'date'
  unit: 'FCFA' // optionnel
}
```

---

## ✅ Build Status

```bash
✓ 96 modules transformed
📦 371.06 kB JavaScript (98.94 kB gzipped)
📦 45.92 kB CSS (8.39 kB gzipped)
✓ Built successfully in 4.11s
```

---

## 📚 Fichiers Créés

1. **Configuration**:
   - `src/config/departmentsData.ts` (380 lignes)

2. **Composants**:
   - `src/components/HomePageModern.tsx` (150 lignes)
   - `src/components/DepartmentDashboard.tsx` (250 lignes)

3. **Styles**:
   - `src/components/HomePageModern.css` (340 lignes)
   - `src/components/DepartmentDashboard.css` (450 lignes)

4. **Documentation**:
   - `docs/USER-PROFILE-SYSTEM.md`
   - `docs/DEPARTMENT-ARCHITECTURE.md` (ce fichier)

---

## 🎓 Résumé

L'application propose maintenant:
- ✅ 3 interfaces départementales distinctes
- ✅ 99 activités réparties sur 21 catégories
- ✅ Contrôle d'accès basé sur le profil
- ✅ Interface adaptative (Directeur vs Chef)
- ✅ Design responsive et moderne
- ✅ Système de saisie par période
- ✅ Architecture extensible et maintenable

**Prochaine étape**: Intégration SharePoint pour la persistance des données.
