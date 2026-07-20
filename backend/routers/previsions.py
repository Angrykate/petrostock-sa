from fastapi import APIRouter
from services.ia_service import ia_service

router = APIRouter(prefix="/previsions", tags=["Prévisions"])


@router.get("/{produit_id}")
def prevision_demande(produit_id: str, depot_id: str, horizon_jours: int = 30):
    """Prévision de demande pour un produit dans un dépôt sur un horizon donné."""
    prediction = ia_service.predire_demande(depot_id, produit_id, horizon_jours)
    return {
        "depot_id": depot_id,
        "produit_id": produit_id,
        "prevision": prediction.tolist()
    }