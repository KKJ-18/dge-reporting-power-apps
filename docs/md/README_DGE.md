# 📈 Plateforme de Reporting Hebdomadaire DGE

## Vue d'ensemble

Application Power Apps développée pour la Direction Générale de l'Économie (DGE) permettant la saisie, visualisation et consolidation des rapports d'activité hebdomadaires. L'application utilise les couleurs institutionnelles rouge, noir et blanc de la DGE.

## 🏗️ Architecture

- **Frontend**: React + TypeScript avec Power Apps Code SDK
- **Backend**: SharePoint Online pour le stockage des données
- **Automatisation**: Power Automate pour les workflows
- **Visualisation**: Power BI pour les rapports et analyses
- **Design**: Thème DGE (Rouge #CC0000, Noir #1A1A1A, Blanc #FFFFFF)

## 🚀 Fonctionnalités

### 📝 Saisie Hebdomadaire
- Formulaire structuré par rubriques (Crédits classiques, Comités de crédit, etc.)
- Validation automatique et sauvegarde
- Gestion des brouillons et versions

### 📊 Rapports & Visualisation
- Consultation interactive des rapports soumis
- Filtrage par période, division, utilisateur
- Export PDF/CSV individuel et consolidé

### 📋 Suivi des Soumissions
- Dashboard de suivi des utilisateurs
- Indicateurs de complétude par division
- Système de rappels automatiques

### 📈 Consolidation Multi-Période
- Analyses temporelles et comparaisons
- Métriques consolidées par division
- Export programmé pour la direction

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+ et npm
- Power Platform CLI (`pac`)
- Accès à l'environnement Power Platform DGE

### 1. Cloner et installer
```bash
git clone <repository-url>
cd "Reporting DGE/Reporting"
npm install
```

### 2. Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Configurer les variables d'environnement
# Modifier .env avec vos URLs SharePoint et Power Automate
```

### 3. Variables d'environnement (.env)
```bash
# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=https://votre-tenant.sharepoint.com/sites/DGEReporting
VITE_SHAREPOINT_LIST_NAME=ReportsHebdomadaires

# Power Automate Flow URLs
VITE_EXPORT_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx
VITE_REMINDER_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx
VITE_VALIDATION_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx

# Power BI Configuration
VITE_POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_POWERBI_REPORT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🚀 Déploiement Power Platform

### Étape 1: Initialiser l'application
```bash
# L'application est déjà initialisée avec:
pac code init -n "Reporting Activités DGE" -env "e78a17af-caf0-e888-989b-beca000173f8"
```

### Étape 2: Ajouter les sources de données
```bash
# SharePoint Lists (à configurer selon votre environnement)
pac code add-data-source -a "shared_sharepointonline" -c "YOUR_SHAREPOINT_CONNECTION_ID"

# Office 365 Users (pour l'authentification)
pac code add-data-source -a "shared_office365users" -c "YOUR_OFFICE365_CONNECTION_ID"
```

### Étape 3: Build et déploiement
```bash
# Build de l'application
npm run build

# Push vers Power Platform
pac code push
```

## 🏃‍♂️ Développement Local

```bash
# Lancer en mode développement
npm run dev

# L'application sera disponible sur http://localhost:5173/
```

## 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── Header.tsx       # En-tête et navigation
│   ├── WeeklyReportForm.tsx    # Formulaire de saisie
│   ├── ReportsView.tsx         # Visualisation des rapports
│   ├── SubmissionTracking.tsx  # Suivi des soumissions
│   └── ConsolidationView.tsx   # Consolidation multi-période
├── services/            # Services d'intégration
│   └── PowerPlatformService.ts # Connexions SharePoint/Power Automate
├── types/              # Types TypeScript
│   └── index.ts        # Définitions des interfaces
├── App.tsx            # Composant principal
├── App.css           # Thème DGE (rouge, noir, blanc)
└── main.tsx          # Point d'entrée
```

## 🎨 Thème DGE

L'application respecte la charte graphique DGE avec:

- **Rouge primaire**: #CC0000 (boutons principaux, accents)
- **Rouge sombre**: #990000 (hover states)
- **Noir**: #1A1A1A (textes, éléments sombres)
- **Gris foncé**: #333333 (textes secondaires)
- **Blanc**: #FFFFFF (arrière-plans)
- **Gris clair**: #F5F5F5 (arrière-plan principal)

## 🔗 Intégrations Power Platform

### SharePoint Online
- **Liste**: ReportsHebdomadaires (stockage des rapports)
- **Bibliothèque**: DocumentsReporting (archivage)
- **Permissions**: Basé sur les groupes AD DGE

### Power Automate
- **Export Flow**: Génération PDF/CSV des rapports
- **Reminder Flow**: Envoi automatique de rappels
- **Validation Flow**: Validation et horodatage des soumissions

### Power BI
- **Dataset**: Données consolidées des rapports
- **Reports**: Dashboards de visualisation
- **Embedding**: Intégration dans l'interface

## 👥 Gestion des Accès

### Rôles utilisateur
- **Collaborateur**: Saisie de ses propres rapports
- **Chef de Division**: Consultation des rapports de sa division
- **Direction DGE**: Accès complet, rapports consolidés
- **Administrateur**: Gestion système et configuration

### Sécurité
- Authentification Azure AD
- Permissions SharePoint par groupes
- Audit trail complet des actions

## 📈 Métriques et Suivi

### KPIs suivis
- Taux de complétude hebdomadaire
- Délais de soumission par division
- Volume d'activités par rubrique
- Évolution temporelle des métriques

### Rapports automatiques
- Rapport hebdomadaire consolidé (PDF)
- Dashboard Power BI temps réel
- Alertes pour les retards de soumission
- Export mensuel pour la direction

## 🛠️ Maintenance

### Logs et monitoring
- Logs Power Automate pour les workflows
- Métriques Power Apps usage
- Audit SharePoint pour les accès données

### Support utilisateur
- Documentation intégrée dans l'app
- Support DRI pour les aspects techniques
- Formation équipes DGE sur l'utilisation

## 📞 Support

**Équipe DGE - Support Technique**
- Email: support.reporting@dge.gouv.fr
- Documentation: [Lien vers la documentation interne]

## 📄 Licence

© 2025 Direction Générale de l'Économie (DGE) - Usage interne uniquement