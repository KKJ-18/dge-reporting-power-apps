# Guide des Couleurs DGE

## 🎨 Palette de couleurs par département

### Département DA (Direction de l'Analyse)
- **Couleur primaire**: `#0078d4` (Bleu Microsoft)
- **Icône**: 📊
- **Usage**:
  - Boutons de soumission
  - En-têtes de dashboard
  - Accents d'interface

```css
/* Exemple d'utilisation */
.da-button {
  background-color: #0078d4;
  color: white;
}
```

---

### Département DSE (Surveillance des Engagements)
- **Couleur primaire**: `#107c10` (Vert Microsoft)
- **Icône**: 🏦
- **Usage**:
  - Boutons de soumission
  - En-têtes de dashboard
  - Accents d'interface

```css
/* Exemple d'utilisation */
.dse-button {
  background-color: #107c10;
  color: white;
}
```

---

### Département DPNP (Prêts Non Performants)
- **Couleur primaire**: `#d83b01` (Orange Microsoft)
- **Icône**: 🏛️
- **Usage**:
  - Boutons de soumission
  - En-têtes de dashboard
  - Accents d'interface

```css
/* Exemple d'utilisation */
.dpnp-button {
  background-color: #d83b01;
  color: white;
}
```

---

## 📐 Guide d'implémentation

### Dans les composants React

```typescript
interface ComponentProps {
  departmentColor?: string;
}

const MyComponent: React.FC<ComponentProps> = ({ departmentColor = '#CC0000' }) => {
  return (
    <button
      style={{
        backgroundColor: departmentColor,
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold'
      }}
    >
      Enregistrer
    </button>
  );
};
```

### Transmission depuis le dashboard

```typescript
// DepartmentDashboard.tsx
const commonProps = {
  departmentColor: department.color, // '#0078d4', '#107c10', ou '#d83b01'
  // ... autres props
};

<FormComponent {...commonProps} />
```

---

## 🎯 Cohérence visuelle

### Palette Microsoft (référence)

| Département | Couleur | Hex Code | RGB |
|-------------|---------|----------|-----|
| DA | Bleu | `#0078d4` | rgb(0, 120, 212) |
| DSE | Vert | `#107c10` | rgb(16, 124, 16) |
| DPNP | Orange | `#d83b01` | rgb(216, 59, 1) |

### Variantes (si nécessaire)

#### DA (Bleu)
- **Hover**: `#005a9e` (plus foncé)
- **Disabled**: `#80bce9` (plus clair)
- **Background**: `#e6f2ff` (très clair)

#### DSE (Vert)
- **Hover**: `#0c5e0c` (plus foncé)
- **Disabled**: `#88be88` (plus clair)
- **Background**: `#e6f4e6` (très clair)

#### DPNP (Orange)
- **Hover**: `#a62d01` (plus foncé)
- **Disabled**: `#ec9d81` (plus clair)
- **Background**: `#fde7e9` (très clair)

---

## 📊 Icônes par catégorie

### Département DA
| Catégorie | Icône |
|-----------|-------|
| Crédit classique | 💰 |
| Crédit programme | 🎯 |
| Administration des engagements | 📊 |
| Suivi des dossiers en cours de MEP | 📈 |

### Département DSE
| Catégorie | Icône |
|-----------|-------|
| Situation Mise en Place | ✅ |
| Accords de Classement | 📋 |
| Contrats | 📄 |
| Projets | 🚀 |
| Déclaration Règlementaire | 📑 |

### Département DPNP
| Catégorie | Icône |
|-----------|-------|
| Analyse des dossiers de restructuration | 🔄 |
| Suivi des anomalies engagements | ⚠️ |
| Suivi des anomalies leasing | 🚗 |
| Travail de proximité | 🤝 |
| Suivi des débits non autorisés | 🔴 |
| Recouvrement par versement | 💸 |
| Suivi de la contagion | 🔍 |
| Suivi des provisions | 💼 |
| Recherche clients à l'étranger | 🌍 |

### Commun à tous
| Catégorie | Icône |
|-----------|-------|
| Activités annexes | 📎 |
| Autres Activités | 📌 |

---

## 🔧 Configuration centralisée

**Fichier**: `src/config/departmentsData.ts`

```typescript
export const DEPARTMENTS_MAP = {
  DA: {
    id: 'DA',
    name: 'DA',
    fullName: 'Département Analyse',
    icon: '📊',
    color: '#0078d4', // ✅ Bleu
    categories: []
  },
  DSE: {
    id: 'DSE',
    name: 'DSE',
    fullName: 'Département Surveillance des Engagements',
    icon: '🏦',
    color: '#107c10', // ✅ Vert
    categories: []
  },
  DPNP: {
    id: 'DPNP',
    name: 'DPNP',
    fullName: 'Département des Prêts Non Performants',
    icon: '🏛️',
    color: '#d83b01', // ✅ Orange
    categories: []
  }
};
```

---

## ✅ Checklist d'implémentation

Pour chaque nouveau composant:

- [ ] Ajouter `departmentColor?: string` dans l'interface des props
- [ ] Définir une valeur par défaut (`'#CC0000'` ou `'#0078d4'`)
- [ ] Utiliser `departmentColor` dans les styles (boutons, bordures, etc.)
- [ ] Transmettre `department.color` depuis le dashboard parent
- [ ] Tester avec les 3 départements (DA, DSE, DPNP)

---

## 🎨 Exemples CSS

### Bouton primaire
```css
.btn-primary {
  background-color: var(--department-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  filter: brightness(0.85);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### Badge de statut
```css
.status-badge {
  background-color: var(--department-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}
```

### Bordure d'accent
```css
.card-header {
  border-left: 4px solid var(--department-color);
  padding-left: 12px;
}
```

---

## 📖 Références

- **Microsoft Fluent UI**: https://fluentuipr.z22.web.core.windows.net/heads/master/theming-designer
- **Accessibilité**: Toutes les couleurs respectent WCAG 2.1 AA pour le contraste sur fond blanc
- **Cohérence**: Utiliser uniquement ces couleurs pour les éléments liés aux départements

---

**Dernière mise à jour**: ${new Date().toLocaleDateString('fr-FR')}
