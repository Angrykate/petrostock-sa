from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class IncidentCreate(BaseModel):
    date_incident: date
    depot_id: str
    type_incident: str
    produit_concerne_id: Optional[str] = None
    duree_arret_heures: Optional[float] = 0
    quantite_perdue: Optional[float] = 0
    heure_int: Optional[int] = 12
    mois: Optional[int] = None
    gravite: Optional[str] = None
    description: Optional[str] = None


class IncidentClassificationRequest(BaseModel):
    type_incident: str
    depot_id: str
    produit_concerne_id: str
    duree_arret_heures: float
    quantite_perdue: float
    heure_int: int
    mois: int


class IncidentClassificationResponse(BaseModel):
    gravite: str

# Ce que l'API RENVOIE une fois la commande créée (avec l'ID généré, le statut, etc.)
class IncidentOut(BaseModel):
    incident_id: str
    date_incident: date
    depot_id: str
    type_incident: str
    gravite: Optional[str] = None
    description: Optional[str] = None
    statut: str

    class Config:
        from_attributes = True