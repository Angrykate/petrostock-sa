import joblib
import os
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
MODELS_DIR = os.getenv("MODELS_DIR", "../models")


class IAService:
    """Charge tous les modèles IA une seule fois au démarrage de l'API,
    pour éviter de relire les fichiers .pkl à chaque requête (lent)."""

    def __init__(self):
        self.modele_prevision = None
        self.modele_ruptures = None
        self.modele_anomalies = None
        self.scaler_anomalies = None
        self.modele_incidents = None
        self.encoders_incidents = None
        self._initialiser_modeles()

    def _initialiser_modeles(self):
        """Charge les modèles depuis les fichiers .pkl.
        Si un fichier est manquant, le modèle concerné reste None
        et retournera un message indiquant qu'il n'est pas disponible."""
        modeles = {
            "modele_prevision": ("model_prevision_demande.pkl", "modele_prevision"),
            "modele_ruptures": ("model_ruptures.pkl", "modele_ruptures"),
            "modele_anomalies": ("model_anomalies.pkl", "modele_anomalies"),
            "scaler_anomalies": ("scaler_anomalies.pkl", "scaler_anomalies"),
            "modele_incidents": ("model_incidents.pkl", "modele_incidents"),
            "encoders_incidents": ("encoders_incidents.pkl", "encoders_incidents"),
        }

        for attr, (filename, _) in modeles.items():
            chemin = os.path.join(MODELS_DIR, filename)
            if os.path.exists(chemin):
                try:
                    setattr(self, attr, joblib.load(chemin))
                except Exception as e:
                    print(f"[IA Service] Erreur chargement {filename}: {e}")
            else:
                print(f"[IA Service] Fichier {filename} non trouvé dans {MODELS_DIR}")

    def _modele_est_disponible(self, modele, nom: str) -> bool:
        """Vérifie si un modèle est chargé, sinon lève une exception claire."""
        if modele is None:
            raise HTTPException(
                status_code=503,
                detail=f"Modèle IA '{nom}' non disponible. Vérifier que le fichier .pkl est présent dans {MODELS_DIR}"
            )
        return True

    def predire_demande(self, depot_id: str, produit_id: str, horizon_jours: int = 30):
        """Prévision de demande pour un produit dans un dépôt."""
        self._modele_est_disponible(self.modele_prevision, "prevision_demande")
        # À adapter selon le format exact attendu par le modèle de SIDIBE
        donnees_entree = self._preparer_donnees_prevision(depot_id, produit_id, horizon_jours)
        prediction = self.modele_prevision.predict(donnees_entree)
        return prediction

    def detecter_anomalie(self, observation: dict) -> dict:
        """Détecte si une observation est une anomalie via Isolation Forest."""
        self._modele_est_disponible(self.modele_anomalies, "anomalies")
        import numpy as np
        # Préparer les données dans le bon ordre de colonnes
        colonnes_attendues = [
            "stock_fin_jour", "entrees", "sorties", "taux_remplissage_pct"
        ]
        valeurs = [observation.get(col, 0) for col in colonnes_attendues]

        # Appliquer le scaler si disponible
        if self.scaler_anomalies is not None:
            donnees_normalisees = self.scaler_anomalies.transform([valeurs])
        else:
            donnees_normalisees = np.array([valeurs])

        score = self.modele_anomalies.decision_function(donnees_normalisees)
        prediction = self.modele_anomalies.predict(donnees_normalisees)
        return {
            "anomalie": bool(prediction[0] == -1),
            "score": float(score[0])
        }

    def classifier_incident(self, incident: dict) -> str:
        """Classifie la gravité d'un incident."""
        self._modele_est_disponible(self.modele_incidents, "incidents")
        self._modele_est_disponible(self.encoders_incidents, "encoders_incidents")
        donnees_encodees = self._encoder_incident(incident)
        gravite = self.modele_incidents.predict([donnees_encodees])
        return gravite[0]

    def estimer_jours_rupture(self, depot_id: str, produit_id: str) -> float:
        """Estime le nombre de jours avant rupture de stock."""
        self._modele_est_disponible(self.modele_ruptures, "ruptures")
        donnees_entree = self._preparer_donnees_rupture(depot_id, produit_id)
        prediction = self.modele_ruptures.predict(donnees_entree)
        return float(prediction[0])

    # ----- Fonctions internes de préparation -----
    # Ces méthodes sont à compléter quand les notebooks de SIDIBE/SEMAGNON
    # seront finalisés, pour correspondre exactement au format d'entrée
    # attendu par chaque modèle.

    def _preparer_donnees_prevision(self, depot_id: str, produit_id: str, horizon_jours: int = 30):
        """À compléter selon le format d'entrée du modèle de prévision (Prophet/ARIMA)."""
        from datetime import datetime, timedelta
        import pandas as pd
        dates = pd.date_range(start=datetime.now(), periods=horizon_jours, freq='D')
        return pd.DataFrame({
            'ds': dates,
            'depot_id': depot_id,
            'produit_id': produit_id
        })

    def _preparer_donnees_rupture(self, depot_id: str, produit_id: str):
        """À compléter selon le format d'entrée du modèle de rupture."""
        return [[depot_id, produit_id]]

    def _encoder_incident(self, incident: dict):
        """À compléter selon les encodeurs utilisés dans le notebook 08."""
        # Exemple : encoder les colonnes catégorielles
        import numpy as np
        valeurs = []
        for col, encoder in self.encoders_incidents.items():
            if col in incident:
                try:
                    val_encodee = encoder.transform([incident[col]])[0]
                except (ValueError, AttributeError):
                    val_encodee = -1  # valeur inconnue
                valeurs.append(val_encodee)
            else:
                valeurs.append(0)
        return np.array(valeurs)


# Une seule instance, créée au démarrage de l'API, réutilisée par tous les endpoints
ia_service = IAService()