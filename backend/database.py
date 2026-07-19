from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Charge les variables du fichier .env (dont DATABASE_URL)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Le moteur de connexion à PostgreSQL
engine = create_engine(DATABASE_URL)

# Une "usine" à sessions : chaque requête à l'API ouvrira sa propre session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base dont hériteront tous les modèles SQLAlchemy (Étape 3)
Base = declarative_base()

# Fonction utilitaire : fournit une session de base de données à chaque
# requête, puis la ferme proprement une fois la requête terminée
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()