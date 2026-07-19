from pydantic import BaseModel
from datetime import date
from typing import Optional

class FactureOut(BaseModel):
    statut_paiement: Optional[str] = None
    client_id: Optional[str] = None
    
    class Config:
        from_attributes = True  # permet de créer ce schéma directement depuis un objet SQLAlchemy