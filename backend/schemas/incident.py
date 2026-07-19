from pydantic import BaseModel
from datetime import date, time
from typing import Optional


class IncidentCreate(BaseModel):
    date_incident: date
    depot_id: str
    type_incident: str
    gravite: Optional[str] = None
    description: Optional[str] = None

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