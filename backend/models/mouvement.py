from sqlalchemy import Column, Integer, Date, Time, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Mouvement(Base):
    __tablename__ = "mouvement"

    mouvement_id = Column(String(20), primary_key=True)
    date = Column(Date, nullable=False)
    heure = Column(Time)
    depot_id = Column(String(10), ForeignKey("depot.depot_id"))
    produit_id = Column(String(10), ForeignKey("produit.produit_id"))
    type_mouvement = Column(String(20))  # Ex: "Entrée", "Sortie"
    quantite = Column(Numeric(14, 2))
    prix_unitaire = Column(Numeric(14, 4))
    valeur_mouvement = Column(Numeric(16, 2))
    camion_id = Column(String(20))
    operateur_id = Column(String(10))
    bon_commande_ref = Column(String(20), ForeignKey("bon_commande.bon_commande_id"))

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")
    bon_commande = relationship("BonCommande")