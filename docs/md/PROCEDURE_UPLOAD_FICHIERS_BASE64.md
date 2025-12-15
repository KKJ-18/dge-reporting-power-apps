# Procédure de Configuration et Test - Upload de Fichiers Base64

## 📋 Vue d'ensemble

Cette solution permet l'upload de fichiers vers SharePoint en les convertissant en base64, contournant ainsi la limitation du Power Apps SDK.

---

## 🔧 Étape 1 : Configuration SharePoint

### 1.1 Accéder à la liste "Action Recouvrement"

1. Ouvrez SharePoint
2. Naviguez vers le site : `Reporting des activités commerciales`
3. Accédez à la liste : **"Action Recouvrement"**
4. Cliquez sur l'icône **⚙️ Paramètres** > **Paramètres de liste**

### 1.2 Créer les colonnes nécessaires

Cliquez sur **"Créer une colonne"** et ajoutez les 4 colonnes suivantes :

#### Colonne 1 : PieceJointeBase64
```
Nom de la colonne : PieceJointeBase64
Type : Multiple lines of text
Description : Contenu du fichier encodé en base64

Options :
☑️ Plain text
Nombre de lignes : 6
```

#### Colonne 2 : NomFichier
```
Nom de la colonne : NomFichier
Type : Single line of text
Description : Nom du fichier original (ex: Rapport.pdf)
Taille maximale : 255 caractères
```

#### Colonne 3 : TypeFichier
```
Nom de la colonne : TypeFichier
Type : Single line of text
Description : Type MIME du fichier (ex: application/pdf, image/jpeg)
Taille maximale : 100 caractères
```

#### Colonne 4 : TailleFichier
```
Nom de la colonne : TailleFichier
Type : Number
Description : Taille du fichier en octets
Nombre de décimales : 0
Valeur min : 0
Valeur max : 10485760 (10 MB)
```

### 1.3 Vérification

Après création, votre liste doit avoir ces colonnes :
- ✅ PieceJointeBase64 (Multiple lines of text)
- ✅ NomFichier (Single line of text)
- ✅ TypeFichier (Single line of text)
- ✅ TailleFichier (Number)

---

## 🔄 Étape 2 : Regénérer les Modèles Power Apps

### 2.1 Ajouter la source de données mise à jour

```powershell
# Dans le terminal PowerShell du projet
cd C:\Users\jordan_kamsu\dge-reporting-power-apps

# Regénérer le modèle ActionRecouvrement
pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53" -t "4e73ebaf-faa0-4655-8b1a-86db749dbdcf" -d "https%253A%252F%252Fafrilandfirstbankcmr.sharepoint.com%252Fsites%252FReportingdesactivitscommerciales"
```

### 2.2 Vérifier le modèle généré

Ouvrez `src/Models/ActionRecouvrementModel.ts` et vérifiez que les nouveaux champs sont présents :

```typescript
export interface ActionRecouvrement {
  // ... autres champs
  PieceJointeBase64?: string;
  NomFichier?: string;
  TypeFichier?: string;
  TailleFichier?: number;
}
```

---

## 🧪 Étape 3 : Test de la Fonctionnalité

### 3.1 Lancer l'application

```powershell
npm run dev
```

L'application démarre sur `http://localhost:5173/`

### 3.2 Accéder au module

1. Connectez-vous avec votre compte
2. Naviguez vers le département **DPNP**
3. Cliquez sur la catégorie **"Suivi des actions de recouvrement pour les GFC"**

### 3.3 Tester la recherche

1. Dans la barre de recherche, entrez au moins 2 caractères (ex: "SA")
2. Cliquez sur **"🔍 Rechercher"**
3. Vérifiez que la liste des clients s'affiche avec pagination

### 3.4 Tester l'upload de fichier

1. Sélectionnez un client dans la liste
2. Remplissez le formulaire :
   - **Type d'Action** : Sélectionnez (ex: "Lettre de relance")
   - **Date d'Exécution** : Date requise
   - **Origine de l'Impayé** : Texte requis
   - **Commentaire** : Description requise
   - **Pièce Jointe** : Cliquez et sélectionnez un fichier PDF ou image (max 10 MB)

3. Cliquez sur **"💾 Enregistrer"**

### 3.5 Vérifier l'enregistrement

#### Dans la console du navigateur (F12) :
```
✅ Action créée avec ID: 1234
📎 Tentative upload fichier: Rapport.pdf
✅ Fichier uploadé avec succès en base64
✅ Action de recouvrement enregistrée avec succès !
```

#### Dans SharePoint :
1. Ouvrez la liste "Action Recouvrement"
2. Trouvez le dernier enregistrement créé
3. Vérifiez que les colonnes suivantes sont remplies :
   - `PieceJointeBase64` : Long texte base64 (commence par /9j/ pour JPG, JVBERi pour PDF)
   - `NomFichier` : "Rapport.pdf"
   - `TypeFichier` : "application/pdf"
   - `TailleFichier` : 245678 (exemple)

---

## 📥 Étape 4 : Télécharger un Fichier depuis SharePoint

Pour récupérer et télécharger un fichier uploadé :

### 4.1 Créer un composant de téléchargement

Créez `src/components/FileDownloader.tsx` :

```typescript
import React from 'react';
import { ActionRecouvrementService } from '../services/ActionRecouvrementService';

interface FileDownloaderProps {
  actionId: string;
}

const FileDownloader: React.FC<FileDownloaderProps> = ({ actionId }) => {
  const handleDownload = async () => {
    try {
      // 1. Récupérer l'action
      const result = await ActionRecouvrementService.getById(actionId);
      
      if (!result.success || !result.data) {
        alert('Erreur : Action introuvable');
        return;
      }

      const action = result.data;
      
      if (!action.PieceJointeBase64) {
        alert('Aucun fichier attaché');
        return;
      }

      // 2. Décoder le base64
      const base64Data = action.PieceJointeBase64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 3. Créer un Blob
      const blob = new Blob([bytes], { type: action.TypeFichier || 'application/octet-stream' });
      
      // 4. Télécharger
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = action.NomFichier || 'fichier';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Fichier téléchargé:', action.NomFichier);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  return (
    <button onClick={handleDownload} className="btn btn-primary">
      📥 Télécharger la pièce jointe
    </button>
  );
};

export default FileDownloader;
```

### 4.2 Utiliser le composant

Dans votre liste d'actions, ajoutez :

```tsx
{action.PieceJointeBase64 && (
  <FileDownloader actionId={action.ID.toString()} />
)}
```

---

## ⚠️ Limitations et Notes Importantes

### Limitations Techniques

1. **Taille maximale** : **500 KB** (limite stricte)
   - SharePoint rejette les requêtes avec des colonnes "Multiple lines of text" > 700 KB encodé
   - 500 KB binaire ≈ 670 KB en base64 (marge de sécurité)
   - **Important** : Compresser les fichiers avant upload
   - Au-delà, utiliser une des alternatives mentionnées ci-dessous

2. **Types de fichiers supportés** :
   - ✅ PDF (.pdf) - **Recommandé : compresser avec iLovePDF ou similaire**
   - ✅ Images (.jpg, .jpeg, .png) - **Recommandé : compresser avec TinyPNG**
   - ✅ Word (.doc, .docx) - Petits documents uniquement
   - ❌ Fichiers volumineux ou non compressés

3. **Performance** :
   - Conversion base64 : ~1-2 secondes pour 200 KB
   - Upload vers SharePoint : ~2-3 secondes
   - Total : ~3-5 secondes pour un fichier de 200 KB

### Bonnes Pratiques

1. **Validation côté client**
   ```typescript
   const maxSizeBytes = 500 * 1024; // 500 KB
   if (file.size > maxSizeBytes) {
     const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
     alert(`Fichier trop volumineux (${sizeMB} MB). Limite : 0.5 MB`);
     return;
   }
   ```

2. **Compression OBLIGATOIRE**
   - **Pour les PDFs** : Utiliser [iLovePDF](https://www.ilovepdf.com/compress_pdf) ou Adobe Acrobat
   - **Pour les images** : Utiliser [TinyPNG](https://tinypng.com/) ou [Squoosh](https://squoosh.app/)
   - **Objectif** : Réduire à < 300 KB pour une meilleure fiabilité

3. **Feedback utilisateur**
   - Afficher un loader pendant l'upload
   - Indiquer clairement la taille limite (500 KB)
   - Confirmer le succès/échec avec logs détaillés

---

## 🐛 Troubleshooting

### Problème 1 : "PieceJointeBase64 is not defined"

**Cause** : Le modèle n'a pas été regénéré après l'ajout des colonnes SharePoint

**Solution** :
```powershell
pac code add-data-source -a "shared_sharepointonline" -c "7f6f26afaf97425c88cdfcc6af3cee53" -t "4e73ebaf-faa0-4655-8b1a-86db749dbdcf" -d "https%253A%252F%252Fafrilandfirstbankcmr.sharepoint.com%252Fsites%252FReportingdesactivitscommerciales"
```

### Problème 2 : Upload échoue avec erreur 400

**Cause** : Le fichier base64 est trop volumineux (> 700 KB encodé)

**Solution** :
1. ✅ **Vérifier la taille du fichier** : Doit être < 500 KB binaire
2. ✅ **Compresser le fichier** avant upload :
   - PDFs : [iLovePDF Compress](https://www.ilovepdf.com/compress_pdf)
   - Images : [TinyPNG](https://tinypng.com/)
3. ✅ **Vérifier les logs console** : `Base64 trop volumineux: XXX KB (limite: 700 KB)`
4. ⚠️ **Si toujours trop volumineux** : Considérer les alternatives (Power Automate, Graph API)

**Exemple de compression** :
- Fichier PDF original : 850 KB → ❌ Trop volumineux
- Après compression : 320 KB → ✅ Acceptable

### Problème 3 : Fichier téléchargé est corrompu

**Cause** : Erreur de décodage base64

**Solution** :
1. Vérifier que `TypeFichier` est correct
2. Vérifier que le base64 est complet dans SharePoint
3. Tester avec un fichier plus petit

---

## 📊 Tests de Validation

### Test 1 : Upload PDF compressé (300 KB)
- [ ] Fichier compressé avec iLovePDF
- [ ] Fichier sélectionné avec succès
- [ ] Conversion base64 réussie (< 700 KB encodé)
- [ ] Enregistrement SharePoint OK
- [ ] Colonnes remplies correctement
- [ ] Téléchargement fonctionne
- [ ] PDF s'ouvre correctement

### Test 2 : Upload Image compressée (200 KB)
- [ ] Image compressée avec TinyPNG
- [ ] Fichier sélectionné avec succès
- [ ] Conversion base64 réussie
- [ ] Enregistrement SharePoint OK
- [ ] Image téléchargée s'affiche

### Test 3 : Upload Word (100 KB)
- [ ] Fichier sélectionné avec succès
- [ ] Conversion base64 réussie
- [ ] Enregistrement SharePoint OK
- [ ] Document s'ouvre dans Word

### Test 4 : Fichier trop volumineux (800 KB)
- [ ] Message d'erreur affiché avant conversion
- [ ] Upload bloqué côté client
- [ ] Pas d'enregistrement SharePoint
- [ ] Indication claire : "Limite : 0.49 MB"

---

## 📝 Checklist Finale

Avant de considérer la fonctionnalité comme terminée :

- [ ] Les 4 colonnes sont créées dans SharePoint
- [ ] Le modèle ActionRecouvrementModel.ts est regénéré
- [ ] L'upload de fichiers fonctionne (logs console OK)
- [ ] Les données sont visibles dans SharePoint
- [ ] Le téléchargement fonctionne (si implémenté)
- [ ] Les tests de validation sont passés
- [ ] La documentation est à jour

---

## 🎯 Prochaines Étapes

1. **Amélioration** : Ajouter une barre de progression pendant l'upload
2. **Optimisation** : Compresser les images automatiquement
3. **Visualisation** : Prévisualiser les PDFs directement dans l'app
4. **Alternative** : Explorer Power Automate Flow pour upload natif

---

## 📞 Support

Pour toute question ou problème :
- Documentation Power Apps : https://learn.microsoft.com/en-us/power-apps/
- SharePoint REST API : https://learn.microsoft.com/en-us/sharepoint/dev/
- Logs console : F12 dans le navigateur
