# Étape 5 — Premier router complet : `routers/stocks.py`

**Objectif de cette étape :** écrire un router entier, du début à la fin, qui deviendra le modèle à recopier pour tous les autres routers (Étape 6). C'est l'étape où modèles SQLAlchemy (Étape 3) et schémas Pydantic (Étape 4) se rejoignent enfin dans du code fonctionnel.

---

## 1. Qu'est-ce qu'un router ?

Jusqu'ici, tous les endpoints de test étaient écrits directement dans `main.py`. Ça devient vite ingérable si tous les endpoints du projet (stocks, commandes, incidents, factures, kpi...) sont dans un seul fichier. Un **router** permet de regrouper les endpoints liés à une même ressource dans son propre fichier, que `main.py` vient ensuite assembler.

## 2. Créer `routers/stocks.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from models import Stock
from schemas.stock import StockOut

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/", response_model=List[StockOut])
def lister_stocks(
    depot_id: Optional[str] = None,
    produit_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste les stocks, avec filtres optionnels par dépôt et/ou produit."""
    query = db.query(Stock)
    if depot_id:
        query = query.filter(Stock.depot_id == depot_id)
    if produit_id:
        query = query.filter(Stock.produit_id == produit_id)
    return query.limit(100).all()


@router.get("/alertes/", response_model=List[StockOut])
def stocks_en_alerte(db: Session = Depends(get_db)):
    """Retourne tous les stocks actuellement sous le seuil d'alerte."""
    return db.query(Stock).filter(Stock.alerte_stock_bas == True).all()


@router.get("/{depot_id}", response_model=List[StockOut])
def stock_par_depot(
    depot_id: str,
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Historique de stock pour un dépôt donné, avec filtre de période optionnel."""
    query = db.query(Stock).filter(Stock.depot_id == depot_id)

    if date_debut:
        query = query.filter(Stock.date >= date_debut)
    if date_fin:
        query = query.filter(Stock.date <= date_fin)

    resultats = query.order_by(Stock.date.desc()).limit(100).all()

    if not resultats:
        raise HTTPException(status_code=404, detail=f"Aucun stock trouvé pour le dépôt {depot_id}")

    return resultats
```

## 3. Explication des éléments nouveaux

**`router = APIRouter(prefix="/stocks", tags=["Stocks"])`**
- `prefix="/stocks"` : toutes les routes de ce fichier commencent automatiquement par `/stocks` — pas besoin de le réécrire à chaque fonction.
- `tags=["Stocks"]` : regroupe visuellement ces endpoints sous un même titre dans la page Swagger (`/docs`).

**`response_model=List[StockOut]`**
Dit à FastAPI : "la réponse doit avoir exactement la forme de `StockOut`, répétée en liste". FastAPI filtre automatiquement les données pour ne renvoyer que les champs définis dans le schéma — même si l'objet SQLAlchemy en contient plus.

**Paramètres optionnels (`depot_id: Optional[str] = None`)**
Quand un paramètre de fonction n'est pas dans l'URL (comme `{depot_id}` l'est dans la 3e route), FastAPI le traite automatiquement comme un **paramètre de requête** (`?depot_id=D001` dans l'URL). Comme il a une valeur par défaut (`None`), il est optionnel.

**`raise HTTPException(status_code=404, ...)`**
Renvoie une vraie erreur HTTP avec un message clair, plutôt qu'une liste vide silencieuse — important pour que le frontend (plus tard) sache distinguer "pas de résultat" d'une vraie erreur.

**L'ordre des routes compte !**
Remarque que `/alertes/` est définie **avant** `/{depot_id}` dans le fichier. Si l'ordre était inversé, une requête vers `/stocks/alertes/` serait interceptée par la route `/{depot_id}` (qui interpréterait "alertes" comme un `depot_id`) avant d'atteindre la bonne fonction. Règle à retenir : les routes fixes (`/alertes/`) doivent toujours être déclarées avant les routes à paramètre variable (`/{depot_id}`).

## 4. Brancher ce router dans `main.py`

```python
from fastapi import FastAPI
from routers import stocks

app = FastAPI(title="PetroStock SA API")

app.include_router(stocks.router)

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}
```

Créer aussi `routers/__init__.py` (peut rester vide, sert juste à indiquer que `routers` est un dossier importable).

## 5. Tester sur Swagger

Relancer le serveur, aller sur `/docs`. Un nouveau groupe "Stocks" doit apparaître avec 3 endpoints :
- `GET /stocks/`
- `GET /stocks/alertes/`
- `GET /stocks/{depot_id}`

Tester chacun avec "Try it out", avec de vraies valeurs (ex. un `depot_id` existant comme `D001`).

## 6. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `404 Not Found` sur toutes les routes `/stocks/...` | Le router n'est pas branché dans `main.py` (vérifier `app.include_router(...)`) |
| `ResponseValidationError` | Un champ du schéma `StockOut` ne correspond pas à un attribut existant sur le modèle `Stock`, ou un type ne correspond pas (ex. `Numeric` renvoyé sans conversion en `float`) |
| `/stocks/alertes/` renvoie une erreur 404 "dépôt non trouvé" | L'ordre des routes est inversé (voir section 3, dernier point) |
| Liste toujours vide | Vérifier que la base contient bien des lignes avec `alerte_stock_bas = true`, ou que le filtre appliqué est correct |

## 7. Vérification finale de cette étape

- [ ] `routers/stocks.py` créé avec les 3 endpoints
- [ ] Le router est branché dans `main.py`
- [ ] Les 3 endpoints répondent correctement sur `/docs`, avec de vraies données

Si tout est coché, tu es prêt pour l'Étape 6 — répéter ce même pattern pour les routers restants (`commandes`, `incidents`, `factures`, `kpi`).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
