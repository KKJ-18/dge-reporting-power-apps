# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - 2025-01-XX

### ✨ Ajouté
- **Migration Power Apps Code SDK** : Conversion complète vers React + TypeScript + Vite
- **ActivityManager** : Interface CRUD complète pour gestion des activités
  - Création, modification, suppression d'activités
  - Export CSV/Excel avec données filtrées
  - Validation des formulaires
  - Gestion des catégories (NomRubrique)
- **CategoryManager** : Interface CRUD pour gestion des catégories/rubriques
  - Opérations CRUD complètes
  - Export de données
- **PowerProvider** : Context Provider pour connexions SharePoint
- **Documentation** :
  - README.md complet avec badges et architecture
  - QUICKSTART.md pour démarrage rapide
  - CONTRIBUTING.md pour les contributeurs
  - WORKAROUND-Lookup-Not-Supported.md (limitation SDK)
  - SharePoint-Configuration-CategorieNom.md

### 🔧 Modifié
- **Champ NomRubrique** : Remplacement de IdRubrique (Lookup) par NomRubrique (Text)
  - Solution de contournement pour limitation SDK
  - Migration des données existantes
  - Régénération des modèles
- **Structure du projet** : Organisation modulaire avec services et modèles
- **Build system** : Optimisation Vite avec code splitting

### 🐛 Corrigé
- **Erreur 400 Lookup** : "The passed-in field \"IdRubrique#Id\" could not be found"
  - Cause : Les champs Lookup ne sont PAS supportés par Power Apps Code SDK (Preview)
  - Solution : Utilisation de champs Text (NomRubrique)
- **Validation des formulaires** : Contrôles de champs obligatoires
- **Export de données** : Gestion correcte des champs vides

### 🚨 Limitations Connues
- **Lookup Fields** : Non supportés par le SDK (limitation officielle Microsoft)
  - Solution : Utiliser des champs Choice ou Text
  - Documenté dans `docs/WORKAROUND-Lookup-Not-Supported.md`
- **Offline Mode** : Non disponible en preview
- **Complex Queries** : Limitations OData

### 🏗️ Architecture
- **Frontend** : React 19.1.1 + TypeScript 5.9.3
- **Build** : Vite 6.0.1
- **SDK** : @pa-client/power-code-sdk v0.0.4 (Preview)
- **Backend** : SharePoint Online Lists
- **Authentification** : Power Platform CLI

### 📊 Schéma de Base de Données Identifié
- **21 tables** documentées pour phases futures
- **5 modules métier** :
  1. Crédit Classique
  2. Crédit Programme
  3. Administration des Engagements
  4. Suivi MEP
  5. Activités Annexes

---

## [1.0.0] - 2024-XX-XX

### Initial Release (Legacy)
- Application Power Apps Canvas initiale
- Formulaires de base
- Connexion SharePoint

---

## Versions à Venir

### [2.1.0] - Prévu Q1 2025
- [ ] Module Crédit Classique (Formulaire 1)
- [ ] Module Crédit Programme (Formulaire 2)
- [ ] Implémentation des 21 tables de données
- [ ] Rapports et tableaux de bord

### [3.0.0] - Prévu Q2 2025
- [ ] Workflow de validation
- [ ] Notifications automatiques
- [ ] Intégration Power BI
- [ ] Mode hors ligne (si disponible dans SDK)

---

## Format des Versions

- **MAJOR** : Changements incompatibles avec versions précédentes
- **MINOR** : Nouvelles fonctionnalités compatibles
- **PATCH** : Corrections de bugs compatibles

---

**Dernière mise à jour** : 2025-01-15  
**Mainteneur** : Jordan Kamsu (jordan_kamsu@afrilandfirstbank.com)
