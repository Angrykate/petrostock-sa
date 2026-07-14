-- =========================================================================
-- 04_populate_reference.sql
-- PetroStock SA - Peuplement des 4 tables de REFERENCE
-- A executer APRES 03_import_csv.sh (le staging doit etre rempli)
--
-- Ordre : depot, produit, fournisseur, client (aucune dependance entre elles,
-- l'ordre exact n'a pas d'importance ici, contrairement aux tables de faits)
-- =========================================================================

-- Depot : source fiable = stocks_journaliers (contient les 8 depots)
INSERT INTO depot (depot_id, depot_nom, region)
SELECT DISTINCT depot_id, depot_nom, region
FROM stg_stocks_journaliers
ON CONFLICT (depot_id) DO NOTHING;

-- Produit : source fiable = stocks_journaliers (contient les 11 produits)
INSERT INTO produit (produit_id, produit_nom, unite)
SELECT DISTINCT produit_id, produit_nom, unite
FROM stg_stocks_journaliers
ON CONFLICT (produit_id) DO NOTHING;

-- Fournisseur : uniquement present dans bons_commande (6 fournisseurs)
INSERT INTO fournisseur (fournisseur_id, fournisseur_nom, pays_fournisseur)
SELECT DISTINCT fournisseur_id, fournisseur_nom, pays_fournisseur
FROM stg_bons_commande
ON CONFLICT (fournisseur_id) DO NOTHING;

-- Client : uniquement present dans factures_ventes (80 clients)
INSERT INTO client (client_id, client_nom, type_client, region_client)
SELECT DISTINCT client_id, client_nom, type_client, region_client
FROM stg_factures_ventes
ON CONFLICT (client_id) DO NOTHING;

-- Verification rapide (optionnelle a ce stade, la verification complete est en 06)
SELECT 'depot' AS table_name, COUNT(*) FROM depot          -- attendu : 8
UNION ALL SELECT 'produit', COUNT(*) FROM produit          -- attendu : 11
UNION ALL SELECT 'fournisseur', COUNT(*) FROM fournisseur  -- attendu : 6
UNION ALL SELECT 'client', COUNT(*) FROM client;            -- attendu : 80
