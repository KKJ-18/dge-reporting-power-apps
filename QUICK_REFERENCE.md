# 🚀 Guide de Référence Rapide - Power Apps DGE

## ⚡ Commandes Essentielles

### 📦 Créer un Nouveau Projet
```bash
# 1. Créer le dossier et initialiser
mkdir "Mon Nouveau Projet DGE"
cd "Mon Nouveau Projet DGE"
pac code init -n "Mon Application DGE" -env "VOTRE_ENVIRONMENT_ID"

# 2. Installer les dépendances
npm install

# 3. Copier la configuration
cp .env.example .env
# Éditer .env avec vos paramètres
```

### 🔗 Ajouter les Sources de Données
```bash
# SharePoint
pac code add-data-source -a "shared_sharepointonline" -c "VOTRE_SHAREPOINT_CONNECTION_ID"

# Office 365 Users
pac code add-data-source -a "shared_office365users" -c "VOTRE_OFFICE365_CONNECTION_ID"

# SQL Server (optionnel)
pac code add-data-source -a "shared_sql" -c "VOTRE_SQL_CONNECTION_ID" -t "[dbo].[Table]" -d "serveur.database.windows.net,db"
```

### 🛠️ Développement
```bash
# Développement local
npm run dev

# Build de production
npm run build

# Vérification du code
npm run lint
```

### 🚀 Déploiement
```bash
# Build et push vers Power Platform
npm run build
pac code push

# Publier l'application
pac application publish --application-id "VOTRE_APP_ID"
```

### 🔍 Commandes Utiles
```bash
# Lister les environnements
pac environment list

# Lister les connexions
pac connection list

# Lister les applications  
pac application list

# Exporter une solution
pac solution export --name "VotreApp" --path "./backup.zip"

# Voir les connecteurs disponibles
pac connector list
```

## 📁 Structure de Fichiers à Copier

Pour reproduire ce projet, copiez ces fichiers depuis le projet DGE :

### CSS et Thème
```
src/App.css                    # Thème DGE (rouge, noir, blanc)
```

### Types TypeScript
```
src/types/index.ts             # Interfaces et types
```

### Services
```
src/services/PowerPlatformService.ts    # Service d'intégration Power Platform
```

### Composants (optionnel - adaptez selon vos besoins)
```
src/components/Header.tsx              # En-tête avec navigation
src/components/WeeklyReportForm.tsx    # Formulaire de saisie
src/components/ReportsView.tsx         # Vue des rapports
src/components/SubmissionTracking.tsx  # Suivi des soumissions
src/components/ConsolidationView.tsx   # Consolidation des données
```

### Configuration
```
.env.example                   # Template de configuration
power.config.json             # Configuration Power Apps (généré automatiquement)
```

## ⚙️ Variables d'Environnement (.env)

```bash
# SharePoint
VITE_SHAREPOINT_SITE_URL=https://votre-tenant.sharepoint.com/sites/VotreProjet
VITE_SHAREPOINT_LIST_NAME=VosRapports

# Power Automate
VITE_EXPORT_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx
VITE_REMINDER_FLOW_URL=https://prod-xx.westeurope.logic.azure.com:443/workflows/xxxxx

# Power BI
VITE_POWERBI_WORKSPACE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_POWERBI_REPORT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# App
VITE_APP_TITLE=Mon Application
VITE_ENVIRONMENT=development
```

## 🎨 CSS Variables DGE

```css
:root {
  --dge-red: #CC0000;           /* Rouge principal */
  --dge-dark-red: #990000;      /* Rouge foncé */
  --dge-black: #1A1A1A;        /* Noir */
  --dge-white: #FFFFFF;         /* Blanc */
  --dge-light-gray: #F5F5F5;    /* Fond clair */
}
```

## 🔄 Workflow Complet

```bash
# 1. INITIALISATION
mkdir "Mon Projet" && cd "Mon Projet"
pac code init -n "Mon App" -env "ENV_ID"
npm install

# 2. CONFIGURATION
cp .env.example .env
# Éditer .env avec vos paramètres

# 3. COPIER LES FICHIERS DU PROJET DGE
cp ../Reporting/src/App.css ./src/
cp ../Reporting/src/types/index.ts ./src/types/
cp ../Reporting/src/services/PowerPlatformService.ts ./src/services/

# 4. SOURCES DE DONNÉES
pac code add-data-source -a "shared_sharepointonline" -c "CONNEXION_ID"
pac code add-data-source -a "shared_office365users" -c "CONNEXION_ID"

# 5. DÉVELOPPEMENT
npm run dev

# 6. DÉPLOIEMENT
npm run build
pac code push
```

## 🆘 Dépannage Rapide

### Erreurs Courantes
```bash
# Port déjà utilisé
npm run dev -- --port 5175

# Problème de build
rm -rf node_modules dist
npm install
npm run build

# Problème de connexion Power Platform
pac auth clear
pac auth create --environment "VOTRE_ENV_ID"

# Problème de TypeScript
npm run lint --fix
```

### Commandes de Debug
```bash
# Vérifier l'environnement
pac environment show --environment "VOTRE_ENV_ID"

# Vérifier l'app
pac application show --application-id "VOTRE_APP_ID"

# Logs de déploiement
pac code push --verbose
```

---

## 📋 Checklist de Déploiement

- [ ] Environnement Power Platform accessible
- [ ] Connexions SharePoint et Office 365 créées
- [ ] Variables d'environnement configurées
- [ ] Application buildée sans erreurs
- [ ] Tests fonctionnels passés
- [ ] Push vers Power Platform réussi
- [ ] Application publiée et accessible

**✅ Votre projet Power Apps DGE est prêt !**