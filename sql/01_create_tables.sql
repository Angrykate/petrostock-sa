-- =========================================================================
-- 01_create_tables.sql
-- PetroStock SA - Creation des 9 tables finales normalisees
-- A executer EN PREMIER, sur une base vide (petrostock_db)
--
-- Ordre de creation (respecte les dependances de cles etrangeres) :
--   1. depot            (reference)
--   2. produit           (reference)
--   3. fournisseur        (reference)
--   4. client              (reference)
--   5. bon_commande         (depend de fournisseur, depot, produit)
--   6. stock                 (depend de depot, produit)
--   7. mouvement               (depend de depot, produit, bon_commande)
--   8. facture_vente             (depend de client, depot, produit)
--   9. incident                   (depend de depot, produit)
-- =========================================================================


-- 1. DEPOT (reference) -----------------------------------------------------
CREATE TABLE depot (
    depot_id        VARCHAR(10)   PRIMARY KEY,
    depot_nom       VARCHAR(100)  NOT NULL,
    region          VARCHAR(50)
);

-- 2. PRODUIT (reference) ----------------------------------------------------
CREATE TABLE produit (
    produit_id      VARCHAR(10)   PRIMARY KEY,
    produit_nom     VARCHAR(100)  NOT NULL,
    unite           VARCHAR(20),
    categorie       VARCHAR(50)
);

-- 3. FOURNISSEUR (reference) -------------------------------------------------
CREATE TABLE fournisseur (
    fournisseur_id  VARCHAR(10)   PRIMARY KEY,
    fournisseur_nom VARCHAR(100)  NOT NULL,
    pays_fournisseur VARCHAR(50)
);

-- 4. CLIENT (reference) -------------------------------------------------------
CREATE TABLE client (
    client_id       VARCHAR(10)   PRIMARY KEY,
    client_nom      VARCHAR(150)  NOT NULL,
    type_client     VARCHAR(50),
    region_client   VARCHAR(50)
);

-- 5. BON_COMMANDE (faits <- bons_commande.csv) ---------------------------------
CREATE TABLE bon_commande (
    bon_commande_id         VARCHAR(20)  PRIMARY KEY,
    date_commande           DATE         NOT NULL,
    date_livraison_prevue   DATE,
    date_livraison_reelle   DATE,
    fournisseur_id          VARCHAR(10)  REFERENCES fournisseur(fournisseur_id),
    depot_destination_id    VARCHAR(10)  REFERENCES depot(depot_id),
    produit_id              VARCHAR(10)  REFERENCES produit(produit_id),
    quantite_commandee      NUMERIC(14,2),
    quantite_livree         NUMERIC(14,2),
    prix_unitaire           NUMERIC(14,4),
    montant_total           NUMERIC(16,2),
    statut                  VARCHAR(30),
    delai_livraison_jours   INTEGER,
    retard_jours            INTEGER
);

CREATE INDEX idx_boncommande_depot   ON bon_commande(depot_destination_id);
CREATE INDEX idx_boncommande_produit ON bon_commande(produit_id);
CREATE INDEX idx_boncommande_date    ON bon_commande(date_commande);

-- 6. STOCK (faits <- stocks_journaliers.csv) -- TABLE CENTRALE -----------------
CREATE TABLE stock (
    id                      SERIAL       PRIMARY KEY,
    date                    DATE         NOT NULL,
    jour_semaine            VARCHAR(20),
    mois                    SMALLINT,
    trimestre               SMALLINT,
    annee                   SMALLINT,
    depot_id                VARCHAR(10)  REFERENCES depot(depot_id),
    produit_id              VARCHAR(10)  REFERENCES produit(produit_id),
    stock_debut_jour        NUMERIC(14,2),
    entrees                 NUMERIC(14,2),
    sorties                 NUMERIC(14,2),
    stock_fin_jour          NUMERIC(14,2),
    capacite_max            NUMERIC(14,2),
    taux_remplissage_pct    NUMERIC(5,2),
    seuil_alerte_min        NUMERIC(14,2),
    alerte_stock_bas        BOOLEAN,
    anomalie_detectee       BOOLEAN,
    prix_wti_usd_baril      NUMERIC(10,2),
    prix_unitaire           NUMERIC(14,4),
    valeur_stock            NUMERIC(16,2),

    CONSTRAINT uq_stock_date_depot_produit UNIQUE (date, depot_id, produit_id)
);

CREATE INDEX idx_stock_date    ON stock(date);
CREATE INDEX idx_stock_depot   ON stock(depot_id);
CREATE INDEX idx_stock_produit ON stock(produit_id);

-- 7. MOUVEMENT (faits <- mouvements.csv) ----------------------------------------
CREATE TABLE mouvement (
    mouvement_id       VARCHAR(20)  PRIMARY KEY,
    date                DATE         NOT NULL,
    heure               TIME,
    depot_id            VARCHAR(10)  REFERENCES depot(depot_id),
    produit_id          VARCHAR(10)  REFERENCES produit(produit_id),
    type_mouvement      VARCHAR(30),
    quantite             NUMERIC(14,2),
    prix_unitaire        NUMERIC(14,4),
    valeur_mouvement     NUMERIC(16,2),
    camion_id            VARCHAR(10),
    operateur_id         VARCHAR(10),
    bon_commande_ref     VARCHAR(20)  REFERENCES bon_commande(bon_commande_id)
);

CREATE INDEX idx_mouvement_date    ON mouvement(date);
CREATE INDEX idx_mouvement_depot   ON mouvement(depot_id);
CREATE INDEX idx_mouvement_produit ON mouvement(produit_id);
CREATE INDEX idx_mouvement_type    ON mouvement(type_mouvement);

-- 8. FACTURE_VENTE (faits <- factures_ventes.csv) --------------------------------
CREATE TABLE facture_vente (
    facture_id          VARCHAR(20)  PRIMARY KEY,
    date_facture         DATE         NOT NULL,
    date_echeance        DATE,
    client_id             VARCHAR(10)  REFERENCES client(client_id),
    depot_source_id       VARCHAR(10)  REFERENCES depot(depot_id),
    produit_id            VARCHAR(10)  REFERENCES produit(produit_id),
    quantite_vendue        NUMERIC(14,2),
    prix_unitaire_vente    NUMERIC(14,4),
    remise_pct             NUMERIC(5,2),
    montant_ht             NUMERIC(16,2),
    tva_pct                NUMERIC(5,2),
    montant_tva             NUMERIC(16,2),
    montant_ttc              NUMERIC(16,2),
    statut_paiement          VARCHAR(30),
    mode_paiement            VARCHAR(30)
);

CREATE INDEX idx_facture_date    ON facture_vente(date_facture);
CREATE INDEX idx_facture_client  ON facture_vente(client_id);
CREATE INDEX idx_facture_depot   ON facture_vente(depot_source_id);
CREATE INDEX idx_facture_statut  ON facture_vente(statut_paiement);

-- 9. INCIDENT (faits <- incidents_pannes.csv) --------------------------------------
CREATE TABLE incident (
    incident_id             VARCHAR(20)  PRIMARY KEY,
    date_incident            DATE         NOT NULL,
    heure_incident           TIME,
    depot_id                  VARCHAR(10)  REFERENCES depot(depot_id),
    region                     VARCHAR(50),
    produit_concerne_id        VARCHAR(10)  REFERENCES produit(produit_id),
    type_incident               VARCHAR(50),
    gravite                      VARCHAR(20),
    description                   TEXT,
    quantite_perdue                NUMERIC(14,2),
    unite                            VARCHAR(20),
    cout_incident_usd                NUMERIC(16,2),
    duree_arret_heures                NUMERIC(8,2),
    operateur_responsable              VARCHAR(10),
    statut                              VARCHAR(30),
    date_resolution                     DATE,
    mesures_correctives                  TEXT
);

CREATE INDEX idx_incident_date    ON incident(date_incident);
CREATE INDEX idx_incident_depot   ON incident(depot_id);
CREATE INDEX idx_incident_gravite ON incident(gravite);
CREATE INDEX idx_incident_type    ON incident(type_incident);
