from pydantic import BaseModel
from datetime import date
from typing import Optional

# Ce que le CLIENT envoie pour créer une commande (pas d'ID, il est généré)
class BonCommandeCreate(BaseModel):
    date_commande: date
    fournisseur_id: str
    depot_destination_id: str
    produit_id: str
    quantite_commandee: float

# Ce que le client envoie pour mettre à jour le statut d'une commande
class BonCommandeUpdate(BaseModel):
    statut: str
    quantite_livree: Optional[float] = None
    date_livraison_reelle: Optional[date] = None

# Ce que l'API RENVOIE une fois la commande créée (avec l'ID généré, le statut, etc.)
class BonCommandeOut(BaseModel):
    bon_commande_id: str
    date_commande: date
    date_livraison_reelle: Optional[date] = None
    fournisseur_id: str
    depot_destination_id: str
    produit_id: str
    quantite_commandee: float
    quantite_livree: Optional[float] = None
    statut: str

    class Config:
        from_attributes = True
