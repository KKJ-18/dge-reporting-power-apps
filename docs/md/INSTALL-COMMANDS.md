# 📦 Commandes d'Installation et Déploiement

Ce document liste toutes les commandes nécessaires pour installer et déployer l'application DGE Reporting.

---

## 🆕 Installation Initiale (Nouveau PC)

### 1️⃣ Prérequis à Installer

```powershell
# Vérifier Node.js (≥ 18)
node --version

# Si non installé, télécharger depuis https://nodejs.org/
# Ou via winget
winget install OpenJS.NodeJS.LTS

# Vérifier npm (≥ 9)
npm --version

# Vérifier Git (≥ 2.30)
git --version

# Si non installé
winget install Git.Git

# Installer Power Platform CLI (≥ 1.30)
winget install Microsoft.PowerPlatformCLI
# OU
pac install latest

# Vérifier l'installation
pac
```

### 2️⃣ Cloner le Projet

```powershell
# Cloner depuis GitHub (après publication)
git clone https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git

# Ou cloner depuis Azure DevOps (si utilisé)
git clone https://dev.azure.com/AfrilandFirstBank/DGE/_git/dge-reporting-power-apps

# Se placer dans le répertoire
cd dge-reporting-power-apps
```

### 3️⃣ Installer les Dépendances

```powershell
# Installer les packages npm
npm install

# Vérifier qu'il n'y a pas d'erreurs
npm list
```

### 4️⃣ Configurer Power Platform

```powershell
# S'authentifier (Browser interactif)
pac auth create --environment e78a17af-caf0-e888-989b-beca000173f8

# Vérifier la connexion
pac auth list

# Sélectionner l'environnement (si plusieurs)
pac auth select --environment e78a17af-caf0-e888-989b-beca000173f8
```

### 5️⃣ Configurer SharePoint (CRITIQUE)

⚠️ **Étape manuelle SharePoint obligatoire** :

1. Aller sur SharePoint : https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity
2. Ouvrir la liste **Activity**
3. Cliquer sur **⚙️ Settings** → **List settings**
4. Cliquer sur **Create column**
5. Créer la colonne **NomRubrique** :
   - Name : `NomRubrique`
   - Type : **Single line of text**
   - Max length : 255
   - Required : Yes
6. Cliquer sur **OK**

📖 Documentation détaillée : [docs/SharePoint-Configuration-CategorieNom.md](docs/SharePoint-Configuration-CategorieNom.md)

### 6️⃣ Régénérer les Modèles (Après Config SharePoint)

```powershell
# Régénérer les modèles TypeScript
pac code add-data-source -a "sharepointonline" -c "1ecbbdd1bf484e2283fd2e26f79abfa4" -t "Activity" -d "https://afrilandfirstbankcmr.sharepoint.com/sites/DGEReportingActivity"

# Vérifier que src/Models/ActivityModel.ts contient NomRubrique
```

---

## 🚀 Développement Local

### Lancer le Serveur de Développement

```powershell
# Démarrer le dev server (avec Hot Reload)
npm run dev

# L'application s'ouvre automatiquement sur http://localhost:5173
```

### Vérifier les Erreurs TypeScript

```powershell
# Compiler sans build (vérification syntaxe)
npx tsc --noEmit

# Ou utiliser le script npm
npm run type-check
```

### Linter (Future - Pas encore configuré)

```powershell
# Installer ESLint (optionnel)
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Lancer le linter
npm run lint

# Auto-fix
npm run lint:fix
```

---

## 🏗️ Build Production

### Build Optimisé

```powershell
# Compiler le projet pour production
npm run build

# Les fichiers compilés sont dans dist/
# Vérifier dist/index.html, dist/assets/
```

### Preview du Build

```powershell
# Tester le build localement
npm run preview

# Ouvre http://localhost:4173
```

---

## 📤 Déploiement vers Power Apps

### Déploiement Complet

```powershell
# Build + Push vers Power Apps
npm run build
pac code push

# OU en une seule commande (script npm à créer)
npm run deploy
```

### Déploiement Rapide (Dev)

```powershell
# Push sans rebuild complet (plus rapide)
pac code push --skip-build
```

### Vérifier le Déploiement

```powershell
# Lister les versions déployées
pac canvas list

# Récupérer les infos de l'app
pac canvas get --app-id f2efbd49-a1d4-4236-ba66-a3b223964848
```

---

## 🔄 Workflow Complet (Quotidien)

### Morning Workflow

```powershell
# 1. Récupérer les dernières modifications
git pull origin main

# 2. Installer les nouvelles dépendances (si package.json changé)
npm install

# 3. Lancer le dev server
npm run dev

# 4. Développer...
```

### Evening Workflow

```powershell
# 1. Vérifier les erreurs
npx tsc --noEmit

# 2. Commit
git add .
git commit -m "feat: ajout de ma fonctionnalité"

# 3. Push
git push origin feature/ma-branche

# 4. Build et déployer (si prêt pour test)
npm run build
pac code push
```

---

## 🔧 Maintenance et Mises à Jour

### Mettre à Jour les Dépendances

```powershell
# Vérifier les packages obsolètes
npm outdated

# Mettre à jour tous les packages mineurs
npm update

# Mettre à jour un package spécifique
npm install @pa-client/power-code-sdk@latest

# Mettre à jour React (ATTENTION : vérifier breaking changes)
npm install react@latest react-dom@latest
```

### Mettre à Jour Power Platform CLI

```powershell
# Via winget
winget upgrade Microsoft.PowerPlatformCLI

# Ou via pac
pac install latest

# Vérifier la version
pac --version
```

### Nettoyer le Projet

```powershell
# Supprimer node_modules et package-lock
Remove-Item -Recurse -Force node_modules, package-lock.json

# Réinstaller proprement
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer dist/
Remove-Item -Recurse -Force dist
```

---

## 🐛 Dépannage

### Problème : "Module not found"

```powershell
# Solution 1 : Réinstaller les dépendances
Remove-Item -Recurse -Force node_modules
npm install

# Solution 2 : Vérifier package.json
npm list <nom-du-package>
```

### Problème : "PAC auth failed"

```powershell
# Supprimer les auth existantes
pac auth clear

# Recréer l'auth
pac auth create --environment e78a17af-caf0-e888-989b-beca000173f8

# Vérifier
pac auth list
```

### Problème : "Build failed"

```powershell
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Nettoyer et rebuild
Remove-Item -Recurse -Force dist
npm run build
```

### Problème : "IdRubrique#Id not found" (Erreur 400)

📖 **Solution complète** : [docs/WORKAROUND-Lookup-Not-Supported.md](docs/WORKAROUND-Lookup-Not-Supported.md)

**Résumé** :
1. Les champs **Lookup ne sont PAS supportés** par le SDK (limitation officielle)
2. Utiliser **NomRubrique** (Text) au lieu de **IdRubrique** (Lookup)
3. Configurer la colonne SharePoint (voir section 5️⃣ ci-dessus)
4. Régénérer les modèles avec `pac code add-data-source`

---

## 📊 Commandes Utiles

### Git

```powershell
# Voir le statut
git status

# Voir l'historique
git log --oneline --graph --all

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Fusionner une branche
git checkout main
git merge feature/ma-branche

# Voir les différences
git diff
```

### NPM

```powershell
# Voir les scripts disponibles
npm run

# Voir les packages installés
npm list --depth=0

# Voir les packages globaux
npm list -g --depth=0

# Installer un package global
npm install -g <package>
```

### Power Platform CLI

```powershell
# Aide générale
pac --help

# Aide spécifique à une commande
pac code --help
pac auth --help

# Lister les environnements
pac env list

# Lister les apps
pac canvas list
```

---

## 🎯 Quick Reference (Commandes les Plus Utilisées)

```powershell
# Installation initiale
git clone <url> && cd dge-reporting-power-apps && npm install

# Authentification Power Platform
pac auth create --environment e78a17af-caf0-e888-989b-beca000173f8

# Développement
npm run dev

# Build production
npm run build

# Déploiement
pac code push

# Pull des modifications
git pull origin main

# Commit et push
git add . && git commit -m "feat: mon changement" && git push
```

---

**Dernière mise à jour** : 2025-01-15  
**Mainteneur** : Jordan Kamsu (jordan_kamsu@afrilandfirstbank.com)
