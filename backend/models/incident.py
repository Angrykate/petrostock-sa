from sqlalchemy import Column, Integer, Date,Time,Text, String, SmallInteger, Numeric, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Incident(Base):
    __tablename__ = "incident"

    incident_id = Column(String(20), primary_key=True)
    date_incident = Column(Date, nullable=False)
    heure_incident = Column(Time)
    depot_id = Column(String(10), ForeignKey("depot.depot_id"))
    region = Column(String(50))
    produit_concerne_id = Column(String(10), ForeignKey("produit.produit_id"))
    type_incident = Column(String(50))  # Ex: "Fuite", "Panne", "Erreur humaine"
    gravite = Column(String(20))  # Ex: "Mineur", "Majeur", "Critique"
    description = Column(Text)
    quantite_perdue = Column(Numeric(14, 2))
    unite= Column(String(20))  # Ex: "Litres", "Barils"
    cout_incident_usd = Column(Numeric(16, 2))
    duree_arret_heures = Column(Numeric(8, 2))
    operateur_responsable = Column(String(10))
    statut = Column(String(30))  # Ex: "En cours", "Résolu", "Non résolu"
    date_resolution = Column(Date)
    mesures_correctives = Column(Text)

    # Permet d'accéder facilement à l'objet Depot lié, ex: mon_stock.depot.depot_nom
    depot = relationship("Depot")
    produit = relationship("Produit")