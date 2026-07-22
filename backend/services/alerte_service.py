class AlerteService:
    """Implémente les règles métier définies en réunion de conception."""

    # Règle 1 — Seuils d'alerte (issus du notebook 04_modèle_ruptures_stock.ipynb)
    SEUIL_STOCK_MODERE_JOURS = 30
    SEUIL_STOCK_BAS_JOURS = 14
    SEUIL_STOCK_CRITIQUE_JOURS = 7
    COEFFICIENT_SECURITE = 0.85

    # Règle 4 — Stock de sécurité
    JOURS_STOCK_SECURITE = 3

    # Règle 3 — Pondération recommandation fournisseur
    POIDS_FIABILITE = 0.5
    POIDS_DELAI = 0.3
    POIDS_PRIX = 0.2

    # Règle 6 — Seuil de tolérance écart de livraison
    SEUIL_ECART_LIVRAISON_PCT = 3.0

    # Types d'incidents qui impactent physiquement le stock disponible
    # (utilisé par la règle d'escalade — Règle 5)
    TYPES_IMPACT_STOCK = ["Fuite de produit", "Contamination produit", "Déversement accidentel"]

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
        if capacite_max is not None:
            capacite_restante = capacite_max - stock_actuel
            quantite = min(quantite, capacite_restante)
        return max(quantite, 0)

    def calculer_score_fournisseur(
        self,
        taux_livraison_effectif: float,
        delai_livraison_jours: float,
        delai_max_reference: float,
        prix_unitaire: float,
        prix_max_reference: float
    ) -> float:
        """Règle 3 : score pondéré = 50% fiabilité + 30% délai + 20% prix."""
        score_fiabilite = taux_livraison_effectif
        score_delai = 1 - (delai_livraison_jours / delai_max_reference)
        score_prix = 1 - (prix_unitaire / prix_max_reference)
        score_final = (
            self.POIDS_FIABILITE * score_fiabilite +
            self.POIDS_DELAI * score_delai +
            self.POIDS_PRIX * score_prix
        )
        return round(score_final, 3)

    def necessite_escalade(self, gravite: str, type_incident: str = None, quantite_perdue: float = 0) -> dict:
        """Règle 5 : détermine qui doit être notifié selon la gravité et le type d'incident.
        
        - Gravité Élevé → notification au Responsable de dépôt
        - Gravité Critique → notification au Responsable de dépôt ET à la Direction
        - Gravité Critique AVEC impact sur le stock disponible (quantité perdue > 0
          OU type d'incident parmi Fuite/Contamination/Déversement)
          → notification supplémentaire au Responsable des achats
        """
        notifier_depot = gravite in ("Élevé", "Critique")
        notifier_direction = gravite == "Critique"

        # Détermine si le stock est impacté : quantité perdue positive
        # OU type d'incident connu pour affecter physiquement le stock
        stock_impacte = (
            quantite_perdue > 0
            or (type_incident and type_incident in self.TYPES_IMPACT_STOCK)
        )
        notifier_achats = (gravite == "Critique" and stock_impacte)

        return {
            "notifier_responsable_depot": notifier_depot,
            "notifier_direction": notifier_direction,
            "notifier_responsable_achats": notifier_achats,
        }

    def verifier_ecart_livraison(self, quantite_commandee: float, quantite_livree: float) -> dict:
        """Règle 6 : vérifie si l'écart entre commandé et livré dépasse le seuil de tolérance.
        
        Retourne un dict avec :
        - ecart_pct : l'écart en pourcentage
        - depotasseuil : True si |écart| > SEUIL (une incident doit être créé)
        """
        if quantite_commandee <= 0:
            return {"ecart_pct": 0.0, "depasse_seuil": False}

        ecart_pct = abs(quantite_commandee - quantite_livree) / quantite_commandee * 100
        depasse_seuil = ecart_pct > self.SEUIL_ECART_LIVRAISON_PCT
        return {
            "ecart_pct": round(ecart_pct, 2),
            "depasse_seuil": depasse_seuil,
        }


alerte_service = AlerteService()