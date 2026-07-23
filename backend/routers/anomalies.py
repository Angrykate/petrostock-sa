from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.database import get_db
from backend.models import Stock
from backend.schemas.stock import StockOut
from backend.schemas.anomalie import AnomalieRequest, AnomalieResponse
from backend.services.ia_service import ia_service

router = APIRouter(prefix="/anomalies", tags=["Anomalies"])


@router.get("/", response_model=List[StockOut])
def lister_anomalies(db: Session = Depends(get_db)):
    """Liste les anomalies déjà détectées et enregistrées en base."""
    return db.query(Stock).filter(Stock.anomalie_detectee == True).order_by(Stock.date.desc()).limit(100).all()


@router.post("/detecter", response_model=AnomalieResponse)
def detecter_nouvelle_anomalie(observation: AnomalieRequest):
    """Détection en temps réel sur une observation qui n'est pas encore en base."""
    try:
        resultat = ia_service.detecter_anomalie(observation.dict())
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return resultat