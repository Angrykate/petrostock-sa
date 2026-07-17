function genererSerieStock(jours, base, amplitude, seed = 0, depotId = "D001", produitId = "PRD003") {
  const serie = [];
  let courant = base;
  for (let i = 0; i < jours; i++) {
    const bruit =
      (Math.sin((i + seed) * 0.3) * 0.5 +
        Math.cos((i + seed) * 0.15) * 0.3 +
        (((seed * 17 + i * 13) % 10) / 10 - 0.5) * 0.4) *
      amplitude;
    const entrees = Math.round(18000 + Math.sin((i + seed) * 0.2) * 6000 + ((seed + i) % 5) * 800);
    const sorties = Math.round(20000 + Math.cos((i + seed) * 0.25) * 5000 + ((seed + i) % 7) * 700);
    courant = Math.max(base * 0.35, courant + entrees - sorties + bruit * 0.1);
    const stockFin = Math.round(courant);
    const capacite = base * 1.15;
    const date = new Date(2026, 5, 18 + i);
    serie.push({
      date: date.toISOString().slice(0, 10),
      depot_id: depotId,
      produit_id: produitId,
      stock_debut_jour: Math.round(courant - entrees + sorties),
      entrees,
      sorties,
      stock_fin_jour: stockFin,
      taux_remplissage_pct: Math.round((stockFin / capacite) * 1000) / 10,
      seuil_alerte_min: Math.round(base * 0.55),
      alerte_stock_bas: stockFin < base * 0.55,
      anomalie_detectee: (i + seed) % 11 === 0,
    });
    courant = stockFin;
  }
  return serie;
}

export const mockMetas = {
  depots: [
    { id: "D001", label: "Lomé Central", region: "Lomé", capacite: 200000 },
    { id: "D002", label: "Terminal Portuaire", region: "Lomé", capacite: 130000 },
    { id: "D003", label: "Tsévié", region: "Maritime", capacite: 85000 },
    { id: "D004", label: "Atakpamé", region: "Plateaux", capacite: 70000 },
    { id: "D005", label: "Sokodé", region: "Centrale", capacite: 110000 },
    { id: "D006", label: "Kara Nord", region: "Kara", capacite: 95000 },
    { id: "D007", label: "Kpalimé", region: "Plateaux", capacite: 75000 },
    { id: "D008", label: "Dapaong", region: "Savanes", capacite: 60000 },
  ],
  produits: [
    { id: "PRD001", label: "Super Sans Plomb", categorie: "Carburant", unite: "L" },
    { id: "PRD002", label: "Gasoil", categorie: "Carburant", unite: "L" },
    { id: "PRD003", label: "Gasoil Premium", categorie: "Carburant", unite: "L" },
    { id: "PRD004", label: "Kérosène", categorie: "Aviation", unite: "L" },
    { id: "PRD005", label: "GPL", categorie: "Gaz", unite: "kg" },
  ],
  fournisseurs: [
    { id: "FRN001", nom: "TotalEnergies Togo", pays: "Togo", score: 0.91, fiabilite: 0.94, delai: 0.88, prix: 0.86 },
    { id: "FRN002", nom: "Vivo Energy", pays: "Ghana", score: 0.87, fiabilite: 0.9, delai: 0.82, prix: 0.84 },
    { id: "FRN003", nom: "Oryx Energies", pays: "Togo", score: 0.84, fiabilite: 0.86, delai: 0.8, prix: 0.85 },
    { id: "FRN004", nom: "MRS Oil", pays: "Nigeria", score: 0.79, fiabilite: 0.81, delai: 0.74, prix: 0.82 },
    { id: "FRN005", nom: "Puma Energy", pays: "Côte d'Ivoire", score: 0.76, fiabilite: 0.78, delai: 0.72, prix: 0.8 },
    { id: "FRN006", nom: "Sahara Group", pays: "Nigeria", score: 0.72, fiabilite: 0.74, delai: 0.68, prix: 0.78 },
  ],
  clients: [
    { id: "CLI001", nom: "SOTRAL", type: "Transport", region: "Lomé" },
    { id: "CLI002", nom: "Aéroport de Lomé", type: "Aviation", region: "Lomé" },
    { id: "CLI003", nom: "Ciments du Togo", type: "Industrie", region: "Maritime" },
    { id: "CLI004", nom: "Ministère des Armées", type: "État", region: "Lomé" },
    { id: "CLI005", nom: "Distributeurs Kara", type: "Distribution", region: "Kara" },
  ],
};

export const mockKpi = {
  valeur_totale_stock_usd: 8425000,
  nombre_alertes_actives: 6,
  taux_remplissage_moyen_pct: 84.7,
  incidents_ouverts: 4,
  variation_journaliere_pct: 2.3,
  tendance: "hausse",
  ca_periode_fcfa: 23875000,
  taux_recouvrement_pct: 78.4,
  montant_en_attente_fcfa: 5150000,
};

export const mockStocks = Object.fromEntries(
  mockMetas.depots.map((d, i) => [
    d.id,
    genererSerieStock(90, Math.round(d.capacite * 0.75), Math.round(d.capacite * 0.08), i * 3, d.id, "PRD003"),
  ])
);

export const mockAlertes = [
  { date: "2026-07-08", depot_id: "D001", produit_id: "PRD003", stock_fin_jour: 162200, seuil_alerte: 170000, niveau: "orange", jours_couverture: 6 },
  { date: "2026-07-05", depot_id: "D002", produit_id: "PRD003", stock_fin_jour: 78000, seuil_alerte: 90000, niveau: "rouge", jours_couverture: 3 },
  { date: "2026-07-04", depot_id: "D003", produit_id: "PRD001", stock_fin_jour: 32400, seuil_alerte: 45000, niveau: "orange", jours_couverture: 7 },
  { date: "2026-07-06", depot_id: "D004", produit_id: "PRD004", stock_fin_jour: 27500, seuil_alerte: 40000, niveau: "rouge", jours_couverture: 2 },
  { date: "2026-07-07", depot_id: "D005", produit_id: "PRD002", stock_fin_jour: 118000, seuil_alerte: 125000, niveau: "orange", jours_couverture: 8 },
  { date: "2026-07-07", depot_id: "D001", produit_id: "PRD005", stock_fin_jour: 63000, seuil_alerte: 80000, niveau: "rouge", jours_couverture: 4 },
  { date: "2026-07-09", depot_id: "D006", produit_id: "PRD002", stock_fin_jour: 41000, seuil_alerte: 52000, niveau: "orange", jours_couverture: 5 },
  { date: "2026-07-10", depot_id: "D008", produit_id: "PRD001", stock_fin_jour: 18500, seuil_alerte: 28000, niveau: "rouge", jours_couverture: 2 },
  { date: "2026-07-11", depot_id: "D002", produit_id: "PRD001", stock_fin_jour: 41200, seuil_alerte: 55000, niveau: "rouge", jours_couverture: 3 },
  { date: "2026-07-11", depot_id: "D007", produit_id: "PRD003", stock_fin_jour: 38500, seuil_alerte: 48000, niveau: "orange", jours_couverture: 6 },
  { date: "2026-07-12", depot_id: "D003", produit_id: "PRD002", stock_fin_jour: 29800, seuil_alerte: 40000, niveau: "orange", jours_couverture: 7 },
  { date: "2026-07-12", depot_id: "D005", produit_id: "PRD004", stock_fin_jour: 15200, seuil_alerte: 28000, niveau: "rouge", jours_couverture: 2 },
  { date: "2026-07-13", depot_id: "D006", produit_id: "PRD001", stock_fin_jour: 22100, seuil_alerte: 30000, niveau: "orange", jours_couverture: 5 },
  { date: "2026-07-13", depot_id: "D008", produit_id: "PRD002", stock_fin_jour: 9800, seuil_alerte: 18000, niveau: "rouge", jours_couverture: 1 },
  { date: "2026-07-14", depot_id: "D001", produit_id: "PRD001", stock_fin_jour: 88000, seuil_alerte: 95000, niveau: "orange", jours_couverture: 8 },
  { date: "2026-07-14", depot_id: "D004", produit_id: "PRD002", stock_fin_jour: 19800, seuil_alerte: 32000, niveau: "rouge", jours_couverture: 3 },
  { date: "2026-07-15", depot_id: "D007", produit_id: "PRD005", stock_fin_jour: 12400, seuil_alerte: 20000, niveau: "orange", jours_couverture: 6 },
  { date: "2026-07-15", depot_id: "D002", produit_id: "PRD005", stock_fin_jour: 8900, seuil_alerte: 22000, niveau: "rouge", jours_couverture: 2 },
  { date: "2026-07-16", depot_id: "D003", produit_id: "PRD004", stock_fin_jour: 16700, seuil_alerte: 25000, niveau: "orange", jours_couverture: 5 },
  { date: "2026-07-16", depot_id: "D005", produit_id: "PRD003", stock_fin_jour: 72000, seuil_alerte: 90000, niveau: "orange", jours_couverture: 7 },
  { date: "2026-07-17", depot_id: "D008", produit_id: "PRD003", stock_fin_jour: 14200, seuil_alerte: 26000, niveau: "rouge", jours_couverture: 2 },
  { date: "2026-07-17", depot_id: "D006", produit_id: "PRD004", stock_fin_jour: 11300, seuil_alerte: 18000, niveau: "orange", jours_couverture: 4 },
];

export const mockPrevisions = {
  PRD003: {
    depot_id: "D001",
    produit_id: "PRD003",
    consommation_moyenne_jour: 18500,
    delai_fournisseur_jours: 5,
    stock_securite: 45000,
    stock_actuel: 162200,
    jours_avant_rupture: 6,
    metriques: { mae: 2140, rmse: 3180, mape: 4.2 },
    historique: Array.from({ length: 60 }, (_, i) => {
      const date = new Date(2026, 4, 18 + i);
      return {
        date: date.toISOString().slice(0, 10),
        sorties: Math.round(17000 + Math.sin(i * 0.2) * 2500 + (i % 5) * 200),
        type: "historique",
      };
    }),
    prevision: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2026, 6, 17 + i);
      const base = 18500 + i * 80;
      return {
        date: date.toISOString().slice(0, 10),
        sorties: null,
        prevision: base,
        basse: base - 1800,
        haute: base + 1800,
        type: "prevision",
      };
    }),
  },
  PRD001: {
    depot_id: "D001",
    produit_id: "PRD001",
    consommation_moyenne_jour: 9200,
    delai_fournisseur_jours: 4,
    stock_securite: 22000,
    stock_actuel: 52000,
    jours_avant_rupture: 4,
    metriques: { mae: 980, rmse: 1420, mape: 5.1 },
    historique: Array.from({ length: 60 }, (_, i) => {
      const date = new Date(2026, 4, 18 + i);
      return {
        date: date.toISOString().slice(0, 10),
        sorties: Math.round(8800 + Math.sin(i * 0.18) * 1200),
        type: "historique",
      };
    }),
    prevision: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2026, 6, 17 + i);
      const base = 9200 + i * 40;
      return {
        date: date.toISOString().slice(0, 10),
        sorties: null,
        prevision: base,
        basse: base - 900,
        haute: base + 900,
        type: "prevision",
      };
    }),
  },
};

export const mockRuptures = [
  { depot_id: "D001", produit_id: "PRD003", jours_avant_rupture: 6, niveau: "attention", stock_actuel: 162200, conso_jour: 18500 },
  { depot_id: "D002", produit_id: "PRD003", jours_avant_rupture: 3, niveau: "critique", stock_actuel: 78000, conso_jour: 21000 },
  { depot_id: "D004", produit_id: "PRD004", jours_avant_rupture: 2, niveau: "critique", stock_actuel: 27500, conso_jour: 9800 },
  { depot_id: "D001", produit_id: "PRD005", jours_avant_rupture: 4, niveau: "critique", stock_actuel: 63000, conso_jour: 12500 },
  { depot_id: "D003", produit_id: "PRD001", jours_avant_rupture: 7, niveau: "attention", stock_actuel: 32400, conso_jour: 4200 },
  { depot_id: "D008", produit_id: "PRD001", jours_avant_rupture: 2, niveau: "critique", stock_actuel: 18500, conso_jour: 7100 },
  { depot_id: "D005", produit_id: "PRD002", jours_avant_rupture: 12, niveau: "normal", stock_actuel: 118000, conso_jour: 9500 },
  { depot_id: "D006", produit_id: "PRD002", jours_avant_rupture: 5, niveau: "attention", stock_actuel: 41000, conso_jour: 7800 },
  { depot_id: "D002", produit_id: "PRD001", jours_avant_rupture: 3, niveau: "critique", stock_actuel: 41200, conso_jour: 13800 },
  { depot_id: "D007", produit_id: "PRD003", jours_avant_rupture: 6, niveau: "attention", stock_actuel: 38500, conso_jour: 6400 },
  { depot_id: "D003", produit_id: "PRD002", jours_avant_rupture: 7, niveau: "attention", stock_actuel: 29800, conso_jour: 4200 },
  { depot_id: "D005", produit_id: "PRD004", jours_avant_rupture: 2, niveau: "critique", stock_actuel: 15200, conso_jour: 7600 },
  { depot_id: "D006", produit_id: "PRD001", jours_avant_rupture: 5, niveau: "attention", stock_actuel: 22100, conso_jour: 4400 },
  { depot_id: "D008", produit_id: "PRD002", jours_avant_rupture: 1, niveau: "critique", stock_actuel: 9800, conso_jour: 8200 },
  { depot_id: "D001", produit_id: "PRD001", jours_avant_rupture: 8, niveau: "attention", stock_actuel: 88000, conso_jour: 11000 },
  { depot_id: "D004", produit_id: "PRD002", jours_avant_rupture: 3, niveau: "critique", stock_actuel: 19800, conso_jour: 6600 },
  { depot_id: "D007", produit_id: "PRD005", jours_avant_rupture: 6, niveau: "attention", stock_actuel: 12400, conso_jour: 2100 },
  { depot_id: "D002", produit_id: "PRD005", jours_avant_rupture: 2, niveau: "critique", stock_actuel: 8900, conso_jour: 4500 },
  { depot_id: "D003", produit_id: "PRD004", jours_avant_rupture: 5, niveau: "attention", stock_actuel: 16700, conso_jour: 3300 },
  { depot_id: "D005", produit_id: "PRD003", jours_avant_rupture: 7, niveau: "attention", stock_actuel: 72000, conso_jour: 10200 },
  { depot_id: "D008", produit_id: "PRD003", jours_avant_rupture: 2, niveau: "critique", stock_actuel: 14200, conso_jour: 7100 },
  { depot_id: "D006", produit_id: "PRD004", jours_avant_rupture: 4, niveau: "critique", stock_actuel: 11300, conso_jour: 2800 },
  { depot_id: "D001", produit_id: "PRD002", jours_avant_rupture: 14, niveau: "normal", stock_actuel: 145000, conso_jour: 10200 },
  { depot_id: "D007", produit_id: "PRD001", jours_avant_rupture: 11, niveau: "normal", stock_actuel: 52000, conso_jour: 4700 },
];

export const mockAnomalies = [
  { date: "2026-07-03", depot_id: "D001", produit_id: "PRD003", stock_fin_jour: 175200, entrees: 16000, sorties: 21400, score_suspicion: 0.87, alerte_stock_bas: false, anomalie_detectee: true, explication: "Sorties 28 % au-dessus de la moyenne mobile 14 jours." },
  { date: "2026-07-03", depot_id: "D002", produit_id: "PRD003", stock_fin_jour: 85300, entrees: 12000, sorties: 17100, score_suspicion: 0.92, alerte_stock_bas: true, anomalie_detectee: true, explication: "Écart-type élevé sur le solde journalier." },
  { date: "2026-07-06", depot_id: "D004", produit_id: "PRD004", stock_fin_jour: 27500, entrees: 5000, sorties: 9800, score_suspicion: 0.81, alerte_stock_bas: true, anomalie_detectee: true, explication: "Baisse brutale hors saisonnalité connue." },
  { date: "2026-07-09", depot_id: "D003", produit_id: "PRD001", stock_fin_jour: 32400, entrees: 8000, sorties: 14200, score_suspicion: 0.76, alerte_stock_bas: true, anomalie_detectee: true, explication: "Score Isolation Forest élevé." },
  { date: "2026-07-10", depot_id: "D005", produit_id: "PRD002", stock_fin_jour: 118000, entrees: 22000, sorties: 31500, score_suspicion: 0.94, alerte_stock_bas: false, anomalie_detectee: true, explication: "Pic de sorties inhabituel pour un dimanche." },
];

export const mockCommandes = [
  { bon_commande_id: "BC24001", date_commande: "2026-07-01", fournisseur_id: "FRN001", depot_destination_id: "D001", produit_id: "PRD003", quantite_commandee: 45000, quantite_livree: 45000, statut: "Livrée", montant_total: 16200000, retard_jours: 0 },
  { bon_commande_id: "BC24002", date_commande: "2026-07-04", fournisseur_id: "FRN002", depot_destination_id: "D002", produit_id: "PRD003", quantite_commandee: 30000, quantite_livree: 0, statut: "En attente", montant_total: 10800000, retard_jours: 0 },
  { bon_commande_id: "BC24003", date_commande: "2026-07-07", fournisseur_id: "FRN001", depot_destination_id: "D001", produit_id: "PRD001", quantite_commandee: 12000, quantite_livree: 0, statut: "Validée", montant_total: 4200000, retard_jours: 0 },
  { bon_commande_id: "BC24004", date_commande: "2026-07-10", fournisseur_id: "FRN003", depot_destination_id: "D003", produit_id: "PRD004", quantite_commandee: 20000, quantite_livree: 0, statut: "Validée", montant_total: 7200000, retard_jours: 0 },
  { bon_commande_id: "BC24005", date_commande: "2026-07-12", fournisseur_id: "FRN001", depot_destination_id: "D005", produit_id: "PRD002", quantite_commandee: 35000, quantite_livree: 0, statut: "En attente", montant_total: 12600000, retard_jours: 0 },
  { bon_commande_id: "BC24006", date_commande: "2026-06-20", fournisseur_id: "FRN004", depot_destination_id: "D008", produit_id: "PRD001", quantite_commandee: 15000, quantite_livree: 12000, statut: "En retard", montant_total: 5400000, retard_jours: 4 },
];

export const mockIncidents = [
  { incident_id: "INC1001", date_incident: "2026-07-02", depot_id: "D002", produit_id: "PRD003", type_incident: "Panne pompe", description: "Arrêt temporaire de la pompe de transfert — intervention technique requise", gravite: "Modéré", statut: "Ouvert", cout_usd: 1200, duree_arret_h: 6 },
  { incident_id: "INC1002", date_incident: "2026-07-05", depot_id: "D004", produit_id: null, type_incident: "Retard livraison", description: "Camion arrivé avec 6 heures de retard sur le créneau prévu", gravite: "Faible", statut: "Clos", cout_usd: 0, duree_arret_h: 0 },
  { incident_id: "INC1003", date_incident: "2026-07-08", depot_id: "D001", produit_id: "PRD003", type_incident: "Variation anormale", description: "Baisse de stock plus rapide que prévu — vérification des sorties en cours", gravite: "Élevé", statut: "Ouvert", cout_usd: 0, duree_arret_h: 0 },
  { incident_id: "INC1004", date_incident: "2026-07-11", depot_id: "D003", produit_id: "PRD001", type_incident: "Fuite détectée", description: "Fuite mineure sur une vanne de soutirage — colmatage effectué", gravite: "Critique", statut: "Ouvert", cout_usd: 4500, duree_arret_h: 12 },
  { incident_id: "INC1005", date_incident: "2026-07-13", depot_id: "D005", produit_id: "PRD002", type_incident: "Erreur inventaire", description: "Écart constaté entre le stock physique et le stock système", gravite: "Modéré", statut: "Ouvert", cout_usd: 0, duree_arret_h: 2 },
];

export const mockFactures = [
  { facture_id: "FAC3001", date_facture: "2026-07-01", client_id: "CLI001", produit_id: "PRD003", montant_ttc: 2450000, depot_id: "D001", statut_paiement: "Payée" },
  { facture_id: "FAC3002", date_facture: "2026-07-02", client_id: "CLI002", produit_id: "PRD001", montant_ttc: 3800000, depot_id: "D002", statut_paiement: "Payée" },
  { facture_id: "FAC3003", date_facture: "2026-07-04", client_id: "CLI003", produit_id: "PRD004", montant_ttc: 1280000, depot_id: "D003", statut_paiement: "Partielle" },
  { facture_id: "FAC3004", date_facture: "2026-07-06", client_id: "CLI001", produit_id: "PRD005", montant_ttc: 5600000, depot_id: "D001", statut_paiement: "En retard" },
  { facture_id: "FAC3005", date_facture: "2026-07-07", client_id: "CLI004", produit_id: "PRD002", montant_ttc: 1940000, depot_id: "D004", statut_paiement: "Payée" },
  { facture_id: "FAC3006", date_facture: "2026-07-09", client_id: "CLI005", produit_id: "PRD003", montant_ttc: 4100000, depot_id: "D001", statut_paiement: "Impayée" },
  { facture_id: "FAC3007", date_facture: "2026-07-11", client_id: "CLI002", produit_id: "PRD004", montant_ttc: 2950000, depot_id: "D002", statut_paiement: "Payée" },
  { facture_id: "FAC3008", date_facture: "2026-07-13", client_id: "CLI001", produit_id: "PRD001", montant_ttc: 1750000, depot_id: "D003", statut_paiement: "Partielle" },
];

export const mockCaMensuel = [
  { mois: "Fév", total: 18.2, Transport: 5.1, Aviation: 4.2, Industrie: 3.8, État: 2.4, Distribution: 2.7 },
  { mois: "Mar", total: 19.5, Transport: 5.4, Aviation: 4.5, Industrie: 4.0, État: 2.6, Distribution: 3.0 },
  { mois: "Avr", total: 21.1, Transport: 5.8, Aviation: 4.9, Industrie: 4.3, État: 2.8, Distribution: 3.3 },
  { mois: "Mai", total: 20.4, Transport: 5.6, Aviation: 4.7, Industrie: 4.1, État: 2.7, Distribution: 3.3 },
  { mois: "Juin", total: 22.8, Transport: 6.2, Aviation: 5.1, Industrie: 4.6, État: 3.0, Distribution: 3.9 },
  { mois: "Juil", total: 23.9, Transport: 6.5, Aviation: 5.4, Industrie: 4.8, État: 3.1, Distribution: 4.1 },
];

export function labelDepot(id) {
  return mockMetas.depots.find((d) => d.id === id)?.label || id;
}

export function labelProduit(id) {
  return mockMetas.produits.find((p) => p.id === id)?.label || id;
}

export function labelFournisseur(id) {
  return mockMetas.fournisseurs.find((f) => f.id === id)?.nom || id;
}

export function labelClient(id) {
  return mockMetas.clients.find((c) => c.id === id)?.nom || id;
}

export function niveauAlerte(niveau) {
  if (niveau === "rouge" || niveau === "critique") return "critique";
  if (niveau === "orange" || niveau === "attention") return "attention";
  return "normal";
}
