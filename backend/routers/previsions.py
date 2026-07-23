from fastapi import APIRouter, HTTPException
from backend.schemas.prevision import PrevisionResponse
from backend.services.ia_service import ia_service

router = APIRouter(prefix="/previsions", tags=["Prévisions"])


@router.get("/{produit_id}", response_model=PrevisionResponse)
def prevision_demande(produit_id: str, depot_id: str, horizon_jours: int = 30):
    """Prévision de demande pour un produit dans un dépôt sur un horizon donné."""
    try:
        request_data = {
            "depot_id": depot_id,
            "produit_id": produit_id,
            "horizon_jours": horizon_jours,
        }
        prediction = ia_service.predire_demande(request_data)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if isinstance(prediction, list):
        return {
            "depot_id": depot_id,
            "produit_id": produit_id,
            "prevision": [float(item.get("yhat", 0.0)) for item in prediction],
        }
    return {
        "depot_id": depot_id,
        "produit_id": produit_id,
        "prevision": [],
    }
