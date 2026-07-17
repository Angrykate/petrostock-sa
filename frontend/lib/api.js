import {
  mockAlertes,
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
} from "./mockData";

const MODE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function clone(donnees) {
  return JSON.parse(JSON.stringify(donnees));
}

function creerCommande(donnees) {
  const nouvelle = {
    bon_commande_id: `BC${24000 + mockCommandes.length + 1}`,
    date_commande: donnees.date_commande,
    fournisseur_id: donnees.fournisseur_id,
    depot_destination_id: donnees.depot_destination_id,
    produit_id: donnees.produit_id,
    quantite_commandee: Number(donnees.quantite_commandee),
    quantite_livree: 0,
    statut: "Validée",
    montant_total: Number(donnees.quantite_commandee) * 360,
    retard_jours: 0,
  };
  mockCommandes.unshift(nouvelle);
  return clone(nouvelle);
}

function creerIncident(donnees) {
  const gravites = ["Faible", "Modéré", "Élevé", "Critique"];
  const gravite = gravites[Math.min(3, Math.floor(Math.random() * 4))];
  const nouvel = {
    incident_id: `INC${1000 + mockIncidents.length + 1}`,
    date_incident: donnees.date_incident,
    depot_id: donnees.depot_id,
    produit_id: donnees.produit_id || null,
    type_incident: donnees.type_incident,
    description: donnees.description,
    gravite,
    statut: "Ouvert",
    cout_usd: 0,
    duree_arret_h: 0,
  };
  mockIncidents.unshift(nouvel);
  return clone(nouvel);
}

function detecterAnomalie(body) {
  const score = Math.min(
    0.99,
    Math.abs(Number(body.sorties) - Number(body.entrees)) / Math.max(Number(body.stock_fin_jour), 1) +
      (Number(body.taux_remplissage_pct) < 40 ? 0.3 : 0)
  );
  return {
    anomalie_detectee: score > 0.45,
    score_suspicion: Math.round(score * 100) / 100,
    niveau: score > 0.7 ? "critique" : score > 0.45 ? "attention" : "normal",
  };
}

async function appelApi(endpoint, options = {}) {
  if (MODE_MOCK) {
    await new Promise((r) => setTimeout(r, 80));
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;
    const path = endpoint.split("?")[0];

    if (path === "/kpi/") return clone(mockKpi);
    if (path === "/stocks/alertes/") return clone(mockAlertes);
    if (path === "/stocks/") return clone(mockStocks.D001);
    if (path.startsWith("/stocks/")) {
      const depotId = path.split("/").filter(Boolean)[1];
      return clone(mockStocks[depotId] || []);
    }
    if (path.startsWith("/previsions/")) {
      const produitId = path.split("/").filter(Boolean)[1];
      return clone(mockPrevisions[produitId] || mockPrevisions.PRD003);
    }
    if (path.startsWith("/ruptures/")) {
      const depotId = path.split("/").filter(Boolean)[1];
      const params = new URLSearchParams(endpoint.split("?")[1] || "");
      const produitId = params.get("produit_id");
      const liste = mockRuptures.filter((r) => r.depot_id === depotId && (!produitId || r.produit_id === produitId));
      return clone(liste[0] || mockRuptures[0]);
    }
    if (path === "/ruptures/") return clone(mockRuptures);
    if (path === "/anomalies/") return clone(mockAnomalies);
    if (path === "/anomalies/detecter" && method === "POST") return detecterAnomalie(body);
    if (path === "/commandes/" && method === "GET") return clone(mockCommandes);
    if (path === "/commandes/" && method === "POST") return creerCommande(body);
    if (path === "/fournisseurs/") return clone(mockMetas.fournisseurs);
    if (path === "/incidents/" && method === "GET") return clone(mockIncidents);
    if (path === "/incidents/" && method === "POST") return creerIncident(body);
    if (path === "/factures/") return clone(mockFactures);
    if (path === "/finances/ca-mensuel/") return clone(mockCaMensuel);
    if (path === "/metas/") return clone(mockMetas);

    throw new Error(`Endpoint mock non défini: ${endpoint}`);
  }

  const reponse = await fetch(`${API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!reponse.ok) {
    throw new Error(`Erreur API ${reponse.status} sur ${endpoint}`);
  }

  return reponse.json();
}

export const api = {
  get: (endpoint) => appelApi(endpoint),
  post: (endpoint, donnees) =>
    appelApi(endpoint, { method: "POST", body: JSON.stringify(donnees) }),
};

export const isMockMode = MODE_MOCK;
