from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from backend.database import get_db
from backend.models import Stock
from backend.schemas.stock import StockOut

router = APIRouter(prefix="/stocks", tags=["Stocks"])


@router.get("/", response_model=List[StockOut])
def lister_stocks(
    depot_id: Optional[str] = None,
    produit_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Liste les stocks, avec filtres optionnels par dépôt et/ou produit."""
    query = db.query(Stock)
    if depot_id:
        query = query.filter(Stock.depot_id == depot_id)
    if produit_id:
        query = query.filter(Stock.produit_id == produit_id)
    return query.limit(100).all()


@router.get("/alertes/", response_model=List[StockOut])
def stocks_en_alerte(db: Session = Depends(get_db)):
    """Retourne tous les stocks actuellement sous le seuil d'alerte."""
    return db.query(Stock).filter(Stock.alerte_stock_bas == True).all()


@router.get("/{depot_id}", response_model=List[StockOut])
def stock_par_depot(
    depot_id: str,
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Historique de stock pour un dépôt donné, avec filtre de période optionnel."""
    query = db.query(Stock).filter(Stock.depot_id == depot_id)

    if date_debut:
        query = query.filter(Stock.date >= date_debut)
    if date_fin:
        query = query.filter(Stock.date <= date_fin)

    resultats = query.order_by(Stock.date.desc()).limit(100).all()

    if not resultats:
        raise HTTPException(status_code=404, detail=f"Aucun stock trouvé pour le dépôt {depot_id}")

    return resultats