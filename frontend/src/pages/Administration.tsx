import { useMemo, useState } from 'react'
import { Plus, Edit2, Power, Shield, X } from 'lucide-react'
import { SYSTEM_USERS, DEPOTS, ROLE_LABELS, ROLE_COLORS } from '../data'
import type { Role, SystemUser } from '../data'
import { Button } from '../components/ui'
import { useToast } from '../lib/toast'
import { loadAuditLog, loadUsers, loadAuthUsers, saveAuditLog, saveAuthUsers, saveUsers } from '../lib/storage'

const ROLE_BADGE_ORDER: Role[] = ['admin', 'direction', 'achat', 'depot']
let userSeq = SYSTEM_USERS.length + 1

function RoleBadge({ role }: { role: Role }) {
  const color = ROLE_COLORS[role]
  return (
    <span className="font-mono text-xs px-2 py-0.5 rounded"
      style={{ background: color + '15', color }}>
      {role.toUpperCase()}
    </span>
  )
}

function UserModal({
  onClose,
  onSave,
  initialUser,
  initialPassword,
}: {
  onClose: () => void
  onSave: (u: SystemUser, password?: string) => void
  initialUser?: SystemUser
  initialPassword?: string
}) {
  const [form, setForm] = useState({
    name: initialUser?.name ?? '',
    email: initialUser?.email ?? '',
    role: initialUser?.role ?? 'depot' as Role,
    depotId: initialUser?.depotId ?? 'D1',
    password: initialPassword ?? '',
  })
  const [touched, setTouched] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const isNew = !initialUser
  const passwordValid = isNew ? form.password.length >= 6 : form.password.length === 0 || form.password.length >= 6
  const isValid = form.name.trim() !== '' && /\S+@\S+\.\S+/.test(form.email) && passwordValid

  const inputCls: React.CSSProperties = {
    background: '#060912', border: '1px solid #1c2540', color: '#e2e8f0',
    borderRadius: 6, padding: '8px 12px', fontSize: 13, outline: 'none', width: '100%',
    fontFamily: "'DM Sans', sans-serif",
  }
  const labelCls = "font-mono text-xs uppercase tracking-widest mb-1.5 block"

  function initials(name: string) {
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  function handleSave() {
    setTouched(true)
    if (!isValid) return
    const user: SystemUser = {
      id: initialUser?.id ?? `U${userSeq}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      depotId: form.role === 'depot' ? form.depotId : undefined,
      active: initialUser?.active ?? true,
      lastLogin: initialUser?.lastLogin ?? '—',
      avatar: initials(form.name),
    }
    if (!initialUser) userSeq += 1
    onSave(user, form.password.trim() || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={e => e.key === 'Escape' && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border animate-slide-up"
        style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 1 }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
          <h2 className="font-display text-xl font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
            {initialUser ? 'MODIFIER UN UTILISATEUR' : 'CRÉER UN UTILISATEUR'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
            style={{ color: '#4a5568' }}>
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Nom complet</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="ex: Ama Bediako"
              style={{ ...inputCls, borderColor: touched && !form.name.trim() ? '#e53e3e' : '#1c2540' }} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Email</label>
            <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="prenom.nom@petrostock.tg"
              style={{ ...inputCls, borderColor: touched && !/\S+@\S+\.\S+/.test(form.email) ? '#e53e3e' : '#1c2540' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: '#4a5568' }}>Rôle</label>
              <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inputCls, appearance: 'none' }}>
                {(Object.keys(ROLE_LABELS) as Role[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            {form.role === 'depot' && (
              <div>
                <label className={labelCls} style={{ color: '#4a5568' }}>Dépôt</label>
                <select value={form.depotId} onChange={e => set('depotId', e.target.value)} style={{ ...inputCls, appearance: 'none' }}>
                  {DEPOTS.map(d => <option key={d.id} value={d.id}>{d.city}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className={labelCls} style={{ color: '#4a5568' }}>Mot de passe</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="motdepasse123"
              style={{ ...inputCls, borderColor: touched && form.password.length < 6 ? '#e53e3e' : '#1c2540' }} />
          </div>
          {touched && !isValid && (
            <p className="text-xs" style={{ color: '#e53e3e' }}>Un nom, un email valide et un mot de passe de 6 caractères minimum sont requis.</p>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button variant="danger" className="flex-1 text-base" onClick={handleSave}>{initialUser ? 'ENREGISTRER' : 'CRÉER'}</Button>
        </div>
      </div>
    </div>
  )
}

export default function Administration() {
  const { push } = useToast()
  const [activeTab, setActiveTab] = useState<'users' | 'config' | 'logs'>('users')
  const [users, setUsers] = useState<SystemUser[]>(() => loadUsers())
  const [authUsers, setAuthUsers] = useState(() => loadAuthUsers())
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [auditLog, setAuditLog] = useState(() => loadAuditLog())
  const [deleteConfirm, setDeleteConfirm] = useState<SystemUser | null>(null)

  function toggleUser(id: string) {
    setUsers(u => {
      const next = u.map(user => {
        if (user.id !== id) return user
        const active = !user.active
        push(`${user.name} ${active ? 'réactivé' : 'désactivé'}.`, active ? 'success' : 'error')
        return { ...user, active }
      })
      saveUsers(next)
      const targetUser = u.find(user => user.id === id)
      if (targetUser) {
        const authNext = authUsers.map(a => a.email === targetUser.email ? { ...a, active: !targetUser.active } : a)
        setAuthUsers(authNext)
        saveAuthUsers(authNext)
      }
      setAuditLog(list => {
        const user = u.find(user => user.id === id)
        const entry = { ts: new Date().toLocaleTimeString('fr-FR', { hour12: false }), user: 'admin@petrostock.tg', action: user?.active ? 'USER_DISABLED' : 'USER_REACTIVATED', target: user?.name ?? 'Utilisateur', level: 'INFO' as const }
        const nextLog = [entry, ...list]
        saveAuditLog(nextLog)
        return nextLog
      })
      return next
    })
  }

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'users', label: 'Utilisateurs' },
    { id: 'config', label: 'Configuration' },
    { id: 'logs', label: 'Audit Log' },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="relative w-full max-w-md rounded-xl border animate-slide-up" style={{ background: '#0c1121', borderColor: '#1c2540', zIndex: 51 }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: '#1c2540' }}>
              <h2 className="font-display text-lg font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>CONFIRMER SUPPRESSION</h2>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm" style={{ color: '#e2e8f0' }}>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
              <div className="rounded-lg border p-3" style={{ background: '#060912', borderColor: '#1c2540' }}>
                <div className="font-mono text-xs" style={{ color: '#4a5568' }}>Utilisateur</div>
                <div className="font-medium text-white mt-1">{deleteConfirm.name}</div>
                <div className="font-mono text-xs mt-1" style={{ color: '#718096' }}>{deleteConfirm.email}</div>
              </div>
              <p className="text-xs" style={{ color: '#e53e3e' }}>Cette action est irréversible.</p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white/5"
                style={{ borderColor: '#1c2540', color: '#718096' }}>Annuler</button>
              <button onClick={() => {
                const next = users.filter(item => item.id !== deleteConfirm.id)
                setUsers(next)
                saveUsers(next)
                const authNext = authUsers.filter(item => item.email !== deleteConfirm.email)
                setAuthUsers(authNext)
                saveAuthUsers(authNext)
                setAuditLog(list => {
                  const entry = { ts: new Date().toLocaleTimeString('fr-FR', { hour12: false }), user: 'admin@petrostock.tg', action: 'USER_DELETED', target: deleteConfirm.email, level: 'ERROR' as const }
                  const nextLog = [entry, ...list]
                  saveAuditLog(nextLog)
                  return nextLog
                })
                push(`Utilisateur ${deleteConfirm.name} supprimé.`, 'error')
                setDeleteConfirm(null)
              }}
                className="flex-1 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-colors font-bold"
                style={{ background: '#e53e3e', color: '#000' }}>SUPPRIMER</button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <UserModal onClose={() => { setShowModal(false); setEditingUser(null) }}
          initialUser={editingUser ?? undefined}
          onSave={(user, password) => {
            if (editingUser) {
              const next = users.map(u => u.id === user.id ? user : u)
              setUsers(next)
              saveUsers(next)
              const authNext = authUsers.map(a => a.email === editingUser.email ? { ...a, name: user.name, email: user.email, role: user.role, depotId: user.depotId, password: password ?? a.password } : a)
              setAuthUsers(authNext)
              saveAuthUsers(authNext)
              const entry = { ts: new Date().toLocaleTimeString('fr-FR', { hour12: false }), user: 'admin@petrostock.tg', action: 'USER_UPDATED', target: user.email, level: 'INFO' as const }
              const nextLog = [entry, ...auditLog]
              setAuditLog(nextLog)
              saveAuditLog(nextLog)
              push(`Utilisateur ${user.name} mis à jour.`)
            } else {
              const next = [user, ...users]
              setUsers(next)
              saveUsers(next)
              const authNext = [...authUsers, { name: user.name, email: user.email, password: password ?? 'petrostock2024', role: user.role, depotId: user.depotId, active: true }]
              saveAuthUsers(authNext)
              setAuthUsers(authNext)
              const entry = { ts: new Date().toLocaleTimeString('fr-FR', { hour12: false }), user: 'admin@petrostock.tg', action: 'USER_CREATED', target: user.email, level: 'INFO' as const }
              const nextLog = [entry, ...auditLog]
              setAuditLog(nextLog)
              saveAuditLog(nextLog)
              push(`Utilisateur ${user.name} créé.`)
            }
          }} />
      )}

      {/* Admin header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border"
        style={{ background: 'rgba(229,62,62,0.05)', borderColor: 'rgba(229,62,62,0.2)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(229,62,62,0.15)' }}>
          <Shield size={18} style={{ color: '#e53e3e' }} />
        </div>
        <div>
          <div className="font-display text-sm font-bold tracking-wide" style={{ color: '#fca5a5', letterSpacing: '0.08em' }}>
            PANNEAU ADMINISTRATEUR
          </div>
          <div className="font-mono text-xs" style={{ color: '#4a5568' }}>
            Accès restreint · Toutes modifications sont auditées
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#0c1121', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-5 py-2 rounded-lg font-mono text-xs uppercase tracking-widest transition-all"
            style={{
              background: activeTab === t.id ? '#1c2540' : 'transparent',
              color: activeTab === t.id ? '#e2e8f0' : '#4a5568',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {ROLE_BADGE_ORDER.map(role => {
                const count = users.filter(u => u.role === role).length
                return (
                  <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs"
                    style={{ borderColor: '#1c2540', background: '#0c1121', color: ROLE_COLORS[role] }}>
                    <span className="w-4 h-4 rounded flex items-center justify-center text-black font-bold"
                      style={{ background: ROLE_COLORS[role], fontSize: 10 }}>{count}</span>
                    {ROLE_LABELS[role]}
                  </div>
                )
              })}
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowModal(true)}>
              <Plus size={14} />
              CRÉER UTILISATEUR
            </Button>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1c2540' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: '#0a0f1c', borderBottom: '1px solid #1c2540' }}>
                  {['Utilisateur','Email','Rôle','Dépôt','Statut','Dernière connexion','Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-xs uppercase tracking-widest whitespace-nowrap" style={{ color: '#4a5568' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const depot = u.depotId ? DEPOTS.find(d => d.id === u.depotId) : null
                  return (
                    <tr key={u.id} className="border-b last:border-0 transition-colors"
                      style={{ borderColor: '#1c2540', opacity: u.active ? 1 : 0.5 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center font-mono text-xs font-bold shrink-0"
                            style={{ background: ROLE_COLORS[u.role] + '20', color: ROLE_COLORS[u.role] }}>
                            {u.avatar}
                          </div>
                          <span className="text-white font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#718096' }}>
                        {depot ? depot.city : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.active ? '#38a169' : '#4a5568' }} />
                          <span className="font-mono text-xs" style={{ color: u.active ? '#38a169' : '#4a5568' }}>
                            {u.active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: '#4a5568' }}>{u.lastLogin}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => { setEditingUser(u); setShowModal(true) }}
                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/5"
                            style={{ color: '#718096' }} title="Modifier">
                            <Edit2 size={13} />
                          </button>
                          {u.id !== 'U8' && (
                            <button onClick={() => setDeleteConfirm(u)}
                              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-white/5"
                              style={{ color: '#e53e3e' }}
                              title="Supprimer">
                              <X size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Config tab */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Dépôts & Capacités', items: DEPOTS.map(d => ({ key: d.city, val: `${(d.capacity/1_000_000).toFixed(1)} ML` })) },
            { title: 'Seuils d\'alerte globaux', items: [
              { key: 'Seuil critique', val: '< 10% capacité' },
              { key: 'Seuil avertissement', val: '< 25% capacité' },
              { key: 'Délai rupture critique', val: '≤ 5 jours' },
              { key: 'Délai rupture alerte', val: '≤ 10 jours' },
            ]},
            { title: 'Paramètres IA', items: [
              { key: 'Modèle prévision', val: 'Prophet + LSTM' },
              { key: 'Horizon prévision', val: '30 jours' },
              { key: 'Intervalle recalcul', val: 'Quotidien 02:00' },
              { key: 'Seuil anomalie (z-score)', val: '3.0' },
            ]},
            { title: 'Notifications', items: [
              { key: 'Email alertes critiques', val: 'Activé' },
              { key: 'SMS rupture imminente', val: 'Activé' },
              { key: 'Rapport quotidien', val: '07:00 WAT' },
              { key: 'Rapport mensuel', val: '1er du mois' },
            ]},
          ].map(section => (
            <div key={section.title} className="rounded-xl border p-5" style={{ background: '#0c1121', borderColor: '#1c2540' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 rounded" style={{ background: '#e53e3e' }} />
                  <h3 className="font-display text-sm font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>
                    {section.title.toUpperCase()}
                  </h3>
                </div>
                <button
                  onClick={() => push(`Modification de « ${section.title} » — fonctionnalité à venir.`, 'info')}
                  className="font-mono text-xs px-2 py-1 rounded border hover:bg-white/5 transition-colors"
                  style={{ borderColor: '#1c2540', color: '#718096' }}>
                  Modifier
                </button>
              </div>
              <div className="space-y-2.5">
                {section.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#1c2540' }}>
                    <span className="font-mono text-xs" style={{ color: '#718096' }}>{item.key}</span>
                    <span className="font-mono text-xs text-white">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit log tab */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: '#1c2540' }}>
          <div className="px-5 py-3 border-b" style={{ background: '#0a0f1c', borderColor: '#1c2540' }}>
            <span className="font-display text-sm font-bold tracking-wide text-white" style={{ letterSpacing: '0.06em' }}>JOURNAL D'AUDIT — 2024-07-19</span>
          </div>
          <div className="p-4 space-y-1">
            {([...(auditLog ?? []), ...[
              { ts: '10:42:05', user: 'admin@petrostock.tg', action: 'LOGIN_SUCCESS', target: 'Session #8841', level: 'INFO' },
              { ts: '10:38:21', user: 'Système IA', action: 'ALERT_CREATED', target: 'Stock bas · D2·P1', level: 'WARN' },
              { ts: '10:35:14', user: 'a.mensah@petrostock.tg', action: 'ORDER_CREATED', target: 'BC-2024-0745', level: 'INFO' },
              { ts: '10:22:08', user: 'Système', action: 'SENSOR_TIMEOUT', target: 'Capteur D7-C3', level: 'ERROR' },
              { ts: '09:58:44', user: 'Système', action: 'BACKUP_COMPLETE', target: 'DB 1.8 GB', level: 'INFO' },
              { ts: '09:31:02', user: 'Système IA', action: 'ANOMALY_DETECTED', target: 'INC-2024-0158', level: 'WARN' },
              { ts: '09:15:44', user: 'y.dossou@petrostock.tg', action: 'ORDER_APPROVED', target: 'BC-2024-0741', level: 'INFO' },
              { ts: '08:50:12', user: 'm.tagba@petrostock.tg', action: 'LOGIN_SUCCESS', target: 'Session #8840', level: 'INFO' },
              { ts: '08:12:33', user: 'k.asante@petrostock.tg', action: 'LOGIN_SUCCESS', target: 'Session #8839', level: 'INFO' },
              { ts: '07:45:01', user: 'a.mensah@petrostock.tg', action: 'STOCK_UPDATED', target: 'D2 · 4 produits', level: 'INFO' },
              { ts: '06:00:02', user: 'Système', action: 'DAILY_SYNC', target: '22 entrées stocks', level: 'INFO' },
            ]]).slice(0, 12).map((log, i) => {
              const c = log.level === 'ERROR' ? '#e53e3e' : log.level === 'WARN' ? '#e8a020' : '#38a169'
              return (
                <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0 font-mono text-xs" style={{ borderColor: '#1c2540' }}>
                  <span className="w-20 shrink-0" style={{ color: '#4a5568' }}>{log.ts}</span>
                  <span className="w-14 text-center px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: c + '15', color: c }}>{log.level}</span>
                  <span className="w-28 shrink-0" style={{ color: '#718096' }}>{log.user.split('@')[0]}</span>
                  <span className="w-32 shrink-0 font-bold" style={{ color: '#e2e8f0' }}>{log.action}</span>
                  <span style={{ color: '#718096' }}>{log.target}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
