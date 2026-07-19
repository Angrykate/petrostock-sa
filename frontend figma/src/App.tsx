import { useEffect, useState } from 'react'
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
import { DEMO_USERS, ROLE_PAGES, STOCKS, getStockAlert } from './data'
import { loadSession, saveSession } from './lib/storage'

const ALERT_COUNT = STOCKS.filter(s => getStockAlert(s) !== 'ok').length

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

function PageRouter({ page, user }: { page: Page; user: AuthUser }) {
  const allowed = ROLE_PAGES[user.role].includes(page)
  if (!allowed) return <AccessDenied />

  switch (page) {
    case 'dashboard':    return <Dashboard user={user} />
    case 'stocks':       return <Stocks user={user} />
    case 'commandes':    return <Commandes user={user} />
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

  useEffect(() => {
    const session = loadSession()
    if (session.user) {
      setUser(session.user as AuthUser)
      setCurrentPage((session.currentPage as Page) ?? 'dashboard')
    }
  }, [])

  useEffect(() => {
    if (!user) {
      saveSession({ user: null, currentPage: 'dashboard' })
      return
    }
    saveSession({ user, currentPage })
  }, [user, currentPage])

  function handleLogin(role: Role) {
    setUser(DEMO_USERS[role])
    setCurrentPage('dashboard')
  }

  function handleLogout() {
    setUser(null)
    setCurrentPage('dashboard')
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <Layout
      user={user}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
      alertCount={ALERT_COUNT}>
      <PageRouter page={currentPage} user={user} />
    </Layout>
  )
}
