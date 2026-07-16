import { Loader2 } from "lucide-react";

function SkeletonBlock({ className }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export default function EtatChargement({ chargement, erreur, children, title = "Chargement des données" }) {
  if (chargement) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/60 bg-white/85 p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-800">
            <Loader2 size={18} className="animate-spin" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{title}</p>
            <p className="text-sm text-muted">Préparation de l’interface et des indicateurs en cours.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-72" />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="rounded-2xl border border-danger-200 bg-danger-50 p-6 text-danger-800 shadow-soft">
        <p className="text-lg font-semibold">Impossible de charger la page</p>
        <p className="mt-2 text-sm text-danger-700/90">{erreur}</p>
      </div>
    );
  }

  return children;
}
