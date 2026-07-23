from sqlalchemy import Column, String
from backend.database import Base

class Fournisseur(Base):
    __tablename__ = "fournisseur"

    fournisseur_id = Column(String(10), primary_key=True)
    fournisseur_nom = Column(String(100), nullable=False)
    fournisseur_region = Column(String(50))