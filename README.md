# ⛽ PetroStock SA

**Système Intelligent de Gestion des Stocks Pétroliers** — Plateforme de pilotage opérationnel pour la gestion des dépôts de produits pétroliers au Togo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)
![Python](https://img.shields.io/badge/Python-3.12-3776AB)

---

## 📋 À propos

PetroStock SA est une application web complète développée dans le cadre de l'EPL 2025-2026. Elle permet de **visualiser, analyser et gérer** les stocks de produits pétroliers répartis sur 8 dépôts au Togo.

Le projet combine :
- Un **backend REST** (FastAPI) connecté à une base de données PostgreSQL/SQLite
- Un **frontend moderne** (React/Vite) avec dashboard, graphiques et alertes en temps réel
- Des **modèles d'intelligence artificielle** pour les prévisions de demande, la détection d'anomalies et la classification d'incidents

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend React/Vite                │
│              http://localhost:8443                   │
│  Dashboard │ Stocks │ Commandes │ Incidents │ IA ... │
└───────────────────────┬─────────────────────────────┘
                        │ API REST (JSON)
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Backend FastAPI                     │
│              http://localhost:8000                   │
│  8 routers · 15 endpoints · Swagger : /docs         │
└───────────────────────┬─────────────────────────────┘
                        │ SQLAlchemy ORM
                        ▼
┌─────────────────────────────────────────────────────┐
│              Base de données (SQLite/PostgreSQL)      │
│  8 dépôts · 9 produits · 960 enregistrements stocks  │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

| Page | Description |
|------|-------------|
| **Dashboard** | KPIs, graphiques d'évolution, alertes stock, commandes récentes, incidents — vue adaptée au rôle |
| **Stocks** | Suivi détaillé par dépôt et produit, barres de remplissage, alertes critiques |
| **Commandes** | Création et suivi des bons de commande (brouillon → livrée), suggestion fournisseurs |
| **Incidents** | Déclaration et suivi, classification automatique par gravité, escalade |
| **Prévisions IA** | Prévisions 30 jours (Prophet/ARIMA/XGBoost), détection ruptures imminentes |
| **Ventes & Finance** | Chiffre d'affaires, analyse par type de client, suivi des paiements |
| **Fournisseurs** | Catalogue, scores de fiabilité, recommandations |
| **Administration** | Gestion des utilisateurs (4 rôles), journal d'audit, configuration |

---

## 🚀 Démarrage rapide

### Prérequis

- Python 3.12+
- Node.js 20+
- npm 10+

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Angrykate/petrostock-sa.git
cd petrostock-sa

# 2. Backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac
pip install -r backend/requirements.txt
cd backend
python init_db.py               # Crée la base SQLite avec données de test
cd ..

# 3. Frontend
cd frontend
npm install
cd ..
```

### Lancement

**Terminal 1 — Backend :**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

Accédez à **http://localhost:8443** pour le dashboard.

### Identifiants de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Responsable Dépôt | `k.asante@petrostock.tg` | `depot2024` |
| Responsable Achat | `y.dossou@petrostock.tg` | `achat2024` |
| Direction | `s.koffi@petrostock.tg` | `dir2024` |
| Administrateur | `admin@petrostock.tg` | `admin2024` |

---

## 📡 API

Documentation interactive disponible sur **http://localhost:8000/docs** (Swagger UI).

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/` | Accueil API |
| `GET` | `/stocks/` | Liste des stocks (filtres : `depot_id`, `produit_id`) |
| `GET` | `/stocks/alertes/` | Stocks en dessous du seuil d'alerte |
| `GET` | `/commandes/` | Liste des commandes |
| `POST` | `/commandes/` | Créer une commande |
| `GET` | `/incidents/` | Liste des incidents |
| `POST` | `/incidents/` | Déclarer un incident |
| `GET` | `/factures/` | Liste des factures |
| `GET` | `/kpi/` | Indicateurs clés (valeur stock, alertes, remplissage, incidents) |
| `GET` | `/anomalies/` | Anomalies détectées en base |
| `POST` | `/anomalies/detecter` | Détection d'anomalie en temps réel |
| `GET` | `/ruptures/{depot_id}` | Estimation jours avant rupture |
| `GET` | `/previsions/{produit_id}` | Prévisions de demande 30 jours |

---

## 👥 Équipe

- **BODJOLLE**
- **SEGNEDJI**
- **SIDIBE**
- **SEMAGNON**

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE).

---

*EPL 2025-2026 — Lomé, Togo*