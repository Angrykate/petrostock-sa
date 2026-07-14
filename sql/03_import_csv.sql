-- =========================================================================
-- 03_import_csv.sql
-- PetroStock SA - Import des 5 CSV bruts dans les tables staging
-- A executer APRES 02_create_staging.sql, dans pgAdmin (Query Tool) ou psql.
--
-- IMPORTANT : COPY lit le fichier cote SERVEUR PostgreSQL, pas cote client.
--   - Utiliser un chemin ABSOLU (pas relatif) vers chaque CSV.
--   - Le processus PostgreSQL doit avoir les droits de lecture sur le fichier.
--   - Si le serveur PostgreSQL tourne sur une autre machine que celle qui
--     contient les CSV (ex. futur conteneur Docker), COPY ne fonctionnera
--     pas : utiliser \copy dans psql a la place (lit cote client).
--
-- Adapter les chemins ci-dessous a l'emplacement reel des CSV.
-- =========================================================================

COPY stg_stocks_journaliers
FROM '/chemin/absolu/vers/data/stocks_journaliers.csv'
DELIMITER ','
CSV HEADER;

COPY stg_mouvements
FROM '/chemin/absolu/vers/data/mouvements.csv'
DELIMITER ','
CSV HEADER;

COPY stg_bons_commande
FROM '/chemin/absolu/vers/data/bons_commande.csv'
DELIMITER ','
CSV HEADER;

COPY stg_factures_ventes
FROM '/chemin/absolu/vers/data/factures_ventes.csv'
DELIMITER ','
CSV HEADER;

COPY stg_incidents_pannes
FROM '/chemin/absolu/vers/data/incidents_pannes.csv'
DELIMITER ','
CSV HEADER;

-- Verification rapide du nombre de lignes importees dans le staging
SELECT 'stg_stocks_journaliers' AS table_name, COUNT(*) FROM stg_stocks_journaliers
UNION ALL SELECT 'stg_mouvements', COUNT(*) FROM stg_mouvements
UNION ALL SELECT 'stg_bons_commande', COUNT(*) FROM stg_bons_commande
UNION ALL SELECT 'stg_factures_ventes', COUNT(*) FROM stg_factures_ventes
UNION ALL SELECT 'stg_incidents_pannes', COUNT(*) FROM stg_incidents_pannes;

-- Alternative sans SQL : dans pgAdmin, clic droit sur chaque table staging
-- -> Import/Export Data -> selectionner le CSV -> cocher "Header" ->
-- Delimiter "," -> lancer. Fonctionne meme si le CSV est cote client,
-- car pgAdmin gere le transfert.
