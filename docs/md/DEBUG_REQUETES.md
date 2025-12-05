# 🔍 DEBUG - Diagnostic des Requêtes Power SDK

## 🎯 Objectif

Identifier pourquoi les enregistrements ne se sauvent pas dans SharePoint avec l'erreur :
```
❌ Erreur lors de la sauvegarde: Erreur lors de la sauvegarde
```

---

## ✅ Modifications Effectuées

### 1️⃣ **Logs Détaillés dans les Formulaires**

Ajout de logs console complets pour tracer le flux de données :

#### FormSituationMEP.tsx, FormAccordsDSE.tsx, FormContratsDSE.tsx

```typescript
// AVANT l'envoi
console.log('📤 Envoi de la requête:', {
  record,
  activityName,
  type
});

// APRÈS la réponse
const result = await Service.create(record);

console.log('📥 Réponse du serveur:', {
  success: result.success,      // ✅ Corrigé: 'success' au lieu de 'isSuccess'
  error: result.error,
  fullResult: result
});

// Gestion des erreurs
if (result.success) {
  console.log('✅ Enregistrement réussi!');
  // ... modal de succès
} else {
  const errorMsg = result.error || 'Erreur inconnue';
  console.error('❌ Échec:', errorMsg);
  throw new Error(errorMsg);
}
```

**Avantages** :
- ✅ Voir exactement les données envoyées
- ✅ Voir la réponse complète du serveur
- ✅ Identifier si la requête arrive au serveur
- ✅ Stack trace complète en cas d'exception

---

### 2️⃣ **Panneau de Diagnostic (DiagnosticPanel.tsx)**

Nouveau composant pour tester la connexion Power SDK en temps réel :

```typescript
// Tests effectués :
1️⃣ Vérifier que l'instance SDK existe
2️⃣ Lister toutes les sources de données configurées
3️⃣ Vérifier que 'situationmep', 'accords', 'contrats' sont présents
4️⃣ Tester l'API Data (createRecordAsync, retrieveMultipleRecordsAsync)
5️⃣ Test de récupération réelle (GET sur SituationMEP)
6️⃣ Préparation d'un record de test (sans l'envoyer)
```

**Utilisation** :
- Bouton flottant en bas à droite : **"🚀 Lancer le diagnostic"**
- Affiche tous les résultats dans un terminal intégré
- Permet de vérifier l'état du SDK sans ouvrir la console

**Intégré dans** : `AppModern.tsx` (toujours visible)

---

### 3️⃣ **Correction de l'API IOperationResult**

```typescript
// ❌ AVANT (INCORRECT)
if (result.isSuccess) { ... }

// ✅ APRÈS (CORRECT)
if (result.success) { ... }
```

**Raison** : L'interface `IOperationResult` du Power SDK utilise `success` et non `isSuccess`.

---

## 🔍 Comment Diagnostiquer

### Étape 1 : Vérifier les Logs Console (F12)

Lorsque vous soumettez un formulaire, vous devriez voir :

```
📤 Envoi de la requête SituationMEP: {
  record: {
    Title: "Amortissables - Amortissables",
    Nombre: 5,
    Montant: 1000000,
    DateMep: "2025-11-15",
    Pourcentage: 85,
    IdDetailClient: ""
  },
  activityName: "Amortissables",
  mepType: "amortissables"
}

📥 Réponse du serveur: {
  success: true,
  error: null,
  fullResult: {...}
}

✅ Enregistrement réussi!
```

**Si vous ne voyez PAS ces logs** → Le formulaire ne s'exécute pas correctement

---

### Étape 2 : Utiliser le Panneau de Diagnostic

1. Ouvrir l'application
2. Cliquer sur **"🚀 Lancer le diagnostic"** (coin bas-droite)
3. Analyser les résultats :

```
🔍 === DIAGNOSTIC POWER SDK ===

1️⃣ Vérification de l'instance SDK...
   ✅ Instance SDK récupérée: true
   ✅ Type: object

2️⃣ Vérification des sources de données:
   ✅ 27 sources de données configurées
   ✅ situationmep: Configuré
   ✅ accords: Configuré
   ✅ contrats: Configuré

3️⃣ Vérification de l'API Data:
   ✅ Data API disponible: true
   ✅ createRecordAsync: function
   ✅ retrieveMultipleRecordsAsync: function

4️⃣ Test de récupération de données (SituationMEP):
   ✅ Requête réussie!
   ✅ success: true
   ✅ Erreur: Aucune
   ✅ Nombre de résultats: 5

✅ === DIAGNOSTIC TERMINÉ ===
```

---

### Étape 3 : Analyser les Erreurs Possibles

#### ❌ Erreur : "Cannot find module dataSourcesInfo"
**Solution** : Le SDK n'est pas initialisé
```bash
npm run build
pac code push
```

#### ❌ Erreur : "situationmep not found in dataSourcesInfo"
**Solution** : La source de données n'est pas configurée
```bash
pac code add-data-source -a "shared_sharepointonline" -c "<connectionId>" -t "<tableId>" -d "<dataset>"
```

#### ❌ Erreur : "success: false, error: 'Access denied'"
**Solution** : Problème de permissions SharePoint
- Vérifier les droits de l'utilisateur sur la liste SharePoint
- Vérifier la connexion dans Power Platform

#### ❌ Erreur : "Network error" ou "Timeout"
**Solution** : Problème de connexion
- Vérifier que `npm run dev` fonctionne
- Vérifier que l'app est publiée : `pac code push`
- Tester en environnement de production (pas en local)

---

## 🎯 Checklist de Débogage

### Avant de tester :
- [ ] `npm run build` sans erreurs
- [ ] Power SDK initialisé (voir console au démarrage)
- [ ] Panneau de diagnostic : **toutes les sources configurées** ✅
- [ ] Panneau de diagnostic : **Test GET réussi** ✅

### Pendant le test :
- [ ] Remplir un formulaire (ex: FormSituationMEP)
- [ ] Cliquer sur "Enregistrer"
- [ ] Ouvrir la console (F12)
- [ ] Vérifier les logs **📤 Envoi de la requête**
- [ ] Vérifier les logs **📥 Réponse du serveur**

### Si `success: false` :
- [ ] Copier le message `error` complet
- [ ] Vérifier les champs obligatoires du modèle SharePoint
- [ ] Vérifier que les noms de colonnes correspondent EXACTEMENT

### Si exception JavaScript :
- [ ] Copier la **stack trace** complète
- [ ] Vérifier que les services sont bien importés
- [ ] Vérifier que `dataSourcesInfo` existe

---

## 🛠️ Commandes Utiles

### Reconstruire l'application
```bash
npm run build
```

### Publier vers Power Platform
```bash
pac code push
```

### Ajouter une source de données manquante
```bash
pac code add-data-source -a "shared_sharepointonline" -c "<connectionId>" -t "<tableId>" -d "<dataset>"
```

### Voir les sources configurées
```bash
# Ouvrir le fichier
.power/appschemas/dataSourcesInfo.ts

# Chercher votre table
grep -i "situationmep" .power/appschemas/dataSourcesInfo.ts
```

---

## 📝 Prochaines Étapes

1. **Lancer l'app** : `npm run dev`
2. **Ouvrir la console** (F12)
3. **Lancer le diagnostic** (bouton flottant)
4. **Tester un formulaire** et analyser les logs
5. **Partager les logs** pour diagnostic approfondi si nécessaire

---

## 🎯 Résultat Attendu

### ✅ Si tout fonctionne :
```
📤 Envoi de la requête...
📥 Réponse: { success: true }
✅ Enregistrement réussi!
[Modal verte 2 secondes]
```

### ❌ Si échec :
```
📤 Envoi de la requête...
📥 Réponse: { success: false, error: "Message d'erreur précis" }
❌ Échec: Message d'erreur précis

[Alert avec message détaillé]
```

---

**Les logs détaillés permettront d'identifier le problème exact !** 🚀
