# Base de données PetroStock SA — dossier `sql/`

Ce dossier contient tous les scripts nécessaires pour créer et peupler la
base de données PostgreSQL du projet, à exécuter **dans l'ordre numéroté**.

## Prérequis

- PostgreSQL installé et un utilisateur avec les droits de création.
- Une base vide créée au préalable : `createdb -U postgres petrostock_db`
- Les 5 fichiers CSV accessibles par le **serveur** PostgreSQL (chemin
  absolu), à ajuster dans `03_import_csv.sql` : `stocks_journaliers.csv`,
  `mouvements.csv`, `bons_commande.csv`, `factures_ventes.csv`,
  `incidents_pannes.csv`.

## Ordre d'exécution

| Script | Rôle |
|---|---|
| `01_create_tables.sql` | Crée les 9 tables finales normalisées (vides) |
| `02_create_staging.sql` | Crée 5 tables temporaires, miroir exact des CSV |
| `03_import_csv.sql` | Importe les CSV bruts dans le staging (`COPY`) |
| `04_populate_reference.sql` | Peuple `depot`, `produit`, `fournisseur`, `client` depuis le staging |
| `05_populate_facts.sql` | Peuple `bon_commande`, `stock`, `mouvement`, `facture_vente`, `incident` |
| `06_verify.sql` | Vérifie les comptages et l'intégrité des jointures |
| `07_cleanup_staging.sql` | Supprime les tables staging (une fois 06 validé) |

## Commandes

Tout est en SQL pur, exécutable directement dans le **Query Tool de
pgAdmin** ou via `psql -f` :

```bash
psql -U postgres -d petrostock_db -f 01_create_tables.sql
psql -U postgres -d petrostock_db -f 02_create_staging.sql
psql -U postgres -d petrostock_db -f 03_import_csv.sql
psql -U postgres -d petrostock_db -f 04_populate_reference.sql
psql -U postgres -d petrostock_db -f 05_populate_facts.sql
psql -U postgres -d petrostock_db -f 06_verify.sql
# vérifier les résultats du script 06 avant de continuer
psql -U postgres -d petrostock_db -f 07_cleanup_staging.sql
```

**Note sur `03_import_csv.sql`** : la commande `COPY` lit le fichier côté
serveur PostgreSQL, pas côté client. En développement local (serveur et
CSV sur la même machine), il suffit d'utiliser des chemins absolus. Si un
jour la base tourne ailleurs que les CSV (ex. conteneur Docker), remplacer
`COPY` par `\copy` (identique mais lu côté client, uniquement disponible
dans `psql`), ou utiliser l'import graphique de pgAdmin (clic droit sur la
table → Import/Export Data).

## Pourquoi des tables "staging" (`stg_...`) ?

Les CSV bruts contiennent des colonnes redondantes (ex. `depot_nom` répété
dans plusieurs fichiers) qui n'existent plus dans le schéma normalisé final
(9 tables). Le staging sert de zone de transit : on y importe le CSV tel
quel, puis on en extrait les valeurs uniques vers les tables de référence,
avant d'insérer les tables de faits en s'appuyant sur les clés étrangères
désormais disponibles. Les tables staging sont supprimées une fois la base
finale validée — il ne reste alors que les 9 tables du projet.

## Schéma final (9 tables)

**Tables de référence** : `depot`, `produit`, `fournisseur`, `client`

**Tables de faits** : `stock`, `mouvement`, `bon_commande`, `facture_vente`,
`incident`
