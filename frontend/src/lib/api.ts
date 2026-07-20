/**
 * Client API centralisé pour communiquer avec le backend FastAPI PetroStock.
 * Tous les appels backend passent par ce fichier.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function requete<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const reponse = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!reponse.ok) {
    const corps = await reponse.json().catch(() => ({}));
    throw new Error(
      corps.detail || `Erreur HTTP ${reponse.status} sur ${endpoint}`
    );
  }

  return reponse.json();
}

// ===== KPI =====
export interface KpiData {
  valeur_totale_stock_usd: number;
  nombre_alertes_actives: number;
  taux_remplissage_moyen_pct: number;
  incidents_ouverts: number;
}

export async function getKpi(): Promise<KpiData> {
  return requete<KpiData>("/kpi/");
}

// ===== Stocks =====
export interface StockData {
  date: string;
  depot_id: string;
  produit_id: string;
  stock_debut_jour: number;
  entrees: number;
  sorties: number;
  stock_fin_jour: number;
  taux_remplissage_pct: number;
  alerte_stock_bas: boolean;
  anomalie_detectee: boolean;
}

export async function getStocks(
  depotId?: string,
  produitId?: string
): Promise<StockData[]> {
  const params = new URLSearchParams();
  if (depotId) params.set("depot_id", depotId);
  if (produitId) params.set("produit_id", produitId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return requete<StockData[]>(`/stocks/${query}`);
}

export async function getStocksAlerte(): Promise<StockData[]> {
  return requete<StockData[]>("/stocks/alertes/");
}

export async function getStockDepot(
  depotId: string,
  dateDebut?: string,
  dateFin?: string
): Promise<StockData[]> {
  const params = new URLSearchParams();
  if (dateDebut) params.set("date_debut", dateDebut);
  if (dateFin) params.set("date_fin", dateFin);
  const query = params.toString() ? `?${params.toString()}` : "";
  return requete<StockData[]>(`/stocks/${depotId}${query}`);
}

// ===== Commandes =====
export interface BonCommande {
  bon_commande_id: string;
  date_commande: string;
  fournisseur_id: string;
  depot_destination_id: string;
  produit_id: string;
  quantite_commandee: number;
  statut: string;
}

export interface CreerCommandeData {
  date_commande: string;
  fournisseur_id: string;
  depot_destination_id: string;
  produit_id: string;
  quantite_commandee: number;
}

export async function getCommandes(): Promise<BonCommande[]> {
  return requete<BonCommande[]>("/commandes/");
}

export async function creerCommande(
  commande: CreerCommandeData
): Promise<BonCommande> {
  return requete<BonCommande>("/commandes/", {
    method: "POST",
    body: JSON.stringify(commande),
  });
}

// ===== Incidents =====
export interface IncidentData {
  incident_id: string;
  date_incident: string;
  depot_id: string;
  type_incident: string;
  gravite?: string;
  description?: string;
  statut: string;
}

export interface CreerIncidentData {
  date_incident: string;
  depot_id: string;
  type_incident: string;
  gravite?: string;
  description?: string;
}

export async function getIncidents(): Promise<IncidentData[]> {
  return requete<IncidentData[]>("/incidents/");
}

export async function creerIncident(
  incident: CreerIncidentData
): Promise<IncidentData> {
  return requete<IncidentData>("/incidents/", {
    method: "POST",
    body: JSON.stringify(incident),
  });
}

// ===== Factures =====
export interface FactureData {
  facture_id: string;
  date_facture: string;
  client_id: string;
  depot_source_id: string;
  produit_id: string;
  quantite_vendue: number;
  montant_ttc: number;
  statut_paiement: string;
  mode_paiement?: string;
}

export async function getFactures(
  statutPaiement?: string,
  clientId?: string
): Promise<FactureData[]> {
  const params = new URLSearchParams();
  if (statutPaiement) params.set("statut_paiement", statutPaiement);
  if (clientId) params.set("client_id", clientId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return requete<FactureData[]>(`/factures/${query}`);
}

// ===== Anomalies =====
export interface DetectionAnomalie {
  stock_fin_jour: number;
  entrees: number;
  sorties: number;
  taux_remplissage_pct: number;
}

export interface ResultatDetection {
  anomalie: boolean;
  score: number;
}

export async function getAnomalies(): Promise<StockData[]> {
  return requete<StockData[]>("/anomalies/");
}

export async function detecterAnomalie(
  observation: DetectionAnomalie
): Promise<ResultatDetection> {
  return requete<ResultatDetection>("/anomalies/detecter", {
    method: "POST",
    body: JSON.stringify(observation),
  });
}

// ===== Ruptures =====
export interface EstimationRupture {
  depot_id: string;
  produit_id: string;
  jours_couverture_estimes: number;
  niveau_alerte: string;
}

export async function estimerRupture(
  depotId: string,
  produitId: string
): Promise<EstimationRupture> {
  return requete<EstimationRupture>(
    `/ruptures/${depotId}?produit_id=${produitId}`
  );
}

// ===== Prévisions =====
export interface PrevisionData {
  depot_id: string;
  produit_id: string;
  prevision: number[];
}

export async function getPrevision(
  produitId: string,
  depotId: string,
  horizonJours: number = 30
): Promise<PrevisionData> {
  return requete<PrevisionData>(
    `/previsions/${produitId}?depot_id=${depotId}&horizon_jours=${horizonJours}`
  );
}