# PetroStock SA — Système Intelligent de Gestion des Stocks

> Projet de stage — École Polytechnique de Lomé · Année Universitaire 2025–2026

Conception et développement d'un système intelligent de gestion et d'analyse
des stocks pour une entreprise pétrolière fictive localisée au Togo, intégrant
des modèles d'intelligence artificielle, une API REST et un tableau de bord interactif.

---

## Équipe

| Nom | Parcours | Rôle |
|---|---|---|
| SIDIBE Illane | LF-IABD | IA & Analyse des données |
| SEMAGNON Akpène Bertille | LF-IABD | IA & Analyse des données |
| SEGNEDJI Komivi Emmanuel | LF-IS | Base de données & API Backend |
| BODJOLLE Gwénaëlle Médédé | LF-LT | Logistique, UML & Documentation |

**Directeur :** Dr ATTIPOU K., École Polytechnique de Lomé

---

## Architecture du Système

```
PostgreSQL (BDD) ←→ FastAPI (API REST) ←→ Next.js (Dashboard)
                         ↑
                   Modèles IA (.pkl)
```

## Stack Technique

| Composant | Technologie |
|---|---|
| Base de données | PostgreSQL |
| API Backend | FastAPI (Python) |
| Frontend | Next.js + TailwindCSS |
| Modèles IA | Scikit-learn, Prophet, XGBoost |
| Analyse de données | Pandas, NumPy, Matplotlib, Seaborn |

---

## Structure du Projet

```
petrostack-sa/
├── notebooks/        ← Notebooks Jupyter (EDA + modèles IA)
├── models/           ← Modèles entraînés (.pkl) — non versionnés
├── sql/              ← Scripts de création et peuplement de la base
├── backend/          ← API FastAPI
├── frontend/         ← Interface web Next.js
├── figures/          ← Graphiques générés par les notebooks
├── data/             ← Données CSV — non versionnées (voir data/README.md)
└── docs/             ← Documentation et rapport final
```

---

## Installation et Lancement

> ⚠️ Documentation complète à venir en fin de projet.

### Prérequis

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+

### Environnement Python pour les notebooks

Créer la `.venv` à la racine du projet puis installer les dépendances des notebooks:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Les notebooks utilisent principalement `pandas`, `numpy`, `matplotlib`, `seaborn`, `statsmodels`, `prophet`, `scikit-learn`, `xgboost`, `ipykernel` et `jupyter`.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Notebooks

| # | Notebook | Auteur | Description |
|---|---|---|---|
| 01 | `eda_stocks_journaliers` | SIDIBE | EDA — table stocks journaliers |
| 02 | `eda_incidents_pannes` | SIDIBE | EDA — table incidents & pannes |
| 03 | `modele_prevision_demande` | SIDIBE | Prophet vs ARIMA |
| 04 | `modele_ruptures_stock` | SIDIBE | XGBoost vs Random Forest |
| 05 | `eda_mouvements` | SEMAGNON | EDA — table mouvements |
| 06 | `eda_ventes_commandes` | SEMAGNON | EDA — factures & bons de commande |
| 07 | `modele_detection_anomalies` | SEMAGNON | Isolation Forest vs Z-score |
| 08 | `modele_classification_incidents` | SEMAGNON | Random Forest vs SVM |

---

## Données

Les fichiers CSV ne sont pas versionnés. Voir [`data/README.md`](data/README.md).

---

*Ce README sera complété à la fin du projet avec les résultats des modèles,
les métriques de performance et les captures d'écran du dashboard.*
