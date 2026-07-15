# Étape 4 — Schémas Pydantic (validation des données)

**Objectif de cette étape :** définir la forme exacte des données que l'API accepte en entrée et renvoie en sortie. C'est différent des modèles SQLAlchemy de l'Étape 3 — source fréquente de confusion, donc à bien distinguer dès le départ.

---

## 1. Modèle SQLAlchemy vs Schéma Pydantic — la différence clé

| | Modèle SQLAlchemy (Étape 3) | Schéma Pydantic (cette étape) |
|---|---|---|
| Rôle | Représente une **table** en base | Représente la **forme d'une requête ou réponse JSON** |
| Utilisé pour | Lire/écrire dans PostgreSQL | Valider ce qui entre/sort de l'API |
| Où il vit | `models/` | `schemas/` |
| Exemple concret | `Stock` sait aller chercher une ligne dans la table `stock` | `StockOut` décrit juste "un JSON avec ces champs, dans ces types" |

**Pourquoi séparer les deux ?** Parce qu'on ne veut pas toujours exposer toutes les colonnes de la base dans l'API (ex. cacher un champ interne), et parce qu'à la création d'une ressource, les données reçues n'ont pas toujours la même forme que la table (ex. pas d'`id` fourni par le client, il est généré par la base).

## 2. Exemple — `schemas/stock.py`

```python
from pydantic import BaseModel
from datetime import date
from typing import Optional

class StockOut(BaseModel):
    date: date
    depot_id: str
    produit_id: str
    stock_debut_jour: float
    entrees: float
    sorties: float
    stock_fin_jour: float
    taux_remplissage_pct: float
    alerte_stock_bas: bool
    anomalie_detectee: bool

    class Config:
        from_attributes = True  # permet de créer ce schéma directement depuis un objet SQLAlchemy
```

**Explication :**
- `StockOut` = ce que l'API **renvoie** quand on demande un stock (le suffixe `Out` est juste une convention de nommage, pas une obligation).
- `class Config: from_attributes = True` : indique à Pydantic qu'il peut construire ce schéma directement à partir d'un objet `Stock` (SQLAlchemy), sans conversion manuelle champ par champ.

## 3. Exemple avec une entrée (création) — `schemas/commande.py`

```python
from pydantic import BaseModel
from datetime import date
from typing import Optional

# Ce que le CLIENT envoie pour créer une commande (pas d'ID, il est généré)
class BonCommandeCreate(BaseModel):
    date_commande: date
    fournisseur_id: str
    depot_destination_id: str
    produit_id: str
    quantite_commandee: float

# Ce que l'API RENVOIE une fois la commande créée (avec l'ID généré, le statut, etc.)
class BonCommandeOut(BaseModel):
    bon_commande_id: str
    date_commande: date
    fournisseur_id: str
    depot_destination_id: str
    produit_id: str
    quantite_commandee: float
    statut: str

    class Config:
        from_attributes = True
```

**Pourquoi deux classes différentes ici ?** `BonCommandeCreate` (entrée) ne contient pas `bon_commande_id` ni `statut` — ce sont des informations que **le serveur** décide, pas le client qui crée la commande. `BonCommandeOut` (sortie), lui, les inclut car ils existent une fois la commande enregistrée.

## 4. Types Python utiles à connaître pour ces schémas

| Besoin | Syntaxe Pydantic |
|---|---|
| Champ obligatoire | `champ: str` |
| Champ optionnel | `champ: Optional[str] = None` |
| Liste de valeurs | `champs: list[str]` |
| Valeur restreinte à un choix (ex. gravité) | voir Enum ci-dessous |

**Exemple avec Enum**, utile pour un champ comme `gravite` (Faible/Modéré/Élevé/Critique) :

```python
from enum import Enum

class GraviteEnum(str, Enum):
    faible = "Faible"
    modere = "Modéré"
    eleve = "Élevé"
    critique = "Critique"

class IncidentOut(BaseModel):
    incident_id: str
    gravite: GraviteEnum
    # ...
```
Si une valeur hors de ces 4 choix arrive, Pydantic rejette automatiquement la requête avec une erreur claire — pas besoin d'écrire cette vérification à la main.

## 5. Schémas à créer pour ce projet

En suivant les deux exemples ci-dessus, créer dans `schemas/` :
- `stock.py` → `StockOut`
- `commande.py` → `BonCommandeCreate`, `BonCommandeOut`
- `incident.py` → `IncidentCreate`, `IncidentOut` (avec `gravite` en `Optional`, puisqu'elle sera déterminée par le modèle IA à la création, pas fournie par le client)
- `kpi.py` → `KpiOut` (à définir une fois qu'on sait précisément quels indicateurs afficher — peut attendre l'Étape 6)

## 6. Vérification finale de cette étape

- [ ] `schemas/stock.py` créé et sans erreur d'import
- [ ] `schemas/commande.py` créé avec les deux classes (Create et Out)
- [ ] Tu comprends la différence entre un modèle SQLAlchemy (Étape 3) et un schéma Pydantic (cette étape) — si ce n'est pas clair, relire la section 1 avant de continuer

Si tout est coché, tu es prêt pour l'Étape 5 (premier router complet, `stocks.py`) — c'est là que modèles et schémas se rejoignent enfin dans un vrai endpoint.

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
