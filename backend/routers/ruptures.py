from fastapi import APIRouter, HTTPException
from backend.schemas.rupture import RuptureRequest, RuptureResponse
from backend.services.ia_service import ia_service
from backend.services.alerte_service import alerte_service

router = APIRouter(prefix="/ruptures", tags=["Ruptures"])


@router.post("/estimer", response_model=RuptureResponse)
def estimation_rupture(request: RuptureRequest):
    """Estime le nombre de jours avant rupture de stock pour une observation donnée."""
    try:
        jours_couverture = ia_service.estimer_jours_rupture(request.dict())
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    niveau = alerte_service.niveau_alerte(jours_couverture)
    return {
        "rupture_risk": float(jours_couverture)
    }