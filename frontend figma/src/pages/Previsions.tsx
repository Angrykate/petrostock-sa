import { useMemo, useState } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Brain, TrendingDown, AlertTriangle } from 'lucide-react'
import { DEMAND_FORECAST, STOCKS, DEPOTS, PRODUCTS, getStockAlert } from '../data'

export default function Previsions() {
  const [selectedDepot, setSelectedDepot] = useState('D2')
  const [selectedProduct, setSelectedProduct] = useState('P1')

  const algo = 'Prophet'

  const criticalStocks = STOCKS.filter(s => getStockAlert(s) === 'critical')
  const selectedStock = STOCKS.find(s => s.depotId === selectedDepot && s.productId === selectedProduct)
  const depot = DEPOTS.find(d => d.id === selectedDepot)
  const product = PRODUCTS.find(p => p.id === selectedProduct)
  const ruptureDays = selectedStock?.daysToStockout ?? 30

  const chartData = useMemo(() => DEMAND_FORECAST.map((d, i) => ({
    ...d,
    predicted: Math.round(d.predicted * (algo === 'LSTM' ? 1.04 : algo === 'ARIMA' ? 0.98 : algo === 'XGBoost' ? 1.01 : 1)),
    lower: Math.round(d.lower * (algo === 'LSTM' ? 1.02 : algo === 'ARIMA' ? 0.96 : algo === 'XGBoost' ? 0.99 : 1)),
    upper: Math.round(d.upper * (algo === 'LSTM' ? 1.06 : algo === 'ARIMA' ? 1.02 : algo === 'XGBoost' ? 1.03 : 1)),
    isFuture: i >= 0,
  })), [algo])

  const SelectStyle: React.CSSProperties = {
    background: '#0c1121', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '7px 12px', fontSize: 13, outline: 'none',
    fontFamily: "'JetBrains Mono', monospace",
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* AI badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background: 'rgba(139,92,246,0.06)', borderColor: 'rgba(139,92,246,0.2)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
          <Brain size={18} style={{ color: '#8b5cf6' }} />
        </div>
        <div>
          <div className="font-display text-sm font-bold tracking-wide" style={{ color: '#c4b5fd', letterSpacing: '0.08em' }}>
            MOTEUR IA · PRÉVISION DE LA DEMANDE
          </div>
          <div className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>
            Modèle fixe: Prophet — Données 2015–2024 (321 464 observations)
          </div>
        </div>
        <div className="ml-auto text-right shrink-0">
          <div className="font-mono text-xs" style={{ color: '#4a5568' }}>Précision globale</div>
          <div className="font-display text-2xl font-bold" style={{ color: '#8b5cf6' }}>94.3%</div>
        </div>
      </div>

      {/* Alerts urgentes */}
      {criticalStocks.length > 0 && (
        <div className="rounded-xl border p-4" style={{ background: 'rgba(229,62,62,0.06)', borderColor: 'rgba(229,62,62,0.25)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} style={{ color: '#e53e3e' }} />
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#e53e3e' }}>
              Ruptures imminentes détectées par l'IA
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {criticalStocks.map(s => {
              const d = DEPOTS.find(dep => dep.id === s.depotId)
              const p = PRODUCTS.find(pr => pr.id === s.productId)
              return (
                <div key={`${s.depotId}-${s.productId}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(229,62,62,0.08)', border: '1px solid rgba(229,62,62,0.2)' }}>
                  <div>
                    <div className="text-sm font-medium text-white">{p?.name}</div>
                    <div className="font-mono text-xs" style={{ color: '#718096' }}>{d?.city}</div>
                  </div>
                  <div className="font-display text-xl font-bold" style={{ color: '#e53e3e' }}>
                    {s.daysToStockout}j
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Dépôt</span>
          <select value={selectedDepot} onChange={e => setSelectedDepot(e.target.value)} style={SelectStyle}>
            {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.city}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Produit</span>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={SelectStyle}>
            {PRODUCTS.slice(0, 6).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Modèle IA</span>
          <div className="px-3 py-2 rounded-lg" style={{ background: '#0b1321', border: '1px solid #1c2540', color: '#e2e8f0', fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>
            {algo}
          </div>
        </div>
      </div>

      {/* Main forecast chart */}
      <div className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded" style={{ background: '#8b5cf6' }} />
              <h3 className="font-display text-base font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
                PRÉVISION 30 JOURS — {product?.name?.toUpperCase()} · {depot?.city?.toUpperCase()}
              </h3>
            </div>
            <div className="font-mono text-xs ml-3" style={{ color: '#4a5568' }}>
              Consommation journalière prévue · Intervalle de confiance 95%
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs" style={{ color: '#4a5568' }}>Rupture estimée</div>
            <div className="font-display text-2xl font-bold" style={{ color: ruptureDays <= 7 ? '#e53e3e' : '#e8a020' }}>
              J+{ruptureDays}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {[
            { label: 'Prévision', color: '#8b5cf6' },
            { label: 'Intervalle de confiance', color: '#8b5cf640' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 rounded" style={{ background: l.color }} />
              <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{l.label}</span>
            </div>
          ))}
          {ruptureDays <= 10 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <TrendingDown size={13} style={{ color: '#e53e3e' }} />
              <span className="font-mono text-xs" style={{ color: '#e53e3e' }}>Rupture imminente dans {ruptureDays} jours</span>
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.07} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="label" tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fill: '#4a5568', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background: '#0c1121', border: '1px solid #1c2540', borderRadius: 6, fontSize: 12 }} />
            <Area type="monotone" dataKey="upper" name="Borne haute" stroke="none" fill="url(#gCI)" />
            <Area type="monotone" dataKey="lower" name="Borne basse" stroke="none" fill="#060912" />
            <Line type="monotone" dataKey="predicted" name="Prévision (L/j)" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            {ruptureDays <= 30 && (
              <ReferenceLine x={`J+${ruptureDays}`} stroke="#e53e3e" strokeDasharray="4 4"
                label={{ value: 'Rupture', fill: '#e53e3e', fontSize: 10, fontFamily: 'JetBrains Mono' }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Model metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'MAE', value: algo === 'LSTM' ? '2 601 L' : algo === 'ARIMA' ? '3 143 L' : algo === 'XGBoost' ? '2 771 L' : '2 847 L', sub: 'Erreur absolue moy.' },
          { label: 'RMSE', value: algo === 'LSTM' ? '3 612 L' : algo === 'ARIMA' ? '4 091 L' : algo === 'XGBoost' ? '3 782 L' : '3 912 L', sub: 'Erreur quadratique' },
          { label: 'R²', value: algo === 'LSTM' ? '0.9512' : algo === 'ARIMA' ? '0.9284' : algo === 'XGBoost' ? '0.9468' : '0.9431', sub: 'Coefficient déterm.' },
          { label: 'MAPE', value: algo === 'LSTM' ? '3.9%' : algo === 'ARIMA' ? '4.8%' : algo === 'XGBoost' ? '4.1%' : '4.2%', sub: 'Erreur % absolue' },
        ].map(m => (
          <div key={m.label} className="p-4 rounded-xl border" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
            <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#4a5568' }}>{m.label}</div>
            <div className="font-display text-2xl font-bold text-white">{m.value}</div>
            <div className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
