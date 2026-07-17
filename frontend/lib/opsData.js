import {
  mockAlertes as rawAlertes,
  mockAnomalies,
  mockCaMensuel,
  mockCommandes,
  mockFactures,
  mockIncidents,
  mockKpi,
  mockMetas,
  mockPrevisions,
  mockRuptures,
  mockStocks,
  labelDepot,
  labelProduit,
  labelFournisseur,
  labelClient,
  niveauAlerte,
} from "./mockData";

export {
  mockAnomalies,
  mockCaMensuel,
  mockCommandes,
  mockFactures,
  mockIncidents,
  mockKpi,
  mockMetas,
  mockPrevisions,
  mockRuptures,
  mockStocks,
  labelDepot,
  labelProduit,
  labelFournisseur,
  labelClient,
  niveauAlerte,
};

function suggestionPourAlerte(a) {
  const conso = a.conso_jour || Math.round((a.seuil_alerte || 50000) * 0.12);
  const delai = a.delai_fournisseur || 5;
  const securite = Math.round(conso * 3);
  const stock = a.stock_fin_jour || 0;
  const qte = Math.max(0, Math.round(conso * delai + securite - stock));
  const frn = mockMetas.fournisseurs[0];
  return {
    quantite_suggeree: qte,
    formule: `conso ${conso}/j × délai ${delai}j + sécurité ${securite} − stock ${stock}`,
    fournisseur_id: frn.id,
    fournisseur_nom: frn.nom,
    fournisseur_score: frn.score,
    delai_jours: delai,
    urgence_heures: a.jours_couverture <= 2 ? 12 : a.jours_couverture <= 5 ? 24 : 72,
    impact_estime_usd: Math.round(qte * 0.42),
  };
}

/** Alertes enrichies : actions, statut workflow, suggestion semi-auto */
export const mockAlertes = rawAlertes.map((a, i) => {
  const niveau = niveauAlerte(a.niveau);
  const types = ["stock_critique", "stock_bas", "couverture_faible", "seuil_franchi"];
  const type = niveau === "critique" ? "stock_critique" : types[i % types.length];
  return {
    id: `ALR-${1000 + i}`,
    ...a,
    niveau,
    type_alerte: type,
    titre:
      niveau === "critique"
        ? `Rupture imminente — ${labelProduit(a.produit_id)}`
        : `Stock bas — ${labelProduit(a.produit_id)}`,
    message: `${labelDepot(a.depot_id)} : stock à ${a.stock_fin_jour?.toLocaleString("fr-FR")} (seuil ${a.seuil_alerte?.toLocaleString("fr-FR")}), couverture estimée ${a.jours_couverture} jour(s).`,
    statut: i % 5 === 0 ? "en_traitement" : i % 7 === 0 ? "ignoree" : "ouverte",
    priorite: niveau === "critique" ? 1 : 2,
    assignee: i % 3 === 0 ? "achats" : i % 3 === 1 ? "depot" : null,
    created_at: `${a.date}T08:${String(10 + i).padStart(2, "0")}:00`,
    updated_at: `${a.date}T14:${String(20 + i).padStart(2, "0")}:00`,
    conso_jour: Math.round((a.seuil_alerte || 50000) * 0.11),
    delai_fournisseur: 4 + (i % 3),
    actions_disponibles: [
      "generer_commande",
      "transferer_depot",
      "escalader",
      "ignorer",
      "marquer_traitee",
    ],
    suggestion: null, // filled below
  };
}).map((a) => ({ ...a, suggestion: suggestionPourAlerte(a) }));

/** Matrice prévisionnelle multi dépôt×produit (style tous_resumés) */
export const mockPrevisionsResume = mockRuptures.map((r, i) => {
  const frn = mockMetas.fournisseurs[i % mockMetas.fournisseurs.length];
  const qte = Math.max(
    0,
    Math.round(r.conso_jour * 5 + r.conso_jour * 3 - r.stock_actuel)
  );
  return {
    id: `PREV-${r.depot_id}-${r.produit_id}`,
    depot_id: r.depot_id,
    produit_id: r.produit_id,
    stock_actuel: r.stock_actuel,
    conso_jour: r.conso_jour,
    jours_avant_rupture: r.jours_avant_rupture,
    niveau: r.niveau,
    tendance: r.jours_avant_rupture < 5 ? "baisse_rapide" : r.jours_avant_rupture < 10 ? "baisse" : "stable",
    confiance_modele_pct: 88 - (i % 5) * 3,
    mape: 3.8 + (i % 4) * 0.7,
    mae: 900 + i * 180,
    quantite_suggeree: qte,
    fournisseur_recommande: frn.id,
    fournisseur_score: frn.score,
    cout_estime_fcfa: qte * 360,
    saisonnalite: i % 2 === 0 ? "haute" : "normale",
    risque_peremption: false,
    opportunite_achat: r.niveau === "critique",
    derniere_maj: "2026-07-17T06:00:00",
  };
});

/** File d'actions prioritaires pour le dashboard */
export const mockActionsPrioritaires = [
  {
    id: "ACT-01",
    type: "commande_urgente",
    titre: "Commander Gasoil Premium — Terminal Portuaire",
    detail: "Couverture 3 jours. Suggestion IA : 87 000 L via TotalEnergies (score 0,91).",
    priorite: 1,
    lien: "/previsions?depot=D002&produit=PRD003",
    action_label: "Créer la commande",
    action_href: "/commandes/nouvelle?depot=D002&produit=PRD003&qte=87000",
  },
  {
    id: "ACT-02",
    type: "alerte_critique",
    titre: "4 alertes critiques non traitées",
    detail: "Dapaong, Atakpamé, Terminal Portuaire, Lomé Central — GPL.",
    priorite: 1,
    lien: "/stocks/alertes?niveau=critique",
    action_label: "Ouvrir le centre d'alertes",
    action_href: "/stocks/alertes?niveau=critique",
  },
  {
    id: "ACT-03",
    type: "incident",
    titre: "Fuite détectée — Tsévié (Critique)",
    detail: "INC1004 ouvert depuis le 11/07. Coût estimé 4 500 $. Arrêt 12 h.",
    priorite: 1,
    lien: "/incidents",
    action_label: "Voir l'incident",
    action_href: "/incidents",
  },
  {
    id: "ACT-04",
    type: "commande_retard",
    titre: "BC24006 en retard de 4 jours",
    detail: "MRS Oil → Dapaong · Super Sans Plomb · 15 000 L (12 000 livrés).",
    priorite: 2,
    lien: "/commandes",
    action_label: "Suivre la commande",
    action_href: "/commandes",
  },
  {
    id: "ACT-05",
    type: "anomalie",
    titre: "Anomalie score 0,94 — Sokodé / Gasoil",
    detail: "Pic de sorties un dimanche. Vérification inventaire recommandée.",
    priorite: 2,
    lien: "/anomalies",
    action_label: "Analyser",
    action_href: "/anomalies",
  },
  {
    id: "ACT-06",
    type: "transfert",
    titre: "Transfert possible Lomé Central → Terminal",
    detail: "Excédent relatif à Lomé pourrait couvrir 1,5 j au Terminal Portuaire.",
    priorite: 3,
    lien: "/stocks",
    action_label: "Voir les stocks",
    action_href: "/stocks?depot=D001",
  },
];

export const mockMatriceDepots = mockMetas.depots.map((d, i) => {
  const alertes = mockAlertes.filter((a) => a.depot_id === d.id && a.statut === "ouverte");
  const critiques = alertes.filter((a) => a.niveau === "critique").length;
  const ruptures = mockRuptures.filter((r) => r.depot_id === d.id);
  const minJours = ruptures.length
    ? Math.min(...ruptures.map((r) => r.jours_avant_rupture))
    : 15;
  return {
    ...d,
    taux_remplissage: critiques ? 38 + i : alertes.length ? 55 + i * 2 : 82 + (i % 5),
    alertes_ouvertes: alertes.length,
    alertes_critiques: critiques,
    produits_sous_seuil: alertes.length,
    jours_min_couverture: minJours,
    valeur_stock_usd: Math.round(d.capacite * 0.75 * 0.42),
    derniere_maj: "2026-07-17T05:45:00",
    statut: critiques ? "critique" : alertes.length ? "attention" : "normal",
  };
});

/** Journal d'activité opérationnelle */
export const mockJournal = [
  { heure: "05:42", type: "alerte", texte: "Seuil franchi — Dapaong / Super Sans Plomb" },
  { heure: "05:38", type: "ia", texte: "Modèle Prophet recalculé — MAPE moyen 4,6 %" },
  { heure: "05:15", type: "commande", texte: "BC24005 passée en « En attente » — Sokodé" },
  { heure: "04:50", type: "incident", texte: "INC1004 mis à jour — intervention en cours Tsévié" },
  { heure: "04:20", type: "stock", texte: "Réception 12 000 L — BC24006 partielle Dapaong" },
  { heure: "03:55", type: "anomalie", texte: "Isolation Forest — score 0,94 Sokodé/Gasoil" },
  { heure: "02:10", type: "ia", texte: "Suggestion auto générée pour Terminal Portuaire / Premium" },
];
