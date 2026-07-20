from fastapi import HTTPException


def ressource_non_trouvee(nom_ressource: str, identifiant: str):
    """Lève une exception HTTP 404 avec un message explicite."""
    raise HTTPException(
        status_code=404,
        detail=f"{nom_ressource} avec l'identifiant '{identifiant}' introuvable"
    )


def donnee_invalide(message: str):
    """Lève une exception HTTP 422 pour une donnée métier invalide."""
    raise HTTPException(
        status_code=422,
        detail=message
    )


def conflit(message: str):
    """Lève une exception HTTP 409 pour un conflit (ex. doublon)."""
    raise HTTPException(
        status_code=409,
        detail=message
    )