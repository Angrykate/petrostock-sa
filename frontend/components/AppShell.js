import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Bell,
  ChevronDown,
  CircleUserRound,
  Gauge,
  Menu,
  X,
} from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { NAV_ITEMS, ROLE_OPTIONS } from "../lib/constants";
import { api } from "../lib/api";
import { labelDepot, labelProduit, niveauAlerte } from "../lib/mockData";
import Badge from "./ui/Badge";

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  // Évite que /stocks active aussi /stocks/alertes (entrée menu distincte)
  if (href === "/stocks") {
    return pathname === "/stocks" || pathname.startsWith("/stocks/historique");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }) {
  const router = useRouter();
  const { profil, setProfil, label } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [alertes, setAlertes] = useState([]);
  const notifsRef = useRef(null);

  useEffect(() => {
    api
      .get("/stocks/alertes/")
      .then((list) => setAlertes(list.filter((a) => a.statut === "ouverte" || !a.statut)))
      .catch(() => setAlertes([]));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  useEffect(() => {
    const close = (e) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target)) setNotifsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const items = useMemo(
    () => NAV_ITEMS.filter((item) => item.roles.includes(profil)),
    [profil]
  );

  const alertesVisibles = alertes.slice(0, 5);

  const NavContent = () => (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-white/10 text-accent">
            <Gauge size={18} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white">
              PetroStock<span className="text-accent"> SA</span>
            </p>
            <p className="text-[11px] text-white/55">Gestion des stocks</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const actif = isActive(router.pathname, item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded px-3 py-2.5 text-sm transition ${
                    actif
                      ? "bg-white/12 font-medium text-white"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-white/40">
          Profil actif
        </label>
        <div className="relative">
          <CircleUserRound size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-accent" />
          <select
            value={profil}
            onChange={(e) => setProfil(e.target.value)}
            className="w-full appearance-none rounded border border-white/20 bg-navy-900 py-2 pl-9 pr-8 text-sm text-white outline-none"
          >
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-navy-900 text-white">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-navy-800 lg:flex">
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-navy-900/50" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-800 shadow-raised animate-fade-in">
            <button
              type="button"
              className="absolute right-3 top-4 rounded p-1 text-white/70 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-line bg-white">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded border border-line p-2 text-ink-muted lg:hidden"
                onClick={() => setMobileOpen(true)}
                aria-label="Ouvrir le menu"
              >
                <Menu size={18} />
              </button>
              <div className="hidden sm:block">
                <p className="text-xs text-ink-muted">Session</p>
                <p className="text-sm font-medium text-ink">{label}</p>
              </div>
            </div>

            <div className="relative" ref={notifsRef}>
              <button
                type="button"
                aria-label="Voir les alertes"
                onClick={() => setNotifsOpen((v) => !v)}
                className="relative rounded border border-line p-2 text-ink-muted hover:bg-canvas-tint hover:text-ink"
              >
                <Bell size={17} />
                {alertes.length > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex min-w-[18px] items-center justify-center rounded bg-danger px-1 text-[10px] font-bold text-white">
                    {alertes.length}
                  </span>
                )}
              </button>
              {notifsOpen && (
                <div className="absolute right-0 top-11 w-80 overflow-hidden rounded border border-line bg-white shadow-raised animate-fade-up">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                    <p className="text-sm font-semibold text-ink">Alertes actives</p>
                    <Badge label={String(alertes.length)} niveau="critique" />
                  </div>
                  <div className="max-h-72 overflow-auto p-2">
                    {alertesVisibles.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-ink-muted">Aucune alerte</p>
                    ) : (
                      alertesVisibles.map((a) => (
                        <Link
                          key={`${a.depot_id}-${a.produit_id}-${a.date}`}
                          href="/stocks/alertes"
                          className="block rounded px-3 py-2.5 hover:bg-canvas"
                          onClick={() => setNotifsOpen(false)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-ink">
                                {a.titre || `${labelDepot(a.depot_id)} · ${labelProduit(a.produit_id)}`}
                              </p>
                              <p className="mt-0.5 text-xs text-ink-muted">
                                {a.jours_couverture != null ? `${a.jours_couverture} j de couverture` : `Seuil le ${a.date}`}
                              </p>
                            </div>
                            <Badge
                              label={niveauAlerte(a.niveau) === "critique" ? "Critique" : "Bas"}
                              niveau={niveauAlerte(a.niveau)}
                            />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <Link
                    href="/stocks/alertes"
                    onClick={() => setNotifsOpen(false)}
                    className="block border-t border-line px-4 py-3 text-sm font-medium text-navy-700 hover:bg-canvas"
                  >
                    Voir toutes les alertes
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-shell px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
