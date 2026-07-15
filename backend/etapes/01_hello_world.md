# Étape 1 — Premier serveur FastAPI ("Hello World")

**Objectif de cette étape :** avoir un serveur qui tourne réellement et qu'on peut voir fonctionner dans le navigateur, avant d'ajouter la moindre complexité (base de données, IA, etc.). C'est la meilleure façon de vérifier que tout l'environnement de l'Étape 0 fonctionne correctement.

---

## 1. Créer le fichier `main.py`

À la racine de `backend/` :

```python
from fastapi import FastAPI

app = FastAPI(title="PetroStock SA API")

@app.get("/")
def accueil():
    return {"message": "API PetroStock SA opérationnelle"}
```

**Explication ligne par ligne :**
- `app = FastAPI(...)` : crée l'application. C'est l'objet central autour duquel tout le reste va s'organiser.
- `@app.get("/")` : c'est un **décorateur** — il dit à FastAPI "quand quelqu'un fait une requête GET sur l'URL `/`, exécute la fonction juste en dessous".
- `def accueil(): return {...}` : la fonction renvoie un dictionnaire Python, que FastAPI convertit **automatiquement** en JSON. Pas besoin de faire cette conversion à la main.

## 2. Lancer le serveur

Dans le terminal, toujours avec l'environnement virtuel activé (`(venv)` visible) :

```bash
uvicorn main:app --reload
```

**Explication de la commande :**
- `main:app` → dans le fichier `main.py`, utilise l'objet nommé `app`
- `--reload` → redémarre automatiquement le serveur à chaque fois que tu modifies et sauvegardes le code (très utile en développement, à retirer en production)

Tu dois voir un message du type :
```
Uvicorn running on http://127.0.0.1:8000
```

## 3. Vérifier que ça marche

**Option A — dans le navigateur, directement :**
Ouvrir `http://127.0.0.1:8000` → tu dois voir `{"message": "API PetroStock SA opérationnelle"}`

**Option B — la documentation automatique Swagger (la plus utile) :**
Ouvrir `http://127.0.0.1:8000/docs`

Tu verras une page interactive listant tous tes endpoints (pour l'instant juste `/`), avec un bouton "Try it out" pour tester directement depuis le navigateur, sans rien installer d'autre. **C'est cette page que tu utiliseras tout le long du projet pour tester chaque nouvel endpoint au fur et à mesure que tu l'écris.**

## 4. Ajouter un deuxième endpoint pour t'entraîner

Toujours dans `main.py`, ajoute :

```python
@app.get("/test/{nom}")
def test_parametre(nom: str):
    return {"message": f"Bonjour {nom}, l'API fonctionne bien"}
```

Relance (ou laisse `--reload` faire son travail automatiquement), puis va sur `/docs` : tu verras ce nouvel endpoint apparaître automatiquement. Teste-le avec un nom au choix dans l'URL, par exemple `http://127.0.0.1:8000/test/Segnedji`.

**Ce que ça montre :** `{nom}` dans l'URL devient un paramètre que FastAPI extrait automatiquement et passe à ta fonction — c'est exactement ce mécanisme qu'on va réutiliser plus tard pour des endpoints comme `/stocks/{depot_id}`.

## 5. Vérification finale de cette étape

- [ ] Le serveur démarre sans erreur avec `uvicorn main:app --reload`
- [ ] `http://127.0.0.1:8000/` répond bien avec le message JSON
- [ ] `http://127.0.0.1:8000/docs` affiche la page Swagger avec les 2 endpoints
- [ ] Le test avec un paramètre dans l'URL fonctionne

Si tout est coché, tu es prêt pour l'Étape 2 (connexion de l'API à la base PostgreSQL).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
