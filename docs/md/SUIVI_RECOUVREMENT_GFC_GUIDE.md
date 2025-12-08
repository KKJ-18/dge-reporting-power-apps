# Guide: Suivi des Actions de Recouvrement pour les GFC (DPNP)

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux agents de recouvrement du département DPNP de gérer le suivi des actions de recouvrement pour les clients en anomalie.

## 🎯 Objectif

Faciliter le processus de recouvrement en :
1. Identifiant les clients en anomalie sans action
2. Enregistrant les actions de recouvrement effectuées
3. Mettant à jour automatiquement le statut des clients

## 🗂️ Bases de données SharePoint utilisées

### 1. **Clients en Anomalie** (`ClientsenAnomalie`)
Base de données contenant tous les clients en situation d'anomalie.

**Champs clés :**
- `Title` : Nom du client
- `Matricule` : Matricule du client
- `Montant` : Montant de l'anomalie
- `EmailGFC` : Email du GFC responsable
- `NomGFC` : Nom du GFC
- `Nomagence` : Nom de l'agence
- `TypeClient` : Type de client
- `StatutAction` : Statut de l'action (Aucun, En cours, Terminé)
- `Numerodossier` : Numéro de dossier
- `TotalSains`, `TotalTrésorerie`, `TotalNPL` : Totaux financiers

### 2. **Action Recouvrement** (`ActionRecouvrement`)
Base de données pour enregistrer les actions de recouvrement effectuées.

**Champs clés :**
- `Title` : Commentaire/Description de l'action
- `Matricule` : Matricule du client
- `NomClient` : Nom du client
- `EmailGFC` : Email du GFC
- `Typedaction` : Type d'action (Planifier / Exécuter)
- `DatePlanification` : Date de planification (optionnel)
- `DateExécution` : Date d'exécution (obligatoire)
- `Origineimpayé` : Origine de l'impayé (obligatoire)
- `Lienpiécejointe` : Lien vers une pièce jointe (optionnel)
- `DateprochaineAction` : Date de prochaine action (optionnel)

## 🔄 Flux de travail

### Étape 1 : Recherche d'un client en anomalie
1. L'agent accède à la catégorie "Suivi des actions de recouvrement pour les GFC"
2. Le système affiche tous les clients avec `StatutAction = "Aucun"`
3. L'agent peut rechercher par :
   - Nom du client (`Title`)
   - Matricule (`Matricule`)
   - Nom du GFC (`NomGFC`)

### Étape 2 : Sélection du client
1. L'agent clique sur le client concerné
2. Le système affiche un résumé des informations du client :
   - Nom et Matricule
   - Montant de l'anomalie
   - Email du GFC
   - Agence

### Étape 3 : Saisie de l'action de recouvrement

#### Champs pré-remplis automatiquement
Ces champs sont extraits de la BD "Clients en Anomalie" :
- ✅ Matricule
- ✅ Nom du client
- ✅ Email GFC
- ✅ Montant (affiché pour information)

#### Champs à remplir par l'agent

**Obligatoires :**
- 🔴 **Type d'Action** : Sélection parmi ["Planifier", "Exécuter"]
- 🔴 **Date d'Exécution** : Date de réalisation de l'action
- 🔴 **Origine de l'Impayé** : Source du problème (ex: Crédit, Découvert, Garantie)
- 🔴 **Commentaire** : Description détaillée de l'action effectuée

**Optionnels :**
- ⚪ **Date de Planification** : Date prévue pour l'action
- ⚪ **Lien Pièce Jointe** : URL vers un document justificatif
- ⚪ **Date de Prochaine Action** : Date de suivi prévu

### Étape 4 : Enregistrement
1. L'agent clique sur "💾 Enregistrer l'Action"
2. Le système effectue deux opérations :
   - ✅ Crée un enregistrement dans `ActionRecouvrement`
   - ✅ Met à jour le `StatutAction` du client à "En cours" dans `ClientsenAnomalie`
3. Message de confirmation affiché
4. Retour automatique à la liste de recherche après 2 secondes

## 🎨 Interface utilisateur

### Vue de recherche
```
┌─────────────────────────────────────────────────────┐
│ 🏛️ Suivi des Actions de Recouvrement pour les GFC  │
├─────────────────────────────────────────────────────┤
│ 🔍 [Rechercher par nom ou matricule...]            │
│                                                     │
│ 3 client(s) en anomalie avec statut "Aucun"       │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌────────────────────────┐ │
│ │ Jean DUPONT         │ │ Marie MARTIN           │ │
│ │ Matricule: 12345    │ │ Matricule: 67890       │ │
│ │ Montant: 5 000 000 │ │ Montant: 3 500 000    │ │
│ └─────────────────────┘ └────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Vue du formulaire
```
┌─────────────────────────────────────────────────────┐
│ ← Retour à la recherche                            │
├─────────────────────────────────────────────────────┤
│ Client sélectionné                                  │
│ Nom: Jean DUPONT                                    │
│ Matricule: 12345                                    │
│ Montant: 5 000 000 FCFA                            │
├─────────────────────────────────────────────────────┤
│ Formulaire d'Action de Recouvrement                │
│                                                     │
│ Type d'Action * [▼ Sélectionner]                  │
│ Date d'Exécution * [____/__/____]                 │
│ Date de Planification [____/__/____]               │
│ Origine de l'Impayé * [________________]          │
│ Commentaire *                                       │
│ [______________________________________]           │
│                                                     │
│           [Annuler]  [💾 Enregistrer l'Action]    │
└─────────────────────────────────────────────────────┘
```

## 💻 Implémentation technique

### Composants créés

1. **SuiviRecouvrementGFC.tsx**
   - Composant principal de gestion
   - Gestion de la recherche et du formulaire
   - Intégration avec les services SharePoint

2. **SuiviRecouvrementGFC.css**
   - Styles dédiés pour l'interface
   - Design responsive
   - Cohérence avec la charte DPNP

### Services utilisés

```typescript
// Récupérer les clients en anomalie
ClientsenAnomalieService.getAll({
  $expand: 'StatutAction'
})

// Créer une action de recouvrement
ActionRecouvrementService.create({
  Title: "Commentaire",
  DateExécution: "2025-12-08",
  Matricule: "12345",
  // ... autres champs
})

// Mettre à jour le statut du client
ClientsenAnomalieService.update(clientId, {
  StatutAction: { Value: 'En cours' }
})
```

### Intégration dans DepartmentDashboard

Le composant détecte automatiquement la catégorie "Suivi des actions de recouvrement" :

```typescript
const handleCategoryClick = (category: CategoryData) => {
  if (category.id === 'suivi-recouvrement-gfc' || 
      category.name.toLowerCase().includes('suivi des actions de recouvrement')) {
    setShowRecouvrementView(true);
    return;
  }
  // ... logique normale pour les autres catégories
}
```

## 📊 Ajout de la catégorie dans SharePoint

Pour activer cette fonctionnalité, vous devez ajouter une nouvelle catégorie dans la table `Activity` de SharePoint :

### Option 1 : Via l'interface d'administration
1. Accéder à la gestion des catégories
2. Créer une nouvelle catégorie :
   - **Nom** : `Suivi des actions de recouvrement pour les GFC`
   - **ID** : `suivi-recouvrement-gfc`
   - **Département** : `DPNP`
   - **Icône** : `💰` ou `📋`

### Option 2 : Directement dans SharePoint
Ajouter un enregistrement dans la table `Activity` :
```json
{
  "CategoryName": "Suivi des actions de recouvrement pour les GFC",
  "CategoryID": "suivi-recouvrement-gfc",
  "Departement": "DPNP",
  "ActivityName": "Action de recouvrement",
  "Icon": "💰"
}
```

## 🔐 Permissions requises

### Utilisateurs concernés
- Agents de recouvrement (DPNP)
- GFC (Gestionnaires de Comptes)
- Responsables DPNP

### Accès aux données
- **Lecture** : Clients en Anomalie (filtré sur StatutAction = "Aucun")
- **Écriture** : Action Recouvrement
- **Mise à jour** : Clients en Anomalie (champ StatutAction uniquement)

## 📈 Indicateurs de suivi

Le système permettra de suivre :
- ✅ Nombre de clients en anomalie sans action
- ✅ Nombre d'actions de recouvrement créées par période
- ✅ Taux de traitement des anomalies
- ✅ Délai moyen de traitement
- ✅ Actions par type (Planifier vs Exécuter)

## 🎯 Prochaines évolutions possibles

1. **Tableau de bord statistiques**
   - Vue des actions par GFC
   - Évolution du nombre de clients en anomalie
   - Performance du recouvrement

2. **Notifications automatiques**
   - Alerte quand une action est créée
   - Rappel pour les prochaines actions planifiées
   - Notification au GFC concerné

3. **Historique des actions**
   - Liste de toutes les actions pour un client
   - Export des rapports d'activité
   - Statistiques personnalisées

4. **Filtres avancés**
   - Par montant d'anomalie
   - Par type de client
   - Par agence ou réseau
   - Par période d'origine

5. **Workflow de validation**
   - Validation hiérarchique des actions
   - Commentaires et retours
   - Suivi du cycle complet

## 🐛 Résolution de problèmes

### Problème : Aucun client n'apparaît
**Solution :**
- Vérifier que des clients existent avec `StatutAction = "Aucun"`
- Vérifier les permissions d'accès à la BD `ClientsenAnomalie`
- Consulter la console pour les erreurs

### Problème : Impossible d'enregistrer l'action
**Solution :**
- Vérifier que tous les champs obligatoires sont remplis
- Vérifier les permissions d'écriture sur `ActionRecouvrement`
- Vérifier la connexion au serveur SharePoint

### Problème : Le statut du client n'est pas mis à jour
**Solution :**
- Vérifier les permissions de mise à jour sur `ClientsenAnomalie`
- L'action sera quand même créée, seule la mise à jour du statut échoue
- Consulter les logs dans la console

## 📞 Support

Pour toute question ou problème :
- 📧 Contact : support-dge@example.com
- 📚 Documentation technique : Voir les fichiers du projet
- 🔧 Développeur : Contacter l'équipe technique DGE

---

**Version :** 1.0  
**Date :** 8 décembre 2025  
**Auteur :** Équipe Développement DGE  
**Département :** DPNP (Département des Prêts Non Performants)
