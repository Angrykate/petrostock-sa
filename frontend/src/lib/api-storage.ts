/**
 * Couche hybride : essaie d'abord les données de l'API,
 * puis tombe sur les données mockées du localStorage si le backend est indisponible.
 */
import { loadStocks, loadOrders, loadIncidents, saveStocks, saveOrders, saveIncidents } from './storage'
import type { StockEntry, Order, Incident, KpiData } from '../data'
import * as api from './api'

// Flag : true si le backend a répondu avec succès
let backendDisponible = false

export function isBackendDisponible(): boolean {
  return backendDisponible
}

export async function detecterBackend(): Promise<boolean> {
  try {
    const response = await fetch(`${api.API_BASE}/`)
    backendDisponible = response.ok
    return backendDisponible
  } catch {
    backendDisponible = false
    return false
  }
}

// ===== KPI =====
export async function getKpiDonnees(): Promise<{
  valeur_totale_stock_usd: number
  nombre_alertes_actives: number
  taux_remplissage_moyen_pct: number
  incidents_ouverts: number
}> {
  try {
    return await api.getKpi()
  } catch {
    // Fallback : calculer depuis les données mockées
    const stocks = loadStocks()
    const incidents = loadIncidents()
    const totalStock = stocks.reduce((a, s) => a + s.current, 0) * 530 // prix moyen
    const alertes = stocks.filter(s => s.current <= s.alertThreshold).length
    const tauxMoyen = stocks.reduce((a, s) => a + (s.current / s.capacity) * 100, 0) / Math.max(stocks.length, 1)
    return {
      valeur_totale_stock_usd: totalStock,
      nombre_alertes_actives: alertes,
      taux_remplissage_moyen_pct: Math.round(tauxMoyen * 100) / 100,
      incidents_ouverts: incidents.filter(i => i.status !== 'resolu').length,
    }
  }
}

// ===== Stocks =====
export async function getStocksDonnees(): Promise<StockEntry[]> {
  try {
    const data = await api.getStocks()
    // Transformation du format API vers format frontend
    return data.map(s => ({
      depotId: s.depot_id,
      productId: s.produit_id,
      current: s.stock_fin_jour,
      capacity: s.stock_fin_jour / (s.taux_remplissage_pct / 100) || 1000000,
      alertThreshold: s.stock_fin_jour * 0.15,
      lastUpdate: s.date,
      daysToStockout: s.alerte_stock_bas ? 5 : null,
    }))
  } catch {
    return loadStocks()
  }
}

// ===== Commandes =====
export async function getCommandesDonnees(): Promise<Order[]> {
  try {
    const data = await api.getCommandes()
    return data.map(c => ({
      id: c.bon_commande_id,
      ref: c.bon_commande_id,
      productId: c.produit_id,
      depotId: c.depot_destination_id,
      supplierId: c.fournisseur_id,
      quantity: c.quantite_commandee,
      status: c.statut.toLowerCase() as Order['status'],
      createdAt: c.date_commande,
      expectedAt: c.date_commande,
      createdBy: '',
      amountFCFA: 0,
    }))
  } catch {
    return loadOrders()
  }
}

export async function creerCommandeApi(donnees: api.CreerCommandeData): Promise<Order | null> {
  try {
    const result = await api.creerCommande(donnees)
    return {
      id: result.bon_commande_id,
      ref: result.bon_commande_id,
      productId: result.produit_id,
      depotId: result.depot_destination_id,
      supplierId: result.fournisseur_id,
      quantity: result.quantite_commandee,
      status: result.statut.toLowerCase() as Order['status'],
      createdAt: result.date_commande,
      expectedAt: result.date_commande,
      createdBy: '',
      amountFCFA: 0,
    }
  } catch {
    return null
  }
}

// ===== Incidents =====
export async function getIncidentsDonnees(): Promise<Incident[]> {
  try {
    const data = await api.getIncidents()
    return data.map(i => ({
      id: i.incident_id,
      ref: i.incident_id,
      depotId: i.depot_id,
      type: i.type_incident,
      severity: (i.gravite?.toLowerCase() || 'modere') as Incident['severity'],
      description: i.description || '',
      date: i.date_incident,
      costFCFA: 0,
      status: i.statut.toLowerCase() as Incident['status'],
    }))
  } catch {
    return loadIncidents()
  }
}

export async function declarerIncidentApi(donnees: api.CreerIncidentData): Promise<Incident | null> {
  try {
    const result = await api.creerIncident(donnees)
    return {
      id: result.incident_id,
      ref: result.incident_id,
      depotId: result.depot_id,
      type: result.type_incident,
      severity: (result.gravite?.toLowerCase() || 'modere') as Incident['severity'],
      description: result.description || '',
      date: result.date_incident,
      costFCFA: 0,
      status: result.statut.toLowerCase() as Incident['status'],
    }
  } catch {
    return null
  }
}