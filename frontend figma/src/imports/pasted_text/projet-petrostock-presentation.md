Présentation Générale du Projet
Contexte
Le secteur pétrolier est l’un des domaines industriels les plus critiques en matière de
gestion logistique. Une entreprise pétrolière gère quotidiennement des flux impor
tants de produits hydrocarbures entre des dépôts géographiquement dispersés, des
fournisseurs internationaux et des clients variés. Toute rupture de stock, tout in
cident non anticipé ou tout retard d’approvisionnement peut engendrer des pertes
financières considérables et des risques opérationnels graves.
Face à cette réalité, les outils traditionnels de gestion (tableurs, registres manuels)
atteignent rapidement leurs limites. L’intelligence artificielle et l’analyse de don
nées offrent aujourd’hui des solutions concrètes pour automatiser la surveillance
des stocks, anticiper les besoins et détecter les anomalies avant qu’elles ne devien
nent critiques.
Objectif du Projet
L’objectif est de concevoir et développer un système intelligent de gestion et d’analyse
des stocks pour une entreprise pétrolière fictive nommée PetroStock SA, localisée au
Togo. Ce système comprend :
• Unebasededonnéesrelationnellecentralisanttouteslesdonnéesopérationnelles
(stocks, commandes, ventes, incidents).
• Desmodèles d’intelligence artificielle pour la prévision de la demande, la dé
tection d’anomalies et la classification des incidents.
• UneAPIbackendexposant les fonctionnalités du système.
• Untableaudebordwebinteractifpermettantlavisualisation en temps réel des
indicateurs clés.
Ce que le Système fera Concrètement
Exemple d’usage : Un responsable de dépôt ouvre l’application web le matin.
Il voit immédiatement le niveau de stock de chaque produit, une alerte rouge
sur le Gasoil du Dépôt de Kara (stock bas prévu dans 5 jours), et une sugges
tion automatique de commande au fournisseur PetroCI. Il valide la commande
en un clic. Le système enregistre tout et met à jour les indicateurs.
Architecture Technique du Système
Vue d’ensemble
Le système est structuré en trois grandes couches indépendantes mais interconnec
tées :
3
Vue Globale du Projet — PetroStock SA
EPL · 2025–2026
COUCHEPRÉSENTATION—Interface Web(Next.js + TailwindCSS)
Tableau de bord · Graphiques · Alertes · Formulaires
↓ Requêtes HTTP/JSON ↑
COUCHEMÉTIER—APIBackend(FastAPI/Python)
Gestion des stocks · Logique IA · Authentification · Endpoints REST
↓ Requêtes SQL ↑
COUCHEDONNÉES—Basededonnées(PostgreSQL)
5 tables · 400 000+ enregistrements · Clés étrangères · Index
Description de chaque couche
Couche Données — PostgreSQL
C’est le socle du projet. PostgreSQL est un système de gestion de base de données
relationnelle robuste et professionnel. Il contiendra les 5 tables du jeu de données
(voir Section 3) et assurera la cohérence, l’intégrité et la performance des requêtes.
Les tables sont liées entre elles par des identifiants communs(depot_id,produit_id,
bon_commande_ref), ce qui permet de répondre à des questions complexes en
croisant plusieurs sources de données.
Couche Métier — API FastAPI (Python)
L’API est le cerveau du système. Elle reçoit les demandes de l’interface web, inter
roge la base de données, exécute les modèles IA et renvoie les résultats.
Elle exposera notamment les endpoints suivants :
• GET /stocks/—niveauxdestockactuels par dépôt et produit
• GET /stocks/alertes/—listedesstocks sous le seuil d’alerte
• GET /previsions/{produit}/—prévision de la demande à 30 jours
• GET /anomalies/—anomaliesdétectées récemment
• POST /commandes/—créerunbondecommande
• GET /incidents/—listeetstatistiques des incidents
• GET /kpi/—indicateurs clés agrégés pour le tableau de bord
Couche Présentation — Interface Web (Next.js)
C’est ce que l’utilisateur voit et utilise. L’interface sera composée de plusieurs
pages/vues :
• Tableau de bord principal : indicateurs clés, graphiques de stocks, alertes en
temps réel.
4
Vue Globale du Projet — PetroStock SA
EPL · 2025–2026
• Gestion des stocks : consultation par dépôt, par produit, historique.
• Prévisions : courbes de prévision de la demande à court terme.
• Commandes: suivi des bons de commande et des fournisseurs.
• Incidents : registre et statistiques des pannes et accidents.
• Ventes : suivi des factures et du chiffre d’affaires.
Technologies utilisées
Composant
Technologie
Rôle
Base de données PostgreSQL
Backend / API
Frontend
FastAPI (Python)
Stockage et gestion des données re
lationnelles
Logique métier, endpoints REST, in
tégration IA
Next.js + TailwindCSS Interface web et tableau de bord in
teractif
Modèles IA
Scikit-learn, Prophet
Analyse données Pandas, NumPy
Visualisation
Versioning
Plotly, Recharts
Git / GitHub
Prévision, détection d’anomalies,
classification
Prétraitement et exploration des
données
Graphiques interactifs dans le dash
board
Gestion du code source en équipe
Les Données du Projet
Origine et justification
En l’absence de données réelles — le secteur pétrolier étant l’un des plus confiden
tiels — un jeu de données simulées a été généré de manière rigoureuse. Cette ap
proche est courammentadoptéedans larechercheappliquée et lesprojetsacadémiques.
Les données reproduisent fidèlement les structures, les volumes et les dynamiques
caractéristiques d’une chaîne logistique pétrolière togolaise.
Une documentation complète des données a été rédigée séparément (Documenta
tion des Données, Juin 2025) et constitue le document de référence pour la description
détaillée de chaque colonne.
5
Vue Globale du Projet — PetroStock SA
EPL · 2025–2026
Vue synthétique du jeu de données
Table
Lignes Colonnes Rôle
stocks_journaliers 321 464
23
mouvements
factures_ventes
bons_commande
incidents_pannes
42 529
32 577
3 248
602
15
21
19
19
Suivi quotidien des niveaux de
stock
Entrées et sorties physiques de
produits
Transactions commerciales avec
les clients
Approvisionnements
des fournisseurs
auprès
Événements opérationnels etac
cidents
Total
400 420
— —
Périmètre commun : 10 ans (2015–2024) · 8 dépôts · 11 produits · 6 fournisseurs · 80
clients · 50 camions · 30 opérateurs.
Schéma relationnel simplifié
Les tables sont reliées entre elles comme suit :
bons_commande −→ stocks_journaliers ←− mouvements
↓
incidents_pannes
↓
factures_ventes
Les clés de liaison sont depot_id,produit_idetbon_commande_ref,présentes
dans toutes les tables concernées.
Les Tâches d’Intelligence Artificielle
C’est le cœur intellectuel du projet. Voici les quatre tâches IA prévues, avec pour
chacune la méthode envisagée, les données utilisées et ce que le modèle produira
concrètement.
Tâche 1 — Prévision de la Demande (Séries Temporelles)
Question à laquelle répond ce modèle : « Combien de litres de Gasoil le Dépôt de
Kara consommera-t-il dans les 30 prochains jours ? »
• Table utilisée : stocks_journaliers, mouvements
• Variable cible : sorties (consommation journalière)
• Algorithmes : Prophet (Facebook), ARIMA, LSTM (réseau de neurones)
6
Vue Globale du Projet — PetroStock SA
EPL · 2025–2026
• Sortie : courbe de prévision à 30 jours avec intervalle de confiance
• Utilité : déclencher automatiquement une commande fournisseur avant la rup
ture de stock
Tâche 2 — Détection d’Anomalies
Question à laquelle répond ce modèle : « Ce mouvement de stock est-il normal
ou suspect ? »
• Table utilisée : stocks_journaliers
• Variable cible : anomalie_detectee (0 ou 1)
• Algorithmes : Isolation Forest, Z-score, Autoencoder
• Sortie : score d’anomalie pour chaque observation + alerte visuelle
• Utilité : détecter les fuites, erreurs de saisie ou détournements
Tâche 3 — Prévision des Ruptures de Stock
Question à laquelle répond ce modèle: «Danscombiendejourscedépôtsera-t-il
en rupture de stock ? »
• Table utilisée : stocks_journaliers
• Variable cible : alerte_stock_bas + jours_couverture
• Algorithmes : Régression (XGBoost, Random Forest)
• Sortie : nombre de jours avant rupture estimé
• Utilité : planification proactive des réapprovisionnements
Tâche 4 — Classification des Incidents
Question à laquelle répond ce modèle : « Cet incident est-il grave ? Quel type
est-il ? »
• Table utilisée : incidents_pannes
• Variable cible : gravite, type_incident
• Algorithmes : Random Forest, SVM, Régression Logistique
• Sortie : classe de gravité (Faible / Modéré / Élevé / Critique)
• Utilité : prioriser les interventions et allouer les ressources
Le Tableau de Bord — Ce que l’on verra
Le tableau de bord est la vitrine du projet. C’est ce qui sera présenté lors de la
soutenance. Il comprendra les éléments suivants :
7
Vue Globale du Projet — PetroStock SA
EPL · 2025–2026
• KPI en temps réel : stock total, valeur des stocks en USD, nombre d’alertes
actives, taux de remplissage moyen des dépôts.
• Carte des dépôts : visualisation géographique des 8 dépôts togolais avec leur
niveau de stock (vert / orange / rouge).
• Graphiques de stocks : évolution temporelle du niveau de stock par produit et
par dépôt.
• Courbes de prévision : projection de la demande à 30 jours avec intervalle de
confiance.
• Alertes anomalies : liste des observations suspectes détectées par le modèle IA.
• Suivi des commandes : tableau des bons de commande en cours, avec statut et
délais.
• Analyse financière : chiffre d’affaires mensuel, répartition par type de client,
taux de recouvrement.
• Registre des incidents : répartition par gravité, coût total, durée d’arrêt cu
mulée.
Planning de Réalisatio