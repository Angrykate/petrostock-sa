from pydantic import BaseModel
from datetime import date
from typing import Optional


class FactureOut(BaseModel):
    facture_id: str
    date_facture: date
    date_echeance: Optional[date] = None
    client_id: str
    depot_source_id: str
    produit_id: str
    quantite_vendue: float
    prix_unitaire_vente: float
    remise_pct: Optional[float] = None
    montant_ht: float
    tva_pct: Optional[float] = None
    montant_tva: Optional[float] = None
    montant_ttc: float
    statut_paiement: str
    mode_paiement: Optional[str] = None

    class Config:
        from_attributes = True