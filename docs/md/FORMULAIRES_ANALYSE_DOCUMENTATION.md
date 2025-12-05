# Formulaires Département Analyse - Documentation

## Vue d'ensemble

Tous les formulaires pour le département Analyse ont été créés avec succès. Voici un résumé complet de l'architecture mise en place.

## Architecture des Formulaires

### 1. **CreditClassiqueFormNew.tsx** ✅
- **Activités gérées** (12 activités de Crédit Classique):
  - Dossiers reçus des unités
  - Dossiers présentés aux comités
  - FAR
  - Notes de circulation
  - Dossiers en attente
  - Dossiers renvoyés
  - Dossiers rejetés
  - Autres activités liées aux dossiers

- **Services utilisés**:
  - `AnalyseDossiersComitesService` (données principales)
  - `DetailsDossiersService` (détails par dossier)

- **Props**:
  - `activityName`: string
  - `requiresComite`: boolean (affiche TypeComite si true)
  - `requiresDetails`: boolean (permet ajout de dossiers détaillés)
  - `onSave`: () => void
  - `onCancel`: () => void

- **Champs principaux**:
  - Nombre de dossiers
  - Montant total
  - Date de réception
  - Type de comité (CC1, CC2, CC3, CC4, CCCA) - conditionnel

- **Fonctionnalités spéciales**:
  - Modal pour ajouter des dossiers détaillés individuels
  - Champs détaillés: nomClient, matricule, montantSollicite, decision, detailDecision, commentaire
  - Support des décisions: Accord, Avis favorable, À représenter, Stand by, Rejet
  - Table récapitulative des dossiers ajoutés

---

### 2. **FormSuiviTransmission.tsx** ✅
- **Activités gérées** (4 activités de Crédit Programme):
  - Transmission SCRG
  - Dossiers présentés aux comités
  - FAR
  - Notes de circulation

- **Service utilisé**:
  - `AnalyseSuiviTransmissionService`

- **Props**:
  - `activityName`: string
  - `requiresComite`: boolean
  - `onSave`: () => void
  - `onCancel`: () => void

- **Champs**:
  - Nombre de dossiers
  - Montant
  - Date de réception
  - Date de transmission
  - Date de comité (conditionnel)
  - Type de comité (conditionnel)

---

### 3. **FormEvaluationDelais.tsx** ✅
- **Activité gérée**:
  - Évaluation délais crédit

- **Service utilisé**:
  - `AnalyseDelaisCreditService`

- **Champs** (tous en jours):
  - Délai moyen DCE
  - Délai moyen Unité
  - Délai moyen DRISQUE
  - Délai moyen DCONF
  - Délai moyen Chaîne globale

- **Fonctionnalités**:
  - Input avec unité "jours" affichée
  - Tooltips explicatifs pour chaque délai
  - Validation: au moins un délai renseigné
  - Support des décimales (0.1 jour = 2.4 heures)

---

### 4. **FormAdminEngagementsAnalyse.tsx** ✅
- **Activités gérées** (6 types):
  - Engagements globaux
  - Crédit classique
  - Crédit programme
  - Crédits mis en place
  - Encours
  - Créances impayées

- **Service utilisé**:
  - `AnalyseEngagementsService`

- **Champs**:
  - Réseau (dropdown dynamique depuis agenceresau)
  - Agence (dropdown dynamique depuis agenceresau)
  - Segment (Particulier / Entreprise)
  - Montant (en millions)

- **Fonctionnalités**:
  - Chargement dynamique des réseaux et agences depuis SharePoint
  - Affichage de "⏳ Chargement..." pendant le chargement
  - Info box montrant l'activité et le mois

---

### 5. **FormSuiviMEP.tsx** ✅
- **Activité gérée**:
  - Suivi des crédits mis en place

- **Service utilisé**:
  - `AnalyseSuiviMEPService`

- **Champs**:
  - Dossiers en attente du mois précédent
  - Mouvement du mois (positif = nouveaux, négatif = clôturés)
  - Stock restant (calculé automatiquement)

- **Fonctionnalités**:
  - Calcul automatique du stock restant
  - Validation de cohérence (Stock = Attente + Mouvement)
  - Info box explicative
  - Champ calculé en lecture seule avec highlight vert

---

### 6. **FormActivitesAnnexes.tsx** ✅
- **Activités gérées** (4 types):
  - Visites clientèle
  - Formations
  - Actualisation de procédures
  - Études

- **Services utilisés**:
  - `VisiteClienteleService`
  - `FormationsService`
  - `ActivitesTransversalesService`

- **Props**:
  - `activityName`: string
  - `activityType`: 'visites' | 'formations' | 'procedures' | 'etudes'
  - `onSave`: () => void
  - `onCancel`: () => void

- **Champs par type**:
  
  **Visites clientèle**:
  - Agence (dropdown dynamique)
  - Client
  - Date de visite
  - Objet de la visite
  - Compte rendu (textarea)

  **Formations**:
  - Libellé
  - Durée (en heures)
  - Date de validation

  **Procédures/Études**:
  - Titre ou thème
  - Date de validation
  - Date de transmission qualité
  - Résultat (textarea)

---

## Mapping Activités → Formulaires

### Crédit Classique (12 activités)
→ **CreditClassiqueFormNew**
- Dossiers reçus: `{ requiresComite: false, requiresDetails: false }`
- Présentés CC1: `{ requiresComite: true, requiresDetails: true }`
- FAR: `{ requiresComite: false, requiresDetails: true }`
- Etc.

### Crédit Programme (5 activités)
→ **FormSuiviTransmission** (4 activités)
- Transmission SCRG: `{ requiresComite: false }`
- Présentés comités: `{ requiresComite: true }`

→ **FormEvaluationDelais** (1 activité)
- Évaluation délais crédit

### Administration (6 activités)
→ **FormAdminEngagementsAnalyse**
- Engagements globaux
- Crédit classique
- Crédit programme
- Crédits mis en place
- Encours
- Créances impayées

### Suivi MEP (1 activité)
→ **FormSuiviMEP**
- Suivi des crédits mis en place

### Activités Annexes (4 activités)
→ **FormActivitesAnnexes**
- Visites: `{ activityType: 'visites' }`
- Formations: `{ activityType: 'formations' }`
- Procédures: `{ activityType: 'procedures' }`
- Études: `{ activityType: 'etudes' }`

---

## Tables SharePoint Utilisées

| Formulaire | Table(s) SharePoint | Service(s) |
|------------|---------------------|------------|
| CreditClassiqueFormNew | analyse_dossiers_comites<br>analyse_details_dossiers | AnalyseDossiersComitesService<br>DetailsDossiersService |
| FormSuiviTransmission | analyse_suivi_transmission | AnalyseSuiviTransmissionService |
| FormEvaluationDelais | analyse_delais_credit | AnalyseDelaisCreditService |
| FormAdminEngagementsAnalyse | analyse_engagements | AnalyseEngagementsService |
| FormSuiviMEP | analyse_suivi_mep | AnalyseSuiviMEPService |
| FormActivitesAnnexes | analyse_visites_clientele<br>analyse_formations<br>analyse_activites_transversales | VisiteClienteleService<br>FormationsService<br>ActivitesTransversalesService |

---

## Fichiers CSS Créés

1. `CreditClassiqueFormNew.css` - Style modal complexe avec table dossiers
2. `FormSuiviTransmission.css` - Style standard avec sections
3. `FormEvaluationDelais.css` - Style avec input-unit et tooltips
4. `FormAdminEngagementsAnalyse.css` - Style avec info box bleue
5. `FormSuiviMEP.css` - Style avec champs calculés verts
6. `FormActivitesAnnexes.css` - Style flexible pour 4 types

Tous les CSS suivent la même charte graphique:
- Header rouge (#CC0000)
- Sections grises (#f8f9fa)
- Boutons avec gradient
- Responsive mobile-first

---

## Prochaines Étapes

### Intégration dans l'application
1. Créer un composant `ActivitySelector` pour le département Analyse
2. Mapper chaque activité au bon formulaire avec les bonnes props
3. Intégrer dans le routing de l'application
4. Tester chaque formulaire avec des données réelles

### Exemple d'intégration

```tsx
// ActivitySelector.tsx
import CreditClassiqueFormNew from './forms/CreditClassiqueFormNew';
import FormSuiviTransmission from './forms/FormSuiviTransmission';
// ... autres imports

const getFormForActivity = (activityName: string) => {
  const creditClassiqueActivities = {
    'Dossiers reçus des unités': { requiresComite: false, requiresDetails: false },
    'Dossiers présentés au CC1': { requiresComite: true, requiresDetails: true },
    // ... etc
  };

  if (creditClassiqueActivities[activityName]) {
    return <CreditClassiqueFormNew 
      activityName={activityName}
      {...creditClassiqueActivities[activityName]}
      onSave={handleSave}
      onCancel={handleCancel}
    />;
  }
  
  // ... autres cas
};
```

---

## Validation et Tests

### Points de test pour chaque formulaire:
- ✅ Champs obligatoires validés
- ✅ Types de données validés (number, date, string)
- ✅ Messages d'erreur clairs
- ✅ État de chargement (loading states)
- ✅ Responsive mobile
- ✅ Intégration avec services SharePoint
- ✅ Auto-calculs (FormSuiviMEP)
- ✅ Dropdowns dynamiques (agences, réseaux)

---

## Statut Final

**✅ TOUS LES FORMULAIRES CRÉÉS ET PRÊTS**

6 composants de formulaires
12 fichiers (6 .tsx + 6 .css)
9 services SharePoint intégrés
28+ activités du département Analyse couvertes
