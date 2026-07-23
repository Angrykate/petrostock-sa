from pydantic import BaseModel


class KpiOut(BaseModel):
    valeur_totale_stock_usd: float
    nombre_alertes_actives: int
    taux_remplissage_moyen_pct: float
    incidents_ouverts: int

    class Config:
        from_attributes = True