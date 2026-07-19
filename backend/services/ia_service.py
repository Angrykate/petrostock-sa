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
