import { useEffect, useState } from 'react'
import { Search, Filter, Eye } from 'lucide-react'
import type { AuthUser, StockEntry } from '../data'
import { DEPOTS, PRODUCTS, getProductName, getDepotName, fmt, getStockAlert } from '../data'
import { useToast } from '../lib/toast'
import { loadStocks } from '../lib/storage'
import { EmptyState } from '../components/ui'

export default function Stocks({ user }: { user: AuthUser }) {
  const { push } = useToast()
  const [depotFilter, setDepotFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [stocks, setStocks] = useState<StockEntry[]>(() => loadStocks())
  const readOnly = user.role === 'direction'

  useEffect(() => {
    const handler = () => setStocks(loadStocks())
    window.addEventListener('petrostock-storage-update', handler)
    return () => window.removeEventListener('petrostock-storage-update', handler)
  }, [])

  const entries = stocks.filter(s => {
    if (user.role === 'depot' && s.depotId !== user.depotId) return false
    if (depotFilter !== 'all' && s.depotId !== depotFilter) return false
    if (productFilter !== 'all' && s.productId !== productFilter) return false
    const q = search.toLowerCase()
    if (q && !getProductName(s.productId).toLowerCase().includes(q) && !getDepotName(s.depotId).toLowerCase().includes(q)) return false
    return true
  }).sort((a, b) => {
    const order = { critical: 0, warning: 1, ok: 2 }
    return order[getStockAlert(a)] - order[getStockAlert(b)]
  })

  const critCount = entries.filter(s => getStockAlert(s) === 'critical').length
  const warnCount = entries.filter(s => getStockAlert(s) === 'warning').length
  const topCritical = entries.find(s => getStockAlert(s) === 'critical')

  const SelectStyle: React.CSSProperties = {
    background: '#0c1121', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '6px 10px', fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace", outline: 'none',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary strip */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Total entrées</span>
          <span className="font-display text-xl font-bold text-white">{entries.length}</span>
        </div>
        {critCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border pulse-danger"
            style={{ background: 'rgba(229,62,62,0.08)', borderColor: '#e53e3e40' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#e53e3e' }} />
            <span className="font-mono text-xs" style={{ color: '#e53e3e' }}>{critCount} critique{critCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {warnCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{ background: 'rgba(221,107,32,0.08)', borderColor: '#dd6b2040' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#dd6b20' }} />
            <span className="font-mono text-xs" style={{ color: '#dd6b20' }}>{warnCount} alerte{warnCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {readOnly && (
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'rgba(232,160,32,0.08)' }}>
            <Eye size={13} style={{ color: '#e8a020' }} />
            <span className="font-mono text-xs" style={{ color: '#e8a020' }}>LECTURE SEULE</span>
          </div>
        )}
      </div>

      {topCritical ? (
        <div className="rounded-xl border p-5" style={{ background: 'rgba(229,62,62,0.08)', borderColor: 'rgba(229,62,62,0.2)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-display text-lg font-bold text-white">Alerte critique</div>
              <div className="font-mono text-xs mt-1" style={{ color: '#f8c0c0' }}>
                {getProductName(topCritical.productId)} au dépôt {getDepotName(topCritical.depotId)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs uppercase tracking-widest" style={{ color: '#f8c0c0' }}>Rupture estimée</div>
              <div className="font-display text-3xl font-bold" style={{ color: '#e53e3e' }}>
                J+{topCritical.daysToStockout}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 font-mono text-xs text-white mb-2">
              <span>Taux de remplissage</span>
              <span className="font-bold">{Math.round((topCritical.current / topCritical.capacity) * 100)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: '#1c2540' }}>
              <div className="h-full rounded-full" style={{ width: `${Math.round((topCritical.current / topCritical.capacity) * 100)}%`, background: '#e53e3e' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <div className="font-display text-lg font-bold text-white">Tous les stocks sont stables</div>
          <div className="font-mono text-xs mt-1" style={{ color: '#4a5568' }}>
            Aucune rupture critique détectée sur les dépôts visibles.
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#4a5568' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-1.5 rounded-lg border text-sm outline-none"
            style={{ background: '#0c1121', borderColor: '#1c2540', color: '#e2e8f0', width: 200 }} />
        </div>
        {user.role !== 'depot' && (
          <select value={depotFilter} onChange={e => setDepotFilter(e.target.value)} style={SelectStyle}>
            <option value="all">Tous les dépôts</option>
            {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.city}</option>)}
          </select>
        )}
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)} style={SelectStyle}>
          <option value="all">Tous les produits</option>
          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="flex items-center gap-1.5 ml-auto">
          <Filter size={14} style={{ color: '#4a5568' }} />
          <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{entries.length} résultats</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1c2540' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0a0f1c', borderBottom: '1px solid #1c2540' }}>
                {['Dépôt','Produit','Catégorie','Stock actuel','Capacité','Seuil alerte','Remplissage','Délai rupture','MAJ','Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: '#4a5568' }}>{h}</th>
                ))}
                {!readOnly && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {entries.map(s => {
                const alert = getStockAlert(s)
                const pct = Math.round((s.current / s.capacity) * 100)
                const c = alert === 'critical' ? '#e53e3e' : alert === 'warning' ? '#dd6b20' : '#38a169'
                const product = PRODUCTS.find(p => p.id === s.productId)
                return (
                  <tr key={`${s.depotId}-${s.productId}`}
                    className="border-b last:border-0 transition-colors"
                    style={{ borderColor: '#1c2540', background: alert === 'critical' ? 'rgba(229,62,62,0.04)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = alert === 'critical' ? 'rgba(229,62,62,0.04)' : 'transparent')}>
                    <td className="px-4 py-3 text-white font-medium">{getDepotName(s.depotId).replace('Dépôt ', '')}</td>
                    <td className="px-4 py-3 text-white">{getProductName(s.productId)}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{product?.category}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium" style={{ color: c }}>{fmt.litres(s.current)}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{fmt.litres(s.capacity)}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{fmt.litres(s.alertThreshold)}</td>
                    <td className="px-4 py-3" style={{ minWidth: 120 }}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1c2540' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c }} />
                        </div>
                        <span className="font-mono text-xs shrink-0" style={{ color: c }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: s.daysToStockout !== null && s.daysToStockout <= 5 ? '#e53e3e' : '#94a3b8' }}>
                      {s.daysToStockout !== null ? `${s.daysToStockout}j` : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#4a5568' }}>{s.lastUpdate.split(' ')[0]}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: c + '15', color: c }}>
                        {alert === 'critical' ? 'CRITIQUE' : alert === 'warning' ? 'ALERTE' : 'NORMAL'}
                      </span>
                    </td>
                    {!readOnly && (
                      <td className="px-4 py-3">
                        {alert !== 'ok' && (
                          <button
                            onClick={() => {
                              const suggested = Math.max(1000, Math.ceil((s.capacity - s.current) / 1000) * 1000)
                              try {
                                window.dispatchEvent(new CustomEvent('petrostock-create-order', { detail: { type: 'create-order', payload: { productId: s.productId, depotId: s.depotId, quantity: suggested } } }))
                              } catch (e) {}
                              push(`Préparation d'une commande pour ${getProductName(s.productId)} · ${getDepotName(s.depotId)}.`)
                            }}
                            className="font-mono text-xs px-3 py-1 rounded border transition-colors hover:bg-white/5"
                            style={{ borderColor: '#e8a020', color: '#e8a020', background: 'rgba(232,160,32,0.08)' }}>
                            Commander
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {entries.length === 0 && <EmptyState message="Aucune entrée de stock ne correspond à ces filtres." />}
        </div>
      </div>
    </div>
  )
}
