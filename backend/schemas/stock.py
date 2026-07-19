from pydantic import BaseModel
from datetime import date
from typing import Optional

class StockOut(BaseModel):
    date: date
    depot_id: str
    produit_id: str
    stock_debut_jour: float
    entrees: float
    sorties: float
    stock_fin_jour: float
    taux_remplissage_pct: float
    alerte_stock_bas: bool
    anomalie_detectee: bool

    class Config:
        from_attributes = True  # permet de créer ce schéma directement depuis un objet SQLAlchemy