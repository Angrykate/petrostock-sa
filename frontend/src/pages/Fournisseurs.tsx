import { useMemo, useState } from 'react'
import { Star, Phone, Mail, Package, TrendingUp } from 'lucide-react'
import { SUPPLIERS, PRODUCTS, getSupplierRecommendationScore } from '../data'
import { useToast } from '../lib/toast'

export default function Fournisseurs() {
  const { push } = useToast()
  const [selected, setSelected] = useState<string | null>(null)
  const [productFilter, setProductFilter] = useState('all')
  const detail = selected ? SUPPLIERS.find(s => s.id === selected) : null

  const visibleSuppliers = useMemo(() => {
    const list = SUPPLIERS.filter(s => productFilter === 'all' || s.products.includes(productFilter))
    return [...list].sort((a, b) => getSupplierRecommendationScore(b, productFilter === 'all' ? 'P1' : productFilter) - getSupplierRecommendationScore(a, productFilter === 'all' ? 'P1' : productFilter))
  }, [productFilter])

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="font-mono text-xs" style={{ color: '#4a5568' }}>
          {visibleSuppliers.length} fournisseurs affichés · Score pondéré fiabilité / délai / disponibilité
        </div>
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)} className="font-mono text-xs px-3 py-2 rounded-lg border" style={{ background: '#0c1121', borderColor: '#1c2540', color: '#e2e8f0' }}>
          <option value="all">Tous les produits</option>
          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <button onClick={() => push('Formulaire de nouveau fournisseur — fonctionnalité à venir.', 'info')}
          className="font-mono text-xs px-4 py-2 rounded-lg border transition-colors hover:bg-white/5"
          style={{ borderColor: '#e8a020', color: '#e8a020', background: 'rgba(232,160,32,0.08)' }}>
          + Nouveau fournisseur
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleSuppliers.map(s => {
          const sel = selected === s.id
          const scoreColor = s.reliabilityScore >= 90 ? '#38a169' : s.reliabilityScore >= 80 ? '#e8a020' : '#e53e3e'
          const products = s.products.map(pid => PRODUCTS.find(p => p.id === pid)?.name).filter(Boolean)

          return (
            <button key={s.id}
              onClick={() => setSelected(sel ? null : s.id)}
              className="text-left p-5 rounded-xl border transition-all duration-200"
              style={{
                background: sel ? 'rgba(232,160,32,0.06)' : '#0c1121',
                borderColor: sel ? 'rgba(232,160,32,0.4)' : '#1c2540',
                boxShadow: sel ? '0 0 24px rgba(232,160,32,0.1)' : 'none',
              }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display text-lg font-bold text-white" style={{ letterSpacing: '0.04em' }}>{s.name}</div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>{s.country}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={13} style={{ color: scoreColor, fill: scoreColor }} />
                  <span className="font-display text-xl font-bold" style={{ color: scoreColor }}>{getSupplierRecommendationScore(s, productFilter === 'all' ? 'P1' : productFilter)}</span>
                </div>
              </div>

              {/* Products */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {products.map(p => (
                  <span key={p} className="font-mono text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(232,160,32,0.1)', color: '#e8a020' }}>
                    {p}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg" style={{ background: '#060912' }}>
                  <div className="font-mono text-xs mb-0.5" style={{ color: '#4a5568' }}>Livraisons</div>
                  <div className="font-display text-xl font-bold text-white">{s.deliveries}</div>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: '#060912' }}>
                  <div className="font-mono text-xs mb-0.5" style={{ color: '#4a5568' }}>À l'heure</div>
                  <div className="font-display text-xl font-bold" style={{ color: s.onTimeRate >= 90 ? '#38a169' : '#e8a020' }}>
                    {s.onTimeRate}%
                  </div>
                </div>
              </div>

              {/* On-time bar */}
              <div className="mt-3">
                <div className="w-full h-1 rounded-full" style={{ background: '#1c2540' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${s.onTimeRate}%`, background: s.onTimeRate >= 90 ? '#38a169' : s.onTimeRate >= 80 ? '#e8a020' : '#e53e3e' }} />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detail panel */}
      {detail && (
        <div className="rounded-xl border p-6 animate-slide-up" style={{ background: '#0c1121', borderColor: 'rgba(232,160,32,0.3)' }}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-white" style={{ letterSpacing: '0.06em' }}>{detail.name}</h2>
              <div className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>{detail.country}</div>
            </div>
            <button onClick={() => setSelected(null)}
              className="font-mono text-xs px-3 py-1.5 rounded border hover:bg-white/5 transition-colors"
              style={{ borderColor: '#1c2540', color: '#718096' }}>
              Fermer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: '#060912' }}>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={14} style={{ color: '#4a5568' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Contact</span>
              </div>
              <div className="font-mono text-sm text-white">{detail.contact}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: '#060912' }}>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={14} style={{ color: '#4a5568' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Email</span>
              </div>
              <div className="font-mono text-sm text-white">{detail.email}</div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: '#060912' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} style={{ color: '#4a5568' }} />
                <span className="font-mono text-xs uppercase tracking-widest" style={{ color: '#4a5568' }}>Score fiabilité</span>
              </div>
              <div className="font-display text-3xl font-bold" style={{ color: detail.reliabilityScore >= 90 ? '#38a169' : '#e8a020' }}>
                {detail.reliabilityScore}/100
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: '#4a5568' }}>
              Produits fournis
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.products.map(pid => {
                const p = PRODUCTS.find(pr => pr.id === pid)
                return p ? (
                  <div key={pid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: '#1c2540', background: '#060912' }}>
                    <Package size={13} style={{ color: '#e8a020' }} />
                    <span className="text-sm text-white">{p.name}</span>
                    <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{p.unit}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <button onClick={() => push(`Ouverture d'une commande pour ${detail.name} — rendez-vous sur la page Commandes.`)}
              className="px-4 py-2 rounded-lg font-display font-bold text-black text-sm tracking-widest transition-transform active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #e8a020, #dd6b20)', letterSpacing: '0.12em' }}>
              PASSER COMMANDE
            </button>
            <button onClick={() => push(`Historique de ${detail.name} — fonctionnalité à venir.`, 'info')}
              className="px-4 py-2 rounded-lg border text-sm transition-colors hover:bg-white/5"
              style={{ borderColor: '#1c2540', color: '#94a3b8' }}>
              Voir historique
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
