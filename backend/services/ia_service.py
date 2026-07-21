import os
from pathlib import Path
import joblib
import pandas as pd
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = Path(os.getenv("MODELS_DIR", str(BASE_DIR / "../models"))).resolve()


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
        self.rupture_features = [
            'stock_fin_jour', 'taux_remplissage_pct', 'sorties', 'entrees',
            'stock_ma7', 'stock_ma14', 'sorties_ma7', 'sorties_ma14',
            'sorties_ma30', 'couverture_lag1', 'couverture_lag7', 'couverture_lag14',
            'tendance_stock', 'jour_semaine', 'mois', 'trimestre',
            'is_weekend', 'prix_wti_usd_baril'
        ]
        self.anomaly_features = [
            'stock_fin_jour', 'taux_remplissage_pct', 'entrees', 'sorties',
            'stock_debut_jour', 'mois', 'jour_sem', 'is_weekend'
        ]
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

    def predire_demande(self, request: dict):
        """Prévision de demande pour un produit dans un dépôt."""
        self._modele_est_disponible(self.modele_prevision, "prevision_demande")

        horizon_jours = int(request.get("horizon_jours", 30))

        if not hasattr(self.modele_prevision, "make_future_dataframe"):
            raise HTTPException(
                status_code=503,
                detail="Le modèle de prévision chargé n'est pas compatible avec la prédiction automatique."
            )

        future = self.modele_prevision.make_future_dataframe(periods=horizon_jours, freq="D")
        forecast = self.modele_prevision.predict(future)

        if "yhat" not in forecast.columns:
            raise HTTPException(
                status_code=503,
                detail="Le modèle de prévision n'a pas renvoyé la colonne attendue 'yhat'."
            )

        sortie = []
        for _, row in forecast.tail(horizon_jours).iterrows():
            sortie.append({
                "ds": row["ds"].strftime("%Y-%m-%d") if hasattr(row["ds"], "strftime") else str(row["ds"]),
                "yhat": float(row["yhat"])
            })
        return sortie

    def detecter_anomalie(self, observation: dict) -> dict:
        """Détecte si une observation est une anomalie via Isolation Forest."""
        self._modele_est_disponible(self.modele_anomalies, "anomalies")
        import numpy as np

        colonnes_attendues = self.anomaly_features
        valeurs = [observation.get(col, 0) for col in colonnes_attendues]
        valeurs = [float(v) if col != "is_weekend" else float(bool(v)) for col, v in zip(colonnes_attendues, valeurs)]

        donnees = np.array([valeurs], dtype=float)
        if self.scaler_anomalies is not None:
            donnees = self.scaler_anomalies.transform(donnees)

        score = self.modele_anomalies.decision_function(donnees)
        prediction = self.modele_anomalies.predict(donnees)
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

    def estimer_jours_rupture(self, donnees: dict) -> float:
        """Estime le nombre de jours avant rupture de stock."""
        self._modele_est_disponible(self.modele_ruptures, "ruptures")
        donnees_entree = self._preparer_donnees_rupture(donnees)
        prediction = self.modele_ruptures.predict(donnees_entree)
        return float(prediction[0])

    # ----- Fonctions internes de préparation -----
    def _preparer_donnees_rupture(self, donnees: dict):
        """Prépare les données d'entrée pour le modèle de rupture."""
        import numpy as np
        valeurs = [donnees.get(feature, 0) for feature in self.rupture_features]
        return np.array([valeurs], dtype=float)

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