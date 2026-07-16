import {
  mockAlertes,
  mockAnomalies,
  mockCommandes,
  mockFactures,
  mockIncidents,
  mockKpi,
  mockMetas,
  mockPrevisions,
  mockStocks,
} from "./mockData";

const MODE_MOCK = true;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function clone(donnees) {
  return JSON.parse(JSON.stringify(donnees));
}

function creerCommande(donnees) {
  const nouvelleCommande = {
    bon_commande_id: `BC${24000 + mockCommandes.length + 1}`,
    date_commande: donnees.date_commande,
    fournisseur_id: donnees.fournisseur_id,
    depot_destination_id: donnees.depot_destination_id,
    produit_id: donnees.produit_id,
    quantite_commandee: Number(donnees.quantite_commandee),
    statut: "Validée",
    montant_total: Number(donnees.quantite_commandee) * 360,
  };
  mockCommandes.unshift(nouvelleCommande);
  return clone(nouvelleCommande);
}

function creerIncident(donnees) {
  const nouvelIncident = {
    incident_id: `INC${1000 + mockIncidents.length + 1}`,
    date_incident: donnees.date_incident,
    depot_id: donnees.depot_id,
    type_incident: donnees.type_incident,
    description: donnees.description,
    gravite: "Modéré",
    statut: "Ouvert",
  };
  mockIncidents.unshift(nouvelIncident);
  return clone(nouvelIncident);
}

async function appelApi(endpoint, options = {}) {
  if (MODE_MOCK) {
    const method = (options.method || "GET").toUpperCase();
    const body = options.body ? JSON.parse(options.body) : null;

    if (endpoint === "/kpi/") return clone(mockKpi);
    if (endpoint === "/stocks/alertes/") return clone(mockAlertes);
    if (endpoint === "/stocks/") return clone(mockStocks.D001);
    if (endpoint.startsWith("/stocks/")) {
      const depotId = endpoint.split("/").filter(Boolean)[1];
      return clone(mockStocks[depotId] || []);
    }
    if (endpoint.startsWith("/previsions/")) {
      const produitId = endpoint.split("/").filter(Boolean)[1];
      return clone(mockPrevisions[produitId] || mockPrevisions.PRD003);
    }
    if (endpoint === "/anomalies/") return clone(mockAnomalies);
    if (endpoint === "/commandes/" && method === "GET") return clone(mockCommandes);
    if (endpoint === "/commandes/" && method === "POST") return creerCommande(body);
    if (endpoint === "/incidents/" && method === "GET") return clone(mockIncidents);
    if (endpoint === "/incidents/" && method === "POST") return creerIncident(body);
    if (endpoint === "/factures/") return clone(mockFactures);
    if (endpoint === "/metas/") return clone(mockMetas);

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
