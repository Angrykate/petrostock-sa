from pydantic import BaseModel
from typing import Optional

class PrevisionRequest(BaseModel):
    depot_id: Optional[str] = None
    produit_id: Optional[str] = None
    horizon_jours: Optional[int] = 30
    stock_fin_jour: float
    taux_remplissage_pct: float
    sorties: float
    entrees: float
    stock_ma7: float
    stock_ma14: float
    sorties_ma7: float
    sorties_ma14: float
    sorties_ma30: float
    couverture_lag1: float
    couverture_lag7: float
    couverture_lag14: float
    tendance_stock: float
    jour_semaine: int
    mois: int
    trimestre: int
    is_weekend: bool
    prix_wti_usd_baril: float

class PrevisionResponse(BaseModel):
    demande_prev: float

    class Config:
        orm_mode = True
