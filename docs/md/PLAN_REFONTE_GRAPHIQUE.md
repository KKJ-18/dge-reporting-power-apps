# Plan de Refonte Graphique — Application DGE Reporting

## 1) Objectif

Refondre l’interface utilisateur pour obtenir une expérience homogène, maintenable et orientée métier, sans régression fonctionnelle sur les flux DA, DSE, DPNP et Direction.

## 2) Périmètre

- Shell applicatif: layout global, sidebar, headers, pages dashboard.
- Parcours métier: catégories, sélection activité, formulaires, modales.
- Rapports et objectifs: pages statistiques, synthèse, objectifs, notifications.
- Exclusions (phase initiale): refonte profonde des modèles SharePoint et logique métier back-office.

## 3) Constats structurants (issus de l’audit)

- UI hétérogène: coexistence styles inline, CSS legacy, Tailwind et écrans modernisés.
- Mapping activité → formulaire dupliqué dans plusieurs composants.
- Règles de rôle/visibilité partiellement réparties entre service et UI.
- Notifications journalières incomplètes (contrôle soumissions non finalisé).
- Plusieurs parcours départementaux proches mais implémentés séparément.

## 4) Principes directeurs de la refonte

1. Unifier le design system avant de retoucher massivement les écrans.
2. Conserver les règles métier existantes, puis les consolider dans une couche dédiée.
3. Réduire la duplication par configuration centralisée.
4. Prioriser lisibilité, performance perçue et cohérence d’interaction.
5. Livrer en incréments courts, testables et réversibles.

## 5) Cible d’architecture UI

### 5.1 Foundation UI
- Tokens uniques (couleurs, typographie, spacing, radius, ombres, z-index).
- Bibliothèque de composants de base (Button, Card, Input, Select, Modal, Alert, Badge, Tabs, PageHeader).
- Patterns partagés (grilles de cards, tableaux, empty/error/loading states).

### 5.2 Orchestration métier
- Registre central des routes/modules visibles par rôle.
- Registre central activité → formulaire (supprime les mappings dispersés).
- Garde d’accès et garde objectif avant soumission, via hooks/services communs.

### 5.3 Pages métier
- Dashboards départementaux basés sur un template unique + thèmes département.
- Page catégorie/activité standardisée pour DA, DSE, DPNP.
- Rapports/objectifs harmonisés avec mêmes composants de filtres et états.

## 6) Roadmap en 3 phases

## Phase 1 — Fondations (Semaine 1 à 2)

### Livrables
- Design tokens finalisés et documentés.
- Kit de composants transverses (v1) utilisé sur 2 écrans pilotes.
- Standard de layout global (sidebar + content + header).

### Travaux
- Créer un dossier UI partagé (`src/components/ui`) et migrer les primitives.
- Supprimer les styles inline critiques dans les composants noyaux.
- Aligner les états Loading/Error/Empty.
- Poser les conventions d’accessibilité (focus, contrastes, labels).

### Critères d’acceptation
- 0 nouveau style inline dans les écrans migrés.
- Parité visuelle desktop sur les écrans pilotes.
- Aucun changement de comportement métier.

## Phase 2 — Harmonisation des parcours (Semaine 3 à 5)

### Livrables
- Dashboard unifié multi-départements (template + variations DA/DSE/DPNP).
- Page catégorie/activité unifiée avec mapping central.
- Modales et formulaires standardisés.

### Travaux
- Remplacer la duplication des dashboards par une base commune.
- Centraliser le mapping activité → formulaire dans une config unique.
- Uniformiser navigation et micro-interactions (hover, active, feedback).
- Migrer progressivement les formulaires les plus utilisés.

### Critères d’acceptation
- Suppression des duplications majeures de mapping.
- Réduction significative des divergences visuelles entre départements.
- Temps de prise en main utilisateur amélioré (navigation plus prévisible).

## Phase 3 — Durcissement UX + Gouvernance (Semaine 6 à 7)

### Livrables
- Contrôle d’accès consolidé par rôle.
- Notifications/objectifs finalisés et cohérents avec les règles métier.
- Guide de contribution UI (Do/Don’t + checklist PR).

### Travaux
- Centraliser les règles de visibilité modules/rapports.
- Compléter la vérification des soumissions journalières.
- Stabiliser les parcours erreurs et messages utilisateurs.
- Ajouter instrumentation minimale (logs UX/erreurs UI).

### Critères d’acceptation
- Rôles Directeur/Chef/Agent correctement appliqués sur tous les modules.
- Notifications quotidiennes fiables (jours ouvrés + vraies vérifications).
- Document de gouvernance utilisé dans les PR UI.

## 7) Backlog priorisé (Top 12)

P0
1. Créer design tokens uniques et supprimer doublons de styles globaux.
2. Centraliser mapping activité → formulaire.
3. Unifier le template de dashboard département.
4. Uniformiser la sidebar et les états actifs/inactifs.
5. Finaliser NotificationService (contrôle réel des soumissions).

P1
6. Standardiser les modales et formulaires de saisie.
7. Harmoniser les pages rapports/synthèse/statistiques.
8. Centraliser garde objectifs avant soumission.
9. Réduire les logs verbeux en production.

P2
10. Rationaliser les anciens écrans legacy non utilisés.
11. Ajouter guide QA visuel par rôle et département.
12. Stabiliser microcopy et terminologie métier.

## 8) Risques et mitigation

- Risque: régressions métier pendant la migration UI.
  - Mitigation: migration incrémentale écran par écran + checklist de non-régression.
- Risque: dette technique déplacée au lieu d’être supprimée.
  - Mitigation: “no new duplication” dans la définition de done.
- Risque: divergence entre docs et implémentation.
  - Mitigation: mise à jour doc obligatoire dans chaque PR majeure UI.

## 9) Plan d’exécution immédiat (prochain sprint)

S1
- Mettre en place tokens + primitives UI.
- Migrer SidebarModern et un dashboard pilote sur les primitives.

S2
- Introduire registre central activité → formulaire.
- Migrer CategoryActivitiesPage + 1 dashboard département complet.

S3
- Consolider notifications/objectif et rôles sur rapports.
- Lancer revue UX avec utilisateurs clés (DA, DSE, DPNP, Direction).

## 10) Définition de Done (refonte)

- Cohérence visuelle inter-modules validée.
- Aucune régression fonctionnelle critique.
- Accessibilité de base respectée (focus, labels, contraste).
- Documentation technique et contribution mise à jour.
