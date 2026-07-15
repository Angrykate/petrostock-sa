# Étape 10 — Finalisation (les points manquants du cahier des tâches)

**Objectif de cette étape :** combler les écarts entre ce que les étapes 0-9 produisent et ce que le cahier des tâches technique demande explicitement. Sans cette étape, le backend fonctionne mais n'est pas complet au sens des livrables attendus.

---

## 1. Router `anomalies.py` dédié (manquant jusqu'ici)

Le cahier des tâches demande deux choses distinctes pour les anomalies :
- **Lister** les anomalies déjà connues (déjà présentes dans la table `stock`, colonne `anomalie_detectee`)
- **Détecter** sur une **nouvelle observation** fournie par le client — c'est différent, ça veut dire appeler le modèle Isolation Forest en temps réel sur des données qui n'existent pas encore en base.

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Stock
from schemas.stock import StockOut
from services.ia_service import ia_service

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("/", response_model=List[StockOut])
def lister_anomalies(db: Session = Depends(get_db)):
    """Liste les anomalies déjà détectées et enregistrées en base."""
    return db.query(Stock).filter(Stock.anomalie_detectee == True).order_by(Stock.date.desc()).limit(100).all()


class ObservationADetecter(BaseModel):
    """Ce que le client doit fournir pour une détection en temps réel.
    Les champs exacts dépendent des variables retenues par SEMAGNON
    dans le notebook 07 (à ajuster une fois sa documentation reçue)."""
    stock_fin_jour: float
    entrees: float
    sorties: float
    taux_remplissage_pct: float


@router.post("/detecter")
def detecter_nouvelle_anomalie(observation: ObservationADetecter):
    """Détection en temps réel sur une observation qui n'est pas encore en base
    (ex. utilisée par le frontend avant l'enregistrement d'un mouvement)."""
    resultat = ia_service.detecter_anomalie(observation.dict())
    return resultat
```

**Ne pas oublier de brancher ce router dans `main.py`** : `app.include_router(anomalies.router)`.

## 2. Endpoint `/ruptures/` dédié (manquant jusqu'ici)

L'Étape 8 utilisait `estimer_jours_rupture` seulement en interne. Il faut un vrai endpoint public, comme listé dans le cahier des tâches (*"estimation des jours avant rupture par dépôt et produit"*).

```python
from fastapi import APIRouter
from services.ia_service import ia_service
from services.alerte_service import alerte_service

router = APIRouter(prefix="/ruptures", tags=["Ruptures"])


@router.get("/{depot_id}")
def estimation_rupture(depot_id: str, produit_id: str):
    jours_couverture = ia_service.estimer_jours_rupture(depot_id, produit_id)
    niveau = alerte_service.niveau_alerte(jours_couverture)
    return {
        "depot_id": depot_id,
        "produit_id": produit_id,
        "jours_couverture_estimes": round(jours_couverture, 1),
        "niveau_alerte": niveau
    }
```

Créer aussi `routers/ruptures.py` comme fichier séparé (cohérent avec le découpage `stocks.py`, `commandes.py`, etc.) plutôt que de le laisser mélangé dans un autre router.

## 3. Documenter les tests (preuve exigée par le cahier des tâches)

Le livrable demandé est explicitement *"API fonctionnelle avec tous les endpoints testés via Swagger ou Postman"* — ça veut dire qu'il faut une **trace** de ces tests pour le rapport, pas juste l'avoir vérifié une fois en développement.

**Option simple (recommandée vu le délai) — captures d'écran Swagger :**
Pour chaque endpoint, sur `/docs` : cliquer "Try it out", exécuter avec des valeurs réelles, prendre une capture d'écran montrant la requête et la réponse. Regrouper dans un dossier `docs/tests_api/` avec un nom clair par capture (ex. `get_stocks_alertes.png`, `post_commandes.png`).

**Option plus complète — export Postman :**
Si vous préférez utiliser Postman, construire une collection avec un exemple de requête par endpoint, puis "Export" → format JSON. Ce fichier peut être commité dans `docs/postman_collection.json` — n'importe qui peut l'importer et rejouer tous les tests d'un coup.

**Les deux options sont valables** — le choix dépend juste de si SEGNEDJI préfère rester uniquement sur Swagger (plus rapide) ou basculer sur Postman (plus réutilisable). Dans les deux cas, il faut qu'une preuve concrète existe dans `docs/` pour le rapport.

## 4. Rédiger les justifications attendues par le rapport

Le cahier des tâches (section 6.3, points de décision) demande explicitement d'argumenter ces choix — ce n'est pas optionnel, même sans soutenance orale. À rédiger en quelques phrases chacun, à inclure dans le rapport final :

**a) Choix FastAPI vs Django REST Framework**
Ex. : *"FastAPI a été retenu pour sa légèreté, sa documentation Swagger générée automatiquement, et son intégration naturelle avec les modèles scikit-learn/Prophet déjà utilisés par l'équipe pour la partie IA."*

**b) Convention de nommage des endpoints**
Documenter la règle suivie, par exemple : *"les endpoints suivent le format `/ressource/` au pluriel pour les collections (`/stocks/`, `/incidents/`), `/ressource/{id}` pour un élément précis, et des sous-routes explicites pour les cas spéciaux (`/stocks/alertes/`, `/anomalies/detecter`)."*

**c) Endpoints publics vs authentifiés**
Documenter le choix pris à l'Étape 9 (ex. authentification hors périmètre pour cette version, tous les endpoints publics) — avec la justification du compromis lié au délai de 10 jours.

**d) Stratégie de gestion des erreurs**
Ex. : *"toute ressource introuvable renvoie un code 404 avec un message explicite ; toute erreur de validation de données renvoie un code 422 généré automatiquement par Pydantic ; toute erreur inattendue est interceptée par un gestionnaire global renvoyant un code 500 générique, pour ne jamais exposer de détails techniques internes au client."*

## 5. Vérification finale de cette étape (et du backend dans son ensemble)

- [ ] `routers/anomalies.py` créé avec les 2 endpoints (liste + détection temps réel)
- [ ] `routers/ruptures.py` créé avec l'endpoint dédié
- [ ] Une preuve de test existe dans `docs/` (captures Swagger ou export Postman)
- [ ] Les 4 justifications (a, b, c, d) sont rédigées, prêtes à copier dans le rapport final

Si tout est coché, le backend est maintenant complet au sens du cahier des tâches technique — pas seulement fonctionnel, mais aussi documenté et justifié comme demandé.

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
