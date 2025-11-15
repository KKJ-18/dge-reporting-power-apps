# 🎯 Spécifications : Système de Rôles, Objectifs et Notifications

## 📋 Résumé Exécutif

Ce document spécifie l'implémentation complète du système de gestion par rôles, validation des objectifs journaliers et notifications automatiques pour l'application DGE Reporting.

---

## 1️⃣ Système de Rôles et Redirections

### 🎭 Définition des Rôles

| Rôle | Fonction SharePoint | Permissions | Vue |
|------|-------------------|-------------|-----|
| **Directeur** | `Fonction = "Directeur"` | Accès complet | Tous les départements |
| **Chef de Département** | `Fonction = "Chef de département"` | Département spécifique | Son département |
| **Utilisateur** | Autre | Personnel | Son département uniquement |

### 🔄 Logique de Redirection Automatique

#### Au Chargement (AppModern.tsx)

```typescript
// ÉTAT ACTUEL (ligne 46-55)
if (profile.isDirecteur) {
  setActiveModule('home'); // ❌ Affiche la sélection - PAS optimal
} else if (profile.departement) {
  setActiveModule('home'); // ❌ Affiche aussi la sélection
}

// AMÉLIORATION REQUISE
if (profile.isDirecteur) {
  setActiveModule('director-dashboard'); // ✅ Vue globale directe
} else if (profile.departement) {
  setActiveModule(`dashboard-${profile.departement.toLowerCase()}`); // ✅ Dashboard dept direct
  // OU
  setActiveModule('my-dashboard'); // ✅ Dashboard personnel
} else {
  setActiveModule('error'); // ⚠️ Utilisateur sans département
}
```

#### Navigation Sidebar (Sidebar.tsx)

**État actuel :**
- ✅ Déjà filtré selon `userProfile.departement` (ligne 22)
- ✅ Affiche "Tous les Départements" si Directeur (ligne 48)

**Amélioration requise :**
- Cacher menu "Rapports & Statistiques" si utilisateur simple
- Afficher uniquement pour Directeur et Chef de département

### 🔐 Contrôle d'Accès aux Modules

#### Module ReportsStatistics.tsx

**État actuel (ligne 75-79) :**
```typescript
setIsDirector(profile.isDirecteur);
if (profile.departement && !profile.isDirecteur) {
  setSelectedDepartment(profile.departement); // ✅ Pre-select département
}
```

**Amélioration requise :**
```typescript
// Ajouter filtre utilisateur
const [canViewAllUsers, setCanViewAllUsers] = useState(false);

// Dans loadUserProfile()
setCanViewAllUsers(profile.isDirecteur || profile.fonction?.includes('Chef'));

// Dans loadTeamMembers()
if (canViewAllUsers) {
  const users = await ReportsService.getSubmittingUsers(filters);
  // Directeur : tous sauf lui
  // Chef : utilisateurs de son département seulement
  const filteredUsers = profile.isDirecteur 
    ? users.filter(u => u.email !== profile.email)
    : users.filter(u => u.departement === profile.departement);
  setTeamMembers(filteredUsers);
} else {
  // Utilisateur simple : voir uniquement ses stats
  setTeamMembers([{ email: profile.email, name: 'Moi', submissionsCount: 0 }]);
  setSelectedUser(profile.email); // Force à son email
}
```

---

## 2️⃣ Validation des Objectifs Journaliers

### 📝 Logique Métier

**Règle :** Un utilisateur DOIT définir ses objectifs de la journée AVANT de pouvoir remplir ses activités.

### 🔍 État Actuel

#### ObjectifsManagement.tsx
- ✅ Permet de créer des objectifs par date
- ✅ Charge les objectifs pour une date donnée
- ❌ **NE FILTRE PAS** par utilisateur (ligne 88 : pas de filtre `CreatedBy`)

#### DepartmentDashboard (DA/DSE/DPNP)
- ❌ **AUCUNE VALIDATION** avant d'ouvrir les formulaires
- Permet de remplir activités sans objectifs définis

### ✅ Implémentation Requise

#### Étape 1 : Créer hook `useObjectifValidation.ts`

```typescript
// src/hooks/useObjectifValidation.ts
import { useState, useEffect } from 'react';
import { ObjectifService } from '../services/ObjectifService';
import { UserProfileService } from '../services/UserProfileService';

interface ObjectifValidation {
  hasObjectifs: boolean;
  loading: boolean;
  error: string | null;
  checkObjectifs: (date: string) => Promise<boolean>;
}

export const useObjectifValidation = (): ObjectifValidation => {
  const [hasObjectifs, setHasObjectifs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkObjectifs = async (date: string): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Récupérer le profil utilisateur
      const profile = await UserProfileService.getCurrentUserProfile();
      
      // 2. Chercher les objectifs du jour pour cet utilisateur
      // IMPORTANT: Utiliser le champ Created By (Author)
      const result = await ObjectifService.getAll({
        filter: `Date eq '${date}'` // TODO: Ajouter filtre Author
      });

      const objectifs = result.data || result.value || [];
      const hasObj = objectifs.length > 0;
      setHasObjectifs(hasObj);
      setError(null);
      return hasObj;
    } catch (err) {
      console.error('Erreur validation objectifs:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { hasObjectifs, loading, error, checkObjectifs };
};
```

#### Étape 2 : Intégrer dans DepartmentDashboard

```typescript
// Dans DepartmentDashboardDPNP.tsx (ligne 160+)
import { useObjectifValidation } from '../hooks/useObjectifValidation';

const DepartmentDashboardDPNP: React.FC<...> = ({ ... }) => {
  const { hasObjectifs, checkObjectifs } = useObjectifValidation();
  const [showObjectifAlert, setShowObjectifAlert] = useState(false);

  const handleActivityClick = async (activity: Activity) => {
    const today = new Date().toISOString().split('T')[0];
    
    // ⚠️ VALIDATION CRITIQUE
    const hasObj = await checkObjectifs(today);
    if (!hasObj) {
      setShowObjectifAlert(true);
      return; // ❌ BLOQUER l'ouverture du formulaire
    }

    // ✅ Objectifs définis - Continuer normalement
    const { formType, contratType, accordType } = detectFormType(categoryLower, activityLower);
    setSelectedForm({ formType, activity, contratType, accordType });
  };

  return (
    <>
      {/* ... reste du JSX ... */}
      
      {showObjectifAlert && (
        <div className="objectif-alert-modal">
          <div className="alert-content">
            <h3>⚠️ Objectifs Requis</h3>
            <p>Vous devez définir vos objectifs de la journée avant de remplir vos activités.</p>
            <button onClick={() => setActiveModule('objectifs')}>
              Définir mes objectifs
            </button>
            <button onClick={() => setShowObjectifAlert(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
```

---

## 3️⃣ Rapports Individuels par Created By

### 📊 Données Existantes

#### Table Activity (SharePoint)
- ✅ `Title` : Nom de l'activité
- ✅ `Category` : Rubrique
- ✅ `Frequency` : Fréquence (Quotidienne, Hebdomadaire, Mensuelle)
- ✅ `Author` / `Created By` : Créateur de l'enregistrement
- ✅ `Created` : Date de création

#### Tables de Formulaires (Accords, Contrats, etc.)
- ✅ Toutes ont `Author` / `{Author}` field
- ✅ Toutes ont `Created` field

### 🎯 Objectif

Générer des rapports individuels montrant :
1. Nombre de soumissions par utilisateur
2. Activités complétées par jour (Lundi-Vendredi)
3. Taux de complétion vs objectifs
4. Statistiques par catégorie/rubrique

### ✅ Implémentation dans ReportsService.ts

```typescript
// src/services/ReportsService.ts (ligne 219+)

/**
 * Récupère les statistiques individuelles par utilisateur
 */
export async function getIndividualStats(
  filters: ReportFilters & { userEmail: string }
): Promise<{
  totalSubmissions: number;
  byDay: { day: string; count: number }[];
  byCategory: { category: string; count: number }[];
  completionRate: number;
}> {
  try {
    // 1. Récupérer tous les formulaires créés par cet utilisateur
    const allTables = [
      'AccordsService',
      'ContratsService',
      'DossiersRestructurationService',
      // ... ajouter tous les services
    ];

    let totalSubmissions = 0;
    const submissionsByDay: Map<string, number> = new Map();
    const submissionsByCategory: Map<string, number> = new Map();

    for (const service of allTables) {
      const result = await service.getAll({
        filter: `Author/Email eq '${filters.userEmail}' and Created ge datetime'${filters.startDate.toISOString()}' and Created le datetime'${filters.endDate.toISOString()}'`
      });

      const data = result.data || result.value || [];
      totalSubmissions += data.length;

      data.forEach((item: any) => {
        // Grouper par jour
        const day = new Date(item.Created).toLocaleDateString('fr-FR', { weekday: 'long' });
        submissionsByDay.set(day, (submissionsByDay.get(day) || 0) + 1);

        // Grouper par catégorie
        const category = item.Category || 'Non catégorisé';
        submissionsByCategory.set(category, (submissionsByCategory.get(category) || 0) + 1);
      });
    }

    // 2. Calculer le taux de complétion vs objectifs
    const objectifs = await ObjectifService.getAll({
      filter: `Author/Email eq '${filters.userEmail}' and Date ge '${filters.startDate.toISOString().split('T')[0]}' and Date le '${filters.endDate.toISOString().split('T')[0]}'`
    });
    const objectifTotal = (objectifs.data || []).reduce((sum, obj) => sum + (obj.Nombre || 0), 0);
    const completionRate = objectifTotal > 0 ? (totalSubmissions / objectifTotal) * 100 : 0;

    return {
      totalSubmissions,
      byDay: Array.from(submissionsByDay.entries()).map(([day, count]) => ({ day, count })),
      byCategory: Array.from(submissionsByCategory.entries()).map(([category, count]) => ({ category, count })),
      completionRate
    };
  } catch (error) {
    console.error('Erreur récupération stats individuelles:', error);
    throw error;
  }
}
```

---

## 4️⃣ Système de Notifications Journalières

### 🔔 Logique Métier

**Objectif :** Vérifier quotidiennement si l'utilisateur a saisi ses données du jour, envoyer une notification si manquant.

### 📅 Vérifications

1. **Au chargement de l'app** (AppModern.tsx)
2. **À minuit** (via interval ou service worker)
3. **Conditions :**
   - Date = aujourd'hui
   - Jour ouvré (Lundi-Vendredi)
   - Aucune soumission avec `Created By` = utilisateur actuel

### ✅ Implémentation

#### Étape 1 : Créer NotificationService.ts

```typescript
// src/services/NotificationService.ts
import { ObjectifService } from './ObjectifService';
import { AccordsService } from './AccordsService';
// ... importer tous les services de formulaires

export interface DailyCheckResult {
  hasObjectifs: boolean;
  hasSubmissions: boolean;
  missingItems: string[];
}

export class NotificationService {
  /**
   * Vérifie si l'utilisateur a rempli ses données du jour
   */
  static async checkDailySubmission(userEmail: string, date: Date): Promise<DailyCheckResult> {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Ignorer weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return { hasObjectifs: true, hasSubmissions: true, missingItems: [] };
    }

    const missingItems: string[] = [];

    // 1. Vérifier objectifs
    const objectifs = await ObjectifService.getAll({
      filter: `Author/Email eq '${userEmail}' and Date eq '${dateStr}'`
    });
    const hasObjectifs = (objectifs.data || []).length > 0;
    if (!hasObjectifs) missingItems.push('Objectifs du jour');

    // 2. Vérifier soumissions (toutes les tables)
    const services = [AccordsService, ContratsService /* ... */];
    let totalSubmissions = 0;

    for (const service of services) {
      const result = await service.getAll({
        filter: `Author/Email eq '${userEmail}' and Created ge datetime'${date.toISOString()}'`
      });
      totalSubmissions += (result.data || []).length;
    }

    const hasSubmissions = totalSubmissions > 0;
    if (!hasSubmissions) missingItems.push('Activités du jour');

    return { hasObjectifs, hasSubmissions, missingItems };
  }

  /**
   * Affiche une notification toast
   */
  static showNotification(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    // Utiliser NotificationModal ou créer un système de toast
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
  }
}
```

#### Étape 2 : Intégrer dans AppModern.tsx

```typescript
// Dans AppModern.tsx (après ligne 65)
import { NotificationService } from './services/NotificationService';

useEffect(() => {
  if (userProfile) {
    checkDailyNotifications();
  }
}, [userProfile]);

const checkDailyNotifications = async () => {
  if (!userProfile) return;

  const today = new Date();
  const result = await NotificationService.checkDailySubmission(userProfile.email, today);

  if (result.missingItems.length > 0) {
    NotificationService.showNotification(
      '⚠️ Données Manquantes',
      `Il vous manque : ${result.missingItems.join(', ')}`,
      'warning'
    );
  }
};
```

---

## 📝 Résumé des Modifications

### Fichiers à Créer
- ✅ `src/hooks/useObjectifValidation.ts` (nouveau)
- ✅ `src/services/NotificationService.ts` (nouveau)

### Fichiers à Modifier
1. **AppModern.tsx** (ligne 46-55, ajouter notifications)
2. **Sidebar.tsx** (ligne 22, 48 - restreindre accès)
3. **ReportsStatistics.tsx** (ligne 75-79, 98-116 - filtrer par rôle)
4. **ObjectifsManagement.tsx** (ligne 88 - ajouter filtre Created By)
5. **DepartmentDashboardDPNP.tsx** (ajouter validation objectifs)
6. **DepartmentDashboardDSE.tsx** (ajouter validation objectifs)
7. **DepartmentDashboardAnalyse.tsx** (ajouter validation objectifs)
8. **ReportsService.ts** (ajouter getIndividualStats())

### Ordre d'Implémentation Recommandé

1. ✅ **CSS DSE** (FAIT - commit ed0613a)
2. 🔄 **useObjectifValidation.ts** (Validation objectifs)
3. 🔄 **Intégrer validation dans DepartmentDashboards**
4. 🔄 **Améliorer ReportsStatistics** (filtrage par rôle)
5. 🔄 **NotificationService.ts** (Notifications journalières)
6. 🔄 **Intégrer notifications dans AppModern**
7. 🔄 **Améliorer redirections automatiques**
8. ✅ **Tests et commit final**

---

## 🎯 Critères de Succès

### Validation des Objectifs
- [ ] Impossible d'ouvrir un formulaire d'activité sans objectifs définis
- [ ] Message d'erreur clair avec bouton "Définir mes objectifs"
- [ ] Redirection vers ObjectifsManagement

### Gestion des Rôles
- [ ] Directeur voit tous les départements et utilisateurs (sauf lui)
- [ ] Chef de département voit uniquement son département
- [ ] Utilisateur voit uniquement ses propres données
- [ ] Redirection automatique au bon dashboard au chargement

### Rapports Individuels
- [ ] Statistiques par utilisateur avec Created By
- [ ] Graphiques par jour (Lundi-Vendredi)
- [ ] Taux de complétion vs objectifs

### Notifications
- [ ] Vérification quotidienne des données manquantes
- [ ] Toast/modal au chargement si données manquantes
- [ ] Liste précise des items manquants

---

## 📚 Références

- **UserProfileService** : `src/services/UserProfileService.ts` (ligne 1-274)
- **ObjectifService** : `src/services/ObjectifService.ts`
- **ReportsService** : `src/services/ReportsService.ts` (ligne 1-597)
- **CommonForm.css** : `src/components/forms/CommonForm.css` (système unifié)

---

**Auteur :** GitHub Copilot  
**Date :** 15 novembre 2025  
**Version :** 1.0
