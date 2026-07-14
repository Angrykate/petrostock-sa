-- =========================================================================
-- 05_populate_facts.sql
-- PetroStock SA - Peuplement des 5 tables de FAITS
-- A executer APRES 04_populate_reference.sql (les tables de reference
-- doivent deja contenir depot/produit/fournisseur/client)
--
-- ORDRE IMPORTANT : bon_commande AVANT mouvement, car mouvement.bon_commande_ref
-- reference bon_commande.bon_commande_id (contrainte de cle etrangere).
-- =========================================================================

-- 5. BON_COMMANDE ------------------------------------------------------------
INSERT INTO bon_commande (
    bon_commande_id, date_commande, date_livraison_prevue, date_livraison_reelle,
    fournisseur_id, depot_destination_id, produit_id,
    quantite_commandee, quantite_livree, prix_unitaire, montant_total,
    statut, delai_livraison_jours, retard_jours
)
SELECT
    bon_commande_id,
    date_commande::DATE,
    NULLIF(date_livraison_prevue, '')::DATE,
    NULLIF(date_livraison_reelle, '')::DATE,
    fournisseur_id, depot_destination_id, produit_id,
    quantite_commandee::NUMERIC, quantite_livree::NUMERIC,
    prix_unitaire::NUMERIC, montant_total::NUMERIC,
    statut, delai_livraison_jours::INTEGER, retard_jours::INTEGER
FROM stg_bons_commande;

-- 6. STOCK ---------------------------------------------------------------------
-- NOTE : verifier au prealable le format des colonnes booleennes avec
--   SELECT DISTINCT alerte_stock_bas FROM stg_stocks_journaliers;
-- et ajuster la condition ci-dessous si le format differe de '1'/'true'.
INSERT INTO stock (
    date, jour_semaine, mois, trimestre, annee, depot_id, produit_id,
    stock_debut_jour, entrees, sorties, stock_fin_jour, capacite_max,
    taux_remplissage_pct, seuil_alerte_min, alerte_stock_bas, anomalie_detectee,
    prix_wti_usd_baril, prix_unitaire, valeur_stock
)
SELECT
    date::DATE, jour_semaine, mois::SMALLINT, trimestre::SMALLINT, annee::SMALLINT,
    depot_id, produit_id,
    stock_debut_jour::NUMERIC, entrees::NUMERIC, sorties::NUMERIC, stock_fin_jour::NUMERIC,
    capacite_max::NUMERIC, taux_remplissage_pct::NUMERIC, seuil_alerte_min::NUMERIC,
    (alerte_stock_bas = '1' OR LOWER(alerte_stock_bas) = 'true'),
    (anomalie_detectee = '1' OR LOWER(anomalie_detectee) = 'true'),
    prix_wti_usd_baril::NUMERIC, prix_unitaire::NUMERIC, valeur_stock::NUMERIC
FROM stg_stocks_journaliers;

-- 7. MOUVEMENT -------------------------------------------------------------------
-- NULLIF transforme les chaines vides en NULL (sinon rejet de la contrainte FK)
INSERT INTO mouvement (
    mouvement_id, date, heure, depot_id, produit_id, type_mouvement,
    quantite, prix_unitaire, valeur_mouvement, camion_id, operateur_id, bon_commande_ref
)
SELECT
    mouvement_id, date::DATE, NULLIF(heure, '')::TIME,
    depot_id, produit_id, type_mouvement,
    quantite::NUMERIC, prix_unitaire::NUMERIC, valeur_mouvement::NUMERIC,
    camion_id, operateur_id, NULLIF(bon_commande_ref, '')
FROM stg_mouvements;

-- 8. FACTURE_VENTE -----------------------------------------------------------------
INSERT INTO facture_vente (
    facture_id, date_facture, date_echeance, client_id, depot_source_id, produit_id,
    quantite_vendue, prix_unitaire_vente, remise_pct, montant_ht, tva_pct,
    montant_tva, montant_ttc, statut_paiement, mode_paiement
)
SELECT
    facture_id, date_facture::DATE, NULLIF(date_echeance, '')::DATE,
    client_id, depot_source_id, produit_id,
    quantite_vendue::NUMERIC, prix_unitaire_vente::NUMERIC, remise_pct::NUMERIC,
    montant_ht::NUMERIC, tva_pct::NUMERIC, montant_tva::NUMERIC, montant_ttc::NUMERIC,
    statut_paiement, mode_paiement
FROM stg_factures_ventes;

-- 9. INCIDENT ------------------------------------------------------------------------
INSERT INTO incident (
    incident_id, date_incident, heure_incident, depot_id, region,
    produit_concerne_id, type_incident, gravite, description,
    quantite_perdue, unite, cout_incident_usd, duree_arret_heures,
    operateur_responsable, statut, date_resolution, mesures_correctives
)
SELECT
    incident_id, date_incident::DATE, NULLIF(heure_incident, '')::TIME,
    depot_id, region, NULLIF(produit_concerne_id, ''),
    type_incident, gravite, description,
    quantite_perdue::NUMERIC, unite, cout_incident_usd::NUMERIC, duree_arret_heures::NUMERIC,
    operateur_responsable, statut, NULLIF(date_resolution, '')::DATE, mesures_correctives
FROM stg_incidents_pannes;
