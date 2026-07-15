# Étape 9 — Gestion des erreurs et configuration finale

**Objectif de cette étape :** finaliser l'API pour qu'elle réponde proprement même en cas de mauvaise requête, et clarifier les derniers points de décision du cahier des tâches (CORS, authentification, structure des erreurs).

---

## 1. Gestion des erreurs cohérente sur toute l'API

FastAPI gère déjà bien les erreurs de validation automatiquement (grâce aux schémas Pydantic de l'Étape 4). Ce qui reste à standardiser, ce sont les erreurs "métier" (ressource non trouvée, donnée invalide).

**Créer un format d'erreur cohérent**, réutilisé partout :

```python
from fastapi import HTTPException

def ressource_non_trouvee(nom_ressource: str, identifiant: str):
    raise HTTPException(
        status_code=404,
        detail=f"{nom_ressource} avec l'identifiant '{identifiant}' introuvable"
    )
```

Utilisation dans un router (reprend l'exemple de l'Étape 5, mais centralisé) :
```python
from utils.erreurs import ressource_non_trouvee

if not resultats:
    ressource_non_trouvee("Dépôt", depot_id)
```

## 2. Gérer les erreurs non prévues (dernier filet de sécurité)

Ajouter un gestionnaire global dans `main.py`, pour qu'une erreur inattendue ne fasse jamais planter l'API sans réponse propre au client :

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def gestionnaire_erreur_globale(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Une erreur interne est survenue. Veuillez réessayer."}
    )
```

**Attention :** ce gestionnaire ne doit **pas** remplacer les `HTTPException` volontaires (404, 422, etc.) — il n'attrape que les erreurs vraiment inattendues (bug, division par zéro, etc.). FastAPI gère cette distinction automatiquement.

## 3. CORS — nécessaire pour que le frontend puisse appeler l'API

Sans cette configuration, le frontend Next.js (qui tournera sur un port différent, ex. `localhost:3000`) sera **bloqué par le navigateur** quand il essaiera d'appeler l'API (`localhost:8000`) — c'est une protection de sécurité standard des navigateurs, pas un bug.

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # l'adresse du frontend en développement
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

À ajuster (`allow_origins`) si le frontend tourne sur une autre adresse une fois déployé.

## 4. Point de décision — authentification

Le cahier des tâches demande de déterminer quels endpoints nécessitent une authentification. Vu le délai de 10 jours et l'absence de soutenance, une option raisonnable : **ne pas implémenter d'authentification complète**, mais le documenter explicitement comme un choix assumé dans le rapport (ex. "hors périmètre pour cette version, tous les endpoints sont publics ; une authentification par token serait la prochaine étape naturelle avant un déploiement réel"). C'est un compromis défendable à condition d'être écrit noir sur blanc, pas laissé de côté silencieusement.

## 5. Variables d'environnement — vérification finale

Le fichier `.env` doit maintenant contenir tout ce dont l'API a besoin :

```
DATABASE_URL=postgresql://postgres:motdepasse@localhost:5432/petrostock_db
MODELS_DIR=../models
```

Et un fichier `.env.example` (celui-ci **peut** être commité sur GitHub, contrairement à `.env`) pour que n'importe qui sache quelles variables définir :

```
DATABASE_URL=postgresql://user:password@localhost:5432/petrostock_db
MODELS_DIR=../models
```

## 6. Vérification que `.gitignore` est complet côté backend

Vérifier que le `.gitignore` du dépôt contient bien :
```
backend/venv/
backend/.env
backend/__pycache__/
**/__pycache__/
*.pyc
```

## 7. Test final de bout en bout

Avant de considérer le backend terminé, faire un test manuel complet sur `/docs` :
1. `GET /stocks/` → renvoie des données
2. `GET /stocks/alertes/` → renvoie uniquement les stocks en alerte
3. `POST /commandes/` → crée une commande, puis `GET /commandes/` confirme qu'elle apparaît
4. `POST /incidents/` → crée un incident, `gravite` est bien remplie automatiquement
5. `GET /previsions/{produit_id}` → renvoie une vraie prédiction
6. `GET /kpi/` → renvoie des chiffres cohérents

Si les 6 fonctionnent sans erreur, l'API backend est complète.

## 8. Vérification finale de cette étape (et du backend dans son ensemble)

- [ ] Un format d'erreur cohérent est utilisé sur tous les endpoints
- [ ] Le gestionnaire d'erreur global est en place
- [ ] CORS est configuré pour permettre au frontend de communiquer avec l'API
- [ ] Le choix concernant l'authentification est documenté (même si la réponse est "pas implémentée")
- [ ] `.env.example` est créé et commité, `.env` est bien ignoré par Git
- [ ] Le test de bout en bout (section 7) passe entièrement

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
