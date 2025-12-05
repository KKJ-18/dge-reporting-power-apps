# 🧪 Guide de Test - Module Synthèse des Activités

## 🎯 Objectif
Valider le fonctionnement du nouveau module "Synthèse Activités" avec vos données réelles SharePoint.

---

## 🚀 Accès au Module

1. **Ouvrir l'application** dans votre navigateur
2. **Se connecter** avec vos identifiants Office 365
3. **Dans le menu latéral**, cliquer sur **📊 Synthèse Activités**

---

## ✅ Tests à Effectuer

### Test 1 : Chargement Initial

#### Actions
1. Le module s'ouvre avec les filtres visibles
2. Vérifier que **votre département est pré-sélectionné** (si vous n'êtes pas Directeur)
3. Vérifier que les **dates par défaut** sont : 
   - Date début = il y a 30 jours
   - Date fin = aujourd'hui

#### Résultat Attendu
✅ Filtres affichés correctement  
✅ Badge de rôle affiché : "👤 Agent", "🏢 Chef de département" ou "👔 Directeur"

---

### Test 2 : Chargement des Données

#### Actions
1. Cliquer sur le bouton **📊 Charger les données**
2. Attendre le chargement (2-5 secondes)

#### Résultat Attendu
✅ Message de notification : "Données chargées - X activité(s) trouvée(s)"  
✅ **4 cartes de statistiques** affichées avec les chiffres :
   - Total activités
   - Utilisateurs
   - Départements
   - Jours
✅ **Tableau détaillé** avec vos activités  
✅ **Pagination** visible en bas (si plus de 20 résultats)

#### En cas d'erreur
❌ Si message "Aucune donnée à afficher" :
- Vérifier que vous avez des activités dans SharePoint pour la période
- Essayer d'élargir la période (ex: 60 jours au lieu de 30)

❌ Si erreur réseau :
- Vérifier votre connexion internet
- Vérifier que SharePoint est accessible
- Consulter la console du navigateur (F12 → Console)

---

### Test 3 : Navigation dans les Données

#### Actions - Vue Détaillée
1. **Vérifier le tableau** :
   - Les dates sont correctes
   - Vos activités sont visibles
   - Votre nom apparaît dans la colonne "Utilisateur"

2. **Tester le tri** :
   - Cliquer sur **"📅 Date"** → Le tableau se trie par date
   - Cliquer à nouveau → L'ordre s'inverse (↑ / ↓)
   - Essayer les autres colonnes : Activité, Utilisateur, Département

3. **Tester la pagination** (si plus de 20 résultats) :
   - Cliquer sur **›** pour aller à la page suivante
   - Cliquer sur **«** pour revenir à la première page
   - Changer la **taille de page** (dropdown en bas à droite) : 10, 20, 50, 100

#### Résultat Attendu
✅ Tri fonctionne instantanément  
✅ Icône ↑ ou ↓ apparaît sur la colonne triée  
✅ Pagination change le contenu du tableau  
✅ Info "Page X sur Y (Z résultats)" est correcte

---

### Test 4 : Vues Alternatives

#### Actions
1. **Cliquer sur l'onglet "👥 Par utilisateur"**
   - Des cartes utilisateur apparaissent
   - Chaque carte montre : nom, email, département, total activités, catégories

2. **Cliquer sur l'onglet "🏢 Par département"**
   - Des cartes département apparaissent
   - Chaque carte montre : nom département, nombre d'utilisateurs, liste des membres

3. **Revenir sur "📋 Vue détaillée"**

#### Résultat Attendu
✅ Les 3 vues sont accessibles  
✅ Les données correspondent (même total)  
✅ Les cartes sont lisibles et bien formatées

---

### Test 5 : Filtres Avancés

#### Actions
1. **Filtre par Catégorie** :
   - Sélectionner une catégorie dans le dropdown
   - Cliquer "📊 Charger les données"
   - Vérifier que seules les activités de cette catégorie apparaissent

2. **Filtre par Activité** :
   - Avec une catégorie sélectionnée, choisir une activité spécifique
   - Cliquer "📊 Charger les données"
   - Vérifier que seule cette activité apparaît

3. **Recherche textuelle** :
   - Dans le champ "🔎 Recherche", taper un mot-clé (ex: "crédit", "analyse")
   - Cliquer "📊 Charger les données"
   - Vérifier que seuls les résultats contenant ce mot apparaissent

4. **Réinitialiser** :
   - Cliquer sur "🔄 Réinitialiser"
   - Vérifier que tous les filtres reviennent à leur état initial

#### Résultat Attendu
✅ Les filtres réduisent correctement les résultats  
✅ Le nombre total change dans les statistiques  
✅ La réinitialisation remet les valeurs par défaut

---

### Test 6 : Export CSV

#### Actions
1. **Charger des données** (si pas déjà fait)
2. **Cliquer sur "📥 Exporter CSV"** (bouton en haut à droite)
3. **Ouvrir le fichier téléchargé** dans Excel ou LibreOffice

#### Résultat Attendu
✅ Fichier téléchargé : `synthese_activites_YYYY-MM-DD_YYYY-MM-DD.csv`  
✅ Le fichier s'ouvre correctement dans Excel  
✅ Les colonnes sont : Date Création, Date Soumission, Activité, Catégorie, Département, etc.  
✅ Les données correspondent à ce qui est affiché dans le tableau

#### Test Export Résumé Utilisateur
1. **Aller sur l'onglet "👥 Par utilisateur"**
2. **Cliquer sur "📥 Exporter CSV"** (en haut à droite de cette vue)
3. **Ouvrir le fichier** : `synthese_utilisateurs_YYYY-MM-DD_YYYY-MM-DD.csv`

#### Résultat Attendu
✅ Fichier avec résumé par utilisateur  
✅ Colonnes : Utilisateur, Email, Département, Total Activités, etc.

---

## 🔒 Tests Spécifiques par Rôle

### Si vous êtes **Agent** (Utilisateur Standard)

#### Test 7A : Vérifier les Restrictions
1. **Vérifier que le dropdown "Département"** est verrouillé (grisé)
2. **Vérifier que vous ne voyez QUE vos propres activités**
   - La colonne "Utilisateur" ne doit afficher que votre nom
   - Le nombre total doit correspondre à vos soumissions uniquement

#### Résultat Attendu
✅ Département verrouillé sur votre département  
✅ Uniquement vos données visibles  
✅ Pas d'accès aux données des collègues

---

### Si vous êtes **Chef de Département**

#### Test 7B : Vérifier l'Accès Équipe
1. **Vérifier que le dropdown "Département"** est verrouillé sur votre département
2. **Vérifier que vous voyez les activités de TOUS les membres de votre département**
   - Plusieurs noms différents dans la colonne "Utilisateur"
   - Le nombre d'utilisateurs dans les stats correspond à votre équipe

3. **Aller dans "👥 Par utilisateur"**
   - Vérifier que tous les membres de votre équipe sont listés

4. **Aller dans "🏢 Par département"**
   - Vérifier que seul votre département apparaît

#### Résultat Attendu
✅ Département verrouillé sur votre département  
✅ Toutes les activités de votre équipe visibles  
✅ Résumés par utilisateur montrent tous les membres

---

### Si vous êtes **Directeur**

#### Test 7C : Vérifier l'Accès Global
1. **Vérifier que le dropdown "Département"** est déverrouillé
   - Vous pouvez sélectionner "Tous" ou un département spécifique

2. **Sélectionner "Tous les départements"**
   - Cliquer "📊 Charger les données"
   - Vérifier que vous voyez des activités de TOUS les départements
   - Plusieurs départements dans la colonne "Département"

3. **Sélectionner un département spécifique** (ex: DA)
   - Cliquer "📊 Charger les données"
   - Vérifier que seules les activités de ce département apparaissent
   - Un nouveau dropdown **"👤 Utilisateur"** apparaît

4. **Utiliser le filtre "Utilisateur"**
   - Sélectionner un membre spécifique dans le dropdown
   - Cliquer "📊 Charger les données"
   - Vérifier que seules les activités de cette personne apparaissent

5. **Aller dans "🏢 Par département"**
   - Vérifier que TOUS les départements sont listés (ou celui sélectionné)
   - Chaque département montre ses membres

#### Résultat Attendu
✅ Accès à tous les départements  
✅ Filtre par département fonctionne  
✅ Filtre par utilisateur spécifique fonctionne  
✅ Vue globale transversale disponible

---

## 🐛 Problèmes Connus & Solutions

### Problème : "0 activité(s) trouvée(s)"

**Causes possibles** :
1. Aucune activité dans SharePoint pour la période sélectionnée
2. Votre profil utilisateur n'est pas correctement configuré
3. Erreur de connexion SharePoint

**Solutions** :
- Élargir la période (ex: 60 ou 90 jours)
- Vérifier dans SharePoint que vous avez bien des données
- Aller dans **⚙️ Paramètres** → Vérifier votre profil
- Ouvrir la console (F12) et chercher les erreurs

---

### Problème : Chargement très lent (> 10 secondes)

**Causes possibles** :
1. Connexion internet lente
2. SharePoint surchargé
3. Beaucoup de données à charger

**Solutions** :
- Réduire la période (ex: 7 jours au lieu de 30)
- Filtrer par département/catégorie avant de charger
- Vérifier votre connexion internet
- Réessayer plus tard si SharePoint est lent

---

### Problème : Export CSV ne s'ouvre pas dans Excel

**Causes possibles** :
1. Paramètres Excel régionaux différents
2. Encodage du fichier

**Solutions** :
- Ouvrir Excel → **Données** → **À partir d'un fichier CSV**
- Sélectionner le fichier téléchargé
- Choisir l'encodage **UTF-8**
- Choisir le séparateur **Point-virgule (;)**

---

### Problème : Pagination ne fonctionne pas

**Causes possibles** :
1. Bug JavaScript
2. Moins de résultats que la taille de page

**Solutions** :
- Vérifier que vous avez plus de 20 résultats (si taille page = 20)
- Rafraîchir la page (F5)
- Vider le cache du navigateur (Ctrl+Shift+Delete)

---

## 📝 Rapport de Test

Après vos tests, noter :

### ✅ Ce qui fonctionne
- [ ] Chargement des données
- [ ] Affichage du tableau
- [ ] Tri des colonnes
- [ ] Pagination
- [ ] Filtres (date, département, catégorie, activité)
- [ ] Recherche textuelle
- [ ] Vue par utilisateur
- [ ] Vue par département
- [ ] Export CSV détaillé
- [ ] Export CSV résumé utilisateur
- [ ] Restrictions par rôle (Agent/Chef/Directeur)

### ❌ Problèmes Rencontrés
- [ ] Problème 1 : ________________________________
- [ ] Problème 2 : ________________________________
- [ ] Problème 3 : ________________________________

### 💡 Suggestions d'Amélioration
- _____________________________________________
- _____________________________________________
- _____________________________________________

---

## 🆘 Besoin d'Aide ?

### Console du Navigateur
1. Appuyer sur **F12** (Windows) ou **Cmd+Option+I** (Mac)
2. Aller sur l'onglet **Console**
3. Chercher les messages en rouge (erreurs)
4. Copier le message d'erreur pour le support

### Informations Utiles pour le Support
- Navigateur et version (ex: Chrome 120)
- Rôle utilisateur (Agent/Chef/Directeur)
- Département
- Message d'erreur exact
- Capture d'écran si possible

---

**Bon test ! 🚀**

_Si tout fonctionne correctement, le module est prêt pour la production._
