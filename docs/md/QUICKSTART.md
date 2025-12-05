# 🚀 Guide de Démarrage Rapide - Application DGE

## 📦 Installation & Lancement (5 minutes)

### Prérequis
- ✅ Node.js 18+ installé
- ✅ Power Platform CLI (`pac`) installé
- ✅ Compte Power Apps avec licence
- ✅ Accès environnement Power Platform

### Commandes Essentielles

```bash
# 1. Installation des dépendances
npm install

# 2. Lancement mode développement
npm run dev
# ➡️ Application disponible sur http://localhost:5173

# 3. Build production
npm run build

# 4. Test du build
npm run preview
```

---

## 🎨 Ce Qui Est Déjà Prêt

### ✅ Interface Complète
- **Design moderne** avec glassmorphism et animations
- **Navigation latérale** avec 13 menus
- **Dashboard** avec sélection de modules
- **Thème DGE** (rouge, noir, blanc)

### ✅ Formulaires Fonctionnels (4/5 complets)

| Module | État | Sections | Fonctionnalités |
|--------|------|----------|-----------------|
| **Crédit Classique** | 🟡 50% | 4/8 complètes | Auto-save, validation |
| **Crédit Programme** | ✅ 100% | 5/5 complètes | Calcul délais, alertes |
| **Admin Engagements** | ✅ 100% | 6 types + graphique | Totaux auto, répartition |
| **Suivi MEP** | ✅ 100% | Calculs stocks | Formule automatique |
| **Activités Annexes** | ✅ 100% | 5 catégories | Upload fichiers |

### ✅ Fonctionnalités Communes
- 💾 Auto-sauvegarde toutes les 30 secondes
- ✅ Validation en temps réel
- 🔢 Calculs automatiques
- 🎯 Formatage monétaire (MAD)
- 📊 Indicateurs visuels

---

## 📂 Structure des Fichiers Clés

```
src/
├── AppModern.tsx              ⭐ Point d'entrée principal
├── AppModern.css              ⭐ Design system (856 lignes)
├── components/
│   ├── HomePage.tsx           ⭐ Dashboard
│   ├── Sidebar.tsx            ⭐ Navigation
│   └── forms/
│       ├── CreditClassiqueForm.tsx       🟡 À compléter (4 sections manquantes)
│       ├── CreditProgrammeForm.tsx       ✅ Complet
│       ├── AdminEngagementsForm.tsx      ✅ Complet
│       ├── SuiviMEPForm.tsx              ✅ Complet
│       └── ActivitesAnnexesForm.tsx      ✅ Complet
```

---

## 🎯 Tâche Prioritaire #1: Compléter CreditClassiqueForm

### Sections Manquantes (4)

Fichier: `src/components/forms/CreditClassiqueForm.tsx`  
Ligne: ~400

**À ajouter après la Section 4:**

#### Section 5: Dossiers en cours d'analyse
```typescript
<div className="card">
  <div className="card-header">
    <h3 className="card-title">🔍 Dossiers en Cours d'Analyse</h3>
  </div>
  <div className="card-content">
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Nombre de dossiers</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Montant total (MAD)</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Délai moyen d'analyse (jours)</label>
        <input type="number" className="form-input" ... />
      </div>
    </div>
  </div>
</div>
```

#### Section 6: En attente avis risque
```typescript
<div className="card">
  <div className="card-header">
    <h3 className="card-title">⚠️ En Attente Avis Risque</h3>
  </div>
  <div className="card-content">
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Nombre de dossiers</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Montant total (MAD)</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Dossiers &gt; 5 jours (alerte)</label>
        <input type="number" className="form-input" ... />
      </div>
    </div>
  </div>
</div>
```

#### Section 7: En attente conformité
```typescript
<div className="card">
  <div className="card-header">
    <h3 className="card-title">📋 En Attente Conformité</h3>
  </div>
  <div className="card-content">
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Nombre de dossiers</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Montant total (MAD)</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Point bloquant principal</label>
        <select className="form-input">
          <option value="">-- Sélectionnez --</option>
          <option value="document">Document manquant</option>
          <option value="kyc">Vérification KYC</option>
          <option value="signature">Signature</option>
          <option value="autre">Autre</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

#### Section 8: Suivi régularisation
```typescript
<div className="card">
  <div className="card-header">
    <h3 className="card-title">🔧 Suivi Régularisation</h3>
  </div>
  <div className="card-content">
    <div className="form-grid">
      <div className="form-group">
        <label className="form-label">Dossiers régularisés</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Montant régularisé (MAD)</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">En attente régularisation</label>
        <input type="number" className="form-input" ... />
      </div>
      <div className="form-group">
        <label className="form-label">Taux de régularisation</label>
        <div className="stat-value">
          {/* Calculé automatiquement */}
        </div>
      </div>
    </div>
  </div>
</div>
```

**Ajouter dans le type `CreditClassiqueData`:**
```typescript
interface CreditClassiqueData {
  // ... existing fields
  
  // Section 5
  enCoursAnalyse_nombre: number
  enCoursAnalyse_montant: number
  enCoursAnalyse_delaiMoyen: number
  
  // Section 6
  attenteRisque_nombre: number
  attenteRisque_montant: number
  attenteRisque_plusDe5Jours: number
  
  // Section 7
  attenteConformite_nombre: number
  attenteConformite_montant: number
  attenteConformite_pointBloquant: string
  
  // Section 8
  regularises_nombre: number
  regularises_montant: number
  attenteRegularisation_nombre: number
  tauxRegularisation: number // Calculé
}
```

---

## 🔄 Workflow de Développement

### 1. Modifications du Code
```bash
# Éditer les fichiers dans src/
# L'application se recharge automatiquement (hot reload)
```

### 2. Vérification des Erreurs
```bash
# TypeScript vérifie automatiquement
# Les erreurs s'affichent dans le terminal
```

### 3. Test du Build
```bash
npm run build
# ✅ Si succès: Prêt pour production
# ❌ Si erreur: Corriger les erreurs TypeScript
```

---

## 📱 Test de l'Application

### Navigation
1. Lancer `npm run dev`
2. Ouvrir http://localhost:5173
3. Cliquer sur un module dans le dashboard
4. Remplir le formulaire
5. Observer l'auto-sauvegarde (💾 Enregistrement...)
6. Cliquer "Soumettre"

### Vérifications
- ✅ Design moderne s'affiche correctement
- ✅ Validation fonctionne (erreurs en rouge)
- ✅ Calculs automatiques s'actualisent
- ✅ Auto-save toutes les 30s
- ✅ Navigation entre modules fluide

---

## 🔗 Intégration Power Platform (Prochaine Étape)

### Commandes PAC CLI

```bash
# 1. Initialiser l'app Power Apps
pac code init -n "Reporting DGE" -env e78a17af-caf0-e888-989b-beca000173f8

# 2. Ajouter source SharePoint (exemple)
pac code add-data-source -a shared_sharepointonline -c <connectionId>

# 3. Build et push
npm run build
pac code push
```

### Configuration SharePoint (À faire)

**Créer les listes:**
1. `ReportsHebdomadaires`
2. `ReportsMensuels`
3. `ActivitesAnnexes`
4. `UsersTracking`
5. `ValidationWorkflow`

**Colonnes principales:**
- ID (auto)
- Semaine (text)
- Module (choice)
- Utilisateur (person)
- DateSoumission (datetime)
- Statut (choice: Brouillon, Soumis, Validé, Consolidé)
- Données (multi-line JSON)
- Validateur (person)
- DateValidation (datetime)
- Commentaires (multi-line)

---

## 📚 Documentation Disponible

| Fichier | Contenu |
|---------|---------|
| `ARCHITECTURE.md` | 📐 Architecture complète, modules, design system |
| `TODO.md` | 📋 Toutes les tâches restantes avec roadmap |
| `README_COMPLET.md` | 📖 Documentation technique initiale |
| `QUICK_REFERENCE.md` | ⚡ Référence rapide des commandes |
| `DEPLOYMENT_GUIDE.md` | 🚀 Guide de déploiement |

---

## 🎨 Personnalisation du Design

### Modifier les Couleurs
Fichier: `src/AppModern.css` (lignes 1-30)

```css
:root {
  --dge-red: #CC0000;      /* Changer le rouge */
  --dge-black: #1A1A1A;    /* Changer le noir */
  --dge-white: #FFFFFF;    /* Changer le blanc */
}
```

### Ajouter des Animations
```css
@keyframes maNouveleAnimation {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.mon-element {
  animation: maNouveleAnimation 0.3s ease;
}
```

---

## 🐛 Dépannage Rapide

### Problème: L'application ne démarre pas
```bash
# Solution 1: Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install

# Solution 2: Nettoyer le cache
npm cache clean --force
npm install
```

### Problème: Erreurs TypeScript
```bash
# Vérifier les types
npm run build

# Lire attentivement les messages d'erreur
# Ils indiquent le fichier et la ligne exacte
```

### Problème: Auto-save ne fonctionne pas
```typescript
// Vérifier que useEffect est présent dans le formulaire
useEffect(() => {
  const timer = setInterval(() => {
    handleSave(true)
  }, 30000) // 30 secondes
  return () => clearInterval(timer)
}, [formData])
```

---

## 💡 Astuces de Productivité

### VS Code Extensions Recommandées
- **ES7+ React/Redux/React-Native snippets** - Snippets React
- **Prettier** - Formatage auto
- **ESLint** - Détection erreurs
- **TypeScript Hero** - Auto-import
- **Auto Rename Tag** - Renommage balises HTML

### Raccourcis Utiles
- `Ctrl + P` : Recherche fichiers
- `Ctrl + Shift + F` : Recherche globale
- `F2` : Renommer symbole
- `Ctrl + Space` : Auto-complétion

---

## 📊 Métriques Actuelles

```
✅ Fonctionnalités complètes:     80%
✅ Design & UX:                   100%
🚧 Intégration Power Platform:    20%
⏳ Fonctionnalités avancées:      0%

Total lignes de code:             ~4500
Composants React:                 8
Formulaires:                      5
Build size:                       265 KB (74 KB gzipped)
```

---

## 🎯 Objectif Immédiat

**Compléter CreditClassiqueForm (1-2 jours)**
- Ajouter 4 sections manquantes
- Tester toutes les validations
- Vérifier les calculs automatiques
- Build et test final

**Ensuite:**
- Interface de validation hiérarchique
- Historique des rapports
- Intégration SharePoint

---

## 📞 Support

Pour toute question:
1. Consulter `ARCHITECTURE.md` pour la documentation complète
2. Vérifier `TODO.md` pour la roadmap
3. Lire les commentaires dans le code (bien documenté)

---

**Bon développement! 🚀**

*Dernière mise à jour: Janvier 2025*