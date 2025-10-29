# 📈 Plateforme de Reporting Hebdomadaire DGE

## 🎯 Vue d'ensemble

Application Power Apps développée pour la **Direction Générale de l'Économie (DGE)** permettant la saisie, visualisation et consolidation des rapports d'activité hebdomadaires. 

**Design** : Thème institutionnel DGE avec les couleurs Rouge (#CC0000), Noir (#1A1A1A) et Blanc (#FFFFFF).

## 🏗️ Architecture Technique

- **Frontend** : React 19 + TypeScript + Vite
- **Power Platform** : Power Apps Code SDK
- **Backend** : SharePoint Online (stockage des données)
- **Automatisation** : Power Automate (workflows et notifications)
- **Visualisation** : Power BI (rapports et analyses)
- **Authentification** : Azure AD / Office 365

## 🚀 Fonctionnalités Implémentées

### 📝 Module 1 : Saisie Hebdomadaire
- ✅ Formulaire structuré par rubriques DGE :
  - Crédits classiques
  - Comités de crédit
  - Crédits programmes
  - Autres crédits
  - MEP et classements
  - Activité des prêts non performants
  - Projets, résolutions et activités internes
- ✅ Validation automatique à la soumission
- ✅ Gestion des brouillons
- ✅ Horodatage automatique

### 📊 Module 2 : Rapports & Visualisation
- ✅ Consultation interactive des rapports soumis
- ✅ Filtres avancés (période, division, utilisateur)
- ✅ Statistiques temps réel
- ✅ Export PDF/CSV individuel et consolidé
- ✅ Interface de recherche intuitive

### 📋 Module 3 : Suivi des Soumissions
- ✅ Dashboard de suivi des utilisateurs
- ✅ Indicateurs de complétude par division
- ✅ Taux de soumission en temps réel
- ✅ Système de rappels automatiques
- ✅ Gestion des retardataires
- ✅ Historique des soumissions

### 📈 Module 4 : Consolidation Multi-Période
- ✅ Analyses temporelles des données
- ✅ Comparaisons inter-périodes
- ✅ Métriques consolidées par division
- ✅ Graphiques d'évolution
- ✅ Export programmé pour la direction
- ✅ Integration Power BI

## 🛠️ Installation et Configuration

### Prérequis
```bash
# Outils nécessaires
- Node.js 18+ et npm
- Power Platform CLI (pac)
- Git
- Accès environnement Power Platform DGE
- Visual Studio Code (recommandé)
```

### 1. Initialisation du Projet

#### Option A : Cloner ce Projet Existant
```bash
# Cloner le repository
git clone <url-du-repository>
cd "Reporting DGE/Reporting"

# Installer les dépendances
npm install

# Copier la configuration d'environnement
cp .env.example .env
```

#### Option B : Créer un Nouveau Projet Similaire
```bash
# 1. Créer un nouveau projet Power Apps Code
mkdir "Mon Nouveau Projet"
cd "Mon Nouveau Projet"

# 2. Initialiser avec Power Platform CLI
pac code init -n "Mon Application" -env "VOTRE_ENVIRONMENT_ID"

# 3. Installer les dépendances supplémentaires (déjà incluses dans ce projet)
npm install

# 4. Ajouter React Router (optionnel)
npm install react-router-dom @types/react-router-dom

# 5. Copier la structure des fichiers depuis ce projet
# - src/components/
# - src/services/
# - src/types/
# - src/App.css (thème DGE)
```

### 2. Configuration de l'Environnement

```bash
# Créer le fichier .env avec vos paramètres
cat > .env << 'EOF'
# SharePoint Configuration
VITE_SHAREPOINT_SITE_URL=https://votre-tenant.sharepoint.com/sites/VotreProjet
VITE_SHAREPOINT_LIST_NAME=VosRapports
VITE_SHAREPOINT_LIBRARY_NAME=VosDocuments

# Power Automate Flow URLs
VITE_EXPORT_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx
VITE_REMINDER_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx
VITE_VALIDATION_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx

# Power BI Configuration
VITE_POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_POWERBI_REPORT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Application
VITE_APP_TITLE=Mon Application
VITE_ENVIRONMENT=development
EOF
```

## 🚀 Commandes de Développement

### Développement Local
```bash
# Lancer en mode développement
npm run dev
# L'application sera disponible sur http://localhost:5173/

# Build de l'application
npm run build

# Aperçu du build de production
npm run preview

# Linting du code
npm run lint
```

### Power Platform - Gestion des Sources de Données

```bash
# Ajouter SharePoint Online
pac code add-data-source -a "shared_sharepointonline" -c "VOTRE_SHAREPOINT_CONNECTION_ID"

# Ajouter Office 365 Users
pac code add-data-source -a "shared_office365users" -c "VOTRE_OFFICE365_CONNECTION_ID"

# Ajouter SQL Server (si nécessaire)
pac code add-data-source -a "shared_sql" -c "VOTRE_SQL_CONNECTION_ID" -t "[dbo].[VotreTable]" -d "votre-serveur.database.windows.net,votre-db"

# Lister les sources de données disponibles
pac connector list

# Voir les connexions existantes
pac connection list
```

### Power Platform - Déploiement

```bash
# Build et Push vers Power Platform
npm run build
pac code push

# Vérifier le statut de l'app
pac application list

# Publier l'application
pac application publish --application-id "VOTRE_APP_ID"
```

## 📁 Structure Détaillée du Projet

```
Reporting DGE/Reporting/
├── .env.example                 # Template de configuration
├── .gitignore                   # Fichiers à ignorer
├── DEPLOYMENT_GUIDE.md          # Guide de déploiement
├── README_DGE.md               # Cette documentation
├── eslint.config.js            # Configuration ESLint
├── index.html                  # Point d'entrée HTML
├── package.json                # Dépendances et scripts
├── power.config.json           # Configuration Power Apps
├── tsconfig.json               # Configuration TypeScript
├── vite.config.ts             # Configuration Vite
├── public/                    # Assets statiques
├── dist/                      # Build de production
└── src/
    ├── main.tsx               # Point d'entrée React
    ├── App.tsx                # Composant principal
    ├── App.css                # Thème DGE (Rouge, Noir, Blanc)
    ├── index.css              # Styles globaux
    ├── PowerProvider.tsx      # Provider Power Platform
    ├── components/            # Composants React
    │   ├── Header.tsx         # En-tête et navigation
    │   ├── WeeklyReportForm.tsx    # Formulaire de saisie
    │   ├── ReportsView.tsx         # Visualisation des rapports
    │   ├── SubmissionTracking.tsx  # Suivi des soumissions
    │   └── ConsolidationView.tsx   # Consolidation multi-période
    ├── services/              # Services d'intégration
    │   └── PowerPlatformService.ts # API SharePoint/Power Automate
    ├── types/                 # Types TypeScript
    │   └── index.ts           # Interfaces et types
    └── assets/                # Images et assets
```

## 🎨 Thème et Design DGE

### Palette de Couleurs
```css
/* Variables CSS définies dans App.css */
:root {
  --dge-red: #CC0000;           /* Rouge principal DGE */
  --dge-dark-red: #990000;      /* Rouge foncé (hover) */
  --dge-light-red: #FF3333;     /* Rouge clair (accents) */
  --dge-black: #1A1A1A;        /* Noir principal */
  --dge-dark-gray: #333333;     /* Gris foncé */
  --dge-light-gray: #F5F5F5;    /* Gris clair (fond) */
  --dge-white: #FFFFFF;         /* Blanc */
  --dge-border: #E0E0E0;        /* Bordures */
  --dge-shadow: rgba(0, 0, 0, 0.1); /* Ombres */
}
```

### Classes CSS Principales
```css
/* Boutons */
.btn-primary          /* Bouton principal rouge */
.btn-secondary        /* Bouton secondaire gris */
.btn-outline          /* Bouton contour rouge */

/* Cartes et conteneurs */
.card                /* Carte avec bordure rouge à gauche */
.content-section     /* Section de contenu principale */

/* Navigation */
.nav-tab             /* Onglet de navigation */
.nav-tab.active      /* Onglet actif */

/* Formulaires */
.form-input          /* Champ de saisie */
.form-select         /* Liste déroulante */
.form-textarea       /* Zone de texte */

/* Statuts et indicateurs */
.status-submitted    /* Statut soumis (vert) */
.status-pending      /* Statut en attente (orange) */
.status-missing      /* Statut manquant (rouge) */
```

## 🔗 Intégrations Power Platform

### SharePoint Online
```javascript
// Structure des listes SharePoint à créer
const sharePointLists = {
  "ReportsHebdomadaires": {
    columns: [
      "Title", "UserId", "Week", "SubmissionDate", "Status",
      "CreditsClassiques", "ComitesCredit", "CreditsProgrammes",
      "AutresCredits", "MepClassements", "ActiviteNonPerformants",
      "ProjetsInternes", "Observations"
    ]
  },
  "UsersTracking": {
    columns: [
      "Title", "Email", "Division", "Role", "LastSubmission", "Status"
    ]
  }
};
```

### Power Automate - Flows à Créer

#### 1. Flow Export de Rapports
```json
{
  "displayName": "DGE-Export-Rapports",
  "trigger": {
    "type": "manual",
    "inputs": {
      "reportIds": "array",
      "format": "string",
      "period": "object"
    }
  },
  "actions": [
    "Get SharePoint items",
    "Create PDF/CSV document",
    "Send email with attachment"
  ]
}
```

#### 2. Flow Rappels Automatiques
```json
{
  "displayName": "DGE-Rappels-Hebdomadaires",
  "trigger": {
    "type": "recurrence",
    "schedule": "every Friday at 4:00 PM"
  },
  "actions": [
    "Get users without submission",
    "Send reminder emails",
    "Log reminder activity"
  ]
}
```

### Power BI - Configuration

```javascript
// Configuration Power BI Embedded
const powerBIConfig = {
  workspaceId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  reportId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  datasetId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  embedUrl: "https://app.powerbi.com/reportEmbed",
  accessToken: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6..."
};
```

## 🔧 Création d'un Nouveau Projet Similaire

### 1. Initialisation Complète

```bash
# Créer le dossier du projet
mkdir "Mon Nouveau Projet DGE"
cd "Mon Nouveau Projet DGE"

# Initialiser avec Power Platform CLI
pac code init -n "Mon Application DGE" -env "VOTRE_ENVIRONMENT_ID"

# Installer les dépendances supplémentaires
npm install @types/react @types/react-dom

# Créer la structure de dossiers
mkdir -p src/components src/services src/types
```

### 2. Copier les Fichiers de Base

```bash
# Copier le thème DGE
cp ../Reporting/src/App.css ./src/

# Copier les types
cp ../Reporting/src/types/index.ts ./src/types/

# Copier le service Power Platform
cp ../Reporting/src/services/PowerPlatformService.ts ./src/services/

# Copier la configuration d'environnement
cp ../Reporting/.env.example ./
```

### 3. Adapter les Composants

```bash
# Créer les composants de base
touch src/components/Header.tsx
touch src/components/MainForm.tsx
touch src/components/DataView.tsx
touch src/components/Dashboard.tsx
```

### 4. Configuration Personnalisée

```typescript
// Modifier src/App.tsx pour votre use case
import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import MainForm from './components/MainForm'
// ... autres imports selon vos besoins

function App() {
  const [activeModule, setActiveModule] = useState('form')
  
  // Votre logique spécifique
  
  return (
    <div className="app-container">
      <Header activeTab={activeModule} onTabChange={setActiveModule} />
      {/* Vos modules spécifiques */}
    </div>
  )
}
```

## 🔐 Configuration Sécurité

### Permissions SharePoint
```powershell
# PowerShell pour configurer les permissions
Connect-PnPOnline -Url "https://votre-tenant.sharepoint.com/sites/VotreProjet"

# Créer les groupes de permissions
New-PnPGroup -Title "Collaborateurs_App" -Description "Utilisateurs standard"
New-PnPGroup -Title "Managers_App" -Description "Responsables"
New-PnPGroup -Title "Admins_App" -Description "Administrateurs"

# Assigner les permissions
Set-PnPGroupPermissions -Identity "Collaborateurs_App" -AddRole "Contribute"
Set-PnPGroupPermissions -Identity "Managers_App" -AddRole "Design"
Set-PnPGroupPermissions -Identity "Admins_App" -AddRole "Full Control"
```

### Groupes Azure AD
```bash
# Commandes Azure CLI pour créer les groupes
az ad group create --display-name "DGE_Collaborateurs" --mail-nickname "DGECollaborateurs"
az ad group create --display-name "DGE_Managers" --mail-nickname "DGEManagers"
az ad group create --display-name "DGE_Admins" --mail-nickname "DGEAdmins"
```

## 📊 Monitoring et Maintenance

### Scripts de Maintenance
```bash
# Script de sauvegarde des données
#!/bin/bash
echo "Sauvegarde des données SharePoint..."
pac data export --environment "VOTRE_ENV_ID" --output "./backup/$(date +%Y%m%d)"

# Script de nettoyage des logs
echo "Nettoyage des anciens logs..."
find ./logs -type f -mtime +30 -delete

# Script de vérification santé
echo "Vérification de la santé de l'application..."
npm run build
pac application list --environment "VOTRE_ENV_ID"
```

### Logs et Monitoring
```javascript
// Service de logging personnalisé
class LoggingService {
  static logUserAction(action, userId, details) {
    console.log(`[${new Date().toISOString()}] ${action} by ${userId}:`, details);
    
    // Envoyer vers Application Insights ou autre
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({ action, userId, details, timestamp: new Date() })
    });
  }
}
```

## 🚀 Commandes de Déploiement Complètes

### Développement vers Test
```bash
# 1. Valider le code
npm run lint
npm run build

# 2. Tests (si configurés)
npm test

# 3. Push vers environnement de test
pac code push --environment "TEST_ENV_ID"

# 4. Valider le déploiement
pac application list --environment "TEST_ENV_ID"
```

### Test vers Production
```bash
# 1. Backup de la production actuelle
pac solution export --name "VotreApp" --path "./backup/prod-backup.zip"

# 2. Push vers production
pac code push --environment "PROD_ENV_ID"

# 3. Tests post-déploiement
curl -f "https://votre-app.powerapps.com/health" || echo "ERREUR: App non accessible"

# 4. Notification équipe
echo "Déploiement terminé à $(date)" | mail -s "Déploiement Production" equipe@votre-org.com
```

## 📞 Support et Documentation

### Ressources Utiles
- 📚 [Documentation Power Apps Code](https://docs.microsoft.com/power-apps/developer/code-components/)
- 🛠️ [Power Platform CLI](https://docs.microsoft.com/power-platform/developer/cli/introduction)
- ⚛️ [React Documentation](https://react.dev/)
- 📘 [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Contacts Support
- **Équipe DGE** : support.reporting@dge.gouv.fr
- **DRI Technique** : dri@votre-org.com
- **Documentation** : [Wiki interne]

## 📄 Licence et Copyright

© 2025 Direction Générale de l'Économie (DGE)  
Usage interne uniquement - Tous droits réservés

---

## 🎉 Résumé des Commandes Principales

```bash
# CRÉATION D'UN NOUVEAU PROJET
mkdir "Mon Projet" && cd "Mon Projet"
pac code init -n "Mon App" -env "ENV_ID"
npm install

# AJOUT DES SOURCES DE DONNÉES
pac code add-data-source -a "shared_sharepointonline" -c "CONNEXION_ID"
pac code add-data-source -a "shared_office365users" -c "CONNEXION_ID"

# DÉVELOPPEMENT
npm run dev          # Développement local
npm run build        # Build production
npm run lint         # Validation code

# DÉPLOIEMENT
pac code push        # Push vers Power Platform
pac application publish --application-id "APP_ID"

# MAINTENANCE
pac solution export --name "MonApp" --path "./backup.zip"
pac connection list  # Lister les connexions
pac application list # Lister les applications
```

**✨ Votre application DGE est maintenant documentée et reproductible ! ✨**