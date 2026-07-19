import { useMemo, useState } from 'react'
import { Warehouse, ShoppingCart, TrendingUp, Shield, Flame, Eye, EyeOff } from 'lucide-react'
import type { Role } from './data'
import { DEMO_USERS, ROLE_LABELS } from './data'
import { loadAuthUsers, saveAuthUsers } from './lib/storage'

interface LoginProps {
  onLogin: (role: Role) => void
}

const ROLE_CONFIG: { role: Role; icon: typeof Warehouse; desc: string; color: string; accent: string }[] = [
  { role: 'depot', icon: Warehouse, desc: 'Gestion des stocks, mouvements et alertes de dépôt', color: '#3b82f6', accent: 'rgba(59,130,246,0.12)' },
  { role: 'achat', icon: ShoppingCart, desc: 'Commandes fournisseurs, approvisionnements, prévisions', color: '#8b5cf6', accent: 'rgba(139,92,246,0.12)' },
  { role: 'direction', icon: TrendingUp, desc: 'KPIs nationaux, finances, analyse stratégique', color: '#e8a020', accent: 'rgba(232,160,32,0.12)' },
  { role: 'admin', icon: Shield, desc: 'Gestion des utilisateurs, configuration système', color: '#e53e3e', accent: 'rgba(229,62,62,0.12)' },
]

const DEMO_CREDS: Record<Role, { email: string; pass: string }> = {
  depot:     { email: 'k.asante@petrostock.tg', pass: 'depot2024' },
  achat:     { email: 'y.dossou@petrostock.tg', pass: 'achat2024' },
  direction: { email: 's.koffi@petrostock.tg',  pass: 'dir2024' },
  admin:     { email: 'admin@petrostock.tg',     pass: 'admin2024' },
}

function getStoredAuthUsers() {
  const stored = loadAuthUsers()
  return stored.length > 0 ? stored : []
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const storedUsers = useMemo(() => getStoredAuthUsers(), [])

  function handleRoleSelect(role: Role) {
    setSelectedRole(role)
    setEmail(DEMO_CREDS[role].email)
    setPassword(DEMO_CREDS[role].pass)
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole) { setError('Veuillez sélectionner un profil.'); return }

    const expected = DEMO_CREDS[selectedRole]
    const matchesDemo = email.trim().toLowerCase() === expected.email && password === expected.pass
    const matchesStored = storedUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password && u.role === selectedRole)

    if (!matchesDemo && !matchesStored) {
      setError('Identifiant ou mot de passe incorrect.');
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin(selectedRole)
    }, 900)
  }

  const roleColor = selectedRole ? ROLE_CONFIG.find(r => r.role === selectedRole)!.color : '#e8a020'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 60%, #0e1520 0%, #060912 70%)' }}>

      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(232,160,32,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,32,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px'
      }} />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${roleColor}08 0%, transparent 70%)`, transition: 'all 0.6s ease' }} />

      {/* Header */}
      <div className="relative z-10 text-center mb-10 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #e8a020, #dd6b20)', boxShadow: '0 0 24px rgba(232,160,32,0.4)' }}>
            <Flame size={20} className="text-black" />
          </div>
          <h1 className="font-display text-5xl font-bold tracking-widest text-white" style={{ letterSpacing: '0.15em' }}>
            PETROSTOCK SA
          </h1>
        </div>
        <p className="font-mono text-xs tracking-[0.25em] uppercase" style={{ color: '#718096' }}>
          Système Intelligent de Gestion des Stocks · Togo · 2024
        </p>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-2xl mx-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
        <div className="rounded-xl border p-8" style={{ background: '#0c1121', borderColor: '#1c2540' }}>

          <div className="mb-6">
            <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: '#4a5568' }}>
              Sélectionnez votre profil
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_CONFIG.map(({ role, icon: Icon, desc, color, accent }) => {
                const selected = selectedRole === role
                return (
                  <button key={role} onClick={() => handleRoleSelect(role)}
                    className="text-left p-4 rounded-lg border transition-all duration-200 group"
                    style={{
                      background: selected ? accent : 'rgba(255,255,255,0.02)',
                      borderColor: selected ? color : '#1c2540',
                      boxShadow: selected ? `0 0 20px ${color}20` : 'none',
                      transform: selected ? 'translateY(-1px)' : 'none',
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: selected ? color : 'rgba(255,255,255,0.06)', transition: 'background 0.2s' }}>
                        <Icon size={16} style={{ color: selected ? '#000' : color }} />
                      </div>
                      <div>
                        <div className="font-display text-sm font-bold tracking-wide mb-1"
                          style={{ color: selected ? color : '#e2e8f0', fontSize: '15px' }}>
                          {ROLE_LABELS[role].toUpperCase()}
                        </div>
                        <div className="text-xs leading-snug" style={{ color: '#718096' }}>{desc}</div>
                      </div>
                    </div>
                    {selected && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <span className="font-mono text-xs" style={{ color }}>PROFIL ACTIF</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Login form */}
          <div style={{ opacity: selectedRole ? 1 : 0.35, transition: 'opacity 0.3s', pointerEvents: selectedRole ? 'all' : 'none' }}>
            <div className="border-t mb-6" style={{ borderColor: '#1c2540' }} />
            <p className="font-mono text-xs tracking-widest uppercase mb-4" style={{ color: '#4a5568' }}>
              Authentification
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>
                  Identifiant
                </label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="utilisateur@petrostock.tg"
                  className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-all"
                  style={{
                    background: '#060912', borderColor: '#1c2540', color: '#e2e8f0',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                  }}
                  onFocus={e => (e.target.style.borderColor = roleColor)}
                  onBlur={e => (e.target.style.borderColor = '#1c2540')}
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-widest mb-1.5 block" style={{ color: '#4a5568' }}>
                  Mot de passe
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-lg border text-sm outline-none transition-all"
                    style={{
                      background: '#060912', borderColor: '#1c2540', color: '#e2e8f0',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
                    }}
                    onFocus={e => (e.target.style.borderColor = roleColor)}
                    onBlur={e => (e.target.style.borderColor = '#1c2540')}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{ color: '#4a5568' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {selectedRole && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.2)' }}>
                  <span className="font-mono text-xs" style={{ color: '#718096' }}>DÉMO ·</span>
                  <span className="font-mono text-xs" style={{ color: '#e8a020' }}>
                    {DEMO_CREDS[selectedRole].email} / {DEMO_CREDS[selectedRole].pass}
                  </span>
                </div>
              )}

              {storedUsers.length > 0 && (
                <div className="text-xs" style={{ color: '#4a5568' }}>
                  Comptes personnalisés enregistrés : {storedUsers.length}
                </div>
              )}

              {error && (
                <div className="text-xs px-3 py-2 rounded-md" style={{ background: 'rgba(229,62,62,0.1)', color: '#e53e3e', border: '1px solid rgba(229,62,62,0.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-lg font-display text-lg font-bold tracking-widest transition-all duration-200 mt-1"
                style={{
                  background: loading ? 'rgba(232,160,32,0.4)' : `linear-gradient(135deg, ${roleColor}, ${roleColor}cc)`,
                  color: '#000',
                  letterSpacing: '0.15em',
                  boxShadow: loading ? 'none' : `0 4px 20px ${roleColor}30`,
                }}>
                {loading ? '· · ·' : 'CONNEXION'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-xs mt-4" style={{ color: '#2d3748' }}>
          PetroStock SA · EPL 2025–2026 · Lomé, Togo
        </p>
      </div>
    </div>
  )
}
