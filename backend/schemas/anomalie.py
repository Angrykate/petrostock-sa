from pydantic import BaseModel

class AnomalieRequest(BaseModel):
    stock_fin_jour: float
    taux_remplissage_pct: float
    entrees: float
    sorties: float
    stock_debut_jour: float
    mois: int
    jour_sem: int
    is_weekend: bool

class AnomalieResponse(BaseModel):
    anomalie: bool
    score: float

    class Config:
        orm_mode = True
