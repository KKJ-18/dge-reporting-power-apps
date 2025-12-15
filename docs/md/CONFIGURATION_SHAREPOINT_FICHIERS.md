# Configuration SharePoint pour Upload de Fichiers

## Problème
Power Apps SDK ne supporte pas l'upload direct de pièces jointes vers SharePoint.

## Solution : Stockage en Base64

Les fichiers sont convertis en base64 et stockés dans des colonnes SharePoint.

### Étapes de Configuration

#### 1. Ajouter les colonnes dans la liste "Action Recouvrement"

Allez dans SharePoint > Liste "Action Recouvrement" > Paramètres de liste > Créer une colonne

**Colonne 1 : PieceJointeBase64**
- Type : Multiple lines of text (Plain text)
- Taille : Enhanced rich text (Full HTML content with pictures, tables, and hyperlinks)
- Description : Contenu du fichier en base64

**Colonne 2 : NomFichier**
- Type : Single line of text
- Description : Nom du fichier original

**Colonne 3 : TypeFichier**
- Type : Single line of text
- Description : Type MIME du fichier (ex: application/pdf)

**Colonne 4 : TailleFichier**
- Type : Number
- Description : Taille du fichier en octets

#### 2. Télécharger un fichier depuis SharePoint

Pour récupérer un fichier stocké en base64 :

```typescript
// 1. Récupérer l'action depuis SharePoint
const action = await ActionRecouvrementService.getById(actionId);

// 2. Décoder le base64
const base64Data = action.PieceJointeBase64;
const binaryString = atob(base64Data);
const bytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}

// 3. Créer un Blob et télécharger
const blob = new Blob([bytes], { type: action.TypeFichier });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = action.NomFichier;
a.click();
window.URL.revokeObjectURL(url);
```

#### 3. Limitations

- **Taille maximale** : 10 MB (limite base64 dans SharePoint)
- **Formats supportés** : PDF, Word (.doc, .docx), Images (.jpg, .jpeg, .png)
- **Performance** : L'upload peut prendre quelques secondes pour les gros fichiers

## Alternatives

### Option 1 : Power Automate Flow
Créer un Flow qui :
1. Reçoit le fichier via HTTP
2. L'uploade dans une bibliothèque SharePoint
3. Retourne l'URL du fichier

### Option 2 : Microsoft Graph API
Utiliser l'API Graph pour uploader directement :
```
POST /sites/{site-id}/lists/{list-id}/items/{item-id}/driveItem/content
```

### Option 3 : Upload manuel
L'utilisateur peut uploader manuellement le fichier dans SharePoint après la création de l'action.

## Configuration Recommandée

Pour une utilisation optimale :
- Créez les 4 colonnes mentionnées ci-dessus
- Limitez les fichiers à 5 MB pour de meilleures performances
- Informez les utilisateurs de la limitation de taille

## Support

Pour plus d'informations :
- Documentation Power Apps : https://learn.microsoft.com/en-us/power-apps/
- SharePoint REST API : https://learn.microsoft.com/en-us/sharepoint/dev/sp-add-ins/
