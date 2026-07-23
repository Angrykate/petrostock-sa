from sqlalchemy import Column, Integer, Date, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class FactureVente(Base):
    __tablename__ = "facture_vente"

    facture_id = Column(String(20), primary_key=True)
    date_facture = Column(Date, nullable=False)
    date_echeance = Column(Date)
    client_id = Column(String(10), ForeignKey("client.client_id"))
    depot_source_id = Column(String(10), ForeignKey("depot.depot_id"))
    produit_id = Column(String(10), ForeignKey("produit.produit_id"))
    quantite_vendue = Column(Numeric(14, 2))
    prix_unitaire_vente = Column(Numeric(14, 4))
    remise_pct = Column(Numeric(5, 2))
    montant_ht = Column(Numeric(16, 2))
    tva_pct = Column(Numeric(5, 2))
    montant_tva = Column(Numeric(16, 2))
    montant_ttc = Column(Numeric(16, 2))
    statut_paiement = Column(String(30))        # Ex: "En attente", "Payée", "Annulée"
    mode_paiement = Column(String(30))          # Ex: "Espèces", "Chèque", "Virement"

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")
    client = relationship("Client")
