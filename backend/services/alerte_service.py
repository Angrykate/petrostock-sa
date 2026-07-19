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