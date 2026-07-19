from fastapi import HTTPException


def ressource_non_trouvee(nom_ressource: str, identifiant: str):
    raise HTTPException(
        status_code=404,
        detail=f"{nom_ressource} avec l'identifiant '{identifiant}' introuvable"
    )