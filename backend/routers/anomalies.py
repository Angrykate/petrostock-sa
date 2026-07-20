from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from database import get_db
from models import Stock
from schemas.stock import StockOut
from services.ia_service import ia_service

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


class ObservationADetecter(BaseModel):
    """Ce que le client doit fournir pour une détection en temps réel.
    Les champs exacts dépendent des variables retenues par SEMAGNON
    dans le notebook 07 (à ajuster une fois sa documentation reçue)."""
    stock_fin_jour: float
    entrees: float
    sorties: float
    taux_remplissage_pct: float


@router.get("/", response_model=List[StockOut])
def lister_anomalies(db: Session = Depends(get_db)):
    """Liste les anomalies déjà détectées et enregistrées en base."""
    return db.query(Stock).filter(Stock.anomalie_detectee == True).order_by(Stock.date.desc()).limit(100).all()


@router.post("/detecter")
def detecter_nouvelle_anomalie(observation: ObservationADetecter):
    """Détection en temps réel sur une observation qui n'est pas encore en base
    (ex. utilisée par le frontend avant l'enregistrement d'un mouvement)."""
    resultat = ia_service.detecter_anomalie(observation.dict())
    return resultat