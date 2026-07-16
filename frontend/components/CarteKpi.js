import { ArrowDownRight, ArrowUpRight, CircleGauge } from "lucide-react";

const STYLES = {
  normal: {
    accent: "border-success-200 bg-success-50 text-success-700",
    icon: CircleGauge,
    badge: "Normal",
  },
  attention: {
    accent: "border-warning-200 bg-warning-50 text-warning-700",
    icon: ArrowUpRight,
    badge: "Attention",
  },
  critique: {
    accent: "border-danger-200 bg-danger-50 text-danger-700",
    icon: ArrowDownRight,
    badge: "Critique",
  },
  info: {
    accent: "border-brand-200 bg-brand-50 text-brand-700",
    icon: CircleGauge,
    badge: "Donnée",
  },
};

export default function CarteKpi({ titre, valeur, sousTitre, niveau = "info" }) {
  const style = STYLES[niveau] || STYLES.info;
  const Icon = style.icon;

  return (
    <article className={`rounded-2xl border ${style.accent} bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{titre}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{valeur}</p>
          {sousTitre && <p className="mt-2 text-sm text-muted">{sousTitre}</p>}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5">
          <Icon size={22} strokeWidth={2.2} className="text-brand-900" />
        </div>
      </div>
      <div className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {style.badge}
      </div>
    </article>
  );
}
