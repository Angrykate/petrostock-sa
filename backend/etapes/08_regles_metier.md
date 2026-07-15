# Étape 8 — Règles métier (`services/alerte_service.py`)

**Objectif de cette étape :** implémenter en code les règles métier tranchées lors de la réunion de conception (seuils d'alerte, quantité de commande, recommandation fournisseur, stock de sécurité, escalade d'incident).

**Prérequis :** les valeurs de ces règles doivent être confirmées par l'équipe (voir support de réunion, section 6) — idéalement affinées après l'EDA de SIDIBE/SEMAGNON, comme le précise le cahier des tâches technique.

---

## 1. Créer `services/alerte_service.py`

```python
class AlerteService:
    """Implémente les règles métier définies en réunion de conception."""

    # Règle 1 — Seuils d'alerte (à ajuster si l'EDA suggère d'autres valeurs)
    SEUIL_STOCK_BAS_JOURS = 10
    SEUIL_STOCK_CRITIQUE_JOURS = 5

    # Règle 4 — Stock de sécurité
    JOURS_STOCK_SECURITE = 3

    # Règle 3 — Pondération recommandation fournisseur
    POIDS_FIABILITE = 0.5
    POIDS_DELAI = 0.3
    POIDS_PRIX = 0.2

    def niveau_alerte(self, jours_couverture: float) -> str:
        """Règle 1 : détermine le niveau d'alerte selon les jours de couverture restants."""
        if jours_couverture < self.SEUIL_STOCK_CRITIQUE_JOURS:
            return "critique"
        elif jours_couverture < self.SEUIL_STOCK_BAS_JOURS:
            return "bas"
        return "normal"

    def calculer_stock_securite(self, consommation_moyenne_journaliere: float) -> float:
        """Règle 4 : Stock de sécurité = consommation moyenne journalière x 3 jours."""
        return consommation_moyenne_journaliere * self.JOURS_STOCK_SECURITE

    def calculer_quantite_commande(
        self,
        consommation_moyenne_journaliere: float,
        delai_fournisseur_jours: float,
        stock_actuel: float,
        capacite_max: float = None
    ) -> float:
        """Règle 2 : Quantité à commander = (conso moyenne x délai) + stock sécurité - stock actuel."""
        stock_securite = self.calculer_stock_securite(consommation_moyenne_journaliere)
        quantite = (consommation_moyenne_journaliere * delai_fournisseur_jours) + stock_securite - stock_actuel

        # Point de décision de la réunion : plafonner à la capacité restante du dépôt
        if capacite_max is not None:
            capacite_restante = capacite_max - stock_actuel
            quantite = min(quantite, capacite_restante)

        return max(quantite, 0)  # jamais de quantité négative

    def calculer_score_fournisseur(
        self,
        taux_livraison_effectif: float,   # entre 0 et 1
        delai_livraison_jours: float,
        delai_max_reference: float,        # le pire délai observé, pour normaliser le score
        prix_unitaire: float,
        prix_max_reference: float          # le prix le plus élevé observé, pour normaliser le score
    ) -> float:
        """Règle 3 : score pondéré = 50% fiabilité + 30% délai + 20% prix.
        Délai et prix sont inversés (plus c'est bas, meilleur est le score)."""
        score_fiabilite = taux_livraison_effectif
        score_delai = 1 - (delai_livraison_jours / delai_max_reference)
        score_prix = 1 - (prix_unitaire / prix_max_reference)

        score_final = (
            self.POIDS_FIABILITE * score_fiabilite +
            self.POIDS_DELAI * score_delai +
            self.POIDS_PRIX * score_prix
        )
        return round(score_final, 3)

    def necessite_escalade(self, gravite: str) -> dict:
        """Règle 5 : détermine qui doit être notifié selon la gravité d'un incident."""
        notifier_depot = gravite in ("Élevé", "Critique")
        notifier_direction = gravite == "Critique"
        return {
            "notifier_responsable_depot": notifier_depot,
            "notifier_direction": notifier_direction
        }


alerte_service = AlerteService()
```

## 2. Pourquoi des constantes en haut de la classe plutôt que des valeurs "en dur" dans le code ?

Parce que ces valeurs sont **exactement** les points de décision que l'équipe doit trancher et documenter dans le rapport. En les regroupant en haut du fichier, deux avantages :
- Si l'EDA révèle qu'il faut ajuster un seuil, on change une seule ligne, pas besoin de chercher partout dans le code.
- C'est directement lisible et citable dans le rapport ("le seuil retenu est de 10 jours, codé dans `alerte_service.py`, justifié par...").

## 3. Utilisation dans un endpoint

Exemple d'intégration dans `routers/stocks.py`, pour enrichir la réponse d'un stock avec son niveau d'alerte calculé :

```python
from services.alerte_service import alerte_service

@router.get("/{depot_id}/alerte-niveau")
def niveau_alerte_depot(depot_id: str, produit_id: str, db: Session = Depends(get_db)):
    # jours_couverture proviendrait normalement du modèle de prévision des ruptures (Étape 7)
    jours_couverture = ia_service.estimer_jours_rupture(depot_id, produit_id)
    niveau = alerte_service.niveau_alerte(jours_couverture)
    return {"depot_id": depot_id, "produit_id": produit_id, "jours_couverture": jours_couverture, "niveau_alerte": niveau}
```

Et pour l'escalade automatique, à ajouter dans `routers/incidents.py` juste après la classification (Étape 7) :

```python
from services.alerte_service import alerte_service

# ... après avoir obtenu gravite_predite et créé l'incident
escalade = alerte_service.necessite_escalade(gravite_predite)
# escalade["notifier_direction"] et escalade["notifier_responsable_depot"]
# indiquent maintenant qui doit recevoir une notification
# (l'envoi réel de notification n'est pas dans le périmètre des 10 jours,
# mais l'info est calculée et disponible pour le frontend)
```

## 4. Vérification finale de cette étape

- [ ] `services/alerte_service.py` créé avec les 5 méthodes
- [ ] Les valeurs des règles (seuils, pondérations) sont confirmées par l'équipe, pas juste des valeurs provisoires
- [ ] Au moins un endpoint utilise `alerte_service` pour enrichir sa réponse
- [ ] Le point de décision "plafond capacité max" (Règle 2) a été tranché en équipe et reflété dans le code

Si tout est coché, tu es prêt pour l'Étape 9 (gestion des erreurs et configuration finale).

---

*Guide préparé pour SEGNEDJI — Projet PetroStock SA — EPL 2025-2026*
