/**
 * Couche de stockage hybride : API d'abord, localStorage en fallback.
 * Toutes les pages utilisent ces fonctions, donc une modification ici
 * connecte tout le frontend au backend.
 */
import type { Incident, Order, Role, SystemUser, StockEntry } from '../data'
import { INCIDENTS, ORDERS, STOCKS, SYSTEM_USERS } from '../data'
import * as api from './api'

export interface SessionState {
  user: {
    id: string
    name: string
    email: string
    role: Role
    depotId?: string
    avatar: string
  } | null
  currentPage: string
}

export interface AuthCredential {
  name: string
  email: string
  password: string
  role: Role
  depotId?: string
  active?: boolean
}

// Flag pour savoir si le backend est disponible
let _backendOk: boolean | null = null

async function checkBackend(): Promise<boolean> {
  if (_backendOk !== null) return _backendOk
  try {
    const resp = await fetch(`${api.API_BASE}/`)
    _backendOk = resp.ok
    return _backendOk
  } catch {
    _backendOk = false
    return false
  }
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event('petrostock-storage-update'))
}

// Cache pour éviter les appels API répétés
let _stocksCache: StockEntry[] | null = null
let _ordersCache: Order[] | null = null
let _incidentsCache: Incident[] | null = null

// ===== Stocks =====
export async function loadStocksAsync(): Promise<StockEntry[]> {
  if (_stocksCache) return _stocksCache
  try {
    if (await checkBackend()) {
      const data = await api.getStocks()
      _stocksCache = data.map(s => ({
        depotId: s.depot_id,
        productId: s.produit_id,
        current: s.stock_fin_jour,
        capacity: s.taux_remplissage_pct > 0
          ? Math.round(s.stock_fin_jour / (s.taux_remplissage_pct / 100) * 100) / 100
          : 1000000,
        alertThreshold: s.stock_fin_jour * 0.15,
        lastUpdate: s.date,
        daysToStockout: s.alerte_stock_bas ? 5 : null,
      }))
      return _stocksCache!
    }
  } catch {
    // Fallback
  }
  return loadStocks()
}

export function loadStocks(): StockEntry[] {
  return readStorage<StockEntry[]>('petrostock.stocks', STOCKS)
}

export function saveStocks(stocks: StockEntry[]) {
  _stocksCache = stocks
  writeStorage('petrostock.stocks', stocks)
}

// ===== Commandes =====
export async function loadOrdersAsync(): Promise<Order[]> {
  if (_ordersCache) return _ordersCache
  try {
    if (await checkBackend()) {
      const data = await api.getCommandes()
      _ordersCache = data.map(c => ({
        id: c.bon_commande_id,
        ref: c.bon_commande_id,
        productId: c.produit_id,
        depotId: c.depot_destination_id,
        supplierId: c.fournisseur_id,
        quantity: c.quantite_commandee,
        status: (c.statut === 'Livré' ? 'livree' :
                c.statut === 'En transit' ? 'en_transit' :
                c.statut === 'Envoyée' ? 'envoyee' :
                c.statut === 'Approuvée' ? 'approuvee' : 'brouillon') as Order['status'],
        createdAt: c.date_commande,
        expectedAt: c.date_commande,
        createdBy: '',
        amountFCFA: 0,
      }))
      return _ordersCache!
    }
  } catch {
    // Fallback
  }
  return loadOrders()
}

export function loadOrders(): Order[] {
  return readStorage<Order[]>('petrostock.orders', ORDERS)
}

export function saveOrders(orders: Order[], silent: boolean = false) {
  _ordersCache = orders
  if (typeof window === 'undefined') return
  window.localStorage.setItem('petrostock.orders', JSON.stringify(orders))
  if (!silent) {
    window.dispatchEvent(new Event('petrostock-storage-update'))
  }
}

/** Crée une commande via l'API et met à jour le cache local */
export async function createOrderViaApi(data: api.CreerCommandeData): Promise<Order | null> {
  try {
    if (await checkBackend()) {
      const result = await api.creerCommande(data)
      const order: Order = {
        id: result.bon_commande_id,
        ref: result.bon_commande_id,
        productId: result.produit_id,
        depotId: result.depot_destination_id,
        supplierId: result.fournisseur_id,
        quantity: result.quantite_commandee,
        status: 'brouillon',
        createdAt: result.date_commande,
        expectedAt: result.date_commande,
        createdBy: 'API',
        amountFCFA: 0,
      }
      _ordersCache = null // Invalide le cache
      return order
    }
  } catch { /* fallback */ }
  return null
}

// ===== Incidents =====
export async function loadIncidentsAsync(): Promise<Incident[]> {
  if (_incidentsCache) return _incidentsCache
  try {
    if (await checkBackend()) {
      const data = await api.getIncidents()
      _incidentsCache = data.map(i => ({
        id: i.incident_id,
        ref: i.incident_id,
        depotId: i.depot_id,
        type: i.type_incident,
        severity: (i.gravite?.toLowerCase() || 'modere') as Incident['severity'],
        description: i.description || '',
        date: i.date_incident,
        costFCFA: 0,
        status: (i.statut === 'Ouvert' ? 'ouvert' :
                i.statut === 'En cours' ? 'en_cours' : 'resolu') as Incident['status'],
      }))
      return _incidentsCache!
    }
  } catch {
    // Fallback
  }
  return loadIncidents()
}

export function loadIncidents(): Incident[] {
  return readStorage<Incident[]>('petrostock.incidents', INCIDENTS)
}

export function saveIncidents(incidents: Incident[]) {
  _incidentsCache = incidents
  writeStorage('petrostock.incidents', incidents)
}

/** Déclare un incident via l'API et met à jour le cache local */
export async function createIncidentViaApi(data: api.CreerIncidentData): Promise<Incident | null> {
  try {
    if (await checkBackend()) {
      const result = await api.creerIncident(data)
      const incident: Incident = {
        id: result.incident_id,
        ref: result.incident_id,
        depotId: result.depot_id,
        type: result.type_incident,
        severity: (result.gravite?.toLowerCase() || 'modere') as Incident['severity'],
        description: result.description || '',
        date: result.date_incident,
        costFCFA: 0,
        status: 'ouvert',
      }
      _incidentsCache = null // Invalide le cache
      return incident
    }
  } catch { /* fallback */ }
  return null
}

// ===== Factures =====
export async function getFacturesAsync() {
  try {
    if (await checkBackend()) {
      return await api.getFactures()
    }
  } catch { /* fallback */ }
  return null
}

// ===== KPI =====
export async function getKpiAsync() {
  try {
    if (await checkBackend()) {
      return await api.getKpi()
    }
  } catch { /* fallback */ }
  return null
}

// ===== Anomalies =====
export async function detecterAnomalieViaApi(observation: api.DetectionAnomalie) {
  try {
    if (await checkBackend()) {
      return await api.detecterAnomalie(observation)
    }
  } catch { /* fallback */ }
  return null
}

// ===== Ruptures =====
export async function estimerRuptureViaApi(depotId: string, produitId: string) {
  try {
    if (await checkBackend()) {
      return await api.estimerRupture(depotId, produitId)
    }
  } catch { /* fallback */ }
  return null
}

// ===== Prévisions =====
export async function getPrevisionViaApi(produitId: string, depotId: string, horizonJours = 30) {
  try {
    if (await checkBackend()) {
      return await api.getPrevision(produitId, depotId, horizonJours)
    }
  } catch { /* fallback */ }
  return null
}

// ===== Utilisateurs (pas d'API pour ça, reste en localStorage) =====
export function loadUsers(): SystemUser[] {
  return readStorage<SystemUser[]>('petrostock.users', SYSTEM_USERS)
}

export function saveUsers(users: SystemUser[]) {
  writeStorage('petrostock.users', users)
}

export function loadAuthUsers(): AuthCredential[] {
  return readStorage<AuthCredential[]>('petrostock.auth-users', [])
}

export function saveAuthUsers(users: AuthCredential[]) {
  writeStorage('petrostock.auth-users', users)
}

export interface AuditLogEntry {
  ts: string
  user: string
  action: string
  target: string
  level: 'INFO' | 'WARN' | 'ERROR'
}

export function loadAuditLog(): AuditLogEntry[] {
  return readStorage<AuditLogEntry[]>('petrostock.audit-log', [])
}

export function saveAuditLog(entries: AuditLogEntry[]) {
  writeStorage('petrostock.audit-log', entries)
}

export function loadSession(): SessionState {
  return readStorage<SessionState>('petrostock.session', { user: null, currentPage: 'dashboard' })
}

export function saveSession(session: SessionState) {
  writeStorage('petrostock.session', session)
}

export function loadDismissedNotifications(): string[] {
  return readStorage<string[]>('petrostock.dismissed-notifications', [])
}

export function saveDismissedNotifications(ids: string[]) {
  writeStorage('petrostock.dismissed-notifications', ids)
}