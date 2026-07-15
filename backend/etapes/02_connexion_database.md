# Étape 2 — Connexion à la base de données (PostgreSQL + SQLAlchemy)

**Objectif de cette étape :** faire en sorte que l'API puisse parler à `petrostock_db`. À la fin de cette étape, on aura une connexion fonctionnelle, mais pas encore de vraies données manipulées (ça viendra à l'Étape 3).

---

## 1. Comprendre le rôle de SQLAlchemy

SQLAlchemy est un **ORM** (Object-Relational Mapper) : il permet de manipuler les tables PostgreSQL comme des objets Python, sans écrire de SQL à la main dans le code de l'API.

Exemple de ce que ça évite :
```python
# Sans ORM (à éviter dans l'API)
cursor.execute("SELECT * FROM stock WHERE depot_id = %s", (depot_id,))

# Avec ORM (ce qu'on va faire)
db.query(Stock).filter(Stock.depot_id == depot_id).all()
```
La deuxième forme est plus sûre (protège automatiquement contre les injections SQL) et plus facile à maintenir.

## 2. Créer le fichier `database.py`

À la racine de `backend/` :

```python
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
```

**Explication des éléments importants :**
- `load_dotenv()` : lit le fichier `.env` créé à l'Étape 0, pour récupérer `DATABASE_URL` sans l'écrire en clair dans le code.
- `engine` : représente la connexion à PostgreSQL (mais ne se connecte pas encore réellement — c'est juste la configuration).
- `SessionLocal` : chaque fois qu'un endpoint a besoin de parler à la base, il ouvre une "session" via cette fabrique.
- `get_db()` : ce sera injecté automatiquement dans chaque endpoint qui a besoin de la base (on verra comment concrètement à l'Étape 5). Le `yield` + `finally` garantit que la connexion est bien refermée après chaque requête, même en cas d'erreur.

## 3. Tester la connexion

Modifier temporairement `main.py` pour vérifier que la connexion fonctionne :

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

app = FastAPI(title="PetroStock SA API")

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}

@app.get("/test-db")
def test_connexion_db(db: Session = Depends(get_db)):
    resultat = db.execute(text("SELECT COUNT(*) FROM stock")).scalar()
    return {"nombre_lignes_stock": resultat}
```

**Explication de `Depends(get_db)` :**
C'est le mécanisme d'**injection de dépendances** de FastAPI — une des grandes forces du framework. En écrivant `db: Session = Depends(get_db)`, tu dis à FastAPI : "avant d'exécuter cette fonction, appelle `get_db()`, et donne-moi le résultat dans la variable `db`". FastAPI gère l'ouverture et la fermeture de la session automatiquement à chaque requête.

## 4. Vérifier

Relancer le serveur (`uvicorn main:app --reload`) et aller sur `http://127.0.0.1:8000/test-db`.

**Résultat attendu :** `{"nombre_lignes_stock": 321464}` (ou le nombre exact après import).

## 5. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `could not connect to server` | PostgreSQL n'est pas démarré, ou mauvais port dans `DATABASE_URL` |
| `password authentication failed` | Mot de passe incorrect dans le `.env` |
| `database "petrostock_db" does not exist` | La base n'a pas été créée, ou mauvais nom dans `DATABASE_URL` |
| `ModuleNotFoundError: No module named 'dotenv'` | L'environnement virtuel n'est pas activé, ou `python-dotenv` pas installé (retour Étape 0) |
| `relation "stock" does not exist` | Le script `01_create_tables.sql` n'a pas été exécuté, ou exécuté sur une autre base |

## 6. Vérification finale de cette étape

- [ ] Le fichier `database.py` est créé et ne produit pas d'erreur au démarrage
- [ ] `/test-db` renvoie bien le nombre de lignes attendu (321 464)
- [ ] Le fichier `.env` contient la bonne URL de connexion

Si tout est coché, tu es prêt pour l'Étape 3 (transformer les 9 tables en modèles SQLAlchemy).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
