# Étape 0 — Mise en place de l'environnement

**Objectif de cette étape :** avoir tous les outils installés et prêts, avant d'écrire la moindre ligne de code de l'API.

---

## 1. Créer ta branche de travail sur le dépôt Git

Avant toute chose, crée ta propre branche pour travailler sans risquer de modifier directement le code des autres :

```bash
git checkout -b segnedji-backend
```

Tu peux ensuite committer et pousser sur cette branche normalement :
```bash
git push -u origin segnedji-backend
```

**C'est quoi une Pull Request (PR) ?**
C'est une demande officielle, sur GitHub, de fusionner ta branche (`segnedji-backend`) dans `main`. Concrètement : tu vas sur la page du dépôt, GitHub propose automatiquement "Compare & pull request" dès qu'il détecte une branche poussée récemment ; tu cliques dessus, tu décris rapidement ce que contient ta branche, puis tu cliques "Create pull request". Ça ne fusionne rien tout de suite — ça ouvre juste une page où le code peut être relu (par toi-même ou un coéquipier) avant de cliquer "Merge" pour l'intégrer réellement dans `main`. L'intérêt : ça évite qu'un commit encore instable ou buggé atterrisse directement dans la version commune du projet.

**À quel rythme en ouvrir une ?**
Pas après chaque étape individuelle (0, 1, 2...) — ce serait trop de PR pour du code qui n'est pas encore utilisable seul. La bonne pratique ici : ouvrir une PR à chaque **fois que le backend atteint un état stable et testable**, c'est-à-dire à la fin des étapes qui se terminent par une vraie checklist validée dans les guides suivants. Concrètement, pour ce projet :
- après l'Étape 1 (le serveur "Hello World" tourne)
- après l'Étape 3 (les modèles SQLAlchemy sont en place)
- après l'Étape 6 (tous les routers CRUD fonctionnent)
- après l'Étape 7 (l'IA est intégrée)
- après l'Étape 10 (finalisation complète)

Entre ces points, continue de committer et pousser sur ta branche autant de fois que tu veux (c'est gratuit et recommandé, ça sauvegarde ton travail) — c'est seulement le moment de la **fusion vers `main`** qui doit correspondre à un vrai palier stable, pas à chaque petit changement.

## 2. Ce dont tu as besoin

- **Python** (déjà installé normalement, vérifier avec `python --version` — il faut au moins Python 3.9)
- **pip** (le gestionnaire de paquets Python, installé avec Python)
- Un accès à la base **PostgreSQL** `petrostock_db` déjà créée et peuplée (scripts `sql/`)

## 3. Créer un environnement virtuel (recommandé)

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

## 4. Installer les librairies nécessaires

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

## 5. Créer le fichier `requirements.txt`

Ce fichier liste toutes les librairies utilisées, pour que n'importe qui (ou toi sur une autre machine) puisse réinstaller exactement les mêmes en une commande.

```bash
pip freeze > requirements.txt
```

Cela crée automatiquement le fichier `backend/requirements.txt` avec toutes les librairies et leurs versions exactes.

**Pour vérifier que ça marche**, sur une autre machine (ou pour un collègue) :
```bash
pip install -r requirements.txt
```

## 6. Créer le fichier `.env` (configuration de la base)

À la racine de `backend/`, créer un fichier nommé `.env` (attention, sans rien avant le point) :

```
DATABASE_URL=postgresql://postgres:ton_mot_de_passe@localhost:5432/petrostock_db
```

Remplace `ton_mot_de_passe` par le vrai mot de passe PostgreSQL utilisé. Ce fichier **ne doit jamais être partagé sur GitHub** (il contient le mot de passe) — vérifie qu'il est bien listé dans le `.gitignore` du dépôt.

## 7. Vérification finale de cette étape

À ce stade, tu dois avoir :
- [ ] Ta branche Git créée et poussée sur le dépôt
- [ ] Un environnement virtuel `venv/` créé et activé dans `backend/`
- [ ] Les librairies installées (`pip list` doit afficher fastapi, uvicorn, sqlalchemy, psycopg2-binary)
- [ ] Un fichier `requirements.txt` généré
- [ ] Un fichier `.env` créé avec les infos de connexion à la base

Si les 5 cases sont cochées, tu es prêt pour l'Étape 1.

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
