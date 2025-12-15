# 🗜️ Guide de Compression des Fichiers

## Pourquoi Compresser ?

**Limitation SharePoint** : Les fichiers sont stockés en base64, avec une limite de **500 KB maximum**. Sans compression, la plupart des documents dépassent cette limite.

---

## 📕 Compresser un PDF

### Méthode 1 : iLovePDF (En ligne - Recommandé)

1. Allez sur : https://www.ilovepdf.com/compress_pdf
2. Cliquez sur **"Sélectionner un fichier PDF"**
3. Choisissez votre fichier
4. Sélectionnez le niveau de compression :
   - **Extrême** : Pour les gros fichiers (> 2 MB)
   - **Recommandé** : Pour les fichiers moyens (500 KB - 2 MB)
   - **Faible** : Si déjà proche de 500 KB
5. Cliquez sur **"Compresser PDF"**
6. Téléchargez le fichier compressé

**Résultats typiques** :
- PDF 3 MB → 450 KB ✅
- PDF 1.5 MB → 280 KB ✅
- PDF 800 KB → 320 KB ✅

### Méthode 2 : Adobe Acrobat

1. Ouvrez le PDF avec Adobe Acrobat
2. Fichier → **"Enregistrer sous une autre..."** → **"PDF de taille réduite"**
3. Sélectionnez la compatibilité : **"Acrobat X ou version ultérieure"**
4. Enregistrez

---

## 🖼️ Compresser une Image

### Méthode 1 : TinyPNG (En ligne - Recommandé)

1. Allez sur : https://tinypng.com/
2. Glissez-déposez vos images (PNG ou JPG)
3. Attendez la compression automatique
4. Cliquez sur **"Download"**

**Résultats typiques** :
- PNG 2 MB → 350 KB ✅
- JPG 1.2 MB → 280 KB ✅
- PNG 800 KB → 220 KB ✅

### Méthode 2 : Squoosh (En ligne)

1. Allez sur : https://squoosh.app/
2. Glissez-déposez votre image
3. Ajustez le curseur **"Quality"** jusqu'à obtenir < 500 KB
4. Cliquez sur le bouton de téléchargement en bas à droite

### Méthode 3 : Paint (Windows)

1. Ouvrez l'image avec **Paint**
2. Fichier → **"Enregistrer sous"** → **"Image JPEG"**
3. Avant d'enregistrer, cliquez sur **"Outils"** → **"Compresser les images"**
4. Sélectionnez **"Qualité Web (150 ppp)"**
5. Enregistrez

---

## 📘 Compresser un Document Word

### Méthode 1 : Supprimer les Images

1. Ouvrez le document dans Word
2. Pour chaque image :
   - Clic droit → **"Compresser les images"**
   - Cochez **"Supprimer les zones de rognage"**
   - Sélectionnez **"E-mail (96 ppp)"**
   - Cliquez sur **OK**
3. Enregistrez

### Méthode 2 : Convertir en PDF puis Compresser

1. Enregistrez le Word en PDF
2. Compressez le PDF avec iLovePDF (voir ci-dessus)
3. Uploadez le PDF compressé

---

## 📋 Tableau Récapitulatif

| Type de Fichier | Taille Initiale | Après Compression | Outil Utilisé |
|-----------------|-----------------|-------------------|---------------|
| PDF Scan        | 3.2 MB          | 420 KB ✅         | iLovePDF (Extrême) |
| Photo iPhone    | 2.8 MB          | 380 KB ✅         | TinyPNG |
| Document Word   | 1.5 MB          | 290 KB ✅         | Word → PDF → iLovePDF |
| Capture d'écran | 1.1 MB          | 180 KB ✅         | Squoosh |
| PDF Texte       | 850 KB          | 310 KB ✅         | iLovePDF (Recommandé) |

---

## ⚠️ Conseils Importants

### ✅ À Faire
- Compresser **AVANT** d'uploader dans l'application
- Vérifier la taille du fichier compressé (doit être < 500 KB)
- Conserver une copie de l'original si nécessaire
- Pour les images : Privilégier JPEG plutôt que PNG

### ❌ À Éviter
- Uploader des scans haute résolution sans compression
- Uploader des photos iPhone/Android directement
- Uploader des PDFs avec beaucoup d'images non compressées
- Essayer plusieurs fois avec le même fichier non compressé

---

## 🎯 Objectifs de Compression

Pour garantir l'upload dans l'application :

| Type        | Objectif | Maximum |
|-------------|----------|---------|
| **PDF**     | < 300 KB | 500 KB  |
| **Image**   | < 250 KB | 500 KB  |
| **Word**    | < 200 KB | 500 KB  |

---

## 🔗 Liens Rapides

- 📕 PDF : https://www.ilovepdf.com/compress_pdf
- 🖼️ Images PNG/JPG : https://tinypng.com/
- 🎨 Images (avancé) : https://squoosh.app/
- 📦 Multi-format : https://compressor.io/

---

## ❓ Questions Fréquentes

**Q : La compression dégrade-t-elle la qualité ?**
R : Légèrement, mais de façon imperceptible pour les documents administratifs. La lisibilité reste excellente.

**Q : Puis-je compresser plusieurs fichiers à la fois ?**
R : Oui avec iLovePDF (mode batch) et TinyPNG (jusqu'à 20 images).

**Q : Que faire si après compression, le fichier dépasse encore 500 KB ?**
R : Contactez votre administrateur pour explorer les alternatives (Power Automate, upload manuel SharePoint).

**Q : Les outils en ligne sont-ils sûrs ?**
R : Oui, iLovePDF et TinyPNG sont des services reconnus. Évitez les documents confidentiels sur des outils gratuits inconnus.

---

## 📞 Support

Pour toute question sur la compression :
- Consultez d'abord ce guide
- Testez avec un fichier d'exemple
- Vérifiez la taille dans les propriétés du fichier (Clic droit → Propriétés)
