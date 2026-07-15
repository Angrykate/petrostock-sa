# Étape 7 — Intégration des modèles IA (`services/ia_service.py`)

**Objectif de cette étape :** charger les fichiers `.pkl` livrés par SIDIBE et SEMAGNON, et les brancher dans l'API pour que les endpoints de prévision, ruptures, anomalies et classification d'incidents renvoient de vraies prédictions.

**Prérequis :** les fichiers `.pkl` doivent être disponibles dans `models/` (le dossier de fichiers entraînés, pas à confondre avec `backend/models/` qui contient les classes SQLAlchemy). Il faut aussi connaître, pour chaque modèle, **le format exact attendu en entrée** — c'est justement ce que SIDIBE et SEMAGNON doivent documenter en livrant leurs `.pkl` (cf. cahier des tâches technique, section "Sauvegarde" de chaque notebook de modélisation).

---

## 1. Où placer les fichiers `.pkl`

D'après l'arborescence du dépôt, ils vivent dans `models/` à la racine du projet (pas dans `backend/`). Le backend doit donc y accéder avec un chemin relatif remontant d'un niveau, ou via une variable d'environnement pour rester flexible :

```
DATABASE_URL=postgresql://...
MODELS_DIR=../models
```

## 2. Créer `services/ia_service.py`

```python
import joblib
import os
from dotenv import load_dotenv

load_dotenv()
MODELS_DIR = os.getenv("MODELS_DIR", "../models")


class IAService:
    """Charge tous les modèles IA une seule fois au démarrage de l'API,
    pour éviter de relire les fichiers .pkl à chaque requête (lent)."""

    def __init__(self):
        self.modele_prevision = joblib.load(f"{MODELS_DIR}/model_prevision_demande.pkl")
        self.modele_ruptures = joblib.load(f"{MODELS_DIR}/model_ruptures.pkl")
        self.modele_anomalies = joblib.load(f"{MODELS_DIR}/model_anomalies.pkl")
        self.scaler_anomalies = joblib.load(f"{MODELS_DIR}/scaler_anomalies.pkl")
        self.modele_incidents = joblib.load(f"{MODELS_DIR}/model_incidents.pkl")
        self.encoders_incidents = joblib.load(f"{MODELS_DIR}/encoders_incidents.pkl")

    def predire_demande(self, depot_id: str, produit_id: str, horizon_jours: int = 30):
        # IMPORTANT : la forme exacte de l'entrée dépend de la façon dont
        # SIDIBE a entraîné le modèle (Prophet ou ARIMA). À adapter une fois
        # sa documentation reçue. Exemple générique ci-dessous :
        donnees_entree = self._preparer_donnees_prevision(depot_id, produit_id)
        prediction = self.modele_prevision.predict(donnees_entree)
        return prediction

    def detecter_anomalie(self, observation: dict):
        # Le scaler DOIT être appliqué avec les mêmes colonnes, dans le même
        # ordre, que lors de l'entraînement (cf. notebook 07 de SEMAGNON)
        donnees_normalisees = self.scaler_anomalies.transform([list(observation.values())])
        score = self.modele_anomalies.decision_function(donnees_normalisees)
        prediction = self.modele_anomalies.predict(donnees_normalisees)
        return {"anomalie": bool(prediction[0] == -1), "score": float(score[0])}

    def classifier_incident(self, incident: dict):
        # Les colonnes catégorielles doivent être encodées avec les MÊMES
        # encoders que ceux utilisés à l'entraînement (cf. notebook 08 de SEMAGNON)
        donnees_encodees = self._encoder_incident(incident)
        gravite = self.modele_incidents.predict([donnees_encodees])
        return gravite[0]

    def estimer_jours_rupture(self, depot_id: str, produit_id: str):
        donnees_entree = self._preparer_donnees_rupture(depot_id, produit_id)
        prediction = self.modele_ruptures.predict(donnees_entree)
        return float(prediction[0])

    # Fonctions internes de préparation, à écrire précisément une fois
    # les notebooks de SIDIBE/SEMAGNON finalisés (section "Sauvegarde")
    def _preparer_donnees_prevision(self, depot_id, produit_id):
        pass  # à compléter

    def _preparer_donnees_rupture(self, depot_id, produit_id):
        pass  # à compléter

    def _encoder_incident(self, incident):
        pass  # à compléter


# Une seule instance, créée au démarrage de l'API, réutilisée par tous les endpoints
ia_service = IAService()
```

**Pourquoi une classe avec une seule instance globale (`ia_service`), plutôt que recharger le modèle à chaque requête ?**
Charger un fichier `.pkl` prend du temps (surtout pour de gros modèles). Le faire à chaque requête ralentirait énormément l'API. En le chargeant une seule fois au démarrage et en gardant l'objet en mémoire, chaque requête ne fait que **l'appeler**, ce qui est quasi instantané.

## 3. Le point le plus important de cette étape : le format des données

**Le point d'échec le plus fréquent ici n'est pas le code, c'est le décalage entre la façon dont le modèle a été entraîné et la façon dont on lui envoie des données à prédire.** Exemples concrets de pièges :

- Si le modèle d'anomalies a été entraîné sur 5 colonnes dans un ordre précis, il faut envoyer exactement ces 5 colonnes, dans le même ordre, sinon les prédictions seront silencieusement fausses (pas d'erreur, juste un résultat incorrect).
- Si `type_incident` a été encodé avec un `LabelEncoder` à l'entraînement, il faut réutiliser le **même** encodeur sauvegardé (`encoders_incidents.pkl`) pour transformer une nouvelle valeur — pas en recréer un nouveau.
- Le scaler de normalisation (`scaler_anomalies.pkl`) doit lui aussi être le même que celui utilisé à l'entraînement.

**Action concrète à demander à SIDIBE et SEMAGNON en livrant leurs `.pkl` :** un court paragraphe (ou même juste un exemple de code) précisant, pour chaque modèle : les colonnes exactes attendues en entrée, dans quel ordre, et si un encodeur/scaler doit être appliqué avant. C'est exactement ce que le cahier des tâches technique demande déjà dans la partie "Sauvegarde" de chaque notebook — donc cette information devrait déjà exister, juste à transmettre à SEGNEDJI.

## 4. Brancher dans les routers existants

Exemple pour `routers/previsions.py` (nouveau router, ou à ajouter dans `stocks.py` selon préférence) :

```python
from fastapi import APIRouter
from services.ia_service import ia_service

router = APIRouter(prefix="/previsions", tags=["Prévisions"])


@router.get("/{produit_id}")
def prevision_demande(produit_id: str, depot_id: str, horizon_jours: int = 30):
    prediction = ia_service.predire_demande(depot_id, produit_id, horizon_jours)
    return {"depot_id": depot_id, "produit_id": produit_id, "prevision": prediction.tolist()}
```

Exemple pour compléter `routers/incidents.py` (Étape 6) avec la classification automatique :

```python
@router.post("/", response_model=IncidentOut, status_code=201)
def declarer_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    gravite_predite = ia_service.classifier_incident(incident.dict())

    nouvel_incident = Incident(
        incident_id=f"INC{uuid.uuid4().hex[:8].upper()}",
        date_incident=incident.date_incident,
        depot_id=incident.depot_id,
        type_incident=incident.type_incident,
        description=incident.description,
        gravite=gravite_predite,   # <-- rempli automatiquement maintenant
        statut="Ouvert"
    )
    db.add(nouvel_incident)
    db.commit()
    db.refresh(nouvel_incident)
    return nouvel_incident
```

C'est concrètement ce que le support de réunion décrivait comme "l'action Déclarer un incident inclut Classification automatique de la gravité" — cette fonction fait exactement ça.

## 5. En cas d'erreur — pistes de diagnostic courantes

| Erreur rencontrée | Cause probable |
|---|---|
| `FileNotFoundError` au démarrage de l'API | Le chemin `MODELS_DIR` est incorrect, ou le `.pkl` n'a pas encore été livré |
| `ValueError: X has N features, but model expects M` | Les colonnes envoyées ne correspondent pas exactement à celles utilisées à l'entraînement (voir section 3) |
| Prédictions qui semblent "n'importe quoi" | Souvent un problème d'ordre des colonnes ou d'encodage non appliqué, pas un bug de code — revérifier le format exact avec SIDIBE/SEMAGNON |
| API très lente à démarrer | Normal si les modèles sont volumineux — c'est fait une seule fois au démarrage, pas à chaque requête |

## 6. Vérification finale de cette étape

- [ ] Les 6 fichiers `.pkl`/encodeurs sont chargés sans erreur au démarrage de l'API
- [ ] Le format d'entrée de chaque modèle est documenté et confirmé avec SIDIBE/SEMAGNON
- [ ] `/previsions/{produit_id}` renvoie une vraie prédiction
- [ ] `POST /incidents/` remplit maintenant `gravite` automatiquement

Si tout est coché, tu es prêt pour l'Étape 8 (règles métier).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
