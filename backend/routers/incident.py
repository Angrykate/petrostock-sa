from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import get_db
from models import Incident
from schemas.incident import IncidentCreate, IncidentOut

from services.alerte_service import alerte_service

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=List[IncidentOut])
def lister_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.date_incident.desc()).limit(100).all()


@router.post("/", response_model=IncidentOut, status_code=201)
def declarer_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    gravite_predite = ia_service.classifier_incident(incident.dict())

    nouvel_incident = Incident(
        incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
        date_incident=incident.date_incident,
        depot_id=incident.depot_id,
        type_incident=incident.type_incident,
        description=incident.description,
        gravite=gravite_predite,   # <-- rempli automatiquement maintenant
        statut="Ouvert"
    )
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident


  # ... après avoir obtenu gravite_predite et créé l'incident
escalade = alerte_service.necessite_escalade(gravite_predite)

  # escalade["notifier_direction"] et escalade["notifier_responsable_depot"]
  # indiquent maintenant qui doit recevoir une notification
  # (l'envoi réel de notification n'est pas dans le périmètre des 10 jours,
  # mais l'info est calculée et disponible pour le frontend)