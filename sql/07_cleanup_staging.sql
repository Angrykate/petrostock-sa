-- =========================================================================
-- 07_cleanup_staging.sql
-- PetroStock SA - Nettoyage des tables staging
--
-- A executer UNIQUEMENT apres avoir valide 06_verify.sql (tous les
-- comptages corrects, pas de FK orpheline).
--
-- Optionnel en environnement de developpement : tu peux garder le staging
-- un moment pour deboguer, et ne lancer ce script que juste avant la
-- version finale du projet.
-- =========================================================================

DROP TABLE IF EXISTS stg_stocks_journaliers;
DROP TABLE IF EXISTS stg_mouvements;
DROP TABLE IF EXISTS stg_bons_commande;
DROP TABLE IF EXISTS stg_factures_ventes;
DROP TABLE IF EXISTS stg_incidents_pannes;

-- Verification finale : seules les 9 tables du projet doivent rester
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- attendu : bon_commande, client, depot, facture_vente, fournisseur,
--           incident, mouvement, produit, stock  (9 lignes)
