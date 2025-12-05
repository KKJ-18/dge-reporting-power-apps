# 🚀 Instructions de Publication sur GitHub

Ce guide explique comment publier ce projet sur GitHub pour la première fois.

## ✅ Étape 1 : Vérifier que Git est Configuré

```powershell
# Vérifier la configuration Git
git config --global user.name
git config --global user.email

# Si non configuré, définir vos informations
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@afrilandfirstbank.com"
```

## ✅ Étape 2 : Créer un Dépôt sur GitHub

### Option A : Via l'Interface Web (Recommandé)

1. Aller sur [github.com](https://github.com)
2. Se connecter avec le compte de votre organisation
3. Cliquer sur **"New repository"** (bouton vert en haut à droite)
4. Remplir les informations :
   - **Repository name** : `dge-reporting-power-apps`
   - **Description** : `Application DGE Reporting - Power Apps Code SDK - React + TypeScript`
   - **Visibility** : 
     - ✅ **Private** (Recommandé pour code interne)
     - ❌ Public (Ne PAS utiliser - code propriétaire)
   - **Initialize** :
     - ❌ Ne PAS cocher "Add a README file" (on a déjà un README)
     - ❌ Ne PAS ajouter .gitignore (on en a déjà un)
     - ❌ Ne PAS choisir de licence (on a déjà LICENSE)
5. Cliquer sur **"Create repository"**
6. **COPIER L'URL** qui s'affiche (exemple: `https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git`)

### Option B : Via GitHub CLI (Alternatif)

```powershell
# Installer GitHub CLI si nécessaire
winget install --id GitHub.cli

# Se connecter
gh auth login

# Créer le repo directement
gh repo create dge-reporting-power-apps --private --source=. --remote=origin --push
```

## ✅ Étape 3 : Lier le Dépôt Local à GitHub

```powershell
# Se placer dans le répertoire du projet
cd "e:\code\Reporting DGE\Reporting"

# Ajouter le remote GitHub (remplacer <URL> par l'URL copiée)
git remote add origin https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git

# Vérifier que le remote est configuré
git remote -v
```

**Résultat attendu** :
```
origin  https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git (fetch)
origin  https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git (push)
```

## ✅ Étape 4 : Pousser le Code sur GitHub

```powershell
# Renommer la branche en 'main' si nécessaire
git branch -M main

# Pousser le code
git push -u origin main
```

### Si Erreur d'Authentification

```powershell
# Option 1 : Utiliser GitHub CLI
gh auth login

# Option 2 : Utiliser Git Credential Manager
git credential-manager configure
```

## ✅ Étape 5 : Vérifier la Publication

1. Aller sur `https://github.com/AfrilandFirstBank/dge-reporting-power-apps`
2. Vérifier que tous les fichiers sont présents :
   - ✅ `README.md` s'affiche automatiquement
   - ✅ Tous les dossiers (`src/`, `docs/`, `.power/`)
   - ✅ Fichiers de configuration (`package.json`, `vite.config.ts`)
   - ✅ Documentation (`CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE`)

## 📊 Étape 6 : Configurer le Dépôt (Optionnel)

### Ajouter une Description

1. Sur GitHub, cliquer sur l'icône ⚙️ (Settings) du repo
2. Remplir **About** :
   - Description : `Application DGE Reporting - Power Apps Code SDK - React + TypeScript`
   - Website : URL de l'application (si applicable)
   - Topics : `power-apps`, `react`, `typescript`, `sharepoint`, `afriland-first-bank`

### Protéger la Branche Main

1. Aller dans **Settings** → **Branches**
2. Cliquer sur **Add rule**
3. Configurer :
   - Branch name pattern : `main`
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
4. Sauvegarder

### Ajouter des Collaborateurs

1. Aller dans **Settings** → **Collaborators**
2. Cliquer sur **Add people**
3. Entrer les emails des membres de l'équipe
4. Définir les permissions :
   - **Admin** : Peut tout faire
   - **Write** : Peut pousser du code
   - **Read** : Peut seulement voir le code

## 🔄 Workflow de Développement Après Publication

### Récupérer le Projet sur un Autre PC

```powershell
# Cloner le repo
git clone https://github.com/AfrilandFirstBank/dge-reporting-power-apps.git
cd dge-reporting-power-apps

# Installer les dépendances
npm install

# Configurer l'environnement Power Platform
pac auth create --environment e78a17af-caf0-e888-989b-beca000173f8

# Lancer le dev server
npm run dev
```

### Pousser des Modifications

```powershell
# Créer une branche pour vos modifications
git checkout -b feature/ma-nouvelle-fonctionnalite

# Faire vos modifications...

# Commit
git add .
git commit -m "feat: ajout de ma nouvelle fonctionnalité"

# Pousser la branche
git push origin feature/ma-nouvelle-fonctionnalite

# Créer une Pull Request sur GitHub
```

### Récupérer les Modifications des Autres

```powershell
# Mettre à jour la branche main
git checkout main
git pull origin main

# Fusionner dans votre branche de travail
git checkout feature/ma-branche
git merge main
```

## ⚠️ IMPORTANT - Sécurité

### ❌ Ne JAMAIS Commiter

- Mots de passe
- Tokens d'accès
- Clés API
- Informations sensibles clients
- Fichiers `.env` avec secrets

### ✅ Vérifier Avant Chaque Commit

```powershell
# Vérifier les fichiers staged
git status

# Vérifier le contenu des fichiers
git diff --staged

# Si un fichier sensible est staged
git reset HEAD <fichier-sensible>
```

## 📞 Support

**En cas de problème** :
- Email : jordan_kamsu@afrilandfirstbank.com
- Teams : DGE - Afriland First Bank
- Documentation : [docs/](./docs/)

---

## ✅ Checklist de Publication

- [ ] Configuration Git (nom, email)
- [ ] Dépôt GitHub créé (PRIVATE)
- [ ] Remote ajouté (`git remote -v`)
- [ ] Code poussé (`git push -u origin main`)
- [ ] README visible sur GitHub
- [ ] Description et topics configurés
- [ ] Collaborateurs ajoutés
- [ ] Branche main protégée
- [ ] `.gitignore` vérifié (pas de secrets)

---

**Statut Actuel** : ✅ Prêt à publier - Commit créé avec succès

**Dernière vérification** : 2025-01-15
