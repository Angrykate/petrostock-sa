# Étape 3 — Modèles SQLAlchemy (les 9 tables en Python)

**Objectif de cette étape :** traduire chacune des 9 tables créées en SQL (`sql/01_create_tables.sql`) en une classe Python, pour pouvoir les manipuler dans le code de l'API.

---

## 1. Comprendre le principe

Un modèle SQLAlchemy est une classe Python qui **représente une table**. Chaque attribut de la classe correspond à une colonne. C'est un mapping direct depuis le schéma SQL déjà écrit — pas de nouvelle réflexion de conception ici, juste de la traduction.

## 2. Exemple complet — `models/depot.py`

```python
from sqlalchemy import Column, String
from database import Base

class Depot(Base):
    __tablename__ = "depot"

    depot_id = Column(String(10), primary_key=True)
    depot_nom = Column(String(100), nullable=False)
    region = Column(String(50))
```

**Explication :**
- `__tablename__` : doit correspondre exactement au nom de la table dans PostgreSQL.
- `Column(String(10), primary_key=True)` : traduit `VARCHAR(10) PRIMARY KEY` du script SQL.
- `nullable=False` : traduit `NOT NULL`.

## 3. Exemple avec clé étrangère — `models/stock.py`

```python
from sqlalchemy import Column, Integer, Date, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    jour_semaine = Column(String(20))
    mois = Column(SmallInteger)
    trimestre = Column(SmallInteger)
    annee = Column(SmallInteger)
    depot_id = Column(String(10), ForeignKey("depot.depot_id"))
    produit_id = Column(String(10), ForeignKey("produit.produit_id"))
    stock_debut_jour = Column(Numeric(14, 2))
    entrees = Column(Numeric(14, 2))
    sorties = Column(Numeric(14, 2))
    stock_fin_jour = Column(Numeric(14, 2))
    capacite_max = Column(Numeric(14, 2))
    taux_remplissage_pct = Column(Numeric(5, 2))
    seuil_alerte_min = Column(Numeric(14, 2))
    alerte_stock_bas = Column(Boolean)
    anomalie_detectee = Column(Boolean)
    prix_wti_usd_baril = Column(Numeric(10, 2))
    prix_unitaire = Column(Numeric(14, 4))
    valeur_stock = Column(Numeric(16, 2))

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")
```

**Point important sur `relationship()` :**
Ce n'est pas une colonne — ça ne crée rien en base. C'est un raccourci Python qui permet, une fois qu'on a un objet `Stock`, d'accéder directement à `mon_stock.depot.depot_nom` sans écrire de jointure SQL à la main. Très utile pour construire les réponses JSON des endpoints plus tard.

## 4. Correspondance types SQL → types SQLAlchemy

| Type SQL (dans `01_create_tables.sql`) | Type SQLAlchemy |
|---|---|
| `VARCHAR(n)` | `String(n)` |
| `TEXT` | `Text` |
| `DATE` | `Date` |
| `TIME` | `Time` |
| `SMALLINT` | `SmallInteger` |
| `INTEGER` | `Integer` |
| `SERIAL` | `Integer, primary_key=True` (auto-incrément géré automatiquement par la PK) |
| `NUMERIC(p, s)` | `Numeric(p, s)` |
| `BOOLEAN` | `Boolean` |

## 5. Liste des 9 fichiers à créer dans `models/`

À faire un par un, sur le même principe que les deux exemples ci-dessus, en reprenant les colonnes exactes de `sql/01_create_tables.sql` :

- `depot.py` (fait ci-dessus)
- `produit.py`
- `fournisseur.py`
- `client.py`
- `bon_commande.py` (FK vers fournisseur, depot, produit)
- `stock.py` (fait ci-dessus)
- `mouvement.py` (FK vers depot, produit, bon_commande — **nullable**, donc pas de `nullable=False` sur cette colonne)
- `facture_vente.py` (FK vers client, depot, produit)
- `incident.py` (FK vers depot, produit — produit_concerne_id nullable)

## 6. Rendre les modèles visibles à SQLAlchemy — `models/__init__.py`

Créer un fichier `models/__init__.py` qui importe tous les modèles, pour qu'ils soient chargés dès que le dossier `models` est importé quelque part :

```python
from .depot import Depot
from .produit import Produit
from .fournisseur import Fournisseur
from .client import Client
from .bon_commande import BonCommande
from .stock import Stock
from .mouvement import Mouvement
from .facture_vente import FactureVente
from .incident import Incident
```

## 7. Tester que tout est bien relié

Dans `main.py`, remplacer temporairement le test de l'Étape 2 par un vrai test avec l'ORM :

```python
from models import Stock  # au lieu d'utiliser du SQL brut

@app.get("/test-orm")
def test_orm(db: Session = Depends(get_db)):
    premier_stock = db.query(Stock).first()
    return {
        "depot_id": premier_stock.depot_id,
        "produit_id": premier_stock.produit_id,
        "sorties": float(premier_stock.sorties)
    }
```

**Résultat attendu :** un JSON avec les infos du premier enregistrement de la table `stock`, sans avoir écrit une seule ligne de SQL.

## 8. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `NoForeignKeysError` | Le nom de la table ou de la colonne référencée dans `ForeignKey("...")` ne correspond pas exactement à `__tablename__` d'un autre modèle |
| `AttributeError: 'NoneType' object has no attribute ...` | La table est vide, ou le nom de colonne a une faute de frappe |
| Les résultats ne correspondent pas à ceux attendus | Vérifier que `DATABASE_URL` pointe bien vers `petrostock_db` et pas une autre base de test |

## 9. Vérification finale de cette étape

- [ ] Les 9 fichiers de `models/` sont créés
- [ ] `models/__init__.py` importe bien les 9 classes
- [ ] `/test-orm` renvoie des données cohérentes sans erreur

Si tout est coché, tu es prêt pour l'Étape 4 (schémas Pydantic).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
