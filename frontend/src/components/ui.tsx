import { forwardRef } from 'react'
import { Inbox } from 'lucide-react'

type Variant = 'primary' | 'danger' | 'outline' | 'ghost' | 'success'
type Size = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #e8a020, #dd6b20)',
    color: '#000',
    boxShadow: '0 4px 14px rgba(232,160,32,0.22)',
  },
  danger: {
    background: 'linear-gradient(135deg, #e53e3e, #c53030)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(229,62,62,0.22)',
  },
  success: {
    background: 'linear-gradient(135deg, #38a169, #2f855a)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(56,161,105,0.22)',
  },
  outline: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #1c2540',
  },
  ghost: {
    background: 'transparent',
    color: '#718096',
  },
}

const SIZE_STYLE: Record<Size, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8 },
  md: { padding: '10px 18px', fontSize: 13, borderRadius: 10 },
}

/**
 * Bouton standardisé de l'application : mêmes hauteurs, mêmes espacements,
 * mêmes états (hover / focus / disabled) partout, pour éviter les
 * décalages visuels entre les pages.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'outline', size = 'md', className = '', style, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-display font-bold tracking-wider transition-all duration-150 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-110 active:scale-[0.98]'
      } ${className}`}
      style={{
        ...VARIANT_STYLE[variant],
        ...SIZE_STYLE[size],
        letterSpacing: '0.08em',
        outlineColor: '#e8a020',
        ...style,
      }}
      {...rest}>
      {children}
    </button>
  )
})

/** État vide cohérent pour listes / tableaux filtrés sans résultat. */
export function EmptyState({ message = 'Aucun résultat pour ces filtres.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#0c1121', border: '1px solid #1c2540' }}>
        <Inbox size={20} style={{ color: '#4a5568' }} />
      </div>
      <p className="font-mono text-xs" style={{ color: '#4a5568' }}>{message}</p>
    </div>
  )
}
