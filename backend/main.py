from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

from models import Stock 


app = FastAPI(title="PetroStock SA API")

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}

@app.get("/test-orm")
def test_orm(db: Session = Depends(get_db)):
    premier_stock = db.query(Stock).first()
    return {
        "depot_id": premier_stock.depot_id,
        "produit_id": premier_stock.produit_id,
        "sorties": float(premier_stock.sorties)
    }

