# Étape 0 — Mise en place de l'environnement

**Objectif de cette étape :** avoir tous les outils installés et prêts, avant d'écrire la moindre ligne de code de l'API.

---

## 1. Ce dont tu as besoin

- **Python** (déjà installé normalement, vérifier avec `python --version` — il faut au moins Python 3.9)
- **pip** (le gestionnaire de paquets Python, installé avec Python)
- Un accès à la base **PostgreSQL** `petrostock_db` déjà créée et peuplée (scripts `sql/`)

## 2. Créer un environnement virtuel (recommandé)

Un environnement virtuel isole les librairies de ce projet du reste de ta machine — évite les conflits de versions avec d'autres projets Python.

```bash
# Se placer dans le dossier backend/
cd backend

# Créer l'environnement virtuel
python -m venv venv

# L'activer
# Sur Mac/Linux :
source venv/bin/activate
# Sur Windows :
venv\Scripts\activate
```

Une fois activé, tu dois voir `(venv)` apparaître au début de ta ligne de commande. **Il faut réactiver cet environnement à chaque fois que tu ouvres un nouveau terminal pour travailler sur le projet.**

## 3. Installer les librairies nécessaires

```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic
```

**Ce que fait chaque librairie :**

| Librairie | Rôle |
|---|---|
| `fastapi` | Le framework pour créer l'API |
| `uvicorn` | Le serveur qui fait tourner l'API (fastapi ne se lance pas tout seul) |
| `sqlalchemy` | L'ORM — permet de manipuler la base PostgreSQL avec du code Python plutôt que d'écrire du SQL à la main partout |
| `psycopg2-binary` | Le driver qui permet à Python de parler à PostgreSQL |
| `python-dotenv` | Permet de charger des variables de configuration depuis un fichier `.env` (mot de passe base de données, etc.) sans les écrire en clair dans le code |
| `pydantic` | Utilisé par FastAPI pour valider automatiquement les données envoyées/reçues (déjà installé avec fastapi normalement, listé pour info) |

## 4. Créer le fichier `requirements.txt`

Ce fichier liste toutes les librairies utilisées, pour que n'importe qui (ou toi sur une autre machine) puisse réinstaller exactement les mêmes en une commande.

```bash
pip freeze > requirements.txt
```

Cela crée automatiquement le fichier `backend/requirements.txt` avec toutes les librairies et leurs versions exactes.

**Pour vérifier que ça marche**, sur une autre machine (ou pour un collègue) :
```bash
pip install -r requirements.txt
```

## 5. Créer le fichier `.env` (configuration de la base)

À la racine de `backend/`, créer un fichier nommé `.env` (attention, sans rien avant le point) :

```
DATABASE_URL=postgresql://postgres:ton_mot_de_passe@localhost:5432/petrostock_db
```

Remplace `ton_mot_de_passe` par le vrai mot de passe PostgreSQL utilisé. Ce fichier **ne doit jamais être partagé sur GitHub** (il contient le mot de passe) — vérifie qu'il est bien listé dans le `.gitignore` du dépôt.

## 6. Vérification finale de cette étape

À ce stade, tu dois avoir :
- [ ] Un environnement virtuel `venv/` créé et activé dans `backend/`
- [ ] Les librairies installées (`pip list` doit afficher fastapi, uvicorn, sqlalchemy, psycopg2-binary)
- [ ] Un fichier `requirements.txt` généré
- [ ] Un fichier `.env` créé avec les infos de connexion à la base

Si les 4 cases sont cochées, tu es prêt pour l'Étape 1.

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
