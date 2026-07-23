from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.database import get_db
from backend.models import FactureVente
from backend.schemas.factures import FactureOut

router = APIRouter(prefix="/factures", tags=["Factures"])


@router.get("/", response_model=List[FactureOut])
def lister_factures(
    statut_paiement: Optional[str] = None,
    client_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(FactureVente)
    if statut_paiement:
        query = query.filter(FactureVente.statut_paiement == statut_paiement)
    if client_id:
        query = query.filter(FactureVente.client_id == client_id)
    return query.order_by(FactureVente.date_facture.desc()).limit(100).all()