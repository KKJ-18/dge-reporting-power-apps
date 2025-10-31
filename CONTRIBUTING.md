# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer au projet DGE Reporting !

## 📋 Processus de Contribution

### 1. Fork & Clone

```powershell
# Fork le repo sur GitHub, puis :
git clone https://github.com/VOTRE_USERNAME/dge-reporting.git
cd dge-reporting
```

### 2. Créer une Branche

```powershell
git checkout -b feature/ma-nouvelle-fonctionnalite
# ou
git checkout -b fix/correction-bug
```

### 3. Développer

```powershell
# Installer les dépendances
npm install

# Lancer le dev server
npm run dev

# Faire vos modifications...
```

### 4. Commits

Utiliser le format **Conventional Commits** :

```powershell
git add .
git commit -m "feat: ajout export PDF pour les rapports"
git commit -m "fix: correction calcul délais moyens"
git commit -m "docs: mise à jour README"
```

**Préfixes** :
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage (sans changement de code)
- `refactor`: Refactoring
- `test`: Ajout de tests
- `chore`: Maintenance

### 5. Push & Pull Request

```powershell
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis créer une Pull Request sur GitHub avec :
- **Titre clair** décrivant le changement
- **Description** détaillée
- **Screenshots** si changements UI
- **Tests effectués**

## 🎨 Standards de Code

### TypeScript

```typescript
// ✅ Bon
interface User {
  id: number;
  name: string;
  email: string;
}

const getUserName = (user: User): string => {
  return user.name;
};

// ❌ Mauvais
const getUserName = (user: any) => {
  return user.name;
};
```

### React Components

```typescript
// ✅ Bon - Functional Component avec TypeScript
import React, { useState } from 'react';

interface Props {
  title: string;
  onClose: () => void;
}

const MyComponent: React.FC<Props> = ({ title, onClose }) => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default MyComponent;
```

### Naming Conventions

- **Fichiers** : PascalCase pour composants (`UserProfile.tsx`)
- **Variables** : camelCase (`userName`, `isActive`)
- **Constantes** : UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces** : PascalCase (`UserProfile`, `ActivityModel`)
- **Types** : PascalCase avec suffixe `Type` si nécessaire

### Formatage

```powershell
# Linter (à venir)
npm run lint

# Auto-fix
npm run lint:fix
```

## 📁 Structure des Fichiers

```
src/
├── components/
│   ├── shared/          # Composants réutilisables
│   ├── forms/           # Formulaires métier
│   └── [Component].tsx  # Un composant = un fichier
├── services/            # Services API
├── Models/              # Interfaces TypeScript
├── utils/               # Fonctions utilitaires
└── hooks/               # Custom React Hooks (à créer)
```

## 🧪 Tests (À venir)

```powershell
# Lancer les tests
npm run test

# Coverage
npm run test:coverage
```

## 📝 Documentation

- **Code** : Commenter les fonctions complexes
- **README** : Mettre à jour si changements majeurs
- **CHANGELOG** : Documenter les changements

### Exemple de Documentation

```typescript
/**
 * Calcule le délai moyen de traitement des dossiers
 * @param dossiers - Liste des dossiers à analyser
 * @param startDate - Date de début de période
 * @param endDate - Date de fin de période
 * @returns Délai moyen en jours
 */
const calculateAverageDelay = (
  dossiers: Dossier[],
  startDate: Date,
  endDate: Date
): number => {
  // Implementation...
};
```

## 🚫 Ce qu'il NE faut PAS faire

- ❌ Commiter des secrets/mots de passe
- ❌ Commiter `node_modules/`
- ❌ Ignorer les erreurs TypeScript
- ❌ Utiliser `any` sans raison valable
- ❌ Créer des composants > 300 lignes
- ❌ Modifier directement la branche `main`

## ✅ Checklist Avant PR

- [ ] Code compile sans erreurs (`npm run build`)
- [ ] Pas d'erreurs TypeScript
- [ ] Tests passent (quand disponibles)
- [ ] Documentation mise à jour
- [ ] Commits suivent Conventional Commits
- [ ] Testé en local (`npm run dev`)
- [ ] Testé le build (`npm run build`)

## 🔍 Review Process

1. **Automatic Checks** : Build, Lint, Tests
2. **Code Review** : Au moins 1 approbation
3. **Testing** : Vérification fonctionnelle
4. **Merge** : Squash and merge

## 📞 Questions ?

- **Email** : jordan_kamsu@afrilandfirstbank.com
- **Teams** : DGE - Afriland First Bank

---

**Merci de contribuer ! 🎉**
