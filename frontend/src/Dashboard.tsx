import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { AlertTriangle, TrendingUp, TrendingDown, Package, ShoppingCart, Zap, DollarSign, Users, Activity, CheckCircle } from 'lucide-react'
import type { AuthUser, Order, StockEntry, Incident } from './data'
import {
  STOCK_HISTORY_30D,
  MONTHLY_REVENUE,
  DEPOT_FILL_RATES,
  INCIDENTS,
  INCIDENT_BY_SEVERITY,
  getProductName, getDepotName, getSupplierName,
  fmt, getStockAlert
} from './data'
import { useToast } from './lib/toast'
import { loadStocks, loadOrders, loadIncidents, saveOrders } from './lib/storage'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: { dir: 'up' | 'down'; val: string }
  accent?: string
  pulse?: boolean
  icon: React.ReactNode
}

function KpiCard({ label, value, sub, trend, accent = '#e8a020', pulse, icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: '#0c1121', borderColor: '#1c2540', boxShadow: 'none' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = accent + '60')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1c2540')}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }} />
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: accent + '15' }}>
          <span style={{ color: accent }}>{icon}</span>
        </div>
        {pulse && (
          <span className="w-2 h-2 rounded-full pulse-danger" style={{ background: '#e53e3e', display: 'block', marginTop: 4 }} />
        )}
        {trend && !pulse && (
          <span className="flex items-center gap-1 text-xs font-mono"
            style={{ color: trend.dir === 'up' ? '#38a169' : '#e53e3e' }}>
            {trend.dir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.val}
          </span>
        )}
      </div>
      <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#4a5568' }}>{label}</div>
      <div className="font-display text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: '#718096' }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded" style={{ background: '#e8a020' }} />
      <h3 className="font-display text-base font-bold tracking-wide" style={{ color: '#e2e8f0', letterSpacing: '0.06em' }}>
        {children}
      </h3>
    </div>
  )
}

function AlertRow({ alert }: { alert: typeof INCIDENTS[0] }) {
  const colors: Record<string, string> = { critique: '#e53e3e', eleve: '#dd6b20', modere: '#e8a020', faible: '#38a169' }
  const c = colors[alert.severity] ?? '#718096'
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: '#1c2540' }}>
      <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${alert.severity === 'critique' ? 'pulse-danger' : ''}`}
        style={{ background: c }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-white truncate">{alert.type}</span>
          <span className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0"
            style={{ background: c + '15', color: c }}>{alert.severity.toUpperCase()}</span>
        </div>
        <div className="font-mono text-xs" style={{ color: '#4a5568' }}>{getDepotName(alert.depotId)} · {alert.date.split(' ')[0]}</div>
      </div>
    </div>
  )
}

// ─── ROLE DASHBOARDS ─────────────────────────────────────────────────────────

function DepotDashboard({ user, stocks, orders, incidents }: { user: AuthUser; stocks: StockEntry[]; orders: Order[]; incidents: Incident[] }) {
  const depotStocks = stocks.filter(s => s.depotId === user.depotId)
  const depotOrders = orders.filter(o => o.depotId === user.depotId)
  const depotIncidents = incidents.filter(i => i.depotId === user.depotId)
  const alerts = depotStocks.filter(s => getStockAlert(s) !== 'ok')
  const totalStock = depotStocks.reduce((a, s) => a + s.current, 0)
  const activeOrders = depotOrders.filter(o => ['approuvee','en_transit','envoyee'].includes(o.status))
  const critAlerts = depotStocks.filter(s => getStockAlert(s) === 'critical')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Stock total" value={fmt.litres(totalStock)} sub="tous produits" icon={<Package size={18} />} trend={{ dir: 'down', val: '−3.2%' }} />
        <KpiCard label="Alertes actives" value={String(alerts.length)} sub={`dont ${critAlerts.length} critique(s)`} accent="#e53e3e" pulse={critAlerts.length > 0} icon={<AlertTriangle size={18} />} />
        <KpiCard label="Commandes en cours" value={String(activeOrders.length)} sub="approuvées & transit" icon={<ShoppingCart size={18} />} accent="#3b82f6" />
        <KpiCard label="Incidents ouverts" value={String(depotIncidents.filter(i => i.status !== 'resolu').length)} sub="ce mois" icon={<Zap size={18} />} accent="#dd6b20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Évolution des stocks · 30 jours</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={STOCK_HISTORY_30D.slice(-20)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e8a020" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#e8a020" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
              <Area type="monotone" dataKey="gasoil" name="Gasoil" stroke="#e8a020" strokeWidth={2} fill="url(#g1)" />
              <Area type="monotone" dataKey="essence" name="Essence Super" stroke="#3b82f6" strokeWidth={2} fill="url(#g2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Alertes stock</SectionTitle>
          <div className="space-y-0">
            {depotStocks
              .filter(s => getStockAlert(s) !== 'ok')
              .sort((a) => (getStockAlert(a) === 'critical' ? -1 : 1))
              .map(s => {
                const status = getStockAlert(s)
                const c = status === 'critical' ? '#e53e3e' : '#dd6b20'
                const pct = Math.round((s.current / s.capacity) * 100)
                return (
                  <div key={s.productId} className="py-3 border-b last:border-0" style={{ borderColor: '#1c2540' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white">{getProductName(s.productId)}</span>
                      <span className="font-mono text-xs" style={{ color: c }}>{s.daysToStockout}j</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: '#1c2540' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{fmt.litres(s.current)}</span>
                      <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{pct}%</span>
                    </div>
                  </div>
                )
              })}
            {depotStocks.filter(s => getStockAlert(s) !== 'ok').length === 0 && (
              <div className="flex items-center gap-2 py-4" style={{ color: '#38a169' }}>
                <CheckCircle size={16} />
                <span className="text-sm">Tous les stocks sont normaux</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <SectionTitle>Commandes récentes</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1c2540' }}>
              {['Réf.','Produit','Fournisseur','Qté','Statut','Livraison prévue'].map(h => (
                <th key={h} className="pb-2 text-left font-mono text-xs uppercase tracking-widest pr-4" style={{ color: '#4a5568' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {depotOrders.slice(0, 5).map(o => {
              const statusMeta: Record<string, { label: string; color: string }> = {
                brouillon: { label: 'Brouillon', color: '#4a5568' },
                envoyee: { label: 'Envoyée', color: '#3b82f6' },
                approuvee: { label: 'Approuvée', color: '#8b5cf6' },
                en_transit: { label: 'En transit', color: '#e8a020' },
                livree: { label: 'Livrée', color: '#38a169' },
                annulee: { label: 'Annulée', color: '#e53e3e' },
              }
              const sm = statusMeta[o.status]
              return (
                <tr key={o.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1c2540' }}>
                  <td className="py-3 pr-4 font-mono text-xs" style={{ color: '#718096' }}>{o.ref}</td>
                  <td className="py-3 pr-4 text-white">{getProductName(o.productId)}</td>
                  <td className="py-3 pr-4" style={{ color: '#94a3b8' }}>{getSupplierName(o.supplierId)}</td>
                  <td className="py-3 pr-4 font-mono text-xs" style={{ color: '#94a3b8' }}>{fmt.litres(o.quantity)}</td>
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: sm.color + '15', color: sm.color }}>{sm.label}</span>
                  </td>
                  <td className="py-3 font-mono text-xs" style={{ color: '#718096' }}>{o.expectedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AchatDashboard(_props: { orders: Order[] }) {
  const { push } = useToast()
  const [currentOrders, setCurrentOrders] = useState<Order[]>(() => loadOrders())

  // Écouter les mises à jour depuis d'autres onglets/pages
  useEffect(() => {
    const handler = () => setCurrentOrders(loadOrders())
    window.addEventListener('petrostock-storage-update', handler)
    return () => window.removeEventListener('petrostock-storage-update', handler)
  }, [])
  const pendingOrders = currentOrders.filter(o => o.status === 'envoyee')
  const approvedOrders = currentOrders.filter(o => o.status === 'approuvee')
  const inTransit = currentOrders.filter(o => o.status === 'en_transit')
  const totalValue = currentOrders.filter(o => !['livree','annulee'].includes(o.status)).reduce((a, o) => a + o.amountFCFA, 0)

  function updateOrder(id: string, status: Order['status'], msg: string) {
    setCurrentOrders(list => {
      const next = list.map(o => o.id === id ? { ...o, status } : o)
      saveOrders(next)
      return next
    })
    push(msg)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="En attente" value={String(pendingOrders.length)} sub="commandes à approuver" accent="#e8a020" pulse={pendingOrders.length > 0} icon={<ShoppingCart size={18} />} />
        <KpiCard label="Approuvées" value={String(approvedOrders.length)} sub="prêtes à l'expédition" accent="#8b5cf6" icon={<CheckCircle size={18} />} />
        <KpiCard label="En transit" value={String(inTransit.length)} sub="livraisons en cours" accent="#3b82f6" icon={<Activity size={18} />} />
        <KpiCard label="Valeur totale" value={fmt.fcfa(totalValue)} sub="commandes actives" accent="#38a169" icon={<DollarSign size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Commandes par mois (valeur FCFA M)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
              <Bar dataKey="orders" name="Commandes" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>À traiter en urgence</SectionTitle>
          {pendingOrders.length === 0
            ? <div className="flex items-center gap-2 py-4 text-sm" style={{ color: '#38a169' }}><CheckCircle size={16} /> Aucune commande en attente</div>
            : pendingOrders.map(o => (
              <div key={o.id} className="py-3 border-b last:border-0" style={{ borderColor: '#1c2540' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs" style={{ color: '#718096' }}>{o.ref}</span>
                  <span className="font-mono text-xs" style={{ color: '#e8a020' }}>ENVOYÉE</span>
                </div>
                <div className="text-sm text-white">{getProductName(o.productId)}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>
                  {getDepotName(o.depotId)} · {getSupplierName(o.supplierId)}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => updateOrder(o.id, 'approuvee', `Commande ${o.ref} approuvée.`)} className="text-xs px-3 py-1 rounded font-mono transition-colors" style={{ background: 'rgba(56,161,105,0.15)', color: '#38a169' }}>
                    APPROUVER
                  </button>
                  <button onClick={() => updateOrder(o.id, 'annulee', `Commande ${o.ref} refusée.`)} className="text-xs px-3 py-1 rounded font-mono transition-colors" style={{ background: 'rgba(229,62,62,0.1)', color: '#e53e3e' }}>
                    REFUSER
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <SectionTitle>Toutes les commandes actives</SectionTitle>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #1c2540' }}>
              {['Réf.','Produit','Dépôt','Fournisseur','Qté','Montant','Statut','Délai'].map(h => (
                <th key={h} className="pb-2 text-left font-mono text-xs uppercase tracking-widest pr-3" style={{ color: '#4a5568' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentOrders.filter(o => o.status !== 'livree' && o.status !== 'annulee').map(o => {
              const sm: Record<string, { label: string; color: string }> = {
                brouillon: { label: 'Brouillon', color: '#4a5568' },
                envoyee: { label: 'Envoyée', color: '#3b82f6' },
                approuvee: { label: 'Approuvée', color: '#8b5cf6' },
                en_transit: { label: 'En transit', color: '#e8a020' },
              }
              const s = sm[o.status]
              return (
                <tr key={o.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors" style={{ borderColor: '#1c2540' }}>
                  <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: '#718096' }}>{o.ref}</td>
                  <td className="py-2.5 pr-3 text-white">{getProductName(o.productId)}</td>
                  <td className="py-2.5 pr-3 text-sm" style={{ color: '#94a3b8' }}>{getDepotName(o.depotId).replace('Dépôt ', '')}</td>
                  <td className="py-2.5 pr-3 text-sm" style={{ color: '#94a3b8' }}>{getSupplierName(o.supplierId)}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{fmt.litres(o.quantity)}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{fmt.fcfa(o.amountFCFA)}</td>
                  <td className="py-2.5 pr-3">
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: s.color + '15', color: s.color }}>{s.label}</span>
                  </td>
                  <td className="py-2.5 font-mono text-xs" style={{ color: '#718096' }}>{o.expectedAt}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DirectionDashboard({ stocks, incidents }: { stocks: StockEntry[]; incidents: Incident[] }) {
  const totalStock = stocks.reduce((a, s) => a + s.current, 0)
  const criticalAlerts = stocks.filter(s => getStockAlert(s) === 'critical').length
  const monthlyCA = 1760
  const openIncidents = incidents.filter(i => i.status !== 'resolu').length
  const depotFillRates = stocks.map(depot => ({
    name: depot.depotId,
    rate: Math.round((depot.current / depot.capacity) * 100),
    city: getDepotName(depot.depotId).replace('Dépôt ', ''),
  })).reduce((acc, entry) => {
    const existing = acc.find(item => item.name === entry.name)
    return existing ? acc : [...acc, entry]
  }, [] as { name: string; rate: number; city: string }[])
  const avgFill = Math.round(depotFillRates.reduce((a, d) => a + d.rate, 0) / Math.max(depotFillRates.length, 1))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Stock national total" value={fmt.litres(totalStock)} sub="8 dépôts" icon={<Package size={18} />} trend={{ dir: 'up', val: '+1.8%' }} />
        <KpiCard label="CA mensuel" value={`${monthlyCA} M FCFA`} sub="Juillet 2024" accent="#38a169" icon={<DollarSign size={18} />} trend={{ dir: 'down', val: '−9.3%' }} />
        <KpiCard label="Taux remplissage moy." value={`${avgFill}%`} sub="tous dépôts" accent="#8b5cf6" icon={<Activity size={18} />} />
        <KpiCard label="Alertes critiques" value={String(criticalAlerts)} sub={`${openIncidents} incidents ouverts`} accent="#e53e3e" pulse={criticalAlerts > 0} icon={<AlertTriangle size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Chiffre d'affaires mensuel (M FCFA)</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38a169" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38a169" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="CA (M FCFA)" stroke="#38a169" strokeWidth={2} fill="url(#gCA)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Incidents par gravité</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={INCIDENT_BY_SEVERITY} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="count">
                {INCIDENT_BY_SEVERITY.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {INCIDENT_BY_SEVERITY.map(e => (
              <div key={e.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: e.fill }} />
                <span className="font-mono text-xs" style={{ color: '#718096' }}>{e.name}: <span className="text-white">{e.count}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Depot fill rates */}
      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <SectionTitle>Taux de remplissage par dépôt</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {DEPOT_FILL_RATES.map(d => {
            const c = d.rate < 20 ? '#e53e3e' : d.rate < 40 ? '#dd6b20' : d.rate < 60 ? '#e8a020' : '#38a169'
            return (
              <div key={d.name} className="p-3 rounded-lg border" style={{ borderColor: '#1c2540', background: '#060912' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{d.city}</span>
                  <span className="font-mono text-sm font-bold" style={{ color: c }}>{d.rate}%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: '#1c2540' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.rate}%`, background: c }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Incidents récents */}
      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <SectionTitle>Incidents récents</SectionTitle>
        <div className="divide-y max-h-[320px] overflow-y-auto" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {incidents.slice(0, 5).map(i => <AlertRow key={i.id} alert={i} />)}
        </div>
      </div>
    </div>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs actifs" value="9" sub="sur 10 comptes" accent="#8b5cf6" icon={<Users size={18} />} />
        <KpiCard label="Alertes système" value="3" sub="stocks critiques" accent="#e53e3e" pulse icon={<AlertTriangle size={18} />} />
        <KpiCard label="Uptime API" value="99.7%" sub="30 derniers jours" accent="#38a169" icon={<Activity size={18} />} />
        <KpiCard label="Connexions / 24h" value="34" sub="aujourd'hui" accent="#3b82f6" icon={<Zap size={18} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>État des dépôts</SectionTitle>
          <div className="space-y-0">
            {DEPOT_FILL_RATES.map(d => {
              const c = d.rate < 20 ? '#e53e3e' : d.rate < 40 ? '#dd6b20' : '#38a169'
              return (
                <div key={d.name} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: '#1c2540' }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c }} />
                  <span className="flex-1 text-sm text-white">{d.city}</span>
                  <div className="w-32 h-1.5 rounded-full" style={{ background: '#1c2540' }}>
                    <div className="h-full rounded-full" style={{ width: `${d.rate}%`, background: c }} />
                  </div>
                  <span className="font-mono text-xs w-10 text-right" style={{ color: c }}>{d.rate}%</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <SectionTitle>Journal système récent</SectionTitle>
          {[
            { time: '10:42:05', level: 'INFO', msg: 'Connexion réussie — admin@petrostock.tg' },
            { time: '10:38:21', level: 'WARN', msg: 'Stock bas détecté — Kara Gasoil (5j)' },
            { time: '10:35:14', level: 'INFO', msg: 'Commande BC-2024-0746 créée par U2' },
            { time: '10:22:08', level: 'ERROR', msg: 'Capteur niveau D7-C3 — timeout connexion' },
            { time: '09:58:44', level: 'INFO', msg: 'Sauvegarde base de données — OK (1.8 GB)' },
            { time: '09:31:02', level: 'WARN', msg: 'Anomalie IA détectée — INC-2024-0158' },
            { time: '06:00:00', level: 'INFO', msg: 'Mise à jour stocks quotidienne — OK (22 entrées)' },
          ].map((log, i) => {
            const c = log.level === 'ERROR' ? '#e53e3e' : log.level === 'WARN' ? '#e8a020' : '#38a169'
            return (
              <div key={i} className="flex items-start gap-3 py-2 border-b last:border-0 font-mono text-xs" style={{ borderColor: '#1c2540' }}>
                <span style={{ color: '#4a5568' }}>{log.time}</span>
                <span className="px-1.5 rounded shrink-0" style={{ background: c + '15', color: c }}>{log.level}</span>
                <span style={{ color: '#94a3b8' }}>{log.msg}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Incidents overview */}
      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <SectionTitle>Alertes actives — toutes sources</SectionTitle>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {INCIDENTS.filter(i => i.status !== 'resolu').map(i => <AlertRow key={i.id} alert={i} />)}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard({ user }: { user: AuthUser }) {
  const [stocks, setStocks] = useState<StockEntry[]>(() => loadStocks())
  const [orders, setOrders] = useState<Order[]>(() => loadOrders())
  const [incidents, setIncidents] = useState<Incident[]>(() => loadIncidents())

  useEffect(() => {
    const handler = () => {
      setStocks(loadStocks())
      setOrders(loadOrders())
      setIncidents(loadIncidents())
    }
    window.addEventListener('petrostock-storage-update', handler)
    return () => window.removeEventListener('petrostock-storage-update', handler)
  }, [])

  if (user.role === 'depot') return <DepotDashboard user={user} stocks={stocks} orders={orders} incidents={incidents} />
  if (user.role === 'achat') return <AchatDashboard orders={orders} />
  if (user.role === 'direction') return <DirectionDashboard stocks={stocks} incidents={incidents} />
  return <AdminDashboard />
}
