import { useEffect, useMemo, useState } from 'react'
import Login from './Login'
import Layout from './Layout'
import Dashboard from './Dashboard'
import Stocks from './pages/Stocks'
import Commandes from './pages/Commandes'
import Incidents from './pages/Incidents'
import Previsions from './pages/Previsions'
import Fournisseurs from './pages/Fournisseurs'
import Ventes from './pages/Ventes'
import Administration from './pages/Administration'
import { Lock } from 'lucide-react'
import type { AuthUser, Page, Role } from './data'
import { ROLE_PAGES, getDepotName, getProductName, getStockAlert } from './data'
import { loadSession, saveSession, loadStocks, loadOrders, loadIncidents, loadDismissedNotifications, saveDismissedNotifications } from './lib/storage'

interface AppNotification {
  id: string
  title: string
  subtitle: string
  badge: string
  timestamp: string
  severity: 'critical' | 'warning' | 'info' | 'normal'
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(229,62,62,0.1)', border: '1px solid rgba(229,62,62,0.2)' }}>
        <Lock size={28} style={{ color: '#e53e3e' }} />
      </div>
      <div className="text-center">
        <div className="font-display text-2xl font-bold text-white mb-2" style={{ letterSpacing: '0.06em' }}>
          ACCÈS REFUSÉ
        </div>
        <div className="font-mono text-sm" style={{ color: '#4a5568' }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </div>
      </div>
    </div>
  )
}

function PageRouter({ page, user, orderDraft, clearDraft }: { page: Page; user: AuthUser; orderDraft?: any | null; clearDraft?: () => void }) {
  const allowed = ROLE_PAGES[user.role].includes(page)
  if (!allowed) return <AccessDenied />

  switch (page) {
    case 'dashboard':    return <Dashboard user={user} />
    case 'stocks':       return <Stocks user={user} />
    case 'commandes':    return <Commandes user={user} draft={orderDraft} onClearDraft={clearDraft} />
    case 'incidents':    return <Incidents user={user} />
    case 'previsions':   return <Previsions />
    case 'fournisseurs': return <Fournisseurs />
    case 'ventes':       return <Ventes />
    case 'administration': return <Administration />
    default:             return <Dashboard user={user} />
  }
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [stocks, setStocks] = useState(() => loadStocks())
  const [orders, setOrders] = useState(() => loadOrders())
  const [incidents, setIncidents] = useState(() => loadIncidents())
  const [dismissed, setDismissed] = useState<string[]>(() => loadDismissedNotifications())
  const [orderDraft, setOrderDraft] = useState<any | null>(null)

  useEffect(() => {
    const handler = () => {
      setStocks(loadStocks())
      setOrders(loadOrders())
      setIncidents(loadIncidents())
      setDismissed(loadDismissedNotifications())
    }
    window.addEventListener('petrostock-storage-update', handler)
    const ev = (e: Event) => {
      try {
        // support programmatic create-order events: CustomEvent with detail { type: 'create-order', payload }
        const ce = e as CustomEvent
        if (ce?.detail?.type === 'create-order') {
          setOrderDraft(ce.detail.payload)
          setCurrentPage('commandes')
        }
      } catch (err) {
        // ignore
      }
    }
    window.addEventListener('petrostock-create-order', ev as EventListener)
    return () => window.removeEventListener('petrostock-storage-update', handler)
  }, [])

  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = []
    const stockAlerts = stocks.filter(s => getStockAlert(s) !== 'ok')

    stockAlerts.forEach(s => {
      const alert = getStockAlert(s)
      list.push({
        id: `stock-${s.depotId}-${s.productId}`,
        title: `${getProductName(s.productId)} — ${getDepotName(s.depotId)}`,
        subtitle: alert === 'critical'
          ? `Rupture estimée J+${s.daysToStockout}`
          : `Alerte ${alert}`,
        badge: alert === 'critical' ? 'CRITIQUE' : 'ALERTE',
        timestamp: s.lastUpdate,
        severity: alert === 'critical' ? 'critical' : 'warning',
      })
    })

    incidents.filter(i => i.status !== 'resolu').forEach(i => {
        list.push({
          id: `incident-${i.id}`,
          title: `${i.ref} · ${i.type}`,
          subtitle: `${getDepotName(i.depotId)} — ${i.status}`,
          badge: 'INCIDENT',
          timestamp: i.date,
          severity: i.severity === 'critique' ? 'critical' : 'warning',
        })
      })

    if (user && ['achat', 'direction', 'admin'].includes(user.role)) {
      orders.filter(o => ['envoyee', 'approuvee', 'en_transit'].includes(o.status)).forEach(o => {
        list.push({
          id: `order-${o.id}`,
          title: `${o.ref} · ${getProductName(o.productId)}`,
          subtitle: `${getDepotName(o.depotId)} — ${o.status}`,
          badge: 'COMMANDE',
          timestamp: o.expectedAt,
          severity: 'info',
        })
      })
    }

    // remove dismissed
    const filtered = list.filter(n => !dismissed.includes(n.id))
    return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  }, [user, stocks, orders, incidents, dismissed])
  

  useEffect(() => {
    setUnreadCount(notifications.length)
  }, [notifications.length])

  useEffect(() => {
    const session = loadSession()
    if (session.user) {
      const user = session.user as AuthUser
      setUser(user)
      const page = (session.currentPage as Page) ?? 'dashboard'
      setCurrentPage(ROLE_PAGES[user.role].includes(page) ? page : 'dashboard')
    }
  }, [])

  useEffect(() => {
    if (!user) {
      saveSession({ user: null, currentPage: 'dashboard' })
      return
    }
    saveSession({ user, currentPage })
  }, [user, currentPage])

  function handleToggleNotifications() {
    setNotificationsOpen(open => {
      const next = !open
      if (next) setUnreadCount(0)
      return next
    })
  }

  function handleLogin(user: AuthUser) {
    setUser(user)
    setCurrentPage('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setCurrentPage('dashboard')
  }

  function handleDismissNotification(id: string) {
    const next = Array.from(new Set([...dismissed, id]))
    setDismissed(next)
    saveDismissedNotifications(next)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <Layout
      user={user}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      alertCount={unreadCount}
      notifications={notifications}
      notificationsOpen={notificationsOpen}
      onToggleNotifications={handleToggleNotifications}
      onDismissNotification={handleDismissNotification}>
      <PageRouter page={currentPage} user={user} orderDraft={orderDraft} clearDraft={() => setOrderDraft(null)} />
    </Layout>
  )
}
