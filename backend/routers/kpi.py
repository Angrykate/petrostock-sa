from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Stock, Incident

router = APIRouter(prefix="/kpi", tags=["KPI"])


@router.get("/")
def indicateurs_globaux(db: Session = Depends(get_db)):
    valeur_totale_stock = db.query(func.sum(Stock.valeur_stock)).scalar() or 0
    nombre_alertes = db.query(Stock).filter(Stock.alerte_stock_bas == True).count()
    taux_remplissage_moyen = db.query(func.avg(Stock.taux_remplissage_pct)).scalar() or 0
    incidents_ouverts = db.query(Incident).filter(Incident.statut == "Ouvert").count()

    return {
        "valeur_totale_stock_usd": round(float(valeur_totale_stock), 2),
        "nombre_alertes_actives": nombre_alertes,
        "taux_remplissage_moyen_pct": round(float(taux_remplissage_moyen), 2),
        "incidents_ouverts": incidents_ouverts
    }