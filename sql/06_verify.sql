-- =========================================================================
-- 06_verify.sql
-- PetroStock SA - Verification finale de la base
-- A executer APRES 05_populate_facts.sql
--
-- Compare les comptages obtenus aux chiffres attendus (documentation des
-- donnees, Juin 2025). Si un chiffre ne correspond pas, ne PAS executer
-- 07_cleanup_staging.sql : investiguer d'abord la difference (souvent un
-- probleme d'echappement de virgule ou de guillemet dans un champ texte
-- du CSV source, ou une ligne rejetee silencieusement).
-- =========================================================================

SELECT 'depot' AS table_name, COUNT(*) AS lignes, 8 AS attendu FROM depot
UNION ALL SELECT 'produit', COUNT(*), 11 FROM produit
UNION ALL SELECT 'fournisseur', COUNT(*), 6 FROM fournisseur
UNION ALL SELECT 'client', COUNT(*), 80 FROM client
UNION ALL SELECT 'stock', COUNT(*), 321464 FROM stock
UNION ALL SELECT 'mouvement', COUNT(*), 42529 FROM mouvement
UNION ALL SELECT 'bon_commande', COUNT(*), 3248 FROM bon_commande
UNION ALL SELECT 'facture_vente', COUNT(*), 32577 FROM facture_vente
UNION ALL SELECT 'incident', COUNT(*), 602 FROM incident;

-- Test de jointure : stock x depot x produit
SELECT s.date, d.depot_nom, p.produit_nom, s.sorties
FROM stock s
JOIN depot d   ON s.depot_id = d.depot_id
JOIN produit p ON s.produit_id = p.produit_id
LIMIT 10;

-- Test de jointure : mouvement x bon_commande (verifie les FK nullable)
SELECT m.mouvement_id, m.type_mouvement, m.bon_commande_ref, bc.statut
FROM mouvement m
LEFT JOIN bon_commande bc ON m.bon_commande_ref = bc.bon_commande_id
WHERE m.bon_commande_ref IS NOT NULL
LIMIT 10;

-- Verification qu'il n'y a pas de valeurs orphelines (NULL) la ou une FK
-- non-nullable etait attendue, signe d'un souci d'import
SELECT COUNT(*) AS stock_sans_depot FROM stock WHERE depot_id IS NULL;
SELECT COUNT(*) AS stock_sans_produit FROM stock WHERE produit_id IS NULL;
