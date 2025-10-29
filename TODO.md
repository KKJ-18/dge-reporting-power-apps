# 📋 TODO - Tâches Restantes

## 🔴 Haute Priorité (À faire immédiatement)

### 1. Compléter CreditClassiqueForm
**Status:** 🚧 En cours (50% complété)

**Sections manquantes à ajouter:**

#### Section 5: Dossiers en cours d'analyse
- [ ] Nombre de dossiers
- [ ] Montant total
- [ ] Délai moyen d'analyse
- [ ] Date de début analyse

#### Section 6: En attente avis risque
- [ ] Nombre de dossiers
- [ ] Montant total
- [ ] Durée moyenne d'attente
- [ ] Nombre de dossiers > 5 jours (alerte)

#### Section 7: En attente conformité
- [ ] Nombre de dossiers
- [ ] Montant total
- [ ] Points bloquants (dropdown: Document manquant, Vérification KYC, Autre)
- [ ] Actions correctives

#### Section 8: Suivi régularisation
- [ ] Nombre de dossiers régularisés
- [ ] Montant régularisé
- [ ] Dossiers en attente régularisation
- [ ] Taux de régularisation (calculé automatiquement)

**Fichier:** `src/components/forms/CreditClassiqueForm.tsx`  
**Lignes actuelles:** 396  
**Estimation:** +250 lignes pour les 4 sections

---

## 🟠 Priorité Moyenne (1-2 semaines)

### 2. Interface de Validation Hiérarchique
**Status:** ⏳ À créer

**Fonctionnalités requises:**
- [ ] Liste des rapports en attente de validation
- [ ] Filtres : Par date, par utilisateur, par module
- [ ] Vue détaillée d'un rapport
- [ ] Boutons : ✅ Valider / ❌ Rejeter / 💬 Demander modification
- [ ] Commentaires de validation
- [ ] Historique des validations
- [ ] Workflow : Soumis → Validé → Consolidé

**Nouveau fichier:** `src/components/ValidationInterface.tsx`  
**Estimation:** ~600 lignes

---

### 3. Historique des Rapports
**Status:** ⏳ À créer

**Fonctionnalités requises:**
- [ ] Liste de tous les rapports soumis par l'utilisateur
- [ ] Colonnes : Date, Module, Statut, Validateur, Actions
- [ ] Filtres : Par période, par statut, par module
- [ ] Recherche textuelle
- [ ] Export sélection (Excel/PDF)
- [ ] Détail d'un rapport (lecture seule)
- [ ] Suppression brouillons

**Nouveau fichier:** `src/components/ReportsHistory.tsx`  
**Estimation:** ~500 lignes

---

### 4. Page Statistiques
**Status:** ⏳ À créer

**Widgets à afficher:**
- [ ] Graphique : Évolution des soumissions (ligne)
- [ ] Graphique : Répartition par module (camembert)
- [ ] KPIs : Taux de validation, temps moyen de traitement
- [ ] Tableau : Top 5 utilisateurs actifs
- [ ] Alerte : Délais critiques (> 10 jours)
- [ ] Export dashboard (PDF)

**Nouveau fichier:** `src/components/AnalyticsDashboard.tsx`  
**Estimation:** ~700 lignes

---

## 🟡 Basse Priorité (1 mois)

### 5. Intégration SharePoint
**Status:** ⏳ À implémenter

**Configuration requise:**
- [ ] Créer liste SharePoint `ReportsHebdomadaires`
  - Colonnes : ID, Semaine, Module, Utilisateur, DateSoumission, Statut, Données (JSON), Validateur, DateValidation
- [ ] Créer liste `ReportsMensuels` (pour MEP)
- [ ] Créer liste `ActivitesAnnexes`
- [ ] Créer liste `UsersTracking`
- [ ] Créer bibliothèque de documents pour fichiers

**Service à créer:** `src/services/SharePointService.ts`

**Méthodes requises:**
```typescript
- createReport(module, data)
- updateReport(reportId, data)
- getReports(filters)
- getReportById(id)
- submitReport(reportId)
- validateReport(reportId, status, comments)
- uploadFile(file, reportId)
```

**Estimation:** ~400 lignes

---

### 6. Power Automate Flows
**Status:** ⏳ À créer

#### Flow 1: Export quotidien Power BI
- [ ] Déclencheur : Tous les jours à 23h
- [ ] Action : Exporter tous rapports validés
- [ ] Format : CSV ou Excel
- [ ] Destination : OneDrive / SharePoint

#### Flow 2: Rappels automatiques
- [ ] Déclencheur : Tous les lundis à 9h
- [ ] Condition : Si aucun rapport soumis semaine précédente
- [ ] Action : Envoyer email de rappel

#### Flow 3: Notification validation
- [ ] Déclencheur : Quand rapport soumis
- [ ] Action : Notifier le manager par email
- [ ] Template email avec lien vers validation

#### Flow 4: Upload fichiers
- [ ] Déclencheur : Quand fichier uploadé
- [ ] Actions : 
  - Vérifier extension (.pdf, .doc, .xls)
  - Renommer (convention: ModuleID_Date_Filename)
  - Sauvegarder SharePoint
  - Créer lien dans rapport

---

### 7. Upload Fichiers Réel
**Status:** ⏳ À implémenter

**Remplacer simulation actuelle:**
```typescript
// Actuel (temporaire)
const fileUrl = URL.createObjectURL(file)

// À implémenter
const uploadFile = async (file: File, reportId: string) => {
  // 1. Valider taille (< 10MB)
  // 2. Valider extension
  // 3. Upload vers SharePoint
  // 4. Obtenir URL permanente
  // 5. Associer au rapport
  return { fileUrl, fileName }
}
```

**Fichier à modifier:** `src/components/forms/ActivitesAnnexesForm.tsx`  
**Estimation:** +100 lignes

---

## 🔵 Améliorations Futures

### 8. Recherche Avancée
**Status:** 💡 Idée

**Critères de recherche:**
- [ ] Période (date début - date fin)
- [ ] Module (multi-select)
- [ ] Utilisateur (autocomplete)
- [ ] Statut (multi-select)
- [ ] Montant (min - max)
- [ ] Texte libre (dans commentaires)

**Résultats:**
- [ ] Tableau paginé (20 par page)
- [ ] Tri par colonnes
- [ ] Export sélection

---

### 9. Exports Excel/PDF
**Status:** 💡 Idée

**Formats disponibles:**
- [ ] Export rapport individuel (PDF)
- [ ] Export consolidation période (Excel)
- [ ] Export statistiques (PDF avec graphiques)
- [ ] Template personnalisable (logo DGE, en-tête)

**Bibliothèques à utiliser:**
- `xlsx` pour Excel
- `jspdf` pour PDF
- `recharts` pour graphiques

---

### 10. Mode Hors Ligne
**Status:** 💡 Idée

**Fonctionnalités:**
- [ ] Service Worker
- [ ] Stockage local (IndexedDB)
- [ ] Synchronisation automatique au retour en ligne
- [ ] Indicateur de statut réseau

---

### 11. Notifications Push
**Status:** 💡 Idée

**Types de notifications:**
- [ ] Rapport validé ✅
- [ ] Rapport rejeté ❌
- [ ] Demande de modification 💬
- [ ] Rappel de soumission ⏰
- [ ] Nouveau message

---

### 12. Multi-langue (FR/AR)
**Status:** 💡 Idée

**Langues supportées:**
- [ ] Français (par défaut)
- [ ] Arabe (à ajouter)
- [ ] Fichiers de traduction JSON
- [ ] Sélecteur de langue dans header

---

## 📊 Récapitulatif

### Distribution des tâches

| Priorité | Tâches | Estimation |
|----------|--------|------------|
| 🔴 Haute | 1 | 1-2 jours |
| 🟠 Moyenne | 3 | 1-2 semaines |
| 🟡 Basse | 4 | 1 mois |
| 🔵 Futur | 5 | 2-3 mois |
| **TOTAL** | **13** | **3-4 mois** |

### Progression Globale

```
Fonctionnalités Core:        ████████░░ 80%
Intégration Power Platform:  ██░░░░░░░░ 20%
Fonctionnalités Avancées:    ░░░░░░░░░░  0%
Documentation:               ██████████ 100%
```

---

## 🎯 Roadmap Suggérée

### Sprint 1 (Semaine 1-2)
1. ✅ Compléter CreditClassiqueForm
2. ✅ Créer ValidationInterface
3. ✅ Créer ReportsHistory

### Sprint 2 (Semaine 3-4)
1. ✅ Créer AnalyticsDashboard
2. ✅ Implémenter SharePointService
3. ✅ Tests unitaires

### Sprint 3 (Semaine 5-6)
1. ✅ Configurer Power Automate Flows
2. ✅ Implémenter upload fichiers réel
3. ✅ Tests d'intégration

### Sprint 4 (Semaine 7-8)
1. ✅ Recherche avancée
2. ✅ Exports Excel/PDF
3. ✅ Tests utilisateurs
4. ✅ Déploiement production

---

## 📝 Notes Techniques

### Points d'Attention

1. **Performance:**
   - Pagination pour grandes listes (> 100 items)
   - Lazy loading des graphiques
   - Optimisation des requêtes SharePoint

2. **Sécurité:**
   - Validation côté serveur (Power Automate)
   - Permissions granulaires SharePoint
   - Sanitization des inputs utilisateur

3. **Accessibilité:**
   - Labels ARIA
   - Navigation clavier
   - Contraste couleurs (WCAG AA)

4. **Browser Support:**
   - Chrome/Edge (priorité)
   - Firefox
   - Safari (test requis)

---

## 🔗 Dépendances à Installer

```json
{
  "xlsx": "^0.18.5",           // Export Excel
  "jspdf": "^2.5.1",           // Export PDF
  "recharts": "^2.10.0",       // Graphiques
  "react-query": "^3.39.3",    // Cache et requêtes
  "date-fns": "^2.30.0"        // Manipulation dates
}
```

---

*Document mis à jour: 2025-01-XX*