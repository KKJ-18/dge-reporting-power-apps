# 🎨 Système de Formulaires Unifié - Guide d'Utilisation

## Vue d'ensemble

Ce système fournit un style cohérent, moderne et responsive pour tous les formulaires des départements DA, DSE et DPNP.

## Composants Disponibles

### 1. `CommonFormLayout`
Layout principal qui encapsule tout le formulaire.

```typescript
<CommonFormLayout
  icon={ActivityIcons.recherche}
  title="Recherche clients"
  badge="Pays de résidence"
  departmentColor="#990000"
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  isLoading={loading}
  submitLabel="Enregistrer"
  cancelLabel="Annuler"
>
  {/* Contenu du formulaire */}
</CommonFormLayout>
```

### 2. `FormSection`
Section avec titre et icône pour organiser les champs.

```typescript
<FormSection icon="👥" title="Statistiques clients">
  {/* Champs */}
</FormSection>
```

### 3. `FormField`
Champ individuel avec label, hint optionnel.

```typescript
<FormField 
  label="Nombre de clients" 
  required 
  hint="Clients en anomalies"
  fullWidth
>
  <input className="common-form-input" />
</FormField>
```

### 4. `FormSummary`
Résumé des données saisies.

```typescript
<FormSummary
  items={[
    { label: 'Total', value: 1000 },
    { label: 'Montant', value: '5000 FCFA' }
  ]}
/>
```

### 5. `SuccessModal`
Modal de confirmation après soumission.

```typescript
<SuccessModal
  title="Enregistrement réussi"
  message="Les données ont été enregistrées"
  departmentColor="#990000"
/>
```

## Classes CSS Disponibles

### Grilles Responsive
```typescript
<div className="common-form-grid">      // Auto-fit, min 280px
<div className="common-form-grid-2">    // 2 colonnes responsive
<div className="common-form-grid-3">    // 3 colonnes responsive
```

### Inputs
```typescript
<input className="common-form-input" />
<select className="common-form-select" />
<textarea className="common-form-textarea" />
```

### Champ pleine largeur
```typescript
<div className="common-form-field-full">
  <FormField label="Description" fullWidth>
    <textarea className="common-form-textarea" />
  </FormField>
</div>
```

## Couleurs par Département

Les couleurs sont automatiquement appliquées via les variables CSS:

- **DA**: `#0078d4` (Bleu)
- **DSE**: `#107c10` (Vert)
- **DPNP**: `#990000` (Rouge foncé)

Passez simplement `departmentColor` au composant.

## Icônes d'Activités

Utilisez `ActivityIcons` pour une cohérence:

```typescript
import { ActivityIcons } from './CommonFormLayout';

// Exemples
ActivityIcons.dossiers    // 📥
ActivityIcons.analyse     // 🔍
ActivityIcons.anomalie    // ⚠️
ActivityIcons.recherche   // 🌍
ActivityIcons.provision   // 💼
ActivityIcons.client      // 👥
ActivityIcons.formation   // 📚
```

## Exemple Complet

```typescript
import React, { useState } from 'react';
import { 
  CommonFormLayout, 
  FormSection, 
  FormField, 
  FormSummary,
  SuccessModal,
  ActivityIcons 
} from './CommonFormLayout';
import './CommonForm.css';

const MonFormulaire: React.FC<Props> = ({ 
  activityName, 
  departmentColor,
  onClose,
  onSave 
}) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: 0,
    montant: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Enregistrement
      await MonService.create(formData);
      setShowSuccess(true);
      setTimeout(() => onSave(), 2000);
    } catch (error) {
      alert('Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <SuccessModal
        title="Enregistrement réussi"
        message="Données enregistrées"
        departmentColor={departmentColor}
      />
    );
  }

  return (
    <CommonFormLayout
      icon={ActivityIcons.dossiers}
      title={activityName}
      departmentColor={departmentColor}
      onCancel={onClose}
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      <FormSection icon="📊" title="Informations">
        <div className="common-form-grid-2">
          <FormField label="Nombre" required>
            <input
              type="number"
              value={formData.nombre}
              onChange={(e) => setFormData({
                ...formData, 
                nombre: parseInt(e.target.value) || 0
              })}
              className="common-form-input"
              required
            />
          </FormField>

          <FormField label="Montant (FCFA)" required>
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({
                ...formData, 
                montant: parseFloat(e.target.value) || 0
              })}
              className="common-form-input"
              required
            />
          </FormField>
        </div>
      </FormSection>

      <FormSummary
        items={[
          { label: 'Nombre total', value: formData.nombre },
          { label: 'Montant total', value: `${formData.montant.toLocaleString()} FCFA` }
        ]}
      />
    </CommonFormLayout>
  );
};

export default MonFormulaire;
```

## Responsive Design

Le système est automatiquement responsive:

- **Desktop** (>768px): Grilles multi-colonnes
- **Tablet** (≤768px): 1 colonne, header centré
- **Mobile** (≤480px): Optimisé pour petits écrans

## Caractéristiques

✅ **Style unifié** pour DA, DSE, DPNP
✅ **Responsive** automatique
✅ **Modal adaptative** au contenu
✅ **Icônes contextuelles**
✅ **Couleurs par département**
✅ **Focus states** élégants
✅ **Animations** subtiles
✅ **Print-friendly**
✅ **Accessible** (ARIA ready)

## Migration d'un Formulaire Existant

1. Importer les composants:
```typescript
import { CommonFormLayout, FormSection, FormField } from './CommonFormLayout';
import './CommonForm.css';
```

2. Remplacer la structure HTML par les composants
3. Utiliser les classes CSS `common-form-*`
4. Passer `departmentColor` en prop

Voir `FormRechercherClientAnomalieModern.tsx` comme exemple de migration.
