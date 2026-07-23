from fastapi import APIRouter, HTTPException
from backend.schemas.rupture import RuptureResponse
from backend.services.ia_service import ia_service
from backend.services.alerte_service import alerte_service

router = APIRouter(prefix="/ruptures", tags=["Ruptures"])


@router.get("/{depot_id}", response_model=RuptureResponse)
def estimation_rupture(depot_id: str, produit_id: str):
    """Estime le nombre de jours avant rupture de stock pour un produit dans un dépôt."""
    try:
        request_data = {"depot_id": depot_id, "produit_id": produit_id}
        jours_couverture = ia_service.estimer_jours_rupture(request_data)
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    niveau = alerte_service.niveau_alerte(jours_couverture)
    return {
        "depot_id": depot_id,
        "produit_id": produit_id,
        "jours_couverture_estimes": float(jours_couverture),
        "niveau_alerte": niveau,
    }