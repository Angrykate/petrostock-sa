# Étape 6 — Les routers restants

**Objectif de cette étape :** répéter le pattern de l'Étape 5 pour les 4 routers restants. Il n'y a pas de nouveau concept ici — c'est la même méthode appliquée à d'autres tables. Cette étape sert aussi à vérifier que le pattern est bien compris et automatisable.

---

## 1. `routers/commandes.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import BonCommande
from schemas.commande import BonCommandeCreate, BonCommandeOut

router = APIRouter(prefix="/commandes", tags=["Commandes"])


@router.get("/", response_model=List[BonCommandeOut])
def lister_commandes(db: Session = Depends(get_db)):
    return db.query(BonCommande).order_by(BonCommande.date_commande.desc()).limit(100).all()


@router.post("/", response_model=BonCommandeOut, status_code=201)
def creer_commande(commande: BonCommandeCreate, db: Session = Depends(get_db)):
    nouvelle_commande = BonCommande(
        bon_commande_id=f"BC{uuid.uuid4().hex[:8].upper()}",  # génère un ID unique
        date_commande=commande.date_commande,
        fournisseur_id=commande.fournisseur_id,
        depot_destination_id=commande.depot_destination_id,
        produit_id=commande.produit_id,
        quantite_commandee=commande.quantite_commandee,
        statut="En attente"
    )
    db.add(nouvelle_commande)
    db.commit()
    db.refresh(nouvelle_commande)  # recharge l'objet pour récupérer les valeurs générées
    return nouvelle_commande
```

**Points nouveaux par rapport à l'Étape 5 :**
- **`@router.post("/")`** : méthode POST, utilisée pour créer une ressource (au lieu de GET pour lire).
- **`commande: BonCommandeCreate`** : FastAPI valide automatiquement le corps de la requête JSON reçue contre ce schéma — si un champ obligatoire manque ou a le mauvais type, il rejette la requête avant même d'exécuter la fonction.
- **`db.add(...)` / `db.commit()` / `db.refresh(...)`** : le cycle classique d'écriture avec SQLAlchemy — `add` prépare l'insertion, `commit` l'exécute réellement en base, `refresh` recharge l'objet Python avec les éventuelles valeurs générées côté base.
- **`status_code=201`** : convention HTTP pour "ressource créée avec succès" (au lieu du 200 par défaut).

## 2. `routers/incidents.py`

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Incident
from schemas.incident import IncidentCreate, IncidentOut

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=List[IncidentOut])
def lister_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.date_incident.desc()).limit(100).all()


@router.post("/", response_model=IncidentOut, status_code=201)
def declarer_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    nouvel_incident = Incident(
        incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
        date_incident=incident.date_incident,
        depot_id=incident.depot_id,
        type_incident=incident.type_incident,
        description=incident.description,
        statut="Ouvert"
        # gravite sera ajoutée à l'Étape 7, une fois le modèle IA branché
    )
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident
```

**Note importante :** pour l'instant, `gravite` n'est pas encore remplie automatiquement — ça viendra à l'Étape 7, quand le modèle `ClassificationIncident` de SEMAGNON sera branché ici. Pour l'instant, tester juste que la création fonctionne, avec `gravite` laissée vide ou à `None`.

## 3. `routers/factures.py`

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from models import FactureVente
from schemas.facture import FactureOut

router = APIRouter(prefix="/factures", tags=["Factures"])


@router.get("/", response_model=List[FactureOut])
def lister_factures(
    statut_paiement: Optional[str] = None,
    client_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FactureVente)
    if statut_paiement:
        query = query.filter(FactureVente.statut_paiement == statut_paiement)
    if client_id:
        query = query.filter(FactureVente.client_id == client_id)
    return query.order_by(FactureVente.date_facture.desc()).limit(100).all()
```
(Nécessite de créer au préalable `schemas/facture.py` avec une classe `FactureOut`, sur le même modèle que `StockOut` de l'Étape 4.)

## 4. `routers/kpi.py`

Ce router est différent des autres : il n'expose pas une table telle quelle, mais des **valeurs agrégées** calculées à la volée.

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models import Stock, Incident

router = APIRouter(prefix="/kpi", tags=["KPI"])


@router.get("/")
def indicateurs_globaux(db: Session = Depends(get_db)):
    valeur_totale_stock = db.query(func.sum(Stock.valeur_stock)).scalar() or 0
    nombre_alertes = db.query(Stock).filter(Stock.alerte_stock_bas == True).count()
    taux_remplissage_moyen = db.query(func.avg(Stock.taux_remplissage_pct)).scalar() or 0
    incidents_ouverts = db.query(Incident).filter(Incident.statut == "Ouvert").count()

    return {
        "valeur_totale_stock_usd": round(float(valeur_totale_stock), 2),
        "nombre_alertes_actives": nombre_alertes,
        "taux_remplissage_moyen_pct": round(float(taux_remplissage_moyen), 2),
        "incidents_ouverts": incidents_ouverts
    }
```

**Point nouveau :** `func.sum(...)`, `func.avg(...)`, `.count()` — ce sont les équivalents SQLAlchemy des fonctions d'agrégation SQL (`SUM`, `AVG`, `COUNT`). Comme il n'y a pas de "forme de table" fixe ici, on renvoie directement un dictionnaire plutôt que de passer par un schéma Pydantic — acceptable pour ce type d'endpoint, mais tu peux créer un schéma `KpiOut` (évoqué à l'Étape 4) si tu préfères rester cohérent avec les autres routers.

## 5. Brancher tous les nouveaux routers dans `main.py`

```python
from fastapi import FastAPI
from routers import stocks, commandes, incidents, factures, kpi

app = FastAPI(title="PetroStock SA API")

app.include_router(stocks.router)
app.include_router(commandes.router)
app.include_router(incidents.router)
app.include_router(factures.router)
app.include_router(kpi.router)

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}
```

## 6. Vérification finale de cette étape

- [ ] Les 4 routers sont créés et branchés dans `main.py`
- [ ] Chaque `GET` renvoie des données cohérentes sur `/docs`
- [ ] Le `POST /commandes/` crée bien une nouvelle ligne en base (vérifiable avec un `GET /commandes/` juste après)
- [ ] Le `POST /incidents/` fonctionne (même sans `gravite` remplie pour l'instant)
- [ ] `/kpi/` renvoie des chiffres cohérents avec ce que montre l'EDA de stocks

Si tout est coché, l'ensemble des endpoints CRUD (hors IA) est terminé. Prêt pour l'Étape 7 dès que les fichiers `.pkl` de SIDIBE et SEMAGNON sont disponibles.

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
