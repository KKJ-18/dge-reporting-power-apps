# Installation et Configuration - Suivi des Actions de Recouvrement GFC

## 📦 Fichiers créés

### 1. Composants React
- ✅ `src/components/SuiviRecouvrementGFC.tsx` - Composant principal
- ✅ `src/components/SuiviRecouvrementGFC.css` - Styles dédiés

### 2. Modifications
- ✅ `src/components/DepartmentDashboard.tsx` - Intégration de la nouvelle catégorie

### 3. Documentation
- ✅ `docs/md/SUIVI_RECOUVREMENT_GFC_GUIDE.md` - Guide complet
- ✅ `add-recouvrement-category.ps1` - Script d'aide à la configuration
- ✅ `INSTALLATION_SUIVI_RECOUVREMENT.md` - Ce fichier

## 🚀 Étapes d'installation

### Étape 1 : Vérifier les modèles SharePoint existants ✅

Les modèles suivants sont déjà générés et disponibles :
- ✅ `src/Models/ClientsenAnomalieModel.ts`
- ✅ `src/Models/ActionRecouvrementModel.ts`
- ✅ `src/services/ClientsenAnomalieService.ts`
- ✅ `src/services/ActionRecouvrementService.ts`

**Pas d'action requise** - Les modèles sont déjà en place.

### Étape 2 : Compiler et tester localement

```bash
# Installer les dépendances (si nécessaire)
npm install

# Compiler le projet
npm run build

# Lancer en mode développement pour tester
npm run dev
```

### Étape 3 : Ajouter la catégorie dans SharePoint

Vous avez **3 options** pour ajouter la catégorie :

#### Option A : Via l'interface Power Apps (Recommandé)

1. Ouvrir l'application Power Apps
2. Se connecter avec un compte admin
3. Accéder à **"Gestion des Catégories"** ou **"Activities"**
4. Créer une nouvelle catégorie :
   ```
   Nom: Suivi des actions de recouvrement pour les GFC
   ID: suivi-recouvrement-gfc
   Département: DPNP
   Icône: 💰
   ```

#### Option B : Directement dans SharePoint

1. Accéder à votre site SharePoint
2. Ouvrir la liste **"Activity"**
3. Cliquer sur **"+ Nouveau"**
4. Remplir :
   - **CategoryName** : `Suivi des actions de recouvrement pour les GFC`
   - **CategoryID** : `suivi-recouvrement-gfc`
   - **Departement** : `DPNP`
   - **Icon** : `💰`
   - **ActivityName** : `Action de recouvrement`
5. Enregistrer

#### Option C : Via PowerShell (Avancé)

```powershell
# Exécuter le script d'aide
.\add-recouvrement-category.ps1

# Ou utiliser PnP PowerShell directement
Connect-PnPOnline -Url "https://votre-tenant.sharepoint.com/sites/votre-site" -Interactive

Add-PnPListItem -List "Activity" -Values @{
    "Title" = "Suivi des actions de recouvrement pour les GFC"
    "CategoryName" = "Suivi des actions de recouvrement pour les GFC"
    "CategoryID" = "suivi-recouvrement-gfc"
    "Departement" = "DPNP"
    "Icon" = "💰"
    "ActivityName" = "Action de recouvrement"
}
```

### Étape 4 : Vérifier la configuration SharePoint

#### 4.1. Vérifier la base "Clients en Anomalie"

Assurez-vous que la liste SharePoint **"clients en anomalie"** contient :
- Des enregistrements de test
- Le champ **"StatutAction"** avec les valeurs : `Aucun`, `En cours`, `Terminé`
- Les champs : `Title`, `Matricule`, `Montant`, `EmailGFC`, `NomGFC`, etc.

#### 4.2. Vérifier la base "Action Recouvrement"

Assurez-vous que la liste SharePoint **"action recouvrement"** existe avec les champs :
- `Title` (Commentaire)
- `Matricule`
- `NomClient`
- `EmailGFC`
- `Typedaction` (Choice: Planifier, Exécuter)
- `DatePlanification`, `DateExécution`, `DateprochaineAction`
- `Origineimpayé`
- `Lienpiécejointe`

### Étape 5 : Publier l'application

```bash
# Compiler la version de production
npm run build

# Publier avec Power SDK
pac code push
```

### Étape 6 : Tester la fonctionnalité

1. **Se connecter** à l'application avec un compte du département DPNP
2. **Accéder** au département DPNP
3. **Cliquer** sur la catégorie "💰 Suivi des actions de recouvrement pour les GFC"
4. **Vérifier** que la liste des clients en anomalie s'affiche
5. **Tester** la recherche par nom ou matricule
6. **Sélectionner** un client
7. **Remplir** le formulaire d'action
8. **Enregistrer** et vérifier que :
   - L'action est créée dans "Action Recouvrement"
   - Le statut du client passe à "En cours" dans "Clients en Anomalie"

## 🔐 Configuration des permissions

### Permissions minimales requises

#### Pour les agents de recouvrement (DPNP)
```
Clients en Anomalie:
  ✅ Lecture (tous les enregistrements)
  ✅ Modification (champ StatutAction uniquement)

Action Recouvrement:
  ✅ Lecture (leurs propres enregistrements)
  ✅ Création (nouveaux enregistrements)
  ✅ Modification (leurs propres enregistrements)
```

#### Pour les responsables DPNP
```
Clients en Anomalie:
  ✅ Lecture (tous)
  ✅ Modification (tous)

Action Recouvrement:
  ✅ Lecture (tous)
  ✅ Modification (tous)
  ✅ Suppression (tous)
```

### Configuration dans SharePoint

1. Accéder aux **Paramètres de la liste**
2. Aller dans **Permissions de la liste**
3. Configurer les groupes :
   - **DPNP-Agents** : Contribuer (restreint)
   - **DPNP-Responsables** : Contrôle total
   - **DPNP-Directeur** : Contrôle total

## 🧪 Tests recommandés

### Test 1 : Recherche de clients
- ✅ Affichage de tous les clients avec StatutAction = "Aucun"
- ✅ Recherche par nom (insensible à la casse)
- ✅ Recherche par matricule
- ✅ Recherche par nom de GFC
- ✅ Pas de résultat si aucun client ne correspond

### Test 2 : Affichage des informations
- ✅ Toutes les informations client affichées correctement
- ✅ Montant formaté en FCFA
- ✅ Email GFC affiché
- ✅ Agence affichée

### Test 3 : Formulaire d'action
- ✅ Champs pré-remplis corrects (Matricule, Nom, Email)
- ✅ Validation des champs obligatoires
- ✅ Type d'action (liste déroulante)
- ✅ Dates au format correct
- ✅ Lien pièce jointe (URL valide)

### Test 4 : Enregistrement
- ✅ Action créée dans "Action Recouvrement"
- ✅ StatutAction mis à jour dans "Clients en Anomalie"
- ✅ Message de succès affiché
- ✅ Retour à la liste après enregistrement
- ✅ Client n'apparaît plus dans la liste (StatutAction ≠ "Aucun")

### Test 5 : Gestion des erreurs
- ✅ Message d'erreur si champ obligatoire manquant
- ✅ Message d'erreur si échec de sauvegarde
- ✅ Possibilité d'annuler sans sauvegarder
- ✅ Gestion des problèmes de connexion

## 📊 Données de test

### Script pour créer des données de test

```javascript
// À exécuter dans la console du navigateur sur SharePoint

// Créer des clients en anomalie de test
const clientsTest = [
  {
    Title: "Jean DUPONT",
    Matricule: "12345",
    Montant: 5000000,
    EmailGFC: "gfc1@example.com",
    NomGFC: "Marie BERNARD",
    Nomagence: "Agence Centrale",
    TypeClient: "Entreprise",
    StatutAction: { Value: "Aucun" }
  },
  {
    Title: "Sophie MARTIN",
    Matricule: "67890",
    Montant: 3500000,
    EmailGFC: "gfc2@example.com",
    NomGFC: "Pierre DUBOIS",
    Nomagence: "Agence Nord",
    TypeClient: "Particulier",
    StatutAction: { Value: "Aucun" }
  }
];

// À adapter selon votre service
clientsTest.forEach(client => {
  ClientsenAnomalieService.create(client);
});
```

## 🐛 Résolution de problèmes courants

### Problème : La catégorie n'apparaît pas

**Solutions :**
1. Vérifier que la catégorie a été ajoutée dans SharePoint (liste Activity)
2. Vérifier que `Departement = "DPNP"`
3. Vider le cache de l'application : `localStorage.clear()`
4. Recharger la page (F5)

### Problème : Aucun client ne s'affiche

**Solutions :**
1. Vérifier qu'il existe des clients avec `StatutAction = "Aucun"`
2. Vérifier les permissions de lecture sur "Clients en Anomalie"
3. Ouvrir la console (F12) et chercher les erreurs
4. Vérifier la connexion aux données SharePoint

### Problème : Impossible d'enregistrer l'action

**Solutions :**
1. Vérifier que tous les champs obligatoires sont remplis
2. Vérifier les permissions d'écriture sur "Action Recouvrement"
3. Vérifier les permissions de modification sur "Clients en Anomalie"
4. Consulter les logs dans la console (F12)

### Problème : Le statut du client n'est pas mis à jour

**Solutions :**
1. L'action sera quand même créée (comportement normal)
2. Vérifier les permissions de modification sur "Clients en Anomalie"
3. Vérifier que le champ `StatutAction` existe et est de type Choice
4. Mettre à jour manuellement dans SharePoint si nécessaire

## 📞 Support et contact

### Documentation
- 📖 Guide complet : `docs/md/SUIVI_RECOUVREMENT_GFC_GUIDE.md`
- 🔧 Code source : `src/components/SuiviRecouvrementGFC.tsx`

### Contact
- 📧 Email : support-dge@example.com
- 💬 Teams : Équipe DGE - Développement
- 📱 Téléphone : +XXX XXX XXX XXX

### Ressources
- 🌐 SharePoint : [Lien vers votre site SharePoint]
- 📊 Power Apps : [Lien vers l'application]
- 📚 Documentation technique : [Lien vers la doc]

## ✅ Checklist finale

Avant de déployer en production, vérifiez :

- [ ] Les modèles SharePoint sont à jour
- [ ] La catégorie a été ajoutée dans Activity
- [ ] Les deux bases de données existent et sont configurées
- [ ] Les permissions sont correctement configurées
- [ ] L'application compile sans erreurs
- [ ] Tous les tests sont passés avec succès
- [ ] La documentation est à jour
- [ ] Les utilisateurs ont été formés
- [ ] Un plan de rollback est en place
- [ ] Le support a été informé

## 🎉 Conclusion

La fonctionnalité "Suivi des Actions de Recouvrement pour les GFC" est maintenant prête à être déployée !

**Prochaines étapes suggérées :**
1. Former les utilisateurs du département DPNP
2. Créer des données de test pour la démonstration
3. Planifier une phase pilote avec quelques utilisateurs
4. Recueillir les retours et ajuster si nécessaire
5. Déployer en production pour tous les utilisateurs DPNP

Bonne chance ! 🚀
