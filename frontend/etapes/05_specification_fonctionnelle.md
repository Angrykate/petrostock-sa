# Spécification Fonctionnelle Complète — Frontend PetroStock SA

**Statut :** document de référence unique, à respecter à la lettre.
**Destiné à :** Copilot (VS Code Agent), en complément des guides `frontend_guide/00-05`.
**Règle d'or :** chaque écran, chaque composant, chaque bouton, chaque état décrit ici doit exister dans le code. Rien n'est laissé à l'interprétation.

---

## 0. Vision produit

PetroStock SA est une plateforme de pilotage de stocks pétroliers en temps réel pour une entreprise togolaise opérant 8 dépôts. Le tableau de bord doit permettre à un utilisateur de comprendre, en moins de 5 secondes après connexion, l'état global des stocks, les alertes actives, et les actions à prendre. Chaque page a un objectif d'action, pas seulement d'affichage.

---

## 1. Système de design (à appliquer partout, sans exception)

### 1.1 Palette de couleurs

| Rôle | Couleur | Code hex | Usage |
|---|---|---|---|
| Primaire | Bleu marine profond | `#14325A` | Navbar, titres, boutons principaux, lignes de graphique principales |
| Primaire clair | Bleu ciel pâle | `#EAF1FB` | Fonds de carte, fonds de survol |
| Accent | Or/ambre | `#C9A24B` | Éléments de mise en valeur, badges "attention", deuxième série de graphique |
| Succès / Normal | Vert | `#1E8E5A` | Statuts normaux, stock sain, incident résolu |
| Attention / Bas | Ambre | `#E8A33D` | Stock bas, gravité modérée, retard léger |
| Critique / Danger | Rouge | `#D64545` | Stock critique, gravité critique/élevée, erreurs |
| Neutre — texte principal | Gris anthracite | `#1F2937` | Corps de texte |
| Neutre — texte secondaire | Gris moyen | `#6B7280` | Légendes, labels, texte d'aide |
| Neutre — fond page | Gris très clair | `#F8FAFC` | Fond général de l'application |
| Neutre — bordures | Gris clair | `#E2E8F0` | Séparateurs, bordures de carte |
| Blanc | Blanc pur | `#FFFFFF` | Fond des cartes, tableaux |

**Règle stricte de code couleur métier** (appliquée identiquement sur toutes les pages, jamais improvisée différemment) :
- Vert = normal / résolu / livré à temps
- Ambre = attention / bas / modéré / retard léger
- Rouge = critique / élevé / en rupture / impayé

### 1.2 Typographie

- Police unique : `Inter` (via Google Fonts ou `next/font`), fallback `system-ui, sans-serif`.
- Échelle :
  - Titre de page (H1) : 28px, bold, couleur primaire
  - Titre de section (H2) : 20px, semibold, couleur primaire
  - Titre de carte (H3) : 15px, semibold, texte principal
  - Corps de texte : 14px, regular
  - Légendes / labels de formulaire : 12px, medium, texte secondaire
  - Chiffres clés (KPI) : 32px, bold

### 1.3 Espacement et forme

- Échelle d'espacement : 4px, 8px, 12px, 16px, 24px, 32px, 48px (pas de valeurs arbitraires en dehors de cette échelle).
- Rayon de bordure uniforme : 12px sur les cartes, 8px sur les boutons/champs, 999px (pilule) sur les badges.
- Ombre de carte uniforme : `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)`.
- Grille de page : padding externe 32px desktop / 16px mobile, gap entre cartes 24px.

### 1.4 Composants transverses à créer une seule fois, réutilisés partout

**`<Badge>`** — pilule colorée pour un statut. Props : `label`, `niveau` (`normal|attention|critique|info`). Couleur de fond pâle + texte de la couleur pleine correspondante (ex. fond `#FBEAEA` + texte `#D64545` pour critique).

**`<Bouton>`** — 3 variantes :
- `primaire` : fond bleu marine plein, texte blanc — pour l'action principale d'un écran (ex. "Créer la commande")
- `secondaire` : bordure bleu marine, fond transparent, texte bleu marine — pour les actions secondaires (ex. "Annuler", "Filtrer")
- `danger` : fond rouge — réservé aux actions destructives (aucune prévue dans ce projet pour l'instant, mais le composant doit exister)
- États : normal, hover (assombri de 8%), désactivé (grisé, curseur non autorisé), chargement (spinner remplaçant le texte)

**`<CarteKpi>`** — carte avec icône (lucide-react), titre, valeur, et variation optionnelle (flèche haut/bas + pourcentage vs période précédente, en vert/rouge).

**`<CarteConteneur>`** — carte blanche générique avec titre de section (H3) et contenu, utilisée pour envelopper chaque graphique/tableau.

**`<Tableau>`** — tableau générique avec : en-tête bleu marine foncé texte blanc, lignes zébrées légères (`#F8FAFC` une ligne sur deux), survol de ligne en `#EAF1FB`, pagination en bas (10/25/50 lignes par page), tri par colonne au clic sur l'en-tête (flèche indicatrice).

**`<Modale>`** — fenêtre modale centrée, fond semi-transparent derrière (`rgba(0,0,0,0.4)`), fermeture par croix en haut à droite, par clic en dehors, ou touche Échap.

**`<EtatVide>`** — illustration légère + texte quand une liste est vide (ex. "Aucune alerte active" avec une icône check verte).

**`<Squelette>`** — placeholder animé (pulse gris clair) affiché pendant le chargement, à la forme du composant final (carte, ligne de tableau, graphique) — remplace le texte brut "Chargement...".

**`<Toast>`** — notification temporaire en haut à droite de l'écran (3-4 secondes), pour confirmer une action (ex. "Commande créée avec succès" en vert, "Erreur lors de l'enregistrement" en rouge).

---

## 2. Rôles utilisateurs et visibilité

Trois profils, sélectionnables via un sélecteur en haut à droite de la Navbar (`<SelecteurProfil>`) tant qu'il n'y a pas de vraie authentification — ceci permet de démontrer les différences d'accès sans système de comptes complet.

| Fonctionnalité | Responsable de dépôt | Responsable des achats | Direction |
|---|---|---|---|
| Voir stock de son dépôt | Oui | Oui | Oui |
| Voir stock de tous les dépôts | Non | Oui | Oui |
| Recevoir alertes de stock bas | Oui (son dépôt) | Oui (tous) | Non |
| Voir prévisions de demande | Oui | Oui | Non |
| Voir estimation jours avant rupture | Oui | Oui | Non |
| Voir anomalies détectées | Oui | Oui | Non |
| Déclarer un incident | Oui | Non | Non |
| Voir registre des incidents | Oui | Oui | Oui |
| Voir classement fournisseurs | Non | Oui | Non |
| Créer un bon de commande | Non | Oui | Non |
| Voir suivi des commandes | Non | Oui | Oui |
| Voir factures et chiffre d'affaires | Non | Non | Oui |
| Voir KPI globaux | Limité (son dépôt) | Limité (achats) | Complet |

**Comportement attendu :** si un élément n'est pas visible pour le profil sélectionné, il est **masqué entièrement** (pas juste désactivé/grisé) — le menu de navigation lui-même s'adapte : un `Responsable de dépôt` ne voit pas les liens "Commandes" ni "Finances" dans la Navbar.

---

## 3. Page 1 — Tableau de bord principal (`/`, `index.js`)

### 3.1 Objectif
Vue d'ensemble instantanée : tout ce qui nécessite une action est visible sans scroller.

### 3.2 Structure, de haut en bas

**Ligne de 4 `<CarteKpi>`** (grille responsive 4 colonnes desktop → 2 → 1) :
1. Valeur totale du stock (USD), icône `DollarSign`
2. Alertes actives, icône `AlertTriangle`, couleur ambre/rouge selon le nombre
3. Taux de remplissage moyen (%), icône `Gauge`
4. Incidents ouverts, icône `FileWarning`

**Carte "Carte des dépôts"** (`<CarteConteneur>` titre "Vue géographique des dépôts") :
- Représentation des 8 dépôts togolais (Lomé Central, Terminal Portuaire Lomé, Tsévié, Atakpamé, Sokodé, Kara Nord, Kpalimé, Dapaong) — soit une vraie carte (librairie légère type `react-simple-maps` avec coordonnées approximatives du Togo), soit à défaut une grille de 8 `<CartePastille>` nommées par dépôt.
- Chaque dépôt est un point/pastille coloré selon son état agrégé : vert (tout va bien), ambre (au moins un produit en stock bas), rouge (au moins un produit en stock critique).
- Au clic sur un dépôt → navigue vers `/stocks?depot=D00X` (la page Stocks avec ce dépôt pré-sélectionné).
- Au survol → infobulle avec le nom complet du dépôt et son taux de remplissage moyen.

**Deux colonnes côte à côte (desktop), empilées (mobile) :**

*Colonne gauche — `<CarteConteneur>` titre "Alertes de stock bas"* :
- Liste des 10 alertes les plus urgentes (triées par jours de couverture croissants), chaque ligne affichant : nom du dépôt, nom du produit, `<Badge>` "Bas" (ambre) ou "Critique" (rouge), nombre de jours de couverture restants.
- Chaque ligne cliquable → navigue vers `/previsions?depot=X&produit=Y` (voir estimation détaillée).
- Bouton secondaire en bas de carte : "Voir toutes les alertes" → navigue vers `/stocks?filtre=alertes`.
- `<EtatVide>` si aucune alerte.

*Colonne droite — `<CarteConteneur>` titre "Incidents récents"* :
- Liste des 5 derniers incidents déclarés, chaque ligne : date, dépôt, type d'incident, `<Badge>` de gravité.
- Bouton secondaire : "Voir tous les incidents" → `/incidents`.

**Carte pleine largeur — "Évolution du stock global"** :
- Graphique en aire (`AreaChart` Recharts) montrant la somme du stock de tous les dépôts sur les 30 derniers jours.
- Sélecteur de période en haut à droite de la carte : boutons pilule "7j / 30j / 90j" (le dernier sélectionné en fond bleu marine plein, les autres en contour).

### 3.3 Comportements
- Rafraîchissement automatique toutes les 60 secondes (KPI + alertes uniquement, sans réinitialiser les filtres de graphique choisis par l'utilisateur).
- Pendant le premier chargement : `<Squelette>` à la place de chaque carte KPI et de la liste d'alertes.
- Si l'API est injoignable : bannière rouge pleine largeur en haut de la page "Impossible de contacter le serveur — dernière mise à jour : [heure]", le reste de la page affiche les dernières données connues si disponibles, sinon `<EtatVide>`.

---

## 4. Page 2 — Gestion des stocks (`/stocks`)

### 4.1 Objectif
Explorer l'historique et l'état détaillé d'un dépôt/produit précis.

### 4.2 Structure

**Barre de filtres horizontale en haut** (`<CarteConteneur>` sans titre, style barre d'outils) :
- Sélecteur `Dépôt` (menu déroulant, les 8 dépôts + option "Tous")
- Sélecteur `Produit` (menu déroulant, les 11 produits + option "Tous")
- Sélecteur de plage de dates (deux champs date : du / au, par défaut les 90 derniers jours)
- Bouton secondaire "Réinitialiser les filtres"
- Ces filtres sont reflétés dans l'URL (query params) pour être partageables/rechargeables et pour permettre l'arrivée pré-filtrée depuis le Tableau de bord.

**Ligne de 3 `<CarteKpi>` contextuelles au filtre actif** :
1. Stock actuel (dernière valeur `stock_fin_jour`)
2. Taux de remplissage actuel
3. Valeur du stock actuel (USD)

**Carte "Évolution du stock"** :
- `LineChart` avec 3 séries superposables (cases à cocher au-dessus du graphique) : `stock_fin_jour` (ligne pleine bleu marine), `entrees` (barres vertes en fond), `sorties` (barres rouges en fond) — un graphique combiné barres + ligne.
- Les points où `anomalie_detectee = true` sont marqués par un point rouge distinct sur la ligne, avec infobulle "Anomalie détectée" au survol.
- Ligne horizontale pointillée représentant `seuil_alerte_min`, en ambre.

**Carte "Historique détaillé"** :
- `<Tableau>` paginé avec colonnes : Date, Dépôt, Produit, Stock début, Entrées, Sorties, Stock fin, Taux remplissage, `<Badge>` (Normal/Bas/Critique déduit de `alerte_stock_bas`).
- Icône de tri sur chaque colonne.
- Bouton secondaire en haut du tableau : "Exporter en CSV" (exporte les lignes actuellement filtrées).

---

## 5. Page 3 — Prévisions IA (`/previsions`)

### 5.1 Objectif
Anticiper les besoins de réapprovisionnement avant la rupture — c'est la page la plus stratégique du produit.

### 5.2 Comment fonctionne la prévision, du point de vue utilisateur

1. L'utilisateur choisit un **Dépôt** et un **Produit** (deux menus déroulants en haut de page, obligatoires — la page affiche un `<EtatVide>` invitant à sélectionner tant qu'aucun choix n'est fait).
2. L'utilisateur choisit un **horizon de prévision** via 3 boutons pilule : "7 jours / 15 jours / 30 jours" (30 jours sélectionné par défaut).
3. Dès qu'un choix change, le frontend appelle `GET /previsions/{produit_id}?depot_id=X&horizon_jours=Y` et `GET /ruptures/{depot_id}?produit_id=Y`.
4. Le résultat s'affiche sans rechargement de page, avec `<Squelette>` sur le graphique le temps de la réponse.

### 5.3 Structure

**Ligne de sélection** : Dépôt, Produit, boutons horizon — comme décrit ci-dessus.

**Carte "Estimation avant rupture"** (mise en avant, pleine largeur, fond coloré selon le niveau) :
- Gros chiffre : "X jours avant rupture estimée"
- `<Badge>` grand format : Normal (vert, ≥10 jours) / Bas (ambre, 5-10 jours) / Critique (rouge, <5 jours) — reflète exactement la Règle métier 1 (seuils 10 et 5 jours).
- Si Bas ou Critique : bouton primaire "Générer une suggestion de commande" (voir 5.4).

**Carte "Courbe de prévision"** :
- `LineChart` avec :
  - Ligne pleine bleu marine : historique réel des 60 derniers jours (`sorties` journalières)
  - Ligne pointillée or : prévision sur l'horizon choisi
  - Zone ombrée pâle autour de la ligne pointillée : intervalle de confiance (si le modèle Prophet le fournit — sinon, masquer cette zone plutôt que d'inventer des valeurs)
  - Ligne verticale séparant "aujourd'hui" du futur, avec étiquette "Aujourd'hui"

**Carte "Fiabilité du modèle"** (petite carte informative, pas interactive) :
- 3 mini-indicateurs : MAE, RMSE, MAPE du modèle retenu (valeurs fournies statiquement par SIDIBE après entraînement, pas recalculées à la volée) — présentés avec une info-bulle expliquant chaque sigle en une phrase simple au survol de l'icône `Info`.

### 5.4 Le bouton "Générer une suggestion de commande" — comportement détaillé

Ouvre une `<Modale>` titrée "Suggestion de réapprovisionnement" :
- Affiche la formule appliquée de façon lisible (pas juste le résultat) : "Consommation moyenne (X/jour) × Délai fournisseur (Y jours) + Stock de sécurité (Z) − Stock actuel (W) = **Quantité suggérée : N litres/tonnes/barils**"
- Affiche le fournisseur recommandé (nom + score, cf. page Commandes section 7.4) avec possibilité de le changer via un menu déroulant listant les autres fournisseurs du produit, classés par score décroissant.
- Champ quantité modifiable (pré-rempli avec la suggestion, mais l'utilisateur peut ajuster manuellement — reflète le point de décision "le Responsable des achats valide ou ajuste la quantité proposée" du scénario A).
- Bouton primaire "Créer la commande" → appelle `POST /commandes/`, ferme la modale, affiche un `<Toast>` de succès, et propose un lien "Voir la commande" → `/commandes`.
- Bouton secondaire "Annuler".

---

## 6. Page 4 — Anomalies (`/anomalies`)

### 6.1 Structure

**Ligne de filtres** : Dépôt, Produit, plage de dates, sévérité du score (Toutes / Élevé uniquement).

**Carte "Anomalies détectées"** :
- `<Tableau>` paginé : Date, Dépôt, Produit, Stock fin de jour, Score de suspicion (barre de progression colorée : verte si proche de 0, rouge si proche de 1), `<Badge>` "Anomalie".
- Clic sur une ligne → `<Modale>` affichant un mini-graphique : la courbe de stock du produit/dépôt concerné sur les 14 jours autour de la date, avec le point anormal marqué en rouge et une légende expliquant en une phrase pourquoi il sort de la normale (écart-type, comparaison à la moyenne).

**Carte "Détection en temps réel"** (section distincte, sous le tableau) :
- Objectif : permettre de tester une observation hypothétique avant qu'elle soit enregistrée (utile par ex. si un opérateur veut vérifier un chiffre avant de le saisir officiellement).
- Formulaire avec les champs nécessaires au modèle (`stock_fin_jour`, `entrees`, `sorties`, `taux_remplissage_pct` — à ajuster une fois le format exact confirmé par SEMAGNON).
- Bouton primaire "Analyser cette observation" → `POST /anomalies/detecter` → affiche le résultat juste en dessous sans rechargement : `<Badge>` "Normal" (vert) ou "Anomalie détectée" (rouge) + le score brut renvoyé.

---

## 7. Page 5 — Commandes fournisseurs (`/commandes`)

### 7.1 Structure

**Onglets de filtre par statut** (pilules horizontales en haut) : "Toutes / En attente / Livrées / En retard" — le nombre de commandes de chaque catégorie affiché en petit badge sur l'onglet.

**Bouton primaire en haut à droite : "Nouvelle commande"** → ouvre `<Modale>` avec le formulaire (Dépôt, Produit, Fournisseur, Quantité, Date) — identique en fonctionnement à celui déclenché depuis la page Prévisions (section 5.4), mais ici vide par défaut (pas de suggestion pré-calculée) sauf si l'utilisateur arrive via un lien avec des paramètres déjà présents dans l'URL.

**Carte "Classement des fournisseurs"** (au-dessus ou à côté du tableau de commandes) :
- Liste des 6 fournisseurs, triée par score décroissant, chacun affichant :
  - Nom, pays
  - Score global (grand chiffre, ex. "0.87")
  - 3 mini-barres de progression : Fiabilité (poids 50%), Délai (poids 30%), Prix (poids 20%) — reflète exactement la Règle métier 3.
  - `<Badge>` "Recommandé" sur le fournisseur en tête de classement pour le produit actuellement filtré, s'il y a un filtre produit actif.

**Carte "Historique des commandes"** :
- `<Tableau>` : ID commande, Date, Fournisseur, Dépôt destination, Produit, Quantité commandée, Quantité livrée, `<Badge>` statut, Retard (jours, en rouge si > 0).
- Clic sur une ligne → `<Modale>` en lecture seule avec tous les détails de la commande.

---

## 8. Page 6 — Incidents (`/incidents`)

### 8.1 Structure

**Filtres** : Dépôt, Type d'incident (8 types), Gravité, Statut.

**Bouton primaire en haut à droite : "Déclarer un incident"** → `<Modale>` avec formulaire :
- Dépôt (menu déroulant)
- Produit concerné (menu déroulant, optionnel)
- Type d'incident (menu déroulant, 8 types)
- Description (zone de texte libre)
- **Pas de champ "Gravité"** dans le formulaire — c'est le point clé du produit : la gravité n'est jamais saisie manuellement, elle est déterminée automatiquement par le modèle IA à la soumission (reflète la relation d'inclusion du diagramme de cas d'utilisation).
- Bouton primaire "Déclarer" → `POST /incidents/` → à la réponse, affiche dans la modale elle-même (avant fermeture) un encart résultat : "Gravité estimée : `<Badge>` [niveau]" et, si gravité Élevé/Critique, une ligne supplémentaire "Notification envoyée à : Responsable du dépôt concerné" (+ "et à la Direction" si Critique) — reflète la Règle métier 5 telle qu'exécutée par le backend.
- Bouton "Fermer" une fois le résultat affiché.

**Carte "Registre des incidents"** :
- `<Tableau>` : ID, Date, Dépôt, Type, `<Badge>` Gravité, Coût (USD), Durée d'arrêt (heures), `<Badge>` Statut.
- Couleurs de `<Badge>` Gravité : Faible = gris neutre, Modéré = ambre clair, Élevé = ambre foncé, Critique = rouge.

---

## 9. Page 7 — Ventes et finances (`/finances`)

### 9.1 Structure

**Ligne de filtres** : Type de client (5 types), Région, plage de dates.

**Ligne de 3 `<CarteKpi>`** :
1. Chiffre d'affaires total (période filtrée)
2. Taux de recouvrement (% factures entièrement payées)
3. Montant en attente de paiement

**Carte "Chiffre d'affaires mensuel"** :
- `BarChart` par mois, barres colorées par type de client si l'utilisateur active un mode "empilé" (toggle au-dessus du graphique : "Vue globale / Vue par type de client").

**Carte "Top 20 clients"** :
- `BarChart` horizontal, un client par ligne, trié par CA décroissant.

**Carte "État des factures"** :
- `<Tableau>` : ID facture, Client, Date, Montant TTC, `<Badge>` Statut paiement (Payée = vert, Partielle = ambre, En retard = rouge, Impayée = rouge foncé).

---

## 10. Navbar — détail complet

- Fond bleu marine plein (`#14325A`), texte blanc.
- Logo/nom "PetroStock SA" à gauche (texte, pas de fichier image nécessaire).
- Liens de navigation centraux : uniquement ceux autorisés pour le rôle actif (cf. tableau section 2), lien actif souligné en or.
- Icône cloche (`Bell`, lucide-react) à droite avec badge numérique rouge = nombre d'alertes actives — clic → ouvre un panneau déroulant listant les 5 dernières alertes, avec lien "Voir toutes" → `/stocks?filtre=alertes`.
- `<SelecteurProfil>` tout à droite (menu déroulant simple : Responsable de dépôt / Responsable des achats / Direction) — change dynamiquement ce qui est visible dans toute l'application, sans rechargement de page.

---

## 11. Résumé des correspondances page → endpoint API (pour Copilot, cohérence avec le backend à venir)

| Page | Endpoints appelés |
|---|---|
| Tableau de bord | `GET /kpi/`, `GET /stocks/alertes/`, `GET /incidents/` (5 derniers), `GET /stocks/` (agrégé) |
| Stocks | `GET /stocks/{depot_id}` avec filtres query params |
| Prévisions | `GET /previsions/{produit_id}`, `GET /ruptures/{depot_id}`, `POST /commandes/` (depuis la modale) |
| Anomalies | `GET /anomalies/`, `POST /anomalies/detecter` |
| Commandes | `GET /commandes/`, `POST /commandes/`, classement fournisseurs (endpoint à confirmer avec SEGNEDJI — probablement dérivé de `GET /fournisseurs/` ou intégré à `/commandes/fournisseurs-classement`) |
| Incidents | `GET /incidents/`, `POST /incidents/` |
| Finances | `GET /factures/` avec filtres query params |

**Tant que le backend n'existe pas** : tous ces endpoints sont mockés selon le principe déjà défini dans le prompt précédent (`MODE_MOCK`, `lib/mockData.js`) — ce document ajoute le détail visuel et fonctionnel, il ne remplace pas les instructions de mock déjà données.

---

## 12. Ce qui n'est PAS dans le périmètre (à ne pas construire, pour éviter de perdre du temps)

- Authentification réelle (mots de passe, tokens) — remplacée par le `<SelecteurProfil>` de démonstration décrit en section 2.
- Notifications push réelles (email/SMS) — la mention "Notification envoyée à..." (section 8) est un texte d'interface, pas un vrai envoi.
- Export PDF — seul l'export CSV de la page Stocks est demandé.
- Mode sombre.
- Gestion multi-langue.

---

*Spécification préparée pour Copilot (VS Code Agent) — Projet PetroStock SA — EPL 2025-2026*
