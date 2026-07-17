# PetroStock SA — Documentation fonctionnelle & technique exhaustive du frontend

> Document de référence généré à partir du code source réel du dossier `frontend/`.  
> Objectif : décrire **absolument tout** — pages, rôles, boutons, flux, données mock, bibliothèques, design system, configuration.  
> Date de rédaction : juillet 2026 · Stack : Next.js 14.2.33 (Pages Router) + React 18 + Tailwind CSS 3.4 + Recharts 2.12.

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Stack technique & bibliothèques](#2-stack-technique--bibliothèques)
3. [Installation, démarrage, arrêt](#3-installation-démarrage-arrêt)
4. [Architecture des dossiers](#4-architecture-des-dossiers)
5. [Configuration & variables d’environnement](#5-configuration--variables-denvironnement)
6. [Design system](#6-design-system)
7. [Couche applicative globale (shell, providers, garde de rôles)](#7-couche-applicative-globale)
8. [Rôles utilisateurs — matrice complète](#8-rôles-utilisateurs--matrice-complète)
9. [Couche données & API (mock / réel)](#9-couche-données--api-mock--réel)
10. [Catalogue des composants UI](#10-catalogue-des-composants-ui)
11. [Catalogue des graphiques](#11-catalogue-des-graphiques)
12. [Page par page — inventaire microscopique](#12-page-par-page--inventaire-microscopique)
13. [Workflows métier transverses](#13-workflows-métier-transverses)
14. [Référentiels de données mock](#14-référentiels-de-données-mock)
15. [Helpers de formatage](#15-helpers-de-formatage)
16. [Accessibilité, responsive, animations](#16-accessibilité-responsive-animations)
17. [Carte des routes](#17-carte-des-routes)
18. [Glossaire](#18-glossaire)

---

## 1. Vision produit

PetroStock SA est un **poste de pilotage** pour la gestion intelligente des stocks pétroliers d’une entreprise fictive opérant **8 dépôts** au Togo.

Ce n’est **pas** un dashboard décoratif. Chaque écran a pour but de :

- montrer **ce qui exige une décision maintenant** ;
- fournir une **quantité élevée d’informations opérationnelles** (stocks, seuils, couverture en jours, suggestions chiffrées, métriques de modèles) ;
- permettre des **actions** (sélection multiple, génération semi-automatique de commandes, déclaration d’incidents, création de bons de commande) ;
- s’adapter au **rôle** de l’utilisateur (Responsable de dépôt / Responsable des achats / Direction).

Le frontend fonctionne en **mode mock** par défaut (aucune API backend requise) et peut basculer vers une API FastAPI réelle.

---

## 2. Stack technique & bibliothèques

### 2.1 Identité du package

| Champ | Valeur |
|---|---|
| Nom npm | `petrostock-frontend` |
| Version | `1.0.0` |
| Privé | `true` |

### 2.2 Scripts npm

| Script | Commande | Usage |
|---|---|---|
| `dev` | `next dev` | Serveur de développement (hot reload), port **3000** |
| `build` | `next build` | Build de production optimisé |
| `start` | `next start` | Servir le build (après `build`) |
| `lint` | `next lint` | Analyse ESLint (config Next) |

### 2.3 Dépendances de production

| Package | Version | Rôle exact dans PetroStock |
|---|---|---|
| **next** | `14.2.33` | Framework React (Pages Router). Routage fichier, SSR/SSG, bundling Webpack, `_app` / `_document`. |
| **react** | `^18.3.1` | Bibliothèque UI (hooks : `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useContext`). |
| **react-dom** | `^18.3.1` | Rendu DOM de React. |
| **recharts** | `^2.12.7` | Graphiques SVG : `AreaChart`, `ComposedChart`, `BarChart`, `Line`, `Bar`, `Area`, axes, tooltips, légendes. Utilisé via `components/charts.js`. |
| **lucide-react** | `^0.525.0` | Icônes vectorielles (Bell, Gauge, AlertTriangle, Package, Sparkles, Zap, etc.). |

### 2.4 Dépendances de développement

| Package | Version | Rôle |
|---|---|---|
| **tailwindcss** | `^3.4.17` | Utility-first CSS ; tokens couleurs/typo dans `tailwind.config.js`. |
| **postcss** | `^8.4.49` | Pipeline CSS (Tailwind + Autoprefixer). |
| **autoprefixer** | `^10.4.20` | Préfixes navigateurs. |
| **eslint** | `^8.57.0` | Linter. |
| **eslint-config-next** | `14.2.33` | Règles ESLint officielles Next.js (alignées sur Next 14.2.33). |

### 2.5 Technologies absentes (volontairement)

- Pas de TypeScript (JS pur `.js`).
- Pas de Redux / Zustand (état local + Context).
- Pas de React Query / SWR (fetch manuel via `api.js`).
- Pas d’authentification réelle (sélecteur de profil de démonstration).
- Pas de mode sombre.

### 2.6 Comment chaque techno est utilisée concrètement

#### Next.js Pages Router

- Chaque fichier sous `pages/` = une route.
- `pages/index.js` → `/`
- `pages/stocks/alertes.js` → `/stocks/alertes`
- `_app.js` enveloppe toutes les pages (providers + shell).
- `_document.js` fixe `lang="fr"` et la meta description.

#### Tailwind CSS

- Classes utilitaires dans le JSX (`bg-navy-800`, `text-ink-muted`, `panel`, etc.).
- Tokens custom : `navy`, `ink`, `canvas`, `line`, `accent`, `success`, `warning`, `danger`.
- Contenu scanné : `pages/**`, `components/**`, `lib/**`, `context/**`.

#### Recharts

- Centralisé dans `components/charts.js`.
- Tooltips en français via `formatNombre`.
- Animations activables (`isAnimationActive`), durée ~500 ms.

#### Lucide React

- Import nommé : `import { Bell } from "lucide-react"`.
- Tailles typiques : 12–18 px.

#### Context API React

- `ProfileContext` : rôle actif.
- `ToastContext` : notifications toast bas-droite.

---

## 3. Installation, démarrage, arrêt

### 3.1 Prérequis

- Node.js **18+** (idéalement 20+)
- npm

### 3.2 Installation (une fois)

```bash
cd c:\Users\USER\Documents\Projet\ProjetDeStage\frontend
npm install
```

En cas de conflits de peers :

```bash
npm install --legacy-peer-deps
```

### 3.3 Démarrer

```bash
cd c:\Users\USER\Documents\Projet\ProjetDeStage\frontend
npm run dev
```

Attendre `✓ Ready` puis ouvrir **http://localhost:3000**.  
**Laisser le terminal ouvert** pendant l’utilisation.

### 3.4 Arrêter

Dans le terminal du serveur : **`Ctrl + C`**.

Si le port 3000 reste bloqué (PowerShell) :

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 3.5 Build production

```bash
npm run build
npm run start
```

---

## 4. Architecture des dossiers

```
frontend/
├── components/
│   ├── AppShell.js              ← barre latérale + header + notifications
│   ├── charts.js                ← tous les graphiques Recharts
│   └── ui/                      ← design system atomique
│       ├── ActionBar.js
│       ├── Badge.js
│       ├── Button.js
│       ├── Card.js
│       ├── DataTable.js
│       ├── EmptyState.js
│       ├── ErrorBanner.js
│       ├── KpiCard.js
│       ├── Modal.js
│       ├── PageHeader.js
│       ├── Skeleton.js
│       ├── StatStrip.js
│       ├── SubNav.js
│       └── TankGauge.js
├── context/
│   ├── ProfileContext.js        ← rôle (depot / achats / direction)
│   └── ToastContext.js          ← toasts succès / erreur
├── lib/
│   ├── api.js                   ← client HTTP + couche mock
│   ├── constants.js             ← rôles, navigation, enums
│   ├── format.js                ← formatage fr-FR
│   ├── mockData.js              ← jeux de données de base
│   └── opsData.js               ← alertes enrichies, actions, journal, matrice
├── pages/
│   ├── _app.js
│   ├── _document.js
│   ├── index.js                 ← Pilotage /
│   ├── stocks/
│   │   ├── index.js
│   │   ├── alertes.js
│   │   └── historique.js
│   ├── previsions/
│   │   ├── index.js
│   │   └── ruptures.js
│   ├── anomalies/
│   │   ├── index.js
│   │   └── analyser.js
│   ├── commandes/
│   │   ├── index.js
│   │   ├── nouvelle.js
│   │   └── fournisseurs.js
│   ├── incidents/
│   │   ├── index.js
│   │   └── declarer.js
│   └── finances/
│       ├── index.js
│       ├── factures.js
│       └── clients.js
├── styles/
│   └── globals.css
├── etapes/                      ← guides / specs historiques (hors runtime)
├── .env.local
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── .eslintrc.json
└── README.md
```

**Note :** le dossier `etapes/` contient des spécifications Markdown pédagogiques ; il n’est **pas** chargé par l’application au runtime.

---

## 5. Configuration & variables d’environnement

Fichier : `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=true
```

| Variable | Effet |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | Si différent de `"false"` → **mode mock** (données locales). Si `"false"` → appels `fetch` vers l’API. |
| `NEXT_PUBLIC_API_URL` | Base URL de l’API FastAPI lorsque le mock est désactivé. |

Dans `lib/api.js` :

```js
const MODE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

**Important :** toute variable `NEXT_PUBLIC_*` est injectée au build / au démarrage ; après modification de `.env.local`, **redémarrer** `npm run dev`.

### 5.1 next.config.js

```js
reactStrictMode: true
```

Double montage des effets en développement (comportement React 18 Strict Mode).

---

## 6. Design system

### 6.1 Philosophie visuelle

- Thème **clair** professionnel (pas de glassmorphism sombre).
- Bleu marine `#14325A` comme couleur d’autorité.
- Accent ambre/or `#B8952F` **économe** (logo, badges secondaires, CTA semi-auto).
- Typographie **IBM Plex Sans** (UI) + **IBM Plex Mono** (chiffres `mono-nums`).
- Coins légèrement arrondis (`rounded`, `rounded-md`, `rounded-lg`) — géométrie sobre.
- Largeur max contenu : `1440px` (`max-w-shell`).

### 6.2 Palette (tokens Tailwind)

#### Navy (marque / navbar / en-têtes de tableaux)

| Token | Hex |
|---|---|
| `navy` / `navy-700` | `#14325A` |
| `navy-50` | `#EAF1FB` |
| `navy-100` | `#D5E3F4` |
| `navy-800` | `#0F2744` |
| `navy-900` | `#0A1B30` |

#### Ink (texte)

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1A2332` | Texte principal |
| `ink-soft` | `#3D4A5C` | Texte secondaire riche |
| `ink-muted` | `#5B6B7C` | Labels, légendes |
| `ink-faint` | `#8A97A8` | Meta / horodatages |

#### Canvas / surfaces

| Token | Hex |
|---|---|
| `canvas` | `#F1F4F8` | Fond de page |
| `canvas-card` | `#FFFFFF` | Cartes |
| `canvas-tint` | `#E8EEF5` | Fonds secondaires |
| `line` | `#D8DEE8` | Bordures |
| `line-strong` | `#B8C2D1` | Bordures renforcées |

#### États métier

| Token | Hex | Soft |
|---|---|---|
| `success` | `#1E8E5A` | `#E6F5EE` |
| `warning` | `#C9841A` | `#FBF0DC` |
| `danger` | `#C63B3B` | `#FBEAEA` |
| `accent` | `#B8952F` | `#F7F0DB` |

### 6.3 Classes CSS globales (`styles/globals.css`)

| Classe | Rôle |
|---|---|
| `.panel` | Carte : fond blanc, bordure `line`, ombre `panel`, coins `rounded-lg` |
| `.page-title` | Titre H1 de page |
| `.page-subtitle` | Sous-titre |
| `.field-label` | Label de formulaire (xs, medium, muted) |
| `.field-input` | Input/select/textarea standardisé |
| `.mono-nums` | Chiffres tabulaires (IBM Plex Mono) |
| `.skeleton` | Placeholder shimmer de chargement |
| `.animate-fade-up` | Entrée légère vers le haut |
| `.animate-fade-in` | Fondu |
| `.animate-scale-in` | Ouverture modale |
| `.stagger` | Cascade d’animation sur enfants |

### 6.4 Ombres

| Token | Usage |
|---|---|
| `shadow-panel` | Cartes au repos |
| `shadow-raised` | Modales, ActionBar, menus |

### 6.5 Code couleur métier (règle stricte)

| Niveau | Couleur | Signification |
|---|---|---|
| Normal / OK / Livré / Payée | Vert (`success`) | Situation saine |
| Attention / Bas / En attente / Partielle | Ambre (`warning`) | Surveillance |
| Critique / Rouge / En retard / Impayée | Rouge (`danger`) | Action urgente |
| Info / Neutre | Navy soft / gris | Information |

---

## 7. Couche applicative globale

### 7.1 `_document.js`

- `<Html lang="fr">`
- Meta description : *PetroStock SA — Gestion intelligente des stocks pétroliers*

### 7.2 `_app.js` — ordre d’emboîtement

```
ProfileProvider
  └─ ToastProvider
       └─ Head (title: PetroStock SA)
            └─ AppShell
                 └─ RoleGuard
                      └─ <Component />  ← page courante
```

### 7.3 `AppShell` — coque permanente

#### Barre latérale (desktop `lg+`, largeur `w-60`)

- Fond `bg-navy-800`
- Logo : icône Gauge + texte **PetroStock SA** + sous-titre *Gestion des stocks*
- Section **Navigation** : liens filtrés selon le rôle
- Pied : **Profil actif** — `<select>` avec les 3 rôles (persisté en `localStorage`)

#### Header sticky

- Gauche : bouton hamburger (mobile) + libellé de session (rôle)
- Droite : cloche **Bell** avec badge numérique = nombre d’alertes ouvertes
  - Clic → panneau des 5 dernières alertes
  - Lien **Voir toutes les alertes** → `/stocks/alertes`
  - Chaque ligne de notif → `/stocks/alertes`

#### Contenu principal

- `main` centré, `max-w-shell` (1440px), padding responsive

#### Mobile

- Drawer latéral plein écran (overlay sombre + panneau `w-72`)
- Fermeture : croix, overlay, ou changement de route

#### Règle d’activation des liens (`isActive`)

- `/` : exact
- `/stocks` : actif seulement pour `/stocks` et `/stocks/historique` (pas `/stocks/alertes`, qui a sa propre entrée menu)
- Autres : préfixe de chemin

### 7.4 `RoleGuard`

1. Attend `pret === true` (profil chargé depuis localStorage) et `router.isReady`.
2. Trouve l’entrée `NAV_ITEMS` correspondant au pathname (match exact ou préfixe).
3. Si le rôle courant n’est **pas** dans `item.roles` et que le path n’est pas `/` → `router.replace("/")`.

Les sous-routes héritent du parent :
- `/finances/factures` → finances → **Direction uniquement**
- `/commandes/nouvelle` → commandes → **Achats ou Direction** (puis blocage page si pas Achats)

### 7.5 `ProfileContext`

| Champ | Description |
|---|---|
| `profil` | `"depot"` \| `"achats"` \| `"direction"` (défaut : `"achats"`) |
| `setProfil` | Change le rôle |
| `pret` | `true` après lecture localStorage |
| `label` | Libellé FR du rôle |
| `isDepot` / `isAchats` / `isDirection` | Booléens pratiques |
| Clé storage | `petrostock-profile` |

### 7.6 `ToastContext`

| Méthode | Comportement |
|---|---|
| `push(message, type?)` | Affiche un toast (`success` vert ou `error` rouge), auto-fermeture **3,5 s** |
| `dismiss(id)` | Retrait manuel |

Position : bas-droite, `z-[80]`.

---

## 8. Rôles utilisateurs — matrice complète

### 8.1 Les trois profils

| Valeur | Libellé UI | Intention métier |
|---|---|---|
| `depot` | Responsable de dépôt | Opérations terrain : stocks, alertes, incidents (déclaration), prévisions/anomalies en lecture/action limitée |
| `achats` | Responsable des achats | Approvisionnement : commandes, semi-auto alertes, suggestions prévisions, fournisseurs |
| `direction` | Direction | Pilotage + finances + suivi commandes (sans création) ; pas de prévisions/anomalies IA dans le menu |

### 8.2 Visibilité du menu latéral

| Entrée menu | Route | Dépôt | Achats | Direction |
|---|---|:---:|:---:|:---:|
| Pilotage | `/` | ✓ | ✓ | ✓ |
| Alertes | `/stocks/alertes` | ✓ | ✓ | ✓ |
| Stocks | `/stocks` | ✓ | ✓ | ✓ |
| Prévisions IA | `/previsions` | ✓ | ✓ | ✗ |
| Anomalies | `/anomalies` | ✓ | ✓ | ✗ |
| Commandes | `/commandes` | ✗ | ✓ | ✓ |
| Incidents | `/incidents` | ✓ | ✓ | ✓ |
| Finances | `/finances` | ✗ | ✗ | ✓ |

### 8.3 Spécificités fines (boutons / blocs conditionnels)

| Page | Condition | Effet |
|---|---|---|
| Pilotage | `isDirection` | Affiche la variation j/j sur le KPI valeur stock |
| Pilotage | `isAchats` | Liens **Commander** sur ruptures critiques |
| Centre d’alertes | `isAchats` | Bouton **Semi-auto critiques**, ActionBar **Générer commandes**, CTA modale **Créer la commande suggérée** |
| Prévisions | `isAchats` | **Commander**, **Générer suggestion de commande**, modale de création |
| Commandes (liste) | `isAchats` | Bouton **Nouvelle commande** |
| Commandes / nouvelle | `!isAchats` | Écran **Accès restreint** (même si RoleGuard laisse passer Direction) |
| Incidents (liste) | `isDepot` | Bouton **Déclarer un incident** |
| Incidents / déclarer | `!isDepot` | Écran **Accès restreint** |

### 8.4 Ce que chaque rôle « vit » en pratique

#### Responsable de dépôt

- Voit Pilotage, Alertes, Stocks, Prévisions, Anomalies, Incidents.
- Peut **déclarer** un incident (gravité estimée automatiquement).
- Ne crée **pas** de commande fournisseur.
- Peut consulter les alertes et les prévisions, mais les actions d’achat sont masquées.

#### Responsable des achats

- Cœur du semi-automatique : centre d’alertes + prévisions → commandes.
- Accès fournisseurs, nouvelle commande, batch.
- Ne voit **pas** Finances.

#### Direction

- Pilotage + stocks/alertes/incidents en lecture opérationnelle.
- **Finances** exclusive (CA, factures, clients).
- Commandes en suivi (pas de création).
- Pas d’entrée Prévisions / Anomalies dans le menu.

---

## 9. Couche données & API (mock / réel)

### 9.1 Interface publique

```js
api.get(endpoint)
api.post(endpoint, donnees)
isMockMode  // booléen
```

Délai artificiel mock : **~60 ms** (simulation réseau).

### 9.2 Catalogue complet des endpoints mockés

| Méthode | Endpoint | Réponse |
|---|---|---|
| GET | `/kpi/` | Indicateurs globaux |
| GET | `/ops/actions/` | File d’actions prioritaires (dashboard) |
| GET | `/ops/journal/` | Journal opérationnel |
| GET | `/ops/matrice-depots/` | Matrice des 8 dépôts enrichie |
| GET | `/stocks/alertes/` | Alertes enrichies (opsData) |
| POST | `/stocks/alertes/actions` | Body `{ ids[], action }` — voir §13 |
| GET | `/stocks/` | Série D001 par défaut |
| GET | `/stocks/{depotId}` | Série temporelle du dépôt |
| GET | `/previsions/resume/` | Matrice dépôt×produit |
| GET | `/previsions/{produitId}?depot_id=&horizon_jours=` | Détail + historique + bandes |
| GET | `/ruptures/` | Liste risques rupture |
| GET | `/ruptures/{depotId}?produit_id=` | Une rupture |
| GET | `/anomalies/` | Liste anomalies |
| POST | `/anomalies/detecter` | Score d’anomalie sur observation manuelle |
| GET | `/commandes/` | Liste bons de commande |
| POST | `/commandes/` | Création d’une commande |
| POST | `/commandes/batch` | Création multiple |
| GET | `/fournisseurs/` | Classement fournisseurs |
| GET | `/incidents/` | Registre |
| POST | `/incidents/` | Déclaration (gravité random mock) |
| GET | `/factures/` | Factures |
| GET | `/finances/ca-mensuel/` | Série CA mensuel |
| GET | `/metas/` | Dépôts, produits, fournisseurs, clients |

### 9.3 Actions sur alertes (`POST /stocks/alertes/actions`)

| `action` | Effet mock |
|---|---|
| `ignorer` | `statut = "ignoree"` |
| `marquer_traitee` | `statut = "traitee"` |
| `escalader` | `statut = "en_traitement"`, `assignee = "achats"`, `priorite = 1` |
| `generer_commande` | Crée un BC via suggestion IA de l’alerte + passe l’alerte en `en_traitement` |

### 9.4 Mode réel

Si `NEXT_PUBLIC_USE_MOCK=false` :

```js
fetch(`${API_URL}${endpoint}`, {
  headers: { "Content-Type": "application/json" },
  ...options,
})
```

Erreur HTTP → `Error: Erreur API {status} sur {endpoint}`.

---

## 10. Catalogue des composants UI

### 10.1 `Button`

| Prop | Valeurs | Défaut |
|---|---|---|
| `variant` | `primary` \| `secondary` \| `danger` \| `ghost` | `primary` |
| `type` | `button` \| `submit` | `button` |
| `loading` | bool → spinner Lucide `Loader2` | `false` |
| `disabled` | bool | `false` |
| `href` | si présent → rend un `Link` Next au lieu d’un `<button>` | — |
| `children` | contenu | — |

### 10.2 `Badge`

| Prop | Valeurs |
|---|---|
| `label` | Texte affiché (toujours présent — accessibilité) |
| `niveau` | `normal` \| `attention` \| `critique` \| `info` \| `neutre` |

### 10.3 `Card`

| Prop | Rôle |
|---|---|
| `title` | En-tête H2 |
| `action` | Zone droite de l’en-tête (liens, boutons) |
| `bodyClassName` | Override padding (ex. `!p-0` pour tableaux plein bord) |
| `children` | Corps |

### 10.4 `PageHeader`

Titre + description + zone `actions` (boutons à droite).

### 10.5 `StatStrip`

Bandeau dense 2→3→6 colonnes. Items : `{ label, value, tone?, hint? }`.  
`tone` : `danger` \| `warning` \| `success` \| défaut ink.

### 10.6 `ActionBar` + `ActionBarBtn`

Barre sticky (sous le header) apparaissant quand `count > 0`.  
Boutons : `variant` `default` \| `primary` \| `danger`, ou `href`.

### 10.7 `Modal`

- Overlay cliquable, Esc pour fermer, `role="dialog"`, `aria-modal="true"`.
- Props : `open`, `onClose`, `title`, `footer`, `wide` (max-w-3xl vs max-w-lg).
- Bloque le scroll `body` à l’ouverture.

### 10.8 `DataTable`

- Tri par colonne (si `sortable`)
- Pagination : 10 / 25 / 50
- Boutons **Préc.** / **Suiv.**
- `onRowClick` optionnel
- `empty` : composant vide custom
- Colonnes : `{ key, label, sortable?, sortValue?, render?, className? }`

### 10.9 `EmptyState`

`icon` (composant Lucide), `title`, `description`.

### 10.10 `ErrorBanner`

Titre + description + bouton optionnel **Réessayer**.

### 10.11 `Skeleton` / `SkeletonKpi` / `SkeletonBlock`

Placeholders de chargement (évite les sauts de layout).

### 10.12 `TankGauge`

Jauge cylindrique SVG (signature visuelle cuve) :

| Prop | Défaut | Rôle |
|---|---|---|
| `taux` | 0 | Remplissage 0–100 % |
| `seuilPct` | 40 | Ligne pointillée ambre |
| `height` | 120 | Hauteur SVG |

Couleur liquide : vert ≥55 %, ambre 35–55 %, rouge &lt;35 %.  
Transition hauteur 600 ms.

### 10.13 `KpiCard`

Carte KPI avec bordure gauche colorée, icône optionnelle, variation % optionnelle.

### 10.14 `SubNav`

Fil d’Ariane : **Retour — {parent}** / {current}.

### 10.15 `AppShell`

Voir §7.3.

---

## 11. Catalogue des graphiques

Fichier : `components/charts.js`

| Composant | Type Recharts | Données clés | Pages |
|---|---|---|---|
| `StockAreaChart` | AreaChart | `date`, `stock_fin_jour` | Stocks, Anomalies (détail) |
| `StockComposedChart` | ComposedChart | stock + entrees + sorties + seuil | Historique |
| `ForecastChart` | ComposedChart | historique `sorties` + `prevision` + intervalle basse/haute | Prévisions détail |
| `RevenueBarChart` | BarChart | `mois`, `total` ou stacks types clients | Finances |
| `HorizontalClientsChart` | BarChart horizontal | `nom`, `ca` | Clients |

Tooltip style : fond blanc, bordure `line`, police 12 px.  
Formatter numérique : `formatNombre`.

---

## 12. Page par page — inventaire microscopique

---

### 12.1 Pilotage — `/` — `pages/index.js`

#### Objectif

Afficher **ce qui doit être traité maintenant** : actions prioritaires, journal, matrice dépôts, ruptures &lt; 5 j, top alertes.

#### Chargement données

`Promise.all` :

1. `GET /kpi/`
2. `GET /ops/actions/`
3. `GET /ops/matrice-depots/`
4. `GET /ops/journal/`
5. `GET /stocks/alertes/`
6. `GET /previsions/resume/`

Rafraîchissement automatique **toutes les 60 secondes**.

#### StatStrip (6 cases)

1. **Valeur stock** — USD ; hint variation j/j si Direction  
2. **Alertes ouvertes** — count + hint critiques  
3. **Ruptures &lt; 5 j** — count  
4. **Remplissage moyen** — %  
5. **Incidents ouverts** — count  
6. **Dernière maj** — heure HH:MM  

#### Boutons / liens

| Contrôle | Label | Action |
|---|---|---|
| Button | Actualiser | Relance `charger()` |
| Button (par action) | Créer la commande / Ouvrir le centre d'alertes / Voir l'incident / Suivre la commande / Analyser / Voir les stocks | Navigue via `action_href` |
| Link | Vue stocks → | `/stocks` |
| Link | Ouvrir | `/stocks?depot={id}` |
| Link | Centre prévisions → | `/previsions` |
| Link | Commander | `/commandes/nouvelle?...` (Achats) |
| Link | Centre d'alertes → | `/stocks/alertes` |
| ErrorBanner | Réessayer | Relance chargement |

#### Sections

1. **À traiter maintenant** — liste d’actions P1/P2 avec icônes typées  
2. **Journal opérationnel** — horodatages + badges de type  
3. **Matrice des 8 dépôts** — table : dépôt, région, barre remplissage, valeur, alertes, couverture min, statut, lien  
4. **Ruptures estimées &lt; 5 jours** — stock, conso/j, suggestion, coût, jours, Commander  
5. **Alertes ouvertes (top priorité)** — 6 premières triées priorite puis couverture  

---

### 12.2 Stocks — `/stocks` — `pages/stocks/index.js`

#### Objectif

Poste opérationnel par dépôt : niveau instantané, flux 30 j, alertes locales, aperçu multi-dépôts.

#### API

`/metas/`, `/stocks/alertes/`, `/stocks/{depotId}`, `/ops/matrice-depots/`  
Query : `?depot=`

#### Contrôles

| Contrôle | Label / contenu |
|---|---|
| Button | Centre d'alertes |
| Button | Historique (avec flèche) |
| Select | Dépôt actif (8 options + capacité) |
| Badge | Statut dépôt (Critique / Attention / Normal) |
| Boutons tableau | Activer (par dépôt) |
| Link | Historique détaillé |

#### StatStrip

Stock actuel · Remplissage · Valeur estimée · Alertes ouvertes · Entrées 30 j · Sorties 30 j

#### Blocs

- Jauge `TankGauge` + `StockAreaChart` 30 jours  
- Liste alertes ouvertes du dépôt (titre, stock/seuil/couverture, suggestion)  
- Table aperçu tous dépôts  

---

### 12.3 Centre d’alertes — `/stocks/alertes` — `pages/stocks/alertes.js`

#### Objectif

**Cœur décisionnel** : sélection multiple, workflow, suggestions IA, semi-automatisation des commandes.

#### API

- GET `/stocks/alertes/`, `/metas/`
- POST `/stocks/alertes/actions`
- Query `?niveau=` (préfiltre)

#### Filtres

| Champ | Options |
|---|---|
| Niveau | Tous / Critique / Attention |
| Statut workflow | Tous / Ouverte / En traitement / Traitée / Ignorée |
| Dépôt | Tous + 8 dépôts |
| Recherche | Texte libre (ID, titre, message, dépôt, produit) |

#### StatStrip

Total filtrées · Critiques · Ouvertes · En traitement · Sélection · Volume suggéré (si sélection)

#### Bouton header (Achats)

**Semi-auto critiques** — prépare un batch des alertes **critiques + ouvertes + sélectionnées**.

#### ActionBar (si sélection &gt; 0)

| Bouton | Qui | Effet |
|---|---|---|
| Tout désélectionner | Tous | Clear sélection |
| Générer commandes | Achats | `generer_commande` puis redirect `/commandes` |
| Escalader achats | Tous | `escalader` |
| Marquer traitée | Tous | `marquer_traitee` |
| Ignorer | Tous | `ignorer` |

#### Tableau

Colonnes :

1. Checkbox (ligne + tout sélectionner)  
2. ID (`ALR-1xxx`)  
3. Alerte (badge niveau + titre + dépôt/stock/seuil)  
4. Couverture (jours, couleur danger/warning)  
5. Suggestion IA (qté, fournisseur, score, impact USD, délai)  
6. Statut workflow  
7. Lien **Détail**  

#### Modale détail

Grille de champs : ID, Dépôt, Produit, Stock, Seuil, Couverture, Conso/j, Assignee, Créée, MAJ.  
Encart **Suggestion semi-automatique** avec formule textuelle.  
Boutons : **Fermer** · **Créer la commande suggérée** (Achats).

#### Modale semi-auto

- Résumé volume total + impact USD  
- Liste des cibles ID · dépôt/produit · qté → fournisseur  
- **Annuler** · **Confirmer N commande(s)**  

---

### 12.4 Historique stocks — `/stocks/historique`

#### Objectif

Exploration fine : filtres, KPI contextuels, graphique composé, table paginée, export CSV.

#### Contrôles

| Contrôle | Détail |
|---|---|
| SubNav | Retour — Stocks / Historique |
| Button | Exporter CSV |
| Select | Dépôt |
| Select | Produit (Tous + liste) |
| Select | Période 7 / 30 / 90 j |
| Button | Réinitialiser |
| Checkboxes | Stock / Entrées / Sorties (séries graphique) |
| DataTable | Tri + pagination |

#### KPI

Stock actuel · Taux actuel · Points d’anomalie

#### Graphique

`StockComposedChart` : barres entrées/sorties + ligne stock + ligne pointillée seuil.

#### Colonnes table

Date · Produit · Début · Entrées · Sorties · Fin · Taux · Statut (Normal/Bas/Critique)

---

### 12.5 Prévisions IA — `/previsions`

#### Objectif

Centre stratégique : matrice dépôt×produit, recommandations chiffrées, courbe Prophet, création de commande depuis suggestion.

#### Vues (onglets)

1. **Matrice & recommandations**  
2. **Courbe détaillée**  

Query `?depot=&produit=` force la vue détail.

#### StatStrip

Couples suivis · Critiques (&lt;5 j) · Attention (5–10 j) · Volume à commander · Budget estimé · MAPE moyen

#### Matrice — filtres

Chips : Tous / Critiques / Attention / Opportunités  
Tri : Urgence / Volume / Coût / Confiance

#### Colonnes matrice

Dépôt/Produit · Stock · Conso/j · Rupture (+ badge) · Tendance · Confiance (+ MAPE) · Suggestion (+ fournisseur/score) · Coût · Actions **Courbe** / **Commander**

#### Vue détail

- Selects Dépôt / Produit  
- Horizon **7 j / 15 j / 30 j**  
- **← Retour matrice**  
- Bandeau estimation rupture + `TankGauge` + badge  
- Bouton **Générer suggestion de commande** (Achats)  
- `ForecastChart`  
- Métriques MAE / RMSE / MAPE  

#### Modale commande

Fournisseur (classé par score) · Quantité modifiable · Coût estimé · **Annuler** / **Créer la commande**

#### Lien

**Vue risques de rupture →** `/previsions/ruptures`

---

### 12.6 Risques de rupture — `/previsions/ruptures`

SubNav Retour — Prévisions.  
Filtres Dépôt / Niveau.  
Table : Dépôt, Produit, Stock, Conso/j, Avant rupture, Niveau, lien **Voir prévision**.

---

### 12.7 Anomalies — `/anomalies`

#### Liste

Filtres Dépôt / Sévérité (Toutes / Élevé ≥ 0,80).  
Bouton **Analyse manuelle**.  
Table : Date, Dépôt, Produit, Stock fin, Score (barre + chiffre), Badge Anomalie.  
Clic ligne → modale.

#### Modale détail

Métadonnées + explication + `StockAreaChart` 14 jours autour.

---

### 12.8 Analyse manuelle — `/anomalies/analyser`

Formulaire :

- Stock fin de jour  
- Entrées  
- Sorties  
- Taux de remplissage (%)  

Bouton **Analyser cette observation** → `POST /anomalies/detecter` → Badge Normal / Anomalie + score.  
Toast succès/erreur.

---

### 12.9 Commandes — `/commandes`

#### Header

- **Fournisseurs** → `/commandes/fournisseurs`  
- **Export** CSV  
- **Nouvelle commande** (Achats)  

#### KPI

Commandes · Montant · En attente · En retard

#### Onglets statut

Toutes / En attente / Validée / Livrée / En retard (avec compteurs)

#### Table

ID · Date · Fournisseur · Dépôt · Produit · Qté · Statut · Retard  
Clic → modale lecture seule (toutes les propriétés).

---

### 12.10 Nouvelle commande — `/commandes/nouvelle`

**Bloqué si pas Achats.**

Champs : Date · Fournisseur · Dépôt destination · Produit · Quantité.  
Préremplissage query : `?depot=&produit=&qte=`.  
**Créer la commande** · **Annuler**.

---

### 12.11 Fournisseurs — `/commandes/fournisseurs`

Cartes classées par score décroissant.  
Pour chaque : nom, pays, score, badge **Recommandé** (1er), barres Fiabilité 50 % / Délai 30 % / Prix 20 %.

---

### 12.12 Incidents — `/incidents`

Bouton **Déclarer un incident** (Dépôt seulement).  
Filtres : Dépôt · Type · Gravité · Statut.  
Table : ID, Date, Dépôt, Type, Gravité, Coût, Arrêt (h), Statut, Produit.

---

### 12.13 Déclarer un incident — `/incidents/declarer`

**Bloqué si pas Dépôt.**

Formulaire : Date · Dépôt · Produit (optionnel) · Type (8 types) · Description.  
**Pas de champ gravité** — estimée au POST.  
Après succès : ID + badge gravité + message notification si Élevé/Critique · **Voir le registre**.

---

### 12.14 Finances — `/finances` (Direction)

Boutons **Factures** · **Clients**.  
KPI : CA · Taux de recouvrement · En attente.  
Graphique CA mensuel : toggle **Vue globale** / **Par type de client**.

---

### 12.15 Factures — `/finances/factures`

Filtres Type de client · Région.  
Table : ID, Client, Date, Produit, Dépôt, Montant TTC, Statut paiement (Payée / Partielle / En retard / Impayée).

---

### 12.16 Clients — `/finances/clients`

`HorizontalClientsChart` top clients + liste détaillée CA.

---

## 13. Workflows métier transverses

### 13.1 Semi-auto alertes → commandes

1. Profil **Achats**  
2. `/stocks/alertes`  
3. Filtrer critiques / ouvertes  
4. Cocher des lignes  
5. **Semi-auto critiques** OU **Générer commandes**  
6. Confirmer (si semi-auto)  
7. BC créés + redirect `/commandes`  

### 13.2 Prévision → commande

1. Matrice prévisions  
2. **Commander** ou détail → **Générer suggestion**  
3. Ajuster fournisseur / quantité  
4. **Créer la commande**  

### 13.3 Alerte détail → commande unitaire

1. **Détail** sur une alerte  
2. **Créer la commande suggérée**  
3. Arrive sur `/commandes/nouvelle` préremplie  

### 13.4 Déclaration d’incident

1. Profil **Dépôt**  
2. `/incidents/declarer`  
3. Soumettre → gravité auto + éventuelle mention de notification  

### 13.5 Changement de rôle (démo)

1. Select **Profil actif** (sidebar)  
2. Menu se recalcule  
3. RoleGuard redirige si la page courante n’est plus autorisée  

---

## 14. Référentiels de données mock

### 14.1 Dépôts (8)

| ID | Label | Région | Capacité |
|---|---|---|---|
| D001 | Lomé Central | Lomé | 200 000 |
| D002 | Terminal Portuaire | Lomé | 130 000 |
| D003 | Tsévié | Maritime | 85 000 |
| D004 | Atakpamé | Plateaux | 70 000 |
| D005 | Sokodé | Centrale | 110 000 |
| D006 | Kara Nord | Kara | 95 000 |
| D007 | Kpalimé | Plateaux | 75 000 |
| D008 | Dapaong | Savanes | 60 000 |

### 14.2 Produits (5)

| ID | Label | Catégorie | Unité |
|---|---|---|---|
| PRD001 | Super Sans Plomb | Carburant | L |
| PRD002 | Gasoil | Carburant | L |
| PRD003 | Gasoil Premium | Carburant | L |
| PRD004 | Kérosène | Aviation | L |
| PRD005 | GPL | Gaz | kg |

### 14.3 Fournisseurs (6)

TotalEnergies Togo · Vivo Energy · Oryx Energies · MRS Oil · Puma Energy · Sahara Group  
Chacun : `score`, `fiabilite`, `delai`, `prix`, `pays`.

### 14.4 Clients (5)

SOTRAL · Aéroport de Lomé · Ciments du Togo · Ministère des Armées · Distributeurs Kara

### 14.5 Alertes enrichies (opsData)

À partir des alertes brutes (~22), chaque alerte reçoit :

- `id` (`ALR-1xxx`)  
- `titre`, `message`  
- `niveau` normalisé (`critique` / `attention`)  
- `type_alerte`  
- `statut` : `ouverte` \| `en_traitement` \| `traitee` \| `ignoree`  
- `priorite` (1 ou 2)  
- `assignee`  
- `conso_jour`, `delai_fournisseur`  
- `actions_disponibles[]`  
- `suggestion` : quantité, formule, fournisseur, score, délai, urgence_heures, impact_estime_usd  

### 14.6 Matrice prévisions

Une ligne par entrée `mockRuptures` (~24 couples) avec :

- jours avant rupture, niveau, tendance  
- confiance_modele_pct, mape, mae  
- quantite_suggeree, fournisseur_recommande, cout_estime_fcfa  
- saisonnalite, opportunite_achat  

### 14.7 Actions prioritaires dashboard

6 actions typées : `commande_urgente`, `alerte_critique`, `incident`, `commande_retard`, `anomalie`, `transfert` — chacune avec `lien`, `action_label`, `action_href`.

### 14.8 Séries stocks

90 jours générés par dépôt (bruit déterministe + entrées/sorties), champs : dates, stocks début/fin, entrees, sorties, taux, seuil, flags alerte/anomalie.

---

## 15. Helpers de formatage (`lib/format.js`)

| Fonction | Exemple de sortie |
|---|---|
| `formatNombre(8425000)` | `8 425 000` |
| `formatUsd(8425000)` | `8 425 000 $` |
| `formatFcfa(23875000)` | `23 875 000 FCFA` |
| `formatPct(84.7)` | `84,7 %` |
| `formatDate(d, "court")` | `17/07/2026` |
| `formatDate(d, "long")` | `17 juillet 2026` |
| `formatHeure(d)` | `14:32` |
| `formatJours(3)` | `3 jours` |
| `formatScore(0.91)` | `0,91` |
| `exporterCsv(nom, lignes)` | Téléchargement CSV UTF-8 BOM, séparateur `;` |

Locale : **`fr-FR`** partout.

---

## 16. Accessibilité, responsive, animations

### 16.1 Accessibilité

- Focus visible : outline navy 2 px  
- Modales : `role="dialog"`, `aria-modal`, Esc, overlay  
- Badges toujours textuels (jamais couleur seule)  
- Cloche : `aria-label="Voir les alertes"`  
- Graphiques : `aria-label` sur conteneurs  
- `prefers-reduced-motion` : animations quasi annulées  

### 16.2 Responsive

| Breakpoint | Comportement |
|---|---|
| &lt; `lg` (1024) | Sidebar cachée → hamburger + drawer |
| `sm` | Grilles 2 colonnes |
| `lg`+ | Sidebar fixe, grilles 4–6 colonnes |
| Contenu | max 1440 px centré |

### 16.3 Animations fonctionnelles

- Entrée pages : `animate-fade-up`  
- Modales : `animate-scale-in` + overlay fade  
- ActionBar : fade-up à l’apparition  
- Jauge : transition hauteur 600 ms  
- Toasts : fade-up  

---

## 17. Carte des routes

```
/                            Pilotage
/stocks                      Stocks — poste opérationnel
/stocks/alertes              Centre d'alertes
/stocks/historique           Historique détaillé
/previsions                  Centre de prévisions IA
/previsions/ruptures         Risques de rupture
/anomalies                   Anomalies détectées
/anomalies/analyser          Analyse manuelle
/commandes                   Liste des commandes
/commandes/nouvelle          Nouvelle commande (Achats)
/commandes/fournisseurs      Classement fournisseurs
/incidents                   Registre des incidents
/incidents/declarer          Déclarer (Dépôt)
/finances                    Vue finances (Direction)
/finances/factures           Factures
/finances/clients            Top clients
```

**Total : 16 routes métier + `_app` + `_document`.**

---

## 18. Glossaire

| Terme | Définition PetroStock |
|---|---|
| Couverture | Nombre de jours de stock restants au rythme de conso estimé |
| Semi-auto | Génération de commandes à partir des suggestions IA, avec confirmation humaine |
| Suggestion IA | Quantité = conso×délai + stock sécurité − stock actuel |
| MAPE / MAE / RMSE | Métriques d’erreur du modèle de prévision |
| RoleGuard | Garde de navigation basée sur `NAV_ITEMS` |
| Mode mock | Données locales sans backend |
| StatStrip | Bandeau de KPI denses sans cartes décoratives |
| ActionBar | Barre d’actions groupées sur sélection |
| Matrice dépôts | Vue tabulaire des 8 sites avec statut agrégé |
| TankGauge | Jauge visuelle type cuve |

---

## Annexes

### A. Fichiers de configuration clés

| Fichier | Rôle |
|---|---|
| `package.json` | Dépendances & scripts |
| `tailwind.config.js` | Tokens design |
| `postcss.config.js` | Pipeline CSS |
| `next.config.js` | Strict Mode |
| `.eslintrc.json` | Lint |
| `.env.local` | Mock / URL API |
| `README.md` | Guide start/stop rapide |

### B. Constantes d’incidents

```
Panne pompe · Fuite détectée · Retard livraison · Variation anormale ·
Erreur inventaire · Coupure électrique · Contamination · Sécurité
```

### C. Statuts de commande (onglets)

```
Toutes · En attente · Validée · Livrée · En retard
```

### D. Statuts d’alerte (workflow)

```
ouverte · en_traitement · traitee · ignoree
```

### E. Statuts de paiement factures

```
Payée · Partielle · En retard · Impayée
```

---

*Fin du document. Toute divergence future entre ce fichier et le code doit être tranchée en faveur du code source dans `frontend/`.*
