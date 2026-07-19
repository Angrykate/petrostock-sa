from sqlalchemy import Column, String
from database import Base

class Produit(Base):
    __tablename__ = "produit"

    produit_id = Column(String(10), primary_key=True)
    produit_nom = Column(String(100), nullable=False)
    unite = Column(String(20))
    categorie = Column(String(50))