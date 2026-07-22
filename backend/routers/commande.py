from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import date

from backend.database import get_db
from backend.models import BonCommande, Incident
from backend.schemas.commande import BonCommandeCreate, BonCommandeUpdate, BonCommandeOut
from backend.services.alerte_service import alerte_service

router = APIRouter(prefix="/commandes", tags=["Commandes"])


@router.get("/", response_model=List[BonCommandeOut])
def lister_commandes(db: Session = Depends(get_db)):
    return db.query(BonCommande).order_by(BonCommande.date_commande.desc()).limit(100).all()


@router.post("/", response_model=BonCommandeOut, status_code=201)
def creer_commande(commande: BonCommandeCreate, db: Session = Depends(get_db)):
    nouvelle_commande = BonCommande(
        bon_commande_id=f"BC{uuid.uuid4().hex[:8].upper()}",
        date_commande=commande.date_commande,
        fournisseur_id=commande.fournisseur_id,
        depot_destination_id=commande.depot_destination_id,
        produit_id=commande.produit_id,
        quantite_commandee=commande.quantite_commandee,
        statut="En attente",
    )
    db.add(nouvelle_commande)
    db.commit()
    db.refresh(nouvelle_commande)
    return nouvelle_commande


@router.put("/{bon_commande_id}", response_model=BonCommandeOut)
def mettre_a_jour_commande(bon_commande_id: str, update: BonCommandeUpdate, db: Session = Depends(get_db)):
    """Met à jour le statut d'une commande.
    
    Si le statut passe à "Livré" et que l'écart entre quantite_commandee
    et quantite_livree dépasse 3%, un incident est créé automatiquement
    (Règle 6 — Détection automatique d'écart de livraison).
    """
    commande = db.query(BonCommande).filter(BonCommande.bon_commande_id == bon_commande_id).first()
    if not commande:
        raise HTTPException(status_code=404, detail=f"Commande {bon_commande_id} introuvable")

    ancien_statut = commande.statut
    commande.statut = update.statut

    if update.quantite_livree is not None:
        commande.quantite_livree = update.quantite_livree
    if update.date_livraison_reelle is not None:
        commande.date_livraison_reelle = update.date_livraison_reelle

    db.commit()
    db.refresh(commande)

    # Règle 6 : Si le statut passe à "Livré", vérifier l'écart
    if update.statut == "Livré" and ancien_statut != "Livré":
        quantite_livree = update.quantite_livree or 0
        resultat = alerte_service.verifier_ecart_livraison(commande.quantite_commandee, quantite_livree)

        if resultat["depasse_seuil"]:
            # Création automatique d'un incident pour écart de livraison
            nouvel_incident = Incident(
                incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
                date_incident=date.today(),
                depot_id=commande.depot_destination_id,
                type_incident="Anomalie stock",
                description=(
                    f"Écart de livraison automatique : commande {bon_commande_id} — "
                    f"{commande.quantite_commandee}L commandé, {quantite_livree}L reçu "
                    f"(écart {resultat['ecart_pct']}%)"
                ),
                gravite="Modéré",
                statut="Ouvert",
                quantite_perdue=abs(commande.quantite_commandee - quantite_livree),
                operateur_responsable="Système",
            )
            db.add(nouvel_incident)
            db.commit()

    return commande