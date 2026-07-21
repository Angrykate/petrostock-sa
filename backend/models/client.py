from sqlalchemy import Column, String
from backend.database import Base

class Client(Base):
    __tablename__ = "client"

    client_id = Column(String(10), primary_key=True)
    client_nom = Column(String(150), nullable=False)
    type_client = Column(String(50))
    region_client = Column(String(50))