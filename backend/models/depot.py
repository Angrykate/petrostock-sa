from sqlalchemy import Column, String
from backend.database import Base

class Depot(Base):
    __tablename__ = "depot"

    depot_id = Column(String(10), primary_key=True)
    depot_nom = Column(String(100), nullable=False)
    region = Column(String(50))