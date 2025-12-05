# 📥 Guide d'Export des Données

## Vue d'ensemble

L'application DGE Reporting permet d'exporter les données de chaque formulaire dans trois formats différents :
- **Word (.doc)** - Document formaté avec tableaux
- **Excel (.xls)** - Tableur avec données structurées
- **CSV (.csv)** - Format texte pour import/export universel

## Fonctionnalités d'Export

### 🎯 Localisation des Boutons d'Export

Les boutons d'export se trouvent en bas de chaque formulaire, dans la section "Commentaires & Observations" :

```
┌─────────────────────────────────────────┐
│  💬 Commentaires & Observations         │
├─────────────────────────────────────────┤
│  Remarques...                           │
│  [Textarea]                             │
│                                         │
│  Exporter: [📄 Word] [📊 Excel] [📋 CSV]│
└─────────────────────────────────────────┘
```

### 📄 Export Word (.doc)

**Format**: Document Microsoft Word
**Contenu**:
- En-tête avec le titre du formulaire
- Date et heure d'export
- Sections organisées par catégorie
- Tableaux formatés avec les données
- Style DGE (rouge #CC0000, noir #1A1A1A)

**Utilisation**:
1. Remplir le formulaire
2. Cliquer sur le bouton "Word" (bleu)
3. Le fichier est téléchargé automatiquement avec le nom `NomFormulaire_YYYY-MM-DD.doc`

**Exemple**: `CreditProgramme_2025-01-15T14-30-00.doc`

### 📊 Export Excel (.xls)

**Format**: Tableur Microsoft Excel
**Contenu**:
- Une ligne par enregistrement
- En-têtes de colonnes avec fond rouge DGE
- Toutes les données du formulaire
- Compatible avec formules Excel

**Utilisation**:
1. Remplir le formulaire
2. Cliquer sur le bouton "Excel" (vert)
3. Le fichier est téléchargé automatiquement avec le nom `NomFormulaire_YYYY-MM-DD.xls`

**Avantages**:
- Facile à analyser avec des formules
- Compatible avec Power BI et autres outils
- Peut être importé dans d'autres systèmes

### 📋 Export CSV (.csv)

**Format**: Comma-Separated Values (texte)
**Contenu**:
- Format universel compatible avec tous les systèmes
- Une ligne par enregistrement
- Valeurs séparées par virgules
- Encodage UTF-8

**Utilisation**:
1. Remplir le formulaire
2. Cliquer sur le bouton "CSV" (gris)
3. Le fichier est téléchargé automatiquement avec le nom `NomFormulaire_YYYY-MM-DD.csv`

**Avantages**:
- Format le plus léger
- Compatible avec tous les systèmes
- Facile à importer dans des bases de données
- Peut être ouvert avec Excel, LibreOffice, etc.

## Formulaires avec Export

Les exports sont disponibles sur tous les formulaires :

| Formulaire | Export Word | Export Excel | Export CSV |
|-----------|-------------|--------------|------------|
| ✅ Crédit Classique | ✓ | ✓ | ✓ |
| ✅ Crédit Programme | ✓ | ✓ | ✓ |
| ✅ Admin Engagements | ✓ | ✓ | ✓ |
| ✅ Suivi MEP | ✓ | ✓ | ✓ |
| ✅ Activités Annexes | ✓ | ✓ | ✓ |

## Format des Fichiers Exportés

### Structure Word

```
┌──────────────────────────────────────────┐
│  Titre du Formulaire                     │
│  Date d'export: 15/01/2025 14:30:00     │
│  ────────────────────────────────────    │
│                                          │
│  Section 1                               │
│  ┌─────────────────┬──────────────────┐ │
│  │ Champ          │ Valeur           │ │
│  ├─────────────────┼──────────────────┤ │
│  │ ...            │ ...              │ │
│  └─────────────────┴──────────────────┘ │
└──────────────────────────────────────────┘
```

### Structure Excel

```
| Champ 1 | Champ 2 | Champ 3 | ... |
|---------|---------|---------|-----|
| Valeur1 | Valeur2 | Valeur3 | ... |
```

### Structure CSV

```
"Champ 1","Champ 2","Champ 3",...
"Valeur1","Valeur2","Valeur3",...
```

## Utilisation Technique

### Code d'Import

```typescript
import { ExportButtons } from '../ExportButtons'

// Dans votre composant
<ExportButtons 
  formData={formData} 
  formName="Nom du Formulaire"
  disabled={saveStatus === 'saving'}
/>
```

### Fonctions Utilitaires

```typescript
import { 
  exportToCSV, 
  exportToExcel, 
  exportToWord,
  formatFormDataForExport 
} from '../utils/exportUtils'

// Export manuel
const formatted = formatFormDataForExport(formData, 'MonFormulaire')
exportToCSV(formatted.csv.data, formatted.csv.filename)
```

## Limitations et Notes

### ⚠️ Limitations

- **Taille**: Les fichiers générés sont optimisés pour les données de formulaire (< 10MB)
- **Format Excel**: Utilise le format .xls (compatible avec toutes les versions d'Excel)
- **Encodage**: UTF-8 pour support international complet
- **Navigation**: Les exports se font côté client (pas de serveur requis)

### 💡 Bonnes Pratiques

1. **Sauvegarder avant d'exporter**: Assurez-vous que toutes les données sont sauvegardées
2. **Nommage automatique**: Les fichiers sont nommés avec date/heure pour éviter les écrasements
3. **Validation**: Les exports incluent toutes les données, même si certains champs sont vides
4. **Backup régulier**: Exportez régulièrement vos données pour backup

### 🔒 Sécurité

- Les exports se font entièrement côté client (navigateur)
- Aucune donnée n'est envoyée à un serveur externe
- Les fichiers sont générés dans le navigateur et téléchargés directement
- Format standard sans macros ni scripts

## Support et Maintenance

### Dépannage

**Problème**: Le téléchargement ne démarre pas
- **Solution**: Vérifier les paramètres du navigateur (pop-ups bloqués)
- Vérifier que le formulaire contient des données

**Problème**: Le fichier Excel ne s'ouvre pas correctement
- **Solution**: Utiliser Microsoft Excel ou LibreOffice Calc
- Le format .xls est compatible avec toutes les versions

**Problème**: Les caractères spéciaux s'affichent mal
- **Solution**: Les fichiers utilisent UTF-8, ouvrir avec l'encodage correct

### Contact

Pour toute question ou problème :
- Email: support@dge.gov
- Documentation: [README.md](./README.md)

---

**Version**: 2.0.0  
**Date**: Janvier 2025  
**Auteur**: DGE IT Team
