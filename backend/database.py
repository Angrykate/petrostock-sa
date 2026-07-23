from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# Charge les variables du fichier .env (dont DATABASE_URL)
# Cherche d'abord dans backend/, puis à la racine
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()  # fallback: cherche à la racine

DATABASE_URL = os.getenv("DATABASE_URL")

# Si PostgreSQL n'est pas disponible, utiliser SQLite en fallback
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./petrostock.db"
    print("[Database] Aucune DATABASE_URL trouvée, utilisation de SQLite (petrostock.db)")

# Le moteur de connexion
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Une "usine" à sessions : chaque requête à l'API ouvrira sa propre session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe de base dont hériteront tous les modèles SQLAlchemy
Base = declarative_base()

# Fonction utilitaire : fournit une session de base de données à chaque
# requête, puis la ferme proprement une fois la requête terminée
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()