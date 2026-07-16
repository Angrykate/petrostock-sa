from fastapi import FastAPI

app = FastAPI(title="PetroStock SA API")

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}

@app.get("/test/{nom}")
def test_parametre(nom: str):
    return {"message": f"Bonjour {nom}, l'API fonctionne bien"}