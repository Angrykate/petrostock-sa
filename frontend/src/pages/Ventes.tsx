import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { SALES, MONTHLY_REVENUE, getProductName, getDepotName, fmt } from '../data'

const CLIENT_TYPE_LABELS: Record<string, string> = {
  industrie: 'Industrie',
  distribution: 'Distribution',
  transport: 'Transport',
  agriculture: 'Agriculture',
  aviation: 'Aviation',
}

const CLIENT_COLORS: Record<string, string> = {
  industrie: '#e8a020',
  distribution: '#3b82f6',
  transport: '#8b5cf6',
  agriculture: '#38a169',
  aviation: '#06b6d4',
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  payee:      { label: 'Payée',      color: '#38a169' },
  en_attente: { label: 'En attente', color: '#e8a020' },
  retard:     { label: 'En retard',  color: '#e53e3e' },
}

const clientBreakdown = Object.entries(CLIENT_TYPE_LABELS).map(([type, label]) => ({
  name: label,
  value: SALES.filter(s => s.clientType === type).reduce((a, s) => a + s.amountFCFA, 0) / 1_000_000,
  fill: CLIENT_COLORS[type],
})).filter(e => e.value > 0)

export default function Ventes() {
  const totalCA = SALES.reduce((a, s) => a + s.amountFCFA, 0)
  const paid = SALES.filter(s => s.status === 'payee').reduce((a, s) => a + s.amountFCFA, 0)
  const pending = SALES.filter(s => s.status === 'en_attente').reduce((a, s) => a + s.amountFCFA, 0)
  const late = SALES.filter(s => s.status === 'retard')

  return (
    <div className="space-y-5 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CA période', value: fmt.fcfa(totalCA), accent: '#38a169' },
          { label: 'Recouvré', value: fmt.fcfa(paid), sub: `${Math.round((paid/totalCA)*100)}%`, accent: '#38a169' },
          { label: 'En attente', value: fmt.fcfa(pending), accent: '#e8a020' },
          { label: 'En retard', value: `${late.length} factures`, sub: fmt.fcfa(late.reduce((a,s)=>a+s.amountFCFA,0)), accent: '#e53e3e' },
        ].map(k => (
          <div key={k.label} className="p-5 rounded-xl border relative overflow-hidden"
            style={{ background: '#0c1121', borderColor: '#1c2540' }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${k.accent}50, transparent)` }} />
            <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#4a5568' }}>{k.label}</div>
            <div className="font-display text-2xl font-bold text-white">{k.value}</div>
            {k.sub && <div className="font-mono text-xs mt-0.5" style={{ color: k.accent }}>{k.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue trend */}
        <div className="lg:col-span-2 rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded" style={{ background: '#38a169' }} />
            <h3 className="font-display text-base font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
              ÉVOLUTION CA MENSUEL (M FCFA)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gCA2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38a169" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38a169" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" name="CA (M FCFA)" stroke="#38a169" strokeWidth={2} fill="url(#gCA2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Client breakdown pie */}
        <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 rounded" style={{ background: '#e8a020' }} />
            <h3 className="font-display text-base font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
              PAR TYPE CLIENT
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={clientBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {clientBreakdown.map(e => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }}
                formatter={(v) => [`${Number(v).toFixed(1)} M FCFA`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {clientBreakdown.map(e => (
              <div key={e.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: e.fill }} />
                  <span className="font-mono text-xs" style={{ color: '#718096' }}>{e.name}</span>
                </div>
                <span className="font-mono text-xs text-white">{e.value.toFixed(1)} M</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sales table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1c2540' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ background: '#0a0f1c', borderColor: '#1c2540' }}>
          <span className="font-display text-sm font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
            FACTURES RÉCENTES
          </span>
          <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{SALES.length} factures</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0a0f1c', borderBottom: '1px solid #1c2540' }}>
                {['Réf.','Client','Type','Produit','Dépôt','Qté','Montant','Date','Statut'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: '#4a5568' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SALES.map(s => {
                const sm = STATUS_META[s.status]
                return (
                  <tr key={s.id} className="border-b last:border-0 transition-colors"
                    style={{ borderColor: '#1c2540' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{s.ref}</td>
                    <td className="px-4 py-3 text-white font-medium">{s.client}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: CLIENT_COLORS[s.clientType] + '15', color: CLIENT_COLORS[s.clientType] }}>
                        {CLIENT_TYPE_LABELS[s.clientType]}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{getProductName(s.productId)}</td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{getDepotName(s.depotId).replace('Dépôt ', '')}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{fmt.litres(s.quantity)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-white">{fmt.fcfa(s.amountFCFA)}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{s.date}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: sm.color + '15', color: sm.color }}>{sm.label}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
