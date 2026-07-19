from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

from models import Stock 

from routers import stocks, commande, incident, factures, kpi

app = FastAPI(title="PetroStock SA API")

app.include_router(stocks.router)
app.include_router(commande.router) 
app.include_router(incident.router)
app.include_router(factures.router)
app.include_router(kpi.router)

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


