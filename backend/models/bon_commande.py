from sqlalchemy import Column, Integer, Date, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class BonCommande(Base):
    __tablename__ = "bon_commande"

    bon_commande_id = Column(String(20), primary_key=True)
    date_commande = Column(Date, nullable=False)
    date_livraison_prevue = Column(Date)
    date_livraison_reelle = Column(Date)
    fournisseur_id = Column(String(10), ForeignKey("fournisseur.fournisseur_id"))
    depot_destination_id = Column(String(10), ForeignKey("depot.depot_id"))
    produit_id = Column(String(10), ForeignKey("produit.produit_id"))
    quantite_commandee = Column(Numeric(14, 2))
    quantite_livree = Column(Numeric(14, 2))
    prix_unitaire = Column(Numeric(14, 4))
    montant_total = Column(Numeric(16, 2))
    statut = Column(String(30))        # Ex: "En attente", "Livré", "Annulé"
    delai_livraison_jours = Column(Integer)
    retard_jours = Column(Integer)

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")
    fournisseur = relationship("Fournisseur")
