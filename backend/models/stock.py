from sqlalchemy import Column, Integer, Date, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Stock(Base):
    __tablename__ = "stock"

    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    jour_semaine = Column(String(20))
    mois = Column(SmallInteger)
    trimestre = Column(SmallInteger)
    annee = Column(SmallInteger)
    depot_id = Column(String(10), ForeignKey("depot.depot_id"))
    produit_id = Column(String(10), ForeignKey("produit.produit_id"))
    stock_debut_jour = Column(Numeric(14, 2))
    entrees = Column(Numeric(14, 2))
    sorties = Column(Numeric(14, 2))
    stock_fin_jour = Column(Numeric(14, 2))
    capacite_max = Column(Numeric(14, 2))
    taux_remplissage_pct = Column(Numeric(5, 2))
    seuil_alerte_min = Column(Numeric(14, 2))
    alerte_stock_bas = Column(Boolean)
    anomalie_detectee = Column(Boolean)
    prix_wti_usd_baril = Column(Numeric(10, 2))
    prix_unitaire = Column(Numeric(14, 4))
    valeur_stock = Column(Numeric(16, 2))

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")