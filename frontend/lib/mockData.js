export const mockKpi = {
  valeur_totale_stock_usd: 8425000,
  nombre_alertes_actives: 6,
  taux_remplissage_moyen_pct: 84.7,
  incidents_ouverts: 9,
};

export const mockStocks = {
  D001: [
    { date: "2026-07-01", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 182000, entrees: 24000, sorties: 17800, stock_fin_jour: 188200, taux_remplissage_pct: 91.4, alerte_stock_bas: false, anomalie_detectee: false },
    { date: "2026-07-02", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 188200, entrees: 12000, sorties: 19600, stock_fin_jour: 180600, taux_remplissage_pct: 87.8, alerte_stock_bas: false, anomalie_detectee: false },
    { date: "2026-07-03", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 180600, entrees: 16000, sorties: 21400, stock_fin_jour: 175200, taux_remplissage_pct: 85.2, alerte_stock_bas: false, anomalie_detectee: true },
    { date: "2026-07-04", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 175200, entrees: 10000, sorties: 22800, stock_fin_jour: 162400, taux_remplissage_pct: 79.0, alerte_stock_bas: true, anomalie_detectee: false },
    { date: "2026-07-05", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 162400, entrees: 15000, sorties: 20500, stock_fin_jour: 156900, taux_remplissage_pct: 76.3, alerte_stock_bas: true, anomalie_detectee: false },
    { date: "2026-07-06", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 156900, entrees: 32000, sorties: 18700, stock_fin_jour: 170200, taux_remplissage_pct: 82.7, alerte_stock_bas: false, anomalie_detectee: false },
    { date: "2026-07-07", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 170200, entrees: 20000, sorties: 22200, stock_fin_jour: 168000, taux_remplissage_pct: 81.6, alerte_stock_bas: false, anomalie_detectee: false },
    { date: "2026-07-08", depot_id: "D001", produit_id: "PRD003", stock_debut_jour: 168000, entrees: 18000, sorties: 23800, stock_fin_jour: 162200, taux_remplissage_pct: 78.8, alerte_stock_bas: true, anomalie_detectee: false },
  ],
  D002: [
    { date: "2026-07-01", depot_id: "D002", produit_id: "PRD003", stock_debut_jour: 94000, entrees: 18000, sorties: 16100, stock_fin_jour: 95900, taux_remplissage_pct: 73.5, alerte_stock_bas: true, anomalie_detectee: false },
    { date: "2026-07-02", depot_id: "D002", produit_id: "PRD003", stock_debut_jour: 95900, entrees: 9000, sorties: 14500, stock_fin_jour: 90400, taux_remplissage_pct: 69.3, alerte_stock_bas: true, anomalie_detectee: false },
    { date: "2026-07-03", depot_id: "D002", produit_id: "PRD003", stock_debut_jour: 90400, entrees: 12000, sorties: 17100, stock_fin_jour: 85300, taux_remplissage_pct: 65.4, alerte_stock_bas: true, anomalie_detectee: true },
    { date: "2026-07-04", depot_id: "D002", produit_id: "PRD003", stock_debut_jour: 85300, entrees: 14000, sorties: 12400, stock_fin_jour: 86900, taux_remplissage_pct: 66.6, alerte_stock_bas: true, anomalie_detectee: false },
    { date: "2026-07-05", depot_id: "D002", produit_id: "PRD003", stock_debut_jour: 86900, entrees: 10000, sorties: 18900, stock_fin_jour: 78000, taux_remplissage_pct: 59.8, alerte_stock_bas: true, anomalie_detectee: false },
  ],
};

export const mockAlertes = [
  { date: "2026-07-08", depot_id: "D001", produit_id: "PRD003", stock_fin_jour: 162200, seuil_alerte: 170000, niveau: "orange" },
  { date: "2026-07-05", depot_id: "D002", produit_id: "PRD003", stock_fin_jour: 78000, seuil_alerte: 90000, niveau: "rouge" },
  { date: "2026-07-04", depot_id: "D003", produit_id: "PRD001", stock_fin_jour: 32400, seuil_alerte: 45000, niveau: "orange" },
  { date: "2026-07-06", depot_id: "D004", produit_id: "PRD004", stock_fin_jour: 27500, seuil_alerte: 40000, niveau: "rouge" },
  { date: "2026-07-07", depot_id: "D005", produit_id: "PRD002", stock_fin_jour: 118000, seuil_alerte: 125000, niveau: "orange" },
  { date: "2026-07-07", depot_id: "D001", produit_id: "PRD005", stock_fin_jour: 63000, seuil_alerte: 80000, niveau: "rouge" },
];

export const mockPrevisions = {
  PRD003: {
    depot_id: "D001",
    produit_id: "PRD003",
    prevision: [188200, 186900, 185100, 182400, 180300, 178700, 176500, 175200, 173900, 172200, 170900, 169300, 167900, 166200, 164500, 162800, 161400, 159700, 158200, 156900, 155100, 153300, 151800, 150200, 148700, 147100, 145400, 144000, 142600, 141200],
    intervalle_confiance_basse: [184500, 183100, 181600, 179200, 177000, 175300, 173100, 171900, 170200, 168800, 167000, 165600, 164100, 162300, 160800, 159000, 157500, 155900, 154200, 152900, 151100, 149400, 147900, 146500, 145100, 143500, 141900, 140700, 139100, 137900],
    intervalle_confiance_haute: [191900, 190700, 189000, 186700, 184900, 183200, 181000, 179500, 177800, 176200, 174900, 173000, 171700, 170200, 168700, 167100, 165600, 163900, 162400, 160900, 159100, 157500, 156000, 154600, 153200, 151500, 150000, 148600, 147300, 146100],
  },
};

export const mockAnomalies = [
  { date: "2026-07-03", depot_id: "D001", produit_id: "PRD003", stock_fin_jour: 175200, entrees: 16000, sorties: 21400, score_suspicion: 0.87, alerte_stock_bas: false, anomalie_detectee: true },
  { date: "2026-07-03", depot_id: "D002", produit_id: "PRD003", stock_fin_jour: 85300, entrees: 12000, sorties: 17100, score_suspicion: 0.92, alerte_stock_bas: true, anomalie_detectee: true },
  { date: "2026-07-06", depot_id: "D004", produit_id: "PRD004", stock_fin_jour: 27500, entrees: 5000, sorties: 9800, score_suspicion: 0.81, alerte_stock_bas: true, anomalie_detectee: true },
];

export const mockCommandes = [
  { bon_commande_id: "BC24001", date_commande: "2026-07-01", fournisseur_id: "FRN001", depot_destination_id: "D001", produit_id: "PRD003", quantite_commandee: 45000, statut: "Livrée", montant_total: 16200000 },
  { bon_commande_id: "BC24002", date_commande: "2026-07-04", fournisseur_id: "FRN002", depot_destination_id: "D002", produit_id: "PRD003", quantite_commandee: 30000, statut: "En attente", montant_total: 10800000 },
  { bon_commande_id: "BC24003", date_commande: "2026-07-07", fournisseur_id: "FRN001", depot_destination_id: "D001", produit_id: "PRD001", quantite_commandee: 12000, statut: "Validée", montant_total: 4200000 },
];

export const mockIncidents = [
  { incident_id: "INC1001", date_incident: "2026-07-02", depot_id: "D002", type_incident: "Panne pompe", description: "Arrêt temporaire de la pompe de transfert", gravite: "Modéré", statut: "Ouvert" },
  { incident_id: "INC1002", date_incident: "2026-07-05", depot_id: "D004", type_incident: "Retard livraison", description: "Camion arrivé avec 6 heures de retard", gravite: "Faible", statut: "Clos" },
  { incident_id: "INC1003", date_incident: "2026-07-08", depot_id: "D001", type_incident: "Variation anormale", description: "Baisse de stock plus rapide que prévu", gravite: "Élevé", statut: "Ouvert" },
];

export const mockFactures = [
  { facture_id: "FAC3001", date_facture: "2026-07-01", client_id: "CLI001", produit_id: "PRD003", montant_ttc: 2450000, depot_id: "D001" },
  { facture_id: "FAC3002", date_facture: "2026-07-02", client_id: "CLI002", produit_id: "PRD001", montant_ttc: 3800000, depot_id: "D002" },
  { facture_id: "FAC3003", date_facture: "2026-07-04", client_id: "CLI003", produit_id: "PRD004", montant_ttc: 1280000, depot_id: "D003" },
  { facture_id: "FAC3004", date_facture: "2026-07-06", client_id: "CLI001", produit_id: "PRD005", montant_ttc: 5600000, depot_id: "D001" },
  { facture_id: "FAC3005", date_facture: "2026-07-07", client_id: "CLI004", produit_id: "PRD002", montant_ttc: 1940000, depot_id: "D004" },
];

export const mockAlertesCritiques = mockAlertes.filter((alerte) => alerte.niveau === "rouge");

export const mockMetas = {
  depots: [
    { id: "D001", label: "Dépôt Central Lomé" },
    { id: "D002", label: "Terminal Portuaire Lomé" },
    { id: "D003", label: "Dépôt Kara" },
    { id: "D004", label: "Dépôt Sokodé" },
    { id: "D005", label: "Dépôt Atakpamé" },
  ],
  produits: [
    { id: "PRD001", label: "Super Sans Plomb" },
    { id: "PRD002", label: "Gasoil" },
    { id: "PRD003", label: "Gasoil Premium" },
    { id: "PRD004", label: "Kérosène" },
    { id: "PRD005", label: "GPL" },
  ],
};
