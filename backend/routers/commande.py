from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database import get_db
from backend.models import BonCommande
from backend.schemas.commande import BonCommandeCreate, BonCommandeOut

router = APIRouter(prefix="/commandes", tags=["Commandes"])


@router.get("/", response_model=List[BonCommandeOut])
def lister_commandes(db: Session = Depends(get_db)):
    return db.query(BonCommande).order_by(BonCommande.date_commande.desc()).limit(100).all()


@router.post("/", response_model=BonCommandeOut, status_code=201)
def creer_commande(commande: BonCommandeCreate, db: Session = Depends(get_db)):
    nouvelle_commande = BonCommande(
        bon_commande_id=f"BC{uuid.uuid4().hex[:8].upper()}",  # génère un ID unique
        date_commande=commande.date_commande,
        fournisseur_id=commande.fournisseur_id,
        depot_destination_id=commande.depot_destination_id,
        produit_id=commande.produit_id,
        quantite_commandee=commande.quantite_commandee,
        statut="En attente"
    )
    db.add(nouvelle_commande)
    db.commit()
    db.refresh(nouvelle_commande)  # recharge l'objet pour récupérer les valeurs générées
    return nouvelle_commande