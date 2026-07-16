import Link from "next/link";
import { useRouter } from "next/router";
import { BarChart3, Box, ClipboardList, Gauge, TriangleAlert, TrendingUp, Wallet } from "lucide-react";

const LIENS = [
  { href: "/", label: "Tableau de bord", icon: Gauge },
  { href: "/stocks", label: "Stocks", icon: Box },
  { href: "/previsions", label: "Prévisions", icon: TrendingUp },
  { href: "/anomalies", label: "Anomalies", icon: TriangleAlert },
  { href: "/commandes", label: "Commandes", icon: ClipboardList },
  { href: "/incidents", label: "Incidents", icon: BarChart3 },
  { href: "/finances", label: "Finances", icon: Wallet },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-950 text-white shadow-soft">
            <Gauge size={20} strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-700">PetroStock SA</p>
            <p className="text-sm text-muted">Dashboard de supervision des stocks</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {LIENS.map((lien) => {
            const actif = router.pathname === lien.href;
            const Icon = lien.icon;
            return (
              <Link
                key={lien.href}
                href={lien.href}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  actif
                    ? "border-brand-200 bg-brand-950 text-white shadow-soft"
                    : "border-transparent bg-slate-100/80 text-slate-700 hover:border-brand-100 hover:bg-white hover:text-brand-900 hover:shadow-soft"
                }`}
              >
                <Icon size={16} strokeWidth={2.2} className={actif ? "text-accent-300" : "text-brand-700 transition group-hover:text-brand-900"} />
                {lien.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
