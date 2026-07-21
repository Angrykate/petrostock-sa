from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database import get_db
from backend.models import Incident
from backend.schemas.incident import IncidentCreate, IncidentOut

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.get("/", response_model=List[IncidentOut])
def lister_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.date_incident.desc()).limit(100).all()


@router.post("/", response_model=IncidentOut, status_code=201)
def declarer_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    nouvel_incident = Incident(
        incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
        date_incident=incident.date_incident,
        depot_id=incident.depot_id,
        type_incident=incident.type_incident,
        description=incident.description,
        gravite=incident.gravite,
        statut="Ouvert"
        # gravite sera ajoutée à l'Étape 7, une fois le modèle IA branché
    )
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident