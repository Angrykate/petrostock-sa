import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, AlertTriangle,
  TrendingUp, Truck, BarChart2, Settings, Flame, ChevronRight,
  Bell, LogOut, Menu, Lock
} from 'lucide-react'
import type { AuthUser, Page } from './data'
import { ROLE_LABELS, ROLE_COLORS, ROLE_PAGES, DEPOTS } from './data'

interface LayoutProps {
  user: AuthUser
  currentPage: Page
  onNavigate: (p: Page) => void
  onLogout: () => void
  children: React.ReactNode
  alertCount: number
  notifications: Array<{ id: string; title: string; subtitle: string; badge: string; timestamp: string; severity: string }>
  notificationsOpen: boolean
  onToggleNotifications: () => void
  onDismissNotification?: (id: string) => void
}

const PAGE_META: Record<Page, { label: string; icon: typeof LayoutDashboard }> = {
  dashboard:      { label: 'Tableau de bord', icon: LayoutDashboard },
  stocks:         { label: 'Stocks',           icon: Package },
  commandes:      { label: 'Commandes',        icon: ShoppingCart },
  incidents:      { label: 'Incidents',        icon: AlertTriangle },
  previsions:     { label: 'Prévisions IA',    icon: TrendingUp },
  fournisseurs:   { label: 'Fournisseurs',     icon: Truck },
  ventes:         { label: 'Ventes & Finance', icon: BarChart2 },
  administration: { label: 'Administration',   icon: Settings },
}

const ALL_PAGES: Page[] = ['dashboard','stocks','commandes','incidents','previsions','fournisseurs','ventes','administration']

export default function Layout({ user, currentPage, onNavigate, onLogout, children, alertCount, notifications, notificationsOpen, onToggleNotifications }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const allowedPages = ROLE_PAGES[user.role]
  const roleColor = ROLE_COLORS[user.role]
  const depot = user.depotId ? DEPOTS.find(d => d.id === user.depotId) : null

  const NavItem = ({ page }: { page: Page }) => {
    const { label, icon: Icon } = PAGE_META[page]
    const allowed = allowedPages.includes(page)
    const active = currentPage === page

    return (
      <button
        onClick={() => { if (allowed) { onNavigate(page); setMobileOpen(false) } }}
        title={collapsed ? label : undefined}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative"
        style={{
          background: active ? 'rgba(232,160,32,0.12)' : 'transparent',
          opacity: allowed ? 1 : 0.35,
          cursor: allowed ? 'pointer' : 'not-allowed',
        }}>
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
            style={{ background: '#e8a020' }} />
        )}
        <Icon size={18} style={{ color: active ? '#e8a020' : allowed ? '#94a3b8' : '#4a5568', flexShrink: 0 }} />
        {!collapsed && (
          <>
            <span className="text-sm font-medium flex-1 text-left truncate"
              style={{ color: active ? '#e8a020' : allowed ? '#cbd5e0' : '#4a5568' }}>
              {label}
            </span>
            {!allowed && <Lock size={11} style={{ color: '#4a5568', flexShrink: 0 }} />}
          </>
        )}
      </button>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #e8a020, #dd6b20)', boxShadow: '0 0 16px rgba(232,160,32,0.3)' }}>
          <Flame size={16} className="text-black" />
        </div>
        {!collapsed && (
          <span className="font-display text-lg font-bold tracking-widest text-white" style={{ letterSpacing: '0.12em' }}>
            PETROSTOCK
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {ALL_PAGES.filter(page => allowedPages.includes(page)).map(page => <NavItem key={page} page={page} />)}
      </nav>

      {/* User section */}
      <div className="px-2 pb-3 pt-2 border-t" style={{ borderColor: '#1c2540' }}>
        {!collapsed && (
          <div className="px-3 py-3 rounded-lg mb-2" style={{ background: '#0f1420' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 font-mono text-xs font-bold"
                style={{ background: roleColor + '20', color: roleColor }}>
                {user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate text-white">{user.name}</div>
                <div className="font-mono text-xs truncate" style={{ color: roleColor }}>
                  {ROLE_LABELS[user.role].toUpperCase()}
                </div>
                {depot && <div className="font-mono text-xs truncate" style={{ color: '#4a5568' }}>{depot.city}</div>}
              </div>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-red-900/20 group">
          <LogOut size={16} style={{ color: '#4a5568' }} />
          {!collapsed && <span className="text-sm" style={{ color: '#4a5568' }}>Déconnexion</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#060912' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 border-r transition-all duration-300"
        style={{ width: collapsed ? 64 : 240, background: '#0a0f1c', borderColor: '#1c2540' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col border-r"
            style={{ background: '#0a0f1c', borderColor: '#1c2540' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3 border-b shrink-0"
          style={{ background: '#0a0f1c', borderColor: '#1c2540', minHeight: 56 }}>
          <div className="flex items-center gap-3">
            <button onClick={() => collapsed ? setCollapsed(false) : setCollapsed(true)}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
              style={{ color: '#4a5568' }}>
              <Menu size={18} />
            </button>
            <button onClick={() => setMobileOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-white/5"
              style={{ color: '#4a5568' }}>
              <Menu size={18} />
            </button>
            <div>
              <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
                {PAGE_META[currentPage].label.toUpperCase()}
              </h2>
              {user.role === 'depot' && depot && (
                <div className="flex items-center gap-1 font-mono text-xs" style={{ color: '#4a5568' }}>
                  <span>{depot.name}</span>
                  <ChevronRight size={10} />
                  <span style={{ color: ROLE_COLORS[user.role] }}>{ROLE_LABELS[user.role]}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={onToggleNotifications} className="relative w-9 h-9 flex items-center justify-center rounded-lg border transition-colors hover:bg-white/5"
                style={{ borderColor: '#1c2540', color: '#718096' }}>
                <Bell size={17} />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-black text-[10px] font-bold flex items-center justify-center font-mono"
                    style={{ background: '#e53e3e' }}>
                    {alertCount > 9 ? '9+' : alertCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-[#090d15] shadow-2xl" style={{ borderColor: '#1c2540' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: '#1c2540' }}>
                    <div className="font-display text-sm font-bold text-white">Notifications</div>
                    <div className="font-mono text-xs" style={{ color: '#718096' }}>{alertCount} nouvel{alertCount > 1 ? 'les' : 'le'} élément{alertCount > 1 ? 's' : ''}</div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-5 text-sm text-center" style={{ color: '#718096' }}>Aucune notification récente.</div>
                    ) : notifications.map(note => (
                      <div key={note.id} className="px-4 py-3 border-b last:border-0 cursor-pointer" style={{ borderColor: '#1c2540' }} onClick={() => onDismissNotification && onDismissNotification(note.id)}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: '#4a5568' }}>{note.badge}</span>
                          <span className="font-mono text-[11px]" style={{ color: '#718096' }}>{note.timestamp.split(' ')[0]}</span>
                        </div>
                        <div className="mt-2 font-medium text-sm text-white">{note.title}</div>
                        <div className="mt-1 font-mono text-xs" style={{ color: '#94a3b8' }}>{note.subtitle}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ borderColor: '#1c2540', background: '#0f1420' }}>
              <div className="w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-bold"
                style={{ background: roleColor + '20', color: roleColor }}>
                {user.avatar}
              </div>
              <span className="text-sm text-white">{user.name.split(' ')[0]}</span>
              <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                style={{ background: roleColor + '15', color: roleColor }}>
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5" style={{ background: '#060912' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
