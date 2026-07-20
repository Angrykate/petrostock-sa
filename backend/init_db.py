"""Script d'initialisation de la base de données SQLite avec données de test."""
from database import engine, SessionLocal, Base
from models import Depot, Produit, Fournisseur, Client, Stock, BonCommande, Mouvement, FactureVente, Incident
from datetime import date, timedelta
import random


def init_database():
    """Crée les tables et insère des données de test."""
    # Création des tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès")

    db = SessionLocal()

    # Vérifier si déjà peuplé
    if db.query(Depot).count() > 0:
        print("ℹ️  Base déjà peuplée, skip")
        db.close()
        return

    # Dépôts
    depots_data = [
        ("D1", "Dépôt Lomé", "Maritime"),
        ("D2", "Dépôt Kara", "Kara"),
        ("D3", "Dépôt Sokodé", "Centrale"),
        ("D4", "Dépôt Atakpamé", "Plateaux"),
        ("D5", "Dépôt Kpalimé", "Plateaux"),
        ("D6", "Dépôt Tsévié", "Maritime"),
        ("D7", "Dépôt Dapaong", "Savanes"),
        ("D8", "Dépôt Notsé", "Plateaux"),
    ]
    for d_id, d_nom, d_region in depots_data:
        db.add(Depot(depot_id=d_id, depot_nom=d_nom, region=d_region))
    db.commit()
    print("✅ Dépôts créés")

    # Produits
    produits_data = [
        ("P1", "Gasoil", "L", "Carburant"),
        ("P2", "Essence Super", "L", "Carburant"),
        ("P3", "Essence Ordinaire", "L", "Carburant"),
        ("P4", "Kérosène", "L", "Carburant"),
        ("P5", "Fuel Lourd", "L", "Combustible"),
        ("P6", "GPL", "kg", "Gaz"),
        ("P7", "Jet A-1", "L", "Aviation"),
        ("P8", "Lubrifiant", "L", "Lubrifiant"),
        ("P9", "Bitume", "T", "Bitume"),
    ]
    for p_id, p_nom, p_unite, p_cat in produits_data:
        db.add(Produit(produit_id=p_id, produit_nom=p_nom, unite=p_unite, categorie=p_cat))
    db.commit()
    print("✅ Produits créés")

    # Fournisseurs
    fournisseurs_data = [
        ("S1", "PetroCI", "Côte d'Ivoire"),
        ("S2", "TotalEnergies Togo", "Togo"),
        ("S3", "SOCO International", "Congo"),
        ("S4", "SONABHY", "Burkina Faso"),
        ("S5", "OiLibya Togo", "Togo"),
        ("S6", "Oryx Energy", "Suisse"),
    ]
    for f_id, f_nom, f_region in fournisseurs_data:
        db.add(Fournisseur(fournisseur_id=f_id, fournisseur_nom=f_nom, fournisseur_region=f_region))
    db.commit()
    print("✅ Fournisseurs créés")

    # Clients
    clients_data = [
        ("C1", "CIMTOGO SA", "Industrie", "Maritime"),
        ("C2", "TOGOTRANS SARL", "Transport", "Centrale"),
        ("C3", "AGRI-TOGO", "Agriculture", "Plateaux"),
        ("C4", "AIR TOGO", "Aviation", "Maritime"),
        ("C5", "TOTAL DIST.", "Distribution", "Maritime"),
    ]
    for c_id, c_nom, c_type, c_region in clients_data:
        db.add(Client(client_id=c_id, client_nom=c_nom, type_client=c_type, region_client=c_region))
    db.commit()
    print("✅ Clients créés")

    # Stocks : 30 jours d'historique
    base_date = date(2024, 6, 20)
    for jour in range(30):
        d = base_date + timedelta(days=jour)
        for depot_id, _, _ in depots_data:
            for produit_id, _, _, _ in produits_data[:4]:  # P1-P4 seulement
                stock_init = random.uniform(100000, 2000000)
                entrees = random.uniform(0, 50000)
                sorties = random.uniform(20000, 80000)
                stock_fin = stock_init + entrees - sorties
                capacite = random.uniform(500000, 2500000)
                prix_wti = random.uniform(70, 90)

                alerte = stock_fin < capacite * 0.15
                db.add(Stock(
                    date=d,
                    jour_semaine=d.strftime("%A"),
                    mois=d.month,
                    trimestre=(d.month - 1) // 3 + 1,
                    annee=d.year,
                    depot_id=depot_id,
                    produit_id=produit_id,
                    stock_debut_jour=round(stock_init, 2),
                    entrees=round(entrees, 2),
                    sorties=round(sorties, 2),
                    stock_fin_jour=round(stock_fin, 2),
                    capacite_max=round(capacite, 2),
                    taux_remplissage_pct=round((stock_fin / capacite) * 100, 2),
                    seuil_alerte_min=round(capacite * 0.1, 2),
                    alerte_stock_bas=alerte,
                    anomalie_detectee=random.random() < 0.05,
                    prix_wti_usd_baril=round(prix_wti, 2),
                    prix_unitaire=round(random.uniform(400, 700), 2),
                    valeur_stock=round(stock_fin * random.uniform(400, 700), 2),
                ))
    db.commit()
    print(f"✅ {30 * 4 * 8} enregistrements de stocks créés")

    # Commandes
    commandes_data = [
        ("BC-0001", date(2024, 7, 17), date(2024, 7, 22), "S1", "D2", "P1", 300000, 300000, 106000000, "Livré", 5, 0),
        ("BC-0002", date(2024, 7, 15), date(2024, 7, 20), "S2", "D1", "P3", 200000, 200000, 88000000, "En transit", 5, 0),
        ("BC-0003", date(2024, 7, 18), date(2024, 7, 25), "S5", "D4", "P2", 100000, 0, 67000000, "Envoyée", 7, 7),
        ("BC-0004", date(2024, 7, 10), date(2024, 7, 16), "S2", "D1", "P1", 500000, 500000, 265000000, "Livré", 6, 0),
    ]
    for ref, date_cde, date_liv, f_id, depot, prod, qte_cdee, qte_livree, montant, statut, delai, retard in commandes_data:
        db.add(BonCommande(
            bon_commande_id=ref,
            date_commande=date_cde,
            date_livraison_prevue=date_liv,
            date_livraison_reelle=date_liv if statut == "Livré" else None,
            fournisseur_id=f_id,
            depot_destination_id=depot,
            produit_id=prod,
            quantite_commandee=round(qte_cdee, 2),
            quantite_livree=round(qte_livree, 2),
            prix_unitaire=round(montant / qte_cdee, 2) if qte_cdee > 0 else 0,
            montant_total=round(montant, 2),
            statut=statut,
            delai_livraison_jours=delai,
            retard_jours=retard,
        ))
    db.commit()
    print("✅ Commandes créées")

    # Incidents
    incidents_data = [
        ("INC-0001", date(2024, 7, 17), "D2", "P1", "Fuite de canalisation", "Élevé",
         "Fuite détectée sur la conduite principale de Gasoil", 4200000, 12, "En cours"),
        ("INC-0002", date(2024, 7, 16), "D4", "P2", "Erreur de saisie", "Modéré",
         "Écart de 12 000 L entre stock physique et système", 0, 0, "En cours"),
        ("INC-0003", date(2024, 7, 15), "D7", "P1", "Panne équipement", "Critique",
         "Défaillance de la pompe principale n°2", 8750000, 48, "Ouvert"),
        ("INC-0004", date(2024, 7, 10), "D1", "P1", "Anomalie stock IA", "Modéré",
         "Modèle Isolation Forest détecte anomalie sur sortie nocturne", 0, 0, "En cours"),
    ]
    for i_id, i_date, i_depot, i_prod, i_type, i_grav, i_desc, i_cout, i_duree, i_statut in incidents_data:
        db.add(Incident(
            incident_id=i_id,
            date_incident=i_date,
            depot_id=i_depot,
            produit_concerne_id=i_prod,
            type_incident=i_type,
            gravite=i_grav,
            description=i_desc,
            cout_incident_usd=round(i_cout / 600, 2),  # conversion FCFA → USD
            duree_arret_heures=round(i_duree, 2),
            statut=i_statut,
        ))
    db.commit()
    print("✅ Incidents créés")

    # Factures
    for i in range(10):
        db.add(FactureVente(
            facture_id=f"FAC-{4000 + i}",
            date_facture=base_date + timedelta(days=i),
            date_echeance=base_date + timedelta(days=i + 30),
            client_id=random.choice(clients_data)[0],
            depot_source_id=random.choice(depots_data)[0],
            produit_id=random.choice(produits_data[:4])[0],
            quantite_vendue=round(random.uniform(10000, 100000), 2),
            prix_unitaire_vente=round(random.uniform(450, 700), 2),
            montant_ht=round(random.uniform(5000000, 50000000), 2),
            montant_ttc=round(random.uniform(6000000, 60000000), 2),
            statut_paiement=random.choice(["Payée", "En attente", "Retard", "Payée"]),
            mode_paiement=random.choice(["Virement", "Chèque", "Espèces"]),
        ))
    db.commit()
    print("✅ Factures créées")

    db.close()
    print("\n✅ Base de données initialisée avec succès !")
    print(f"📊 {db.query(Depot).count()} dépôts")
    print(f"📊 {db.query(Produit).count()} produits")
    print(f"📊 {db.query(Fournisseur).count()} fournisseurs")
    print(f"📊 {db.query(Stock).count()} enregistrements de stocks")
    print(f"📊 {db.query(BonCommande).count()} commandes")
    print(f"📊 {db.query(Incident).count()} incidents")
    print(f"📊 {db.query(FactureVente).count()} factures")


if __name__ == "__main__":
    init_database()