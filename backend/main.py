from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

from models import Stock 

from routers import stocks, commande, incident, factures, kpi

from fastapi import Request
from fastapi.responses import JSONResponse

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="PetroStock SA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # l'adresse du frontend en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router)
app.include_router(commande.router) 
app.include_router(incident.router)
app.include_router(factures.router)
app.include_router(kpi.router)
app.include_router(anomalies.router)
app.include_router(ruptures.router)

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

@app.exception_handler(Exception)
async def gestionnaire_erreur_globale(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne est survenue. Veuillez réessayer."}
    )


