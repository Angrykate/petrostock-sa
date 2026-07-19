import type { Incident, Order, Role, SystemUser } from '../data'
import { INCIDENTS, ORDERS, SYSTEM_USERS } from '../data'

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
}

export function loadOrders(): Order[] {
  return readStorage<Order[]>('petrostock.orders', ORDERS)
}

export function saveOrders(orders: Order[]) {
  writeStorage('petrostock.orders', orders)
}

export function loadIncidents(): Incident[] {
  return readStorage<Incident[]>('petrostock.incidents', INCIDENTS)
}

export function saveIncidents(incidents: Incident[]) {
  writeStorage('petrostock.incidents', incidents)
}

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
