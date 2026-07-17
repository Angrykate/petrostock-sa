# Spécification Fonctionnelle Complémentaire — Frontend PetroStock SA

**Statut :** complément au document `Spécification Fonctionnelle Complète — Frontend PetroStock SA`. Ne remplace rien de l'existant, comble les zones où l'agent devrait sinon improviser.
**Destiné à :** Copilot (VS Code Agent), à lire après le document principal.
**Règle d'or, rappelée :** si un comportement n'est écrit nulle part, il ne doit pas être inventé — il doit être signalé comme point ouvert plutôt que deviné.

---

## 13. Identité visuelle signature — l'élément qu'on retient

Un tableau de bord de gestion de stock, sans parti pris visuel, ressemble à n'importe quel back-office générique. PetroStock SA a un sujet précis — des cuves de pétrole qui se remplissent et se vident — et le design doit le montrer, pas seulement le décrire en texte.

**Élément signature : la jauge de cuve (`<JaugeCuve>`).**
Au lieu d'une simple barre de progression horizontale pour représenter un taux de remplissage, `<JaugeCuve>` est un composant vertical en forme de cylindre stylisé (SVG), qui se remplit de bas en haut comme une vraie cuve :
- Le niveau de liquide monte/descend avec une transition fluide (`transition: height 600ms cubic-bezier(0.4, 0, 0.2, 1)`) quand la donnée change.
- Couleur du liquide selon le niveau : vert si `taux_remplissage_pct` sain, ambre si bas, rouge si critique — jamais de dégradé arc-en-ciel, une seule teinte unie à la fois pour rester lisible.
- Une ligne pointillée horizontale marque `seuil_alerte_min` à sa hauteur proportionnelle réelle dans la cuve.
- Utilisé : en miniature (48px de haut) dans chaque ligne du tableau "Historique détaillé" (page Stocks) et dans la carte pastille de chaque dépôt sur la carte géographique du Tableau de bord ; en grand format (160px) dans la carte "Estimation avant rupture" de la page Prévisions.
- Ce composant est la signature du produit — il doit apparaître dès la première vue du Tableau de bord (dans les pastilles de dépôts) pour ancrer immédiatement le sujet : ce n'est pas un dashboard SaaS générique, c'est un poste de contrôle de stocks pétroliers.

**Ce que cette signature ne doit PAS devenir :** un gadget répété partout sans raison. Les graphiques de séries temporelles (Recharts) restent des `LineChart`/`AreaChart`/`BarChart` classiques — la jauge de cuve est réservée à la représentation d'un niveau instantané, jamais à une évolution dans le temps.

---

## 14. Micro-interactions et animations

Chaque animation doit avoir une fonction (indiquer un changement d'état, guider l'œil), jamais de la décoration gratuite.

| Élément | Comportement animé |
|---|---|
| Chiffres de `<CarteKpi>` | Comptage progressif de 0 à la valeur finale sur 800ms à l'affichage initial (easing `ease-out`), pas de recomptage à chaque rafraîchissement automatique — seulement au premier montage ou changement de filtre |
| `<JaugeCuve>` | Transition de hauteur 600ms, cf. section 13 |
| Cartes au chargement | Fondu + léger décalage vertical (`opacity 0→1`, `translateY 8px→0`, 300ms, décalage de 50ms entre cartes successives d'une même grille — effet de cascade discret, pas un effet de liste qui rebondit) |
| Survol de ligne de `<Tableau>` | Changement de fond immédiat (pas de transition, pour rester réactif au balayage rapide de la souris) |
| Survol de `<Bouton>` | Assombrissement 8%, transition 150ms |
| Ouverture de `<Modale>` | Fond semi-transparent en fondu 200ms, contenu de la modale en fondu + scale `0.96→1` 200ms |
| `<Toast>` | Entrée par glissement depuis la droite 250ms, sortie par fondu après 3-4s |
| Badge de notification (cloche Navbar) | Une seule pulsation discrète (`scale 1→1.15→1`, 400ms) quand le nombre d'alertes augmente suite à un rafraîchissement automatique — pas de pulsation continue en boucle, ce serait fatigant sur un écran affiché toute la journée |
| Changement d'onglet de statut (page Commandes) | Le contenu du tableau se met à jour en fondu croisé 200ms, pas de rechargement de page |
| Graphiques Recharts | Animation d'entrée native de Recharts activée (`isAnimationActive`), durée 500ms, désactivée lors des rafraîchissements automatiques pour ne pas re-dessiner toutes les 60 secondes sous les yeux de l'utilisateur (seulement au montage initial ou changement de filtre explicite) |

**Respect de `prefers-reduced-motion` :** si l'utilisateur a activé la réduction de mouvement dans son système, toutes les transitions ci-dessus passent à une durée quasi nulle (0-50ms) — aucune animation n'est jamais purement cosmétique au point de devenir un obstacle.

---

## 15. Catalogue exhaustif des états (chargement / vide / erreur)

Le document principal ne couvre ces états en détail que pour 2-3 cartes. Voici la règle complète, applicable à **toute** carte contenant des données dynamiques :

### 15.1 État de chargement
- Premier chargement de la page : `<Squelette>` à la forme exacte du composant final (mêmes dimensions, mêmes proportions), jamais un simple spinner centré qui fait "sauter" la mise en page une fois les données arrivées.
- Rafraîchissement automatique (pas premier chargement) : **aucun** squelette ne réapparaît — un petit indicateur discret (point pulsant gris, 6px, coin supérieur droit de la carte) apparaît 400ms pendant la requête, puis disparaît. La donnée affichée reste celle précédente jusqu'à ce que la nouvelle soit prête (pas de flash de contenu vide).

### 15.2 États vides — texte exact par carte

| Carte | Titre de l'état vide | Sous-texte | Icône |
|---|---|---|---|
| Alertes de stock bas (Dashboard) | "Aucune alerte active" | "Tous les dépôts sont au-dessus du seuil critique." | `CheckCircle2` (vert) |
| Incidents récents (Dashboard) | "Aucun incident récent" | "Rien à signaler sur les 30 derniers jours." | `ShieldCheck` (vert) |
| Historique détaillé (Stocks), aucun résultat de filtre | "Aucune donnée pour ces filtres" | "Essaie d'élargir la période ou de changer de dépôt/produit." | `SearchX` (gris) |
| Prévisions, avant sélection | "Choisis un dépôt et un produit" | "La prévision et l'estimation de rupture s'afficheront ici." | `LineChart` (gris) |
| Anomalies, aucun résultat | "Aucune anomalie détectée" | "Rien d'inhabituel sur la période sélectionnée." | `ShieldCheck` (vert) |
| Commandes, onglet vide | "Aucune commande [en attente / livrée / en retard]" | Texte adapté à l'onglet actif | `Package` (gris) |
| Incidents, registre vide | "Aucun incident enregistré" | "Le registre est vide pour ces filtres." | `FileCheck` (gris) |
| Finances, factures vides | "Aucune facture pour cette période" | — | `Receipt` (gris) |

**Règle de ton :** jamais de point d'exclamation, jamais de ton alarmiste sur un état vide positif (une liste d'alertes vide est une bonne nouvelle — le badge/icône vert le confirme visuellement, le texte reste factuel et sobre).

### 15.3 États d'erreur — texte exact par type d'erreur

| Situation | Titre | Sous-texte | Action proposée |
|---|---|---|---|
| API totalement injoignable (toute page) | "Impossible de contacter le serveur" | "Dernière mise à jour : [heure formatée]. Les données affichées peuvent ne plus être à jour." | Bouton secondaire "Réessayer" |
| Erreur 404 sur une ressource précise (ex. dépôt inconnu dans l'URL) | "Dépôt introuvable" | "Vérifie l'identifiant du dépôt dans l'adresse." | Bouton secondaire "Retour au tableau de bord" |
| Erreur 500 / erreur serveur générique | "Une erreur est survenue" | "L'équipe technique a été informée. Réessaie dans un instant." | Bouton secondaire "Réessayer" |
| Échec de soumission de formulaire (création commande/incident) | Reste dans la modale, pas de fermeture | Bandeau rouge en haut du formulaire : "Impossible d'enregistrer — vérifie les champs en rouge ci-dessous." si erreur de validation, ou "Erreur d'enregistrement, réessaie." si erreur serveur | Le bouton primaire repasse de "chargement" à son état normal, jamais bloqué en spinner indéfiniment |
| Timeout (requête > 10s) | Traité comme l'erreur serveur générique | — | — |

---

## 16. Règles de formatage des données

Rien n'est laissé à l'appréciation du moment — un même nombre doit s'afficher identiquement partout dans l'application.

| Type de donnée | Règle | Exemple |
|---|---|---|
| Grand nombre (stock en litres/tonnes/barils) | Séparateur de milliers, espace insécable, pas de décimale | `321 464` |
| Montant USD | Symbole `$` après le nombre, séparateur de milliers, 0 décimale si ≥ 1000, 2 décimales sinon | `1 801 697 $` / `842,50 $` |
| Montant FCFA | Nombre suivi de `FCFA`, séparateur de milliers, jamais de décimale (le FCFA n'a pas de sous-unité usuelle) | `732 106 FCFA` |
| Grand montant FCFA (> 1 000 000) dans un titre de KPI uniquement (pas dans un tableau) | Abrégé avec un chiffre après la virgule | `23,85 Mds FCFA` |
| Pourcentage | Toujours 1 décimale, symbole `%` collé | `92,7 %` |
| Date | Format long dans les titres/en-têtes de carte, format court dans les tableaux | Titre : `16 juillet 2026` — Tableau : `16/07/2026` |
| Heure | Format 24h, deux chiffres | `14:32` |
| Jours de couverture / délai | Toujours accompagné de l'unité en toutes lettres, jamais juste un chiffre nu | `5 jours`, pas `5` |
| Score de fiabilité fournisseur / score d'anomalie | Sur 1, 2 décimales | `0,87` |
| Champ vide en base (ex. produit_concerne nul sur un incident) | Tiret cadratin, jamais "null", "undefined" ou une case vide sans explication | `—` |

**Locale :** tous les formats numériques utilisent la locale `fr-FR` via `Intl.NumberFormat`/`Intl.DateTimeFormat` (virgule décimale, espace comme séparateur de milliers) — cohérent avec le fait que l'application est entièrement en français.

---

## 17. Accessibilité — niveau minimum requis

Un produit présenté comme professionnel ne peut pas ignorer ce point, même dans un contexte académique.

- **Contraste :** tout texte sur fond doit respecter un ratio minimum de 4.5:1 (texte normal) ou 3:1 (texte ≥ 18px bold). Le gris secondaire `#6B7280` sur fond blanc passe ce seuil — à ne pas assombrir davantage sans nécessité, mais jamais éclaircir non plus.
- **Focus clavier visible :** chaque élément interactif (bouton, lien, champ, ligne de tableau cliquable) doit afficher un contour visible au focus clavier (`outline: 2px solid #14325A`, `outline-offset: 2px`) — jamais `outline: none` sans remplacement.
- **Navigation clavier complète :** toute action réalisable à la souris (ouvrir une modale, trier un tableau, changer d'onglet, fermer une modale) doit être réalisable au clavier (Tab pour naviguer, Entrée/Espace pour activer, Échap pour fermer une modale).
- **Attributs `aria` :**
  - `<Modale>` : `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointant vers le titre de la modale.
  - `<Badge>` : le niveau (normal/attention/critique) ne doit jamais être porté uniquement par la couleur — le texte du badge lui-même (`"Normal"`, `"Bas"`, `"Critique"`) reste toujours visible à côté de la couleur, jamais un badge coloré sans texte.
  - Icônes seules cliquables (ex. cloche de notification) : `aria-label` explicite (`"Voir les alertes"`).
  - Graphiques Recharts : un résumé textuel accessible en `aria-label` sur le conteneur (ex. `"Évolution du stock sur 30 jours, tendance à la baisse"`), car les graphiques SVG ne sont pas nativement lisibles par un lecteur d'écran.
- **`prefers-reduced-motion` :** cf. section 14.

---

## 18. Comportement responsive détaillé par point de rupture

| Breakpoint Tailwind | Largeur | Comportement |
|---|---|---|
| `base` (mobile) | < 640px | Navbar : liens de navigation centraux masqués derrière un menu hamburger (icône `Menu`, panneau latéral coulissant depuis la gauche). Grilles de `<CarteKpi>` : 1 colonne. Tableaux : les colonnes secondaires (ex. taux de remplissage dans l'historique) sont masquées, seules les 3-4 colonnes essentielles restent visibles ; un bouton "Voir plus de détails" sur chaque ligne ouvre le reste dans une `<Modale>`. Filtres horizontaux : empilés verticalement. |
| `sm` | ≥ 640px | Grilles de `<CarteKpi>` : 2 colonnes. |
| `lg` | ≥ 1024px | Grilles de `<CarteKpi>` : 4 colonnes. Navbar complète visible. Colonnes côte à côte (Dashboard : Alertes / Incidents) passent en 2 colonnes. |
| `xl` | ≥ 1280px | Largeur de contenu maximale plafonnée à 1440px, centrée (`mx-auto`), pour éviter des lignes de texte/tableaux démesurément étalées sur les grands écrans de bureau utilisés en salle de contrôle. |

**Test obligatoire avant de considérer une page terminée :** chaque page doit être vérifiée à 375px (mobile), 768px (tablette) et 1440px (desktop) — les trois tailles de référence, pas seulement desktop.

---

## 19. Mapping iconographique (lucide-react) — pour ne jamais improviser une icône différente d'un écran à l'autre

| Concept | Icône | Où |
|---|---|---|
| Dépôt | `Warehouse` | Sélecteurs, carte des dépôts, en-têtes de section |
| Produit générique | `Droplet` | Sélecteurs de produit |
| Pétrole brut | `Droplet` (teinte foncée) | Référentiel produit |
| Gaz (LPG) | `Flame` | Référentiel produit |
| Bitume | `Layers` | Référentiel produit |
| Lubrifiants | `Beaker` | Référentiel produit |
| Fournisseur | `Truck` | Page Commandes, classement fournisseurs |
| Client | `Building2` | Page Finances |
| Stock / niveau | `Gauge` | KPI, jauges |
| Alerte | `AlertTriangle` | Badges, KPI, notifications |
| Anomalie | `ShieldAlert` | Page Anomalies |
| Incident | `FileWarning` | KPI, page Incidents |
| Argent / CA | `DollarSign` (USD) ou `Coins` (FCFA) | KPI financiers — garder la distinction visuelle entre les deux devises |
| Prévision / tendance | `TrendingUp` / `TrendingDown` selon le sens de la variation | KPI avec variation |
| Commande | `Package` | Page Commandes |
| Recouvrement / paiement | `Receipt` | Page Finances |
| Notification | `Bell` | Navbar |
| Utilisateur / rôle | `UserCircle` | Sélecteur de profil |
| Export | `Download` | Bouton export CSV |
| Filtre | `SlidersHorizontal` | Barres de filtre |
| Tri de colonne | `ChevronUp` / `ChevronDown` (selon direction active), `ChevronsUpDown` (colonne non triée) | En-têtes de `<Tableau>` |

Chaque icône est utilisée à la taille 18px dans les listes/tableaux, 24px dans les `<CarteKpi>`, 16px dans les badges/labels.

---

## 20. Validation des formulaires — règle par champ

### 20.1 Formulaire "Nouvelle commande" (pages Prévisions et Commandes)
| Champ | Règle | Message d'erreur si invalide |
|---|---|---|
| Dépôt destination | Obligatoire | "Choisis un dépôt." |
| Produit | Obligatoire | "Choisis un produit." |
| Fournisseur | Obligatoire, pré-rempli par la recommandation si disponible | "Choisis un fournisseur." |
| Quantité | Obligatoire, nombre positif, ne peut pas dépasser `capacite_max − stock_actuel` du dépôt/produit ciblé | "Entre une quantité valide." ou "Cette quantité dépasse la capacité disponible du dépôt (max : X)." |
| Date de commande | Pré-remplie à aujourd'hui, non modifiable |—|

### 20.2 Formulaire "Déclarer un incident"
| Champ | Règle | Message d'erreur si invalide |
|---|---|---|
| Dépôt | Obligatoire | "Choisis le dépôt concerné." |
| Produit concerné | Optionnel (reflète la nullabilité en base) | — |
| Type d'incident | Obligatoire | "Choisis un type d'incident." |
| Description | Obligatoire, minimum 20 caractères (pour garantir une description exploitable, pas juste "panne") | "Décris l'incident en quelques mots (20 caractères minimum)." |

### 20.3 Comportement général de validation
- Validation au moment de la soumission (pas de bordure rouge agressive dès la première frappe) — puis validation en direct champ par champ une fois qu'une première tentative de soumission a échoué, pour ne pas punir l'utilisateur avant qu'il ait fini de remplir.
- Le bouton primaire de soumission n'est jamais désactivé de façon invisible/mystérieuse (pas de bouton grisé sans explication) — il reste cliquable, et un clic sur un formulaire incomplet déclenche l'affichage des erreurs plutôt que de ne rien faire silencieusement.

---

## 21. Stratégie de rafraîchissement et de cache

| Page | Fréquence de rafraîchissement auto | Ce qui est rafraîchi |
|---|---|---|
| Tableau de bord | 60 secondes | KPI, alertes, incidents récents, carte des dépôts |
| Stocks | Pas de rafraîchissement auto (page d'exploration, l'utilisateur contrôle via ses filtres) | — |
| Prévisions | Pas de rafraîchissement auto (recalcul uniquement au changement de sélection) | — |
| Anomalies | 120 secondes | Tableau des anomalies uniquement |
| Commandes | 60 secondes | Compteurs des onglets par statut uniquement, pas le tableau complet (évite de perdre la position de tri/pagination de l'utilisateur en pleine lecture) |
| Incidents | 60 secondes | Registre |
| Finances | Pas de rafraîchissement auto (données comptables, moins volatiles) | — |

**Règle générale :** un rafraîchissement automatique ne doit jamais faire perdre à l'utilisateur sa position de scroll, son filtre actif, ou sa pagination en cours. Si une requête de rafraîchissement échoue silencieusement, les données précédentes restent affichées (cf. section 15.3) — l'utilisateur n'est interrompu que si l'échec persiste au-delà de 3 tentatives consécutives.

---

## 22. Checklist d'acceptation — à cocher par Copilot avant de considérer une page terminée

Pour chacune des 7 pages, avant de passer à la suivante :

- [ ] Toutes les cartes/composants listés dans la section correspondante du document principal sont présents, dans l'ordre décrit
- [ ] Chaque carte a son état de chargement (`<Squelette>`), son état vide, et son état d'erreur implémentés (sections 15.1 à 15.3 de ce document)
- [ ] Tous les nombres affichés respectent le formatage de la section 16 (pas de `342523.5` brut, pas de `null` visible)
- [ ] La page a été vérifiée visuellement à 375px, 768px et 1440px (section 18)
- [ ] Chaque élément interactif est atteignable et utilisable au clavier (section 17)
- [ ] Le `<SelecteurProfil>` masque bien les éléments non autorisés pour chaque rôle (section 2 du document principal), testé pour les 3 rôles un par un
- [ ] Les couleurs de badge/statut suivent strictement la règle vert/ambre/rouge (jamais une couleur improvisée pour un nouveau statut)
- [ ] Les icônes utilisées correspondent au mapping de la section 19, aucune icône "au choix" non listée
- [ ] Les animations respectent la section 14 et `prefers-reduced-motion`
- [ ] Aucune donnée n'est calculée côté frontend — tout ce qui ressemble à une règle métier (seuils, scores, quantités suggérées) vient de l'API, jamais recalculé en JavaScript

---

*Spécification préparée pour Copilot (VS Code Agent) — Projet PetroStock SA — EPL 2025-2026*
