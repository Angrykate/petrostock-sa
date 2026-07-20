import { useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { AuthUser, Incident } from '../data'
import { INCIDENTS, DEPOTS, INCIDENT_BY_SEVERITY, getDepotName, fmt } from '../data'
import { Button, EmptyState } from '../components/ui'
import { useToast } from '../lib/toast'
import { loadIncidents, saveIncidents } from '../lib/storage'

const SEV_META: Record<Incident['severity'], { label: string; color: string }> = {
  faible:   { label: 'Faible',   color: '#38a169' },
  modere:   { label: 'Modéré',   color: '#e8a020' },
  eleve:    { label: 'Élevé',    color: '#dd6b20' },
  critique: { label: 'Critique', color: '#e53e3e' },
}

const STATUS_META: Record<Incident['status'], { label: string; color: string }> = {
  ouvert:   { label: 'Ouvert',     color: '#e53e3e' },
  en_cours: { label: 'En cours',   color: '#e8a020' },
  resolu:   { label: 'Résolu',     color: '#38a169' },
}

// Associe chaque carte de synthèse (libellé affiché) à sa clé de gravité réelle,
// pour éviter toute comparaison fragile basée sur les accents.
const SEVERITY_BY_LABEL: Record<string, Incident['severity']> = {
  Faible: 'faible', Modéré: 'modere', Élevé: 'eleve', Critique: 'critique',
}

let incidentSeq = INCIDENTS.length + 1

function NewIncidentModal({ onClose, user, onCreate }: { onClose: () => void; user: AuthUser; onCreate: (i: Incident) => void }) {
  const [form, setForm] = useState({
    depotId: user.depotId ?? 'D1',
    type: '',
    customType: '',
    description: '',
  })
  const [touched, setTouched] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const selectedType = form.type === 'Autre' ? form.customType.trim() : form.type.trim()
  const isValid = selectedType !== '' && form.description.trim() !== ''

  const inputCls: React.CSSProperties = {
    background: '#060912', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  }

  function handleCreate() {
    setTouched(true)
    if (!isValid) return
    const t = selectedType.toLowerCase()
    const severity: Incident['severity'] = t.includes('fuite') ? 'eleve' : t.includes('panne') ? 'critique' : 'modere'
    const newIncident: Incident = {
      id: `I${incidentSeq}`,
      ref: `INC-2024-0${159 + incidentSeq}`,
      depotId: form.depotId,
      type: selectedType,
      severity,
      description: form.description.trim(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      costFCFA: 0,
      status: 'ouvert',
    }
    incidentSeq += 1
    onCreate(newIncident)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border animate-slide-up"
        style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 1 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
          <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
            DÉCLARER UN INCIDENT
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            style={{ color: '#4a5568' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>Dépôt</label>
              <select value={form.depotId} onChange={e => set('depotId', e.target.value)}
                style={{ ...inputCls, appearance: 'none', opacity: user.role === 'depot' ? 0.6 : 1 }} disabled={user.role === 'depot'}>
                {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.city}</option>)}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>Type d'incident</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inputCls, appearance: 'none' }}>
                <option value="">Sélectionner un type</option>
                <option value="Fuite">Fuite</option>
                <option value="Panne">Panne</option>
                <option value="Anomalie stock">Anomalie stock</option>
                <option value="Autre">Autre</option>
              </select>
              {form.type === 'Autre' && (
                <input value={form.customType} onChange={e => set('customType', e.target.value)} placeholder="Précisez le type..." style={{ ...inputCls, marginTop: 8 }} />
              )}
            </div>
          </div>
          <div>
            <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Description détaillée de l'incident..."
              rows={4} style={{ ...inputCls, resize: 'none', borderColor: touched && !form.description.trim() ? '#e53e3e' : '#1c2540' }} />
          </div>
          
          {touched && !isValid && (
            <p className="text-xs" style={{ color: '#e53e3e' }}>Le type et la description sont obligatoires.</p>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1 text-base" onClick={handleCreate}
            style={{ background: 'linear-gradient(135deg, #dd6b20, #e53e3e)', color: '#000', boxShadow: '0 4px 16px rgba(229,62,62,0.2)' }}>
            DÉCLARER
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Incidents({ user }: { user: AuthUser }) {
  const { push } = useToast()
  const [allIncidents, setAllIncidents] = useState<Incident[]>(() => loadIncidents())
  const [sevFilter, setSevFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const canCreate = ['depot', 'admin'].includes(user.role)
  const isReadOnly = user.role === 'direction'

  const incidents = useMemo(() => allIncidents.filter(i => {
    if (user.role === 'depot' && i.depotId !== user.depotId) return false
    if (sevFilter !== 'all' && i.severity !== sevFilter) return false
    if (statusFilter !== 'all' && i.status !== statusFilter) return false
    return true
  }), [allIncidents, sevFilter, statusFilter, user])

  const totalCost = incidents.reduce((a, i) => a + i.costFCFA, 0)

  function updateStatus(id: string, status: Incident['status'], message: string) {
    setAllIncidents(list => {
      const next = list.map(i => i.id === id ? { ...i, status } : i)
      saveIncidents(next)
      return next
    })
    push(message)
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {showModal && (
        <NewIncidentModal user={user} onClose={() => setShowModal(false)}
          onCreate={incident => { setAllIncidents(list => { const next = [incident, ...list]; saveIncidents(next); return next }) ; push(`Incident ${incident.ref} déclaré.`, 'error') }} />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INCIDENT_BY_SEVERITY.map(s => {
          const key = SEVERITY_BY_LABEL[s.name]
          const active = sevFilter === key
          return (
            <button key={s.name}
              onClick={() => setSevFilter(active ? 'all' : key)}
              className="p-4 rounded-xl border transition-all text-left"
              style={{ background: '#0c1121', borderColor: active ? s.fill : '#1c2540' }}>
              <div className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: '#4a5568' }}>{s.name}</div>
              <div className="font-display text-3xl font-bold" style={{ color: s.fill }}>{s.count}</div>
            </button>
          )
        })}
      </div>

      {/* Filters + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
            style={{ background: '#0c1121', border: '1px solid #1c2540', color: '#e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none' }}>
            <option value="all">Toutes gravités</option>
            {Object.entries(SEV_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#0c1121', border: '1px solid #1c2540', color: '#e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 12, fontFamily: "'JetBrains Mono', monospace", outline: 'none' }}>
            <option value="all">Tous statuts</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="font-mono text-xs" style={{ color: '#4a5568' }}>
            Coût total: <span className="text-white">{fmt.fcfa(totalCost)}</span>
          </span>
        </div>
        {canCreate && (
          <Button onClick={() => setShowModal(true)}
            style={{ background: 'linear-gradient(135deg, #dd6b20, #e53e3e)', color: '#000', boxShadow: '0 4px 12px rgba(229,62,62,0.2)' }}>
            <Plus size={16} />
            DÉCLARER INCIDENT
          </Button>
        )}
      </div>

      {/* Incidents list */}
      <div className="space-y-3">
        {incidents.map(i => {
          const sev = SEV_META[i.severity]
          const stat = STATUS_META[i.status]
          return (
            <div key={i.id}
              className="rounded-xl border p-5 transition-all"
              style={{
                background: i.severity === 'critique' ? 'rgba(229,62,62,0.04)' : '#0c1121',
                borderColor: i.severity === 'critique' ? 'rgba(229,62,62,0.25)' : '#1c2540',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = sev.color + '40')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = i.severity === 'critique' ? 'rgba(229,62,62,0.25)' : '#1c2540')}>
              <div className="flex items-start gap-4">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${i.severity === 'critique' ? 'pulse-danger' : ''}`}
                  style={{ background: sev.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-mono text-xs" style={{ color: '#4a5568' }}>{i.ref}</span>
                    <span className="text-white font-medium">{i.type}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: sev.color + '15', color: sev.color }}>{sev.label.toUpperCase()}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{ background: stat.color + '12', color: stat.color }}>{stat.label}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: '#94a3b8' }}>{i.description}</p>
                  <div className="flex items-center gap-4 font-mono text-xs" style={{ color: '#4a5568' }}>
                    <span>{getDepotName(i.depotId)}</span>
                    <span>{i.date}</span>
                    {i.costFCFA > 0 && <span style={{ color: '#dd6b20' }}>Coût: {fmt.fcfa(i.costFCFA)}</span>}
                  </div>
                </div>
                {!isReadOnly && i.status !== 'resolu' && (
                  <div className="flex gap-2 shrink-0">
                    {i.status === 'ouvert' && (
                      <Button size="sm" variant="outline" style={{ borderColor: '#e8a020', color: '#e8a020', background: 'rgba(232,160,32,0.08)' }}
                        onClick={() => updateStatus(i.id, 'en_cours', `Incident ${i.ref} pris en charge.`)}>
                        Prendre en charge
                      </Button>
                    )}
                    {i.status === 'en_cours' && (
                      <Button size="sm" variant="outline" style={{ borderColor: '#38a169', color: '#38a169', background: 'rgba(56,161,105,0.08)' }}
                        onClick={() => updateStatus(i.id, 'resolu', `Incident ${i.ref} clôturé.`)}>
                        Clôturer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        {incidents.length === 0 && <EmptyState message="Aucun incident ne correspond à ces filtres." />}
      </div>
    </div>
  )
}
