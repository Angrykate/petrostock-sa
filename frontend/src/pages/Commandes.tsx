import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import type { AuthUser, Order, StockEntry } from '../data'
import { ORDERS, PRODUCTS, DEPOTS, SUPPLIERS, getProductName, getDepotName, getSupplierName, fmt, getProductUnitPrice, getSupplierRecommendationScore } from '../data'
import { Button, EmptyState } from '../components/ui'
import { useToast } from '../lib/toast'
import { loadOrders, saveOrders, loadStocks, saveStocks } from '../lib/storage'
import * as api from '../lib/api'

const STATUS_META: Record<Order['status'], { label: string; color: string }> = {
  brouillon:  { label: 'Brouillon',   color: '#4a5568' },
  envoyee:    { label: 'Envoyée',     color: '#3b82f6' },
  approuvee:  { label: 'Approuvée',   color: '#8b5cf6' },
  en_transit: { label: 'En transit',  color: '#e8a020' },
  livree:     { label: 'Livrée',      color: '#38a169' },
  annulee:    { label: 'Annulée',     color: '#e53e3e' },
}

// Lire le dernier ID depuis localStorage pour éviter les doublons après rechargement
let orderSeq = (() => {
  const stored = loadOrders()
  const maxId = stored.reduce((max, o) => {
    const num = parseInt(o.id.replace('O', ''))
    return num > max ? num : max
  }, ORDERS.length)
  return maxId + 1
})()

// ─── MODALE DE CRÉATION / ÉDITION ─────────────────────────────────────────────

function OrderModal({ onClose, user, onSave, editOrder }: {
  onClose: () => void
  user: AuthUser
  onSave: (o: Order) => void
  editOrder?: Order | null
}) {
  const isEdit = !!editOrder
  const [form, setForm] = useState({
    productId: editOrder?.productId ?? 'P1',
    depotId: editOrder?.depotId ?? user.depotId ?? 'D1',
    supplierId: editOrder?.supplierId ?? 'S1',
    quantity: editOrder ? String(editOrder.quantity) : '',
    note: editOrder?.note ?? '',
  })
  const recommendedSupplier = useMemo(() => {
    const filtered = SUPPLIERS.filter(s => s.products.includes(form.productId))
    if (!filtered.length) return SUPPLIERS[0]
    return filtered.sort((a, b) => getSupplierRecommendationScore(b, form.productId) - getSupplierRecommendationScore(a, form.productId))[0]
  }, [form.productId])
  const [touched, setTouched] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const quantityNum = Number(form.quantity)
  const isValid = form.quantity.trim() !== '' && quantityNum > 0

  const inputCls: React.CSSProperties = {
    background: '#060912', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", width: '100%',
  }
  const labelCls = "font-mono text-xs uppercase tracking-widest mb-1.5 block"

  function handleSave() {
    setTouched(true)
    if (!isValid) return
    const estimatedUnitPrice = getProductUnitPrice(form.productId)

    const order: Order = {
      id: editOrder?.id ?? `O${orderSeq}`,
      ref: editOrder?.ref ?? `BC-2024-0${750 + orderSeq}`,
      productId: form.productId,
      depotId: form.depotId,
      supplierId: form.supplierId,
      quantity: quantityNum,
      status: editOrder?.status ?? 'brouillon',
      createdAt: editOrder?.createdAt ?? new Date().toISOString().slice(0, 10),
      expectedAt: editOrder?.expectedAt ?? new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      createdBy: editOrder?.createdBy ?? user.id,
      amountFCFA: Math.round(quantityNum * estimatedUnitPrice),
      note: form.note.trim() || undefined,
    }
    if (!isEdit) orderSeq += 1
    onSave(order)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border animate-slide-up"
        style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 1 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
          <div>
            <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
              {isEdit ? 'MODIFIER LA COMMANDE' : 'NOUVELLE COMMANDE'}
            </h2>
            {editOrder && <p className="font-mono text-xs mt-0.5" style={{ color: '#4a5568' }}>{editOrder.ref}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#4a5568' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: '#4a5568' }}>Produit</label>
              <select value={form.productId} onChange={e => set('productId', e.target.value)} style={{ ...inputCls, appearance: 'none' }}>
                {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls} style={{ color: '#4a5568' }}>Dépôt destinataire</label>
              <select value={form.depotId} onChange={e => set('depotId', e.target.value)}
                style={{ ...inputCls, appearance: 'none', opacity: user.role === 'depot' ? 0.6 : 1 }}
                disabled={user.role === 'depot'}>
                {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.city}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Fournisseur</label>
            <select value={form.supplierId} onChange={e => set('supplierId', e.target.value)} style={{ ...inputCls, appearance: 'none' }}>
              {SUPPLIERS.filter(s => s.products.includes(form.productId)).map(s => <option key={s.id} value={s.id}>{s.name} — {s.country}</option>)}
            </select>
            <p className="text-xs mt-1.5" style={{ color: '#e8a020' }}>Suggestion : {recommendedSupplier?.name} · score {getSupplierRecommendationScore(recommendedSupplier, form.productId)}</p>
          </div>
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Quantité (litres)</label>
            <input type="number" min={1} value={form.quantity} onChange={e => set('quantity', e.target.value)}
              placeholder="ex: 100000" style={{ ...inputCls, borderColor: touched && !isValid ? '#e53e3e' : '#1c2540' }} />
            {touched && !isValid && (
              <p className="text-xs mt-1.5" style={{ color: '#e53e3e' }}>Indiquez une quantité valide (supérieure à 0).</p>
            )}
          </div>
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Note / Justification</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)}
              placeholder="Raison de la commande, urgence, remarques..."
              rows={3} style={{ ...inputCls, resize: 'none' }} />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button variant="primary" className="flex-1 text-base" onClick={handleSave}>
            {isEdit ? 'ENREGISTRER' : 'CRÉER'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── MODALE DE RÉCEPTION ─────────────────────────────────────────────────────

function ReceptionModal({ order, onClose, onConfirm }: {
  order: Order
  onClose: () => void
  onConfirm: (qteLivree: number) => Promise<void>
}) {
  const [qte, setQte] = useState(String(order.quantity))
  const [saving, setSaving] = useState(false)
  const qteNum = Number(qte)
  const isValid = qte.trim() !== '' && qteNum > 0
  const ecartPct = order.quantity > 0 ? Math.abs(order.quantity - qteNum) / order.quantity * 100 : 0
  const depasseSeuil = ecartPct > 3

  const inputCls: React.CSSProperties = {
    background: '#060912', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none',
    fontFamily: "'DM Sans', sans-serif", width: '100%',
  }

  async function handleConfirm() {
    if (!isValid) return
    setSaving(true)
    await onConfirm(qteNum)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border animate-slide-up"
        style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 1 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
          <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
            RÉCEPTIONNER
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            style={{ color: '#4a5568' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="font-mono text-sm" style={{ color: '#94a3b8' }}>
            Commande : <span className="text-white">{order.ref}</span>
          </div>
          <div className="font-mono text-sm" style={{ color: '#94a3b8' }}>
            Produit : <span className="text-white">{getProductName(order.productId)}</span>
          </div>
          <div className="font-mono text-sm" style={{ color: '#94a3b8' }}>
            Quantité commandée : <span className="text-white">{fmt.litres(order.quantity)}</span>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>
              Quantité réellement reçue
            </label>
            <input type="number" min={0} value={qte} onChange={e => setQte(e.target.value)}
              style={{ ...inputCls, borderColor: !isValid && qte !== '' ? '#e53e3e' : '#1c2540' }} />
          </div>

          {qteNum > 0 && order.quantity > 0 && (
            <div className="font-mono text-xs p-3 rounded-lg" style={{
              background: depasseSeuil ? 'rgba(229,62,62,0.1)' : 'rgba(56,161,105,0.1)',
              color: depasseSeuil ? '#e53e3e' : '#38a169',
            }}>
              Écart : {ecartPct.toFixed(1)}%
              {depasseSeuil
                ? ' — un incident sera créé automatiquement (Règle 6).'
                : ' — dans la tolérance de 3%.'}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button variant="primary" className="flex-1 text-base" onClick={handleConfirm} disabled={!isValid || saving}
            style={!isValid || saving ? { opacity: 0.5 } : {}}>
            {saving ? 'Traitement...' : 'CONFIRMER'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── MODALE DÉTAILS (lecture seule) ──────────────────────────────────────────

function DetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const sm = STATUS_META[order.status]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border animate-slide-up"
        style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 1 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
          <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
            DÉTAILS COMMANDE
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            style={{ color: '#4a5568' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {[
            ['Référence', order.ref],
            ['Produit', getProductName(order.productId)],
            ['Dépôt', getDepotName(order.depotId)],
            ['Fournisseur', getSupplierName(order.supplierId)],
            ['Quantité', fmt.litres(order.quantity)],
            ['Montant', fmt.fcfa(order.amountFCFA)],
            ['Statut', <span key="s" className="font-mono text-xs px-2 py-1 rounded" style={{ background: sm.color + '15', color: sm.color }}>{sm.label}</span>],
            ['Créée le', order.createdAt],
            ['Livraison prévue', order.expectedAt],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between font-mono text-xs py-1.5 border-b last:border-0"
              style={{ borderColor: '#1c2540' }}>
              <span style={{ color: '#4a5568' }}>{label}</span>
              <span className="text-white text-right">{value}</span>
            </div>
          ))}
          {order.note && (
            <div className="pt-2">
              <div className="font-mono text-xs mb-1" style={{ color: '#4a5568' }}>Note</div>
              <div className="text-sm" style={{ color: '#94a3b8' }}>{order.note}</div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6">
          <Button variant="outline" className="w-full" onClick={onClose}>Fermer</Button>
        </div>
      </div>
    </div>
  )
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

export default function Commandes({ user, draft: externalDraft, onClearDraft }: { user: AuthUser; draft?: any | null; onClearDraft?: () => void }) {
  const { push } = useToast()
  const [allOrders, setAllOrders] = useState<Order[]>(() => loadOrders())
  const [stocks, setStocks] = useState<StockEntry[]>(() => loadStocks())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [draft, setDraft] = useState<any | null>(null)
  const [receptionOrder, setReceptionOrder] = useState<Order | null>(null)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const canCreate = ['depot', 'achat', 'admin'].includes(user.role)
  const canApprove = ['achat', 'admin'].includes(user.role)
  const isReadOnly = user.role === 'direction'

  useEffect(() => {
    const handler = () => setStocks(loadStocks())
    window.addEventListener('petrostock-storage-update', handler)
    return () => window.removeEventListener('petrostock-storage-update', handler)
  }, [])

  useEffect(() => {
    if (externalDraft) {
      setDraft(externalDraft)
      setEditOrder(null)  // nouveau, pas d'édition
      setShowModal(true)
      if (onClearDraft) onClearDraft()
    }
  }, [externalDraft, onClearDraft])

  useEffect(() => {
    const handler = (e: any) => {
      try {
        const ce = e as CustomEvent
        if (ce?.detail?.type === 'create-order' && ce.detail.payload) {
          setDraft(ce.detail.payload)
          setEditOrder(null)
          setShowModal(true)
        }
      } catch (err) {}
    }
    window.addEventListener('petrostock-create-order', handler as EventListener)
    return () => window.removeEventListener('petrostock-create-order', handler as EventListener)
  }, [])

  const orders = useMemo(() => allOrders.filter(o => {
    if (user.role === 'depot' && o.depotId !== user.depotId) return false
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    return true
  }), [allOrders, statusFilter, user])

  const stats = Object.entries(STATUS_META).map(([status, meta]) => ({
    ...meta, status, count: allOrders.filter(o => o.status === status).length
  })).filter(s => s.count > 0)

  function updateStatus(id: string, status: Order['status'], message: string) {
    const order = allOrders.find(o => o.id === id)
    if (!order) return

    setAllOrders(list => {
      const next = list.map(o => o.id === id ? { ...o, status } : o)
      saveOrders(next, true)
      return next
    })

    if (status === 'livree' && order.status !== 'livree') {
      setStocks(prev => {
        const nextStocks = prev.map(s => {
          if (s.depotId !== order.depotId || s.productId !== order.productId) return s
          return {
            ...s,
            current: Math.min(s.capacity, s.current + order.quantity),
            lastUpdate: new Date().toISOString().slice(0, 10),
          }
        })
        saveStocks(nextStocks)
        return nextStocks
      })
    }

    push(message, status === 'annulee' ? 'error' : 'success')
  }

  function handleDelete(id: string) {
    if (!window.confirm('Supprimer cette commande brouillon ?')) return
    setAllOrders(list => {
      const next = list.filter(o => o.id !== id)
      saveOrders(next, true)
      return next
    })
    push('Commande supprimée.', 'error')
  }

  function handleDoubleClick(o: Order) {
    if (o.status === 'brouillon' && canCreate) {
      // Éditer le brouillon
      setEditOrder(o)
      setShowModal(true)
    } else {
      // Voir les détails
      setDetailOrder(o)
    }
  }

  function handleSaveOrder(order: Order) {
    let wasEdit = false
    setAllOrders(list => {
      const exists = list.find(o => o.id === order.id)
      wasEdit = !!exists
      let next: Order[]
      if (exists) {
        next = list.map(o => o.id === order.id ? order : o)
      } else {
        next = [order, ...list]
      }
      saveOrders(next)
      return next
    })
    push(`Commande ${order.ref} ${wasEdit ? 'modifiée' : 'créée'}.`, 'success')
  }

  // --- Réception ---
  async function handleConfirmReception(qteLivree: number) {
    if (!receptionOrder) return
    try {
      const resp = await fetch(`${api.API_BASE}/commandes/${receptionOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: 'Livré', quantite_livree: qteLivree, date_livraison_reelle: new Date().toISOString().slice(0, 10) }),
      })
      if (resp.ok) {
        push(`Commande ${receptionOrder.ref} réceptionnée (${fmt.litres(qteLivree)}).`, 'success')
      } else {
        updateStatus(receptionOrder.id, 'livree', `Commande ${receptionOrder.ref} réceptionnée (${fmt.litres(qteLivree)}).`)
      }
    } catch {
      updateStatus(receptionOrder.id, 'livree', `Commande ${receptionOrder.ref} réceptionnée (${fmt.litres(qteLivree)}).`)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Modales */}
      {showModal && (
        <OrderModal
          user={user}
          editOrder={editOrder}
          onClose={() => { setShowModal(false); setEditOrder(null); setDraft(null) }}
          onSave={handleSaveOrder}
        />
      )}
      {receptionOrder && (
        <ReceptionModal
          order={receptionOrder}
          onClose={() => setReceptionOrder(null)}
          onConfirm={handleConfirmReception}
        />
      )}
      {detailOrder && (
        <DetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
        />
      )}

      {/* Stats + header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {stats.map(s => (
            <button key={s.status}
              onClick={() => setStatusFilter(statusFilter === s.status ? 'all' : s.status)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs transition-all"
              style={{
                borderColor: statusFilter === s.status ? s.color : '#1c2540',
                background: statusFilter === s.status ? s.color + '15' : '#0c1121',
                color: statusFilter === s.status ? s.color : '#718096',
              }}>
              <span>{s.count}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(232,160,32,0.08)', color: '#e8a020' }}>
              LECTURE SEULE
            </span>
          )}
          {canCreate && (
            <Button variant="primary" onClick={() => { setEditOrder(null); setShowModal(true) }}>
              <Plus size={16} />
              NOUVELLE COMMANDE
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1c2540' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#0a0f1c', borderBottom: '1px solid #1c2540' }}>
                {['Réf.','Produit','Dépôt','Fournisseur','Qté','Montant','Statut','Créée le','Livraison prévue','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: '#4a5568' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const sm = STATUS_META[o.status]
                const isDraft = o.status === 'brouillon'
                return (
                  <tr key={o.id}
                    className="border-b last:border-0 transition-colors cursor-pointer"
                    style={{ borderColor: '#1c2540' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onDoubleClick={() => handleDoubleClick(o)}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{o.ref}</td>
                    <td className="px-4 py-3 text-white font-medium">{getProductName(o.productId)}</td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{getDepotName(o.depotId).replace('Dépôt ', '')}</td>
                    <td className="px-4 py-3" style={{ color: '#94a3b8' }}>{getSupplierName(o.supplierId)}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{fmt.litres(o.quantity)}</td>
                    <td className="px-4 py-3 font-mono text-xs font-medium text-white">{fmt.fcfa(o.amountFCFA)}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs px-2 py-1 rounded whitespace-nowrap"
                        style={{ background: sm.color + '15', color: sm.color }}>{sm.label}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{o.createdAt}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{o.expectedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {isDraft && canCreate && (
                          <>
                            <Button size="sm" variant="outline" style={{ color: '#3b82f6', borderColor: 'transparent', background: 'rgba(59,130,246,0.12)' }}
                              onClick={() => updateStatus(o.id, 'envoyee', `Commande ${o.ref} envoyée au fournisseur.`)}>
                              Envoyer
                            </Button>
                            <button title="Supprimer"
                              onClick={() => handleDelete(o.id)}
                              className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/5"
                              style={{ color: '#e53e3e' }}>
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {canApprove && o.status === 'envoyee' && (
                          <>
                            <Button size="sm" variant="success" title="Approuver"
                              onClick={() => updateStatus(o.id, 'approuvee', `Commande ${o.ref} approuvée.`)}>
                              ✓
                            </Button>
                            <Button size="sm" variant="danger" title="Rejeter"
                              onClick={() => updateStatus(o.id, 'annulee', `Commande ${o.ref} rejetée.`)}>
                              ✕
                            </Button>
                          </>
                        )}
                        {o.status === 'approuvee' && (
                          <Button size="sm" variant="outline" style={{ color: '#e8a020', borderColor: 'transparent', background: 'rgba(232,160,32,0.12)' }}
                            onClick={() => updateStatus(o.id, 'en_transit', `Commande ${o.ref} marquée en transit.`)}>
                            Mettre en transit
                          </Button>
                        )}
                        {o.status === 'en_transit' && (
                          <Button size="sm" variant="success"
                            onClick={() => setReceptionOrder(o)}>
                            Réceptionner
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {orders.length === 0 && <EmptyState message="Aucune commande ne correspond à ce filtre." />}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono" style={{ color: '#4a5568' }}>
        <span>{orders.length} commande{orders.length > 1 ? 's' : ''} affichée{orders.length > 1 ? 's' : ''}</span>
        <span>Total: {fmt.fcfa(orders.reduce((a, o) => a + o.amountFCFA, 0))}</span>
      </div>
    </div>
  )
}