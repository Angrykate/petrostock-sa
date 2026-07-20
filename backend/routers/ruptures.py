from fastapi import APIRouter
from services.ia_service import ia_service
from services.alerte_service import alerte_service

router = APIRouter(prefix="/ruptures", tags=["Ruptures"])


@router.get("/{depot_id}")
def estimation_rupture(depot_id: str, produit_id: str):
    """Estime le nombre de jours avant rupture de stock pour un dépôt et un produit."""
    jours_couverture = ia_service.estimer_jours_rupture(depot_id, produit_id)
    niveau = alerte_service.niveau_alerte(jours_couverture)
    return {
        "depot_id": depot_id,
        "produit_id": produit_id,
        "jours_couverture_estimes": round(jours_couverture, 1),
        "niveau_alerte": niveau
    }