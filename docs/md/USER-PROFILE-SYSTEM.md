# Système de Gestion des Profils Utilisateurs

## Vue d'ensemble

Le système de gestion des activités intègre maintenant un contrôle d'accès basé sur le profil utilisateur, permettant de filtrer les données et les permissions selon le département et la fonction de l'utilisateur.

## Architecture

### 1. Table Utilisateurs (SharePoint)

La table `Utilisateurs` contient les informations de profil :

| Colonne | Type | Description |
|---------|------|-------------|
| `Email` | Text | Email de l'utilisateur (lien avec Office 365) |
| `Fonction` | Text | Fonction de l'utilisateur (ex: "Directeur") |
| `Departement` | Choice | Département (DA, DPNP, DSE) |
| `Title` | Text | Nom complet |

### 2. Départements

Trois départements sont définis :

- **DA** - Département Analyse
- **DPNP** - Département des Prêts Non Performants  
- **DSE** - Département Surveillance des Engagements

### 3. Rôles et Permissions

#### Directeur
- **Fonction** : "Directeur"
- **Département** : Non défini (null)
- **Permissions** :
  - ✅ Vue globale de toutes les activités (tous départements)
  - ✅ Créer des activités pour tous les départements
  - ✅ Modifier/Supprimer toutes les activités
  - ✅ Accès complet à toutes les fonctionnalités

#### Chef de Département
- **Fonction** : Autre que "Directeur"
- **Département** : DA, DPNP ou DSE
- **Permissions** :
  - ✅ Vue filtrée des activités de son département uniquement
  - ✅ Créer des activités pour son département
  - ✅ Modifier/Supprimer uniquement les activités de son département
  - ❌ Pas d'accès aux activités des autres départements

## Service UserProfileService

### Méthodes principales

#### `getCurrentUserProfile()`
Récupère et met en cache le profil de l'utilisateur connecté.

**Processus** :
1. Récupère l'email via `Office365UsersService.MyProfile()`
2. Recherche l'utilisateur dans la table `Utilisateurs` par email
3. Détermine si c'est un Directeur (fonction = "Directeur")
4. Extrait le département si ce n'est pas un Directeur
5. Retourne le profil avec les permissions

**Retour** :
```typescript
{
  email: string
  fonction: string | null
  departement: 'DA' | 'DPNP' | 'DSE' | null
  isDirecteur: boolean
  hasGlobalView: boolean
}
```

#### `getActivityFilter(profile)`
Génère le filtre OData pour récupérer les activités.

**Logique** :
- Directeur → `undefined` (pas de filtre, toutes les activités)
- Chef de département → `"Departement/Value eq 'DA'"` (exemple pour DA)
- Pas de département → `"ID eq -1"` (aucun résultat)

#### `canCreateActivity(profile)`
Vérifie si l'utilisateur peut créer une activité.

**Retour** : `true` si Directeur ou si département défini

#### `canModifyActivity(profile, activityDepartement)`
Vérifie si l'utilisateur peut modifier/supprimer une activité.

**Retour** : 
- `true` si Directeur
- `true` si chef de département ET activité du même département
- `false` sinon

#### `getDepartementLabel(dept)`
Retourne le label complet du département.

## Intégration dans ActivityManagerModern

### 1. Chargement du profil

Au montage du composant :
```typescript
useEffect(() => {
  loadUserProfileAndActivities();
}, []);
```

**Séquence** :
1. Affiche un loader "Chargement de votre profil..."
2. Appelle `UserProfileService.getCurrentUserProfile()`
3. Stocke le profil dans le state
4. Charge les activités avec le filtre approprié

### 2. Affichage adapté

**En-tête** :
- Directeur : "🌍 Vue globale de toutes les activités (Directeur)"
- Chef de département : "🏢 Département Analyse" (exemple)

**Bouton Créer** :
- Désactivé si l'utilisateur n'a pas de département (et n'est pas Directeur)

### 3. Loaders visuels

#### Chargement initial
```tsx
{loadingProfile && <div className="spinner"></div>}
```

#### Chargement des activités
```tsx
{loading && <div className="loading-state">...</div>}
```

#### Sauvegarde d'activité
```tsx
{savingActivity && <span className="spinner-small"></span>}
```

#### Suppression d'activité
```tsx
{deletingId === activity.ID && '⏳'}
```

### 4. Permissions dans l'UI

#### Boutons Modifier/Supprimer
```tsx
<button
  disabled={!UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)}
  onClick={() => handleOpenEditModal(activity)}
>
  ✏️
</button>
```

#### Vérification avant action
```typescript
const handleOpenEditModal = (activity: Activity) => {
  if (!UserProfileService.canModifyActivity(userProfile, activity.NomRubrique)) {
    setError('Vous n\'avez pas les permissions...');
    return;
  }
  // ...
};
```

## Gestion des erreurs

### Profil non trouvé
Si l'email de l'utilisateur n'existe pas dans la table `Utilisateurs` :
- Le système crée un profil par défaut sans département
- L'utilisateur ne peut ni créer ni modifier d'activités
- Message : "Utilisateur non trouvé dans la table Utilisateurs"

### Permissions insuffisantes
Messages d'erreur affichés :
- "Vous n'avez pas les permissions pour créer une activité"
- "Vous n'avez pas les permissions pour modifier cette activité"
- "Vous n'avez pas les permissions pour supprimer cette activité"

## Cache du profil

Le profil utilisateur est mis en cache après le premier chargement :
- Évite les appels répétés à Office 365 et SharePoint
- Améliore les performances
- Peut être réinitialisé avec `UserProfileService.clearCache()`

## États de chargement

### 1. LoadingProfile
- **État** : `loadingProfile`
- **Quand** : Au chargement initial du profil
- **Affichage** : Spinner avec "Chargement de votre profil..."

### 2. Loading
- **État** : `loading`
- **Quand** : Récupération des activités
- **Affichage** : Spinner avec "Chargement des activités..."

### 3. SavingActivity
- **État** : `savingActivity`
- **Quand** : Création ou modification d'activité
- **Affichage** : Spinner dans le bouton + texte "Création..." ou "Modification..."

### 4. DeletingId
- **État** : `deletingId`
- **Quand** : Suppression d'une activité
- **Affichage** : Icône ⏳ sur le bouton de suppression de l'activité concernée

## Exemple de flux complet

### Scénario : Chef du département DA se connecte

1. **Connexion**
   - Email récupéré : `jean.dupont@dge.com`

2. **Chargement du profil**
   ```
   Recherche dans Utilisateurs où Email = 'jean.dupont@dge.com'
   Résultat : {
     Email: 'jean.dupont@dge.com',
     Fonction: 'Chef de département',
     Departement: { Value: 'DA' }
   }
   ```

3. **Profil construit**
   ```typescript
   {
     email: 'jean.dupont@dge.com',
     fonction: 'Chef de département',
     departement: 'DA',
     isDirecteur: false,
     hasGlobalView: false
   }
   ```

4. **Chargement des activités**
   - Filtre appliqué : `Departement/Value eq 'DA'`
   - Seules les activités du département DA sont récupérées

5. **Interactions possibles**
   - ✅ Voir toutes les activités DA
   - ✅ Créer une nouvelle activité DA
   - ✅ Modifier les activités DA
   - ✅ Supprimer les activités DA
   - ❌ Voir les activités DPNP ou DSE
   - ❌ Modifier les activités d'autres départements

### Scénario : Directeur se connecte

1. **Profil**
   ```typescript
   {
     email: 'directeur@dge.com',
     fonction: 'Directeur',
     departement: null,
     isDirecteur: true,
     hasGlobalView: true
   }
   ```

2. **Chargement des activités**
   - Pas de filtre appliqué
   - Toutes les activités de tous les départements sont récupérées

3. **Interactions possibles**
   - ✅ Voir toutes les activités (DA, DPNP, DSE)
   - ✅ Créer des activités pour n'importe quel département
   - ✅ Modifier toutes les activités
   - ✅ Supprimer toutes les activités

## Styles CSS des loaders

```css
/* Spinner principal */
.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #CC0000;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

/* Petit spinner (boutons) */
.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #CC0000;
  animation: spin 1s linear infinite;
}

/* Animation de rotation */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## Points d'attention

### 1. Structure du champ Departement
Le champ `Departement` est un Choice SharePoint, accessible via :
```typescript
(utilisateur.Departement as any)?.Value
```

### 2. Normalisation des départements
La méthode `normalizeDepartement()` accepte plusieurs formats :
- "DA", "DPNP", "DSE"
- "ANALYSE", "NON PERFORMANT", "SURVEILLANCE"

### 3. Mise à jour des données
Si la table Utilisateurs est modifiée, appeler :
```typescript
UserProfileService.clearCache();
```
Puis recharger la page pour rafraîchir le profil.

## Extension future

Pour ajouter d'autres rôles ou départements :

1. Ajouter les valeurs dans le Choice `Departement` de SharePoint
2. Mettre à jour le type `Departement` dans `UserProfileService.ts`
3. Ajouter les cas dans `normalizeDepartement()`
4. Ajouter les labels dans `getDepartementLabel()`

Exemple pour un nouveau département "DCR" (Département Crédit) :
```typescript
export type Departement = 'DA' | 'DPNP' | 'DSE' | 'DCR' | null
```
