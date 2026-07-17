import Link from "next/link";

/** Barre d'actions groupées — apparaît quand des lignes sont sélectionnées */
export default function ActionBar({ count, children, onClear }) {
  if (!count) return null;
  return (
    <div className="sticky top-[57px] z-20 mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-navy-300 bg-navy-800 px-4 py-3 text-white shadow-raised animate-fade-up">
      <div className="flex items-center gap-3 text-sm">
        <span className="font-semibold mono-nums">{count}</span>
        <span className="text-white/70">sélectionné{count > 1 ? "s" : ""}</span>
        {onClear && (
          <button type="button" onClick={onClear} className="text-xs text-accent underline-offset-2 hover:underline">
            Tout désélectionner
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function ActionBarBtn({ children, onClick, variant = "default", href, disabled = false }) {
  const cls =
    variant === "primary"
      ? "bg-accent text-navy-900 hover:brightness-110"
      : variant === "danger"
        ? "bg-danger text-white hover:bg-danger/90"
        : "bg-white/10 text-white hover:bg-white/20";
  const base = `inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${cls}`;
  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  );
}
