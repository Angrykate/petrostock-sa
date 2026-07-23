from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from backend.database import get_db
from backend.models import Incident
from backend.schemas.incident import (
    IncidentClassificationRequest,
    IncidentClassificationResponse,
    IncidentCreate,
    IncidentOut,
)
from backend.services.ia_service import ia_service

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("/classifier", response_model=IncidentClassificationResponse)
def classifier_incident(request: IncidentClassificationRequest):
    """Prédit la gravité d'un incident avec le modèle entraîné du notebook 08."""
    try:
        gravite = ia_service.classifier_incident(request.model_dump())
    except HTTPException as exc:
        raise exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"gravite": gravite}


@router.get("/", response_model=List[IncidentOut])
def lister_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.date_incident.desc()).limit(100).all()


@router.post("/", response_model=IncidentOut, status_code=201)
def declarer_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    gravite = incident.gravite
    if incident.produit_concerne_id:
        try:
            gravite = ia_service.classifier_incident({
                "type_incident": incident.type_incident,
                "depot_id": incident.depot_id,
                "produit_concerne_id": incident.produit_concerne_id,
                "duree_arret_heures": incident.duree_arret_heures or 0,
                "quantite_perdue": incident.quantite_perdue or 0,
                "heure_int": incident.heure_int or 12,
                "mois": incident.mois or incident.date_incident.month,
            })
        except HTTPException as exc:
            raise exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    nouvel_incident = Incident(
        incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
        date_incident=incident.date_incident,
        depot_id=incident.depot_id,
        type_incident=incident.type_incident,
        description=incident.description,
        gravite=gravite,
        statut="Ouvert"
        # gravite sera ajoutée à l'Étape 7, une fois le modèle IA branché
    )
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident