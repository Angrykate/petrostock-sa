-- =========================================================================
-- 02_create_staging.sql
-- PetroStock SA - Creation des 5 tables STAGING (miroir exact des CSV)
-- A executer APRES 01_create_tables.sql
--
-- Ces tables sont TEMPORAIRES : elles servent uniquement de zone de transit
-- pour recevoir les CSV bruts avant transformation vers les 9 tables finales.
-- Elles seront supprimees par 07_cleanup_staging.sql une fois la base validee.
--
-- Toutes les colonnes sont en TEXT pour garantir qu'aucune ligne du CSV ne
-- soit rejetee a l'import (le cast vers les vrais types se fait plus tard,
-- dans 04_populate_reference.sql et 05_populate_facts.sql).
-- =========================================================================

CREATE TABLE stg_stocks_journaliers (
    date TEXT, jour_semaine TEXT, mois TEXT, trimestre TEXT, annee TEXT,
    depot_id TEXT, depot_nom TEXT, region TEXT,
    produit_id TEXT, produit_nom TEXT, unite TEXT,
    stock_debut_jour TEXT, entrees TEXT, sorties TEXT, stock_fin_jour TEXT,
    capacite_max TEXT, taux_remplissage_pct TEXT, seuil_alerte_min TEXT,
    alerte_stock_bas TEXT, anomalie_detectee TEXT,
    prix_wti_usd_baril TEXT, prix_unitaire TEXT, valeur_stock TEXT
);

CREATE TABLE stg_mouvements (
    mouvement_id TEXT, date TEXT, heure TEXT,
    depot_id TEXT, depot_nom TEXT, produit_id TEXT, produit_nom TEXT,
    type_mouvement TEXT, quantite TEXT, unite TEXT,
    prix_unitaire TEXT, valeur_mouvement TEXT,
    camion_id TEXT, operateur_id TEXT, bon_commande_ref TEXT
);

CREATE TABLE stg_bons_commande (
    bon_commande_id TEXT, date_commande TEXT,
    date_livraison_prevue TEXT, date_livraison_reelle TEXT,
    fournisseur_id TEXT, fournisseur_nom TEXT, pays_fournisseur TEXT,
    depot_destination_id TEXT, depot_destination_nom TEXT,
    produit_id TEXT, produit_nom TEXT,
    quantite_commandee TEXT, quantite_livree TEXT, unite TEXT,
    prix_unitaire TEXT, montant_total TEXT, statut TEXT,
    delai_livraison_jours TEXT, retard_jours TEXT
);

CREATE TABLE stg_factures_ventes (
    facture_id TEXT, date_facture TEXT, date_echeance TEXT,
    client_id TEXT, client_nom TEXT, type_client TEXT, region_client TEXT,
    depot_source_id TEXT, depot_source_nom TEXT,
    produit_id TEXT, produit_nom TEXT, unite TEXT,
    quantite_vendue TEXT, prix_unitaire_vente TEXT, remise_pct TEXT,
    montant_ht TEXT, tva_pct TEXT, montant_tva TEXT, montant_ttc TEXT,
    statut_paiement TEXT, mode_paiement TEXT
);

CREATE TABLE stg_incidents_pannes (
    incident_id TEXT, date_incident TEXT, heure_incident TEXT,
    depot_id TEXT, depot_nom TEXT, region TEXT,
    produit_concerne_id TEXT, produit_concerne_nom TEXT,
    type_incident TEXT, gravite TEXT, description TEXT,
    quantite_perdue TEXT, unite TEXT, cout_incident_usd TEXT,
    duree_arret_heures TEXT, operateur_responsable TEXT, statut TEXT,
    date_resolution TEXT, mesures_correctives TEXT
);
