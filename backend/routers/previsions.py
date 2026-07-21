from fastapi import APIRouter, HTTPException
from backend.schemas.prevision import PrevisionRequest, PrevisionResponse
from backend.services.ia_service import ia_service

router = APIRouter(prefix="/previsions", tags=["Prévisions"])


@router.post("/demande", response_model=PrevisionResponse)
def prevision_demande(request: PrevisionRequest):
    """Prévision de demande pour un produit sur un horizon donné."""
    try:
        prediction = ia_service.predire_demande(request.dict())
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if isinstance(prediction, list) and prediction:
        return {"demande_prev": float(prediction[-1].get("yhat", 0.0))}
    return {"demande_prev": 0.0}
