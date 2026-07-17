import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  FileWarning,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Truck,
} from "lucide-react";
import { api } from "../lib/api";
import { formatFcfa, formatHeure, formatJours, formatNombre, formatPct, formatScore, formatUsd } from "../lib/format";
import { labelDepot, labelProduit } from "../lib/mockData";
import { useProfile } from "../context/ProfileContext";
import PageHeader from "../components/ui/PageHeader";
import StatStrip from "../components/ui/StatStrip";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/ui/ErrorBanner";
import { SkeletonBlock } from "../components/ui/Skeleton";

const ICONS = {
  commande_urgente: Truck,
  alerte_critique: AlertTriangle,
  incident: FileWarning,
  commande_retard: ClipboardList,
  anomalie: ShieldAlert,
  transfert: ArrowRight,
};

export default function DashboardPage() {
  const { isDirection, isAchats } = useProfile();
  const [kpi, setKpi] = useState(null);
  const [actions, setActions] = useState([]);
  const [matrice, setMatrice] = useState([]);
  const [journal, setJournal] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [resume, setResume] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [maj, setMaj] = useState(null);

  const charger = useCallback(async () => {
    setErreur(null);
    try {
      const [k, a, m, j, al, r] = await Promise.all([
        api.get("/kpi/"),
        api.get("/ops/actions/"),
        api.get("/ops/matrice-depots/"),
        api.get("/ops/journal/"),
        api.get("/stocks/alertes/"),
        api.get("/previsions/resume/"),
      ]);
      setKpi(k);
      setActions(a);
      setMatrice(m);
      setJournal(j);
      setAlertes(al);
      setResume(r);
      setMaj(new Date());
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
    const id = setInterval(charger, 60000);
    return () => clearInterval(id);
  }, [charger]);

  const alertesOuvertes = useMemo(() => alertes.filter((a) => a.statut === "ouverte"), [alertes]);
  const critiques = alertesOuvertes.filter((a) => a.niveau === "critique");
  const rupturesCritiques = resume.filter((r) => r.niveau === "critique");

  const strip = [
    { label: "Valeur stock", value: formatUsd(kpi?.valeur_totale_stock_usd), hint: isDirection ? `${formatPct(kpi?.variation_journaliere_pct)} j/j` : null },
    { label: "Alertes ouvertes", value: formatNombre(alertesOuvertes.length), tone: critiques.length ? "danger" : "warning", hint: `${critiques.length} critique(s)` },
    { label: "Ruptures < 5 j", value: formatNombre(rupturesCritiques.length), tone: "danger", hint: "selon modèle IA" },
    { label: "Remplissage moyen", value: formatPct(kpi?.taux_remplissage_moyen_pct), tone: "success" },
    { label: "Incidents ouverts", value: formatNombre(kpi?.incidents_ouverts), tone: "warning" },
    { label: "Dernière maj", value: formatHeure(maj), hint: "auto 60 s" },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Poste de pilotage"
        description="Ce qui exige une décision maintenant — pas un résumé décoratif."
        actions={
          <Button variant="secondary" onClick={charger}>
            <RefreshCw size={14} /> Actualiser
          </Button>
        }
      />

      {erreur && <ErrorBanner title="Impossible de contacter le serveur" description={erreur} onRetry={charger} />}

      <StatStrip items={strip} />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        {/* File d'actions */}
        <Card
          title="À traiter maintenant"
          action={
            <span className="text-[11px] text-ink-muted">
              {actions.length} action{actions.length > 1 ? "s" : ""} prioritaire{actions.length > 1 ? "s" : ""}
            </span>
          }
        >
          {chargement ? (
            <SkeletonBlock rows={6} />
          ) : (
            <ul className="divide-y divide-line">
              {actions.map((act) => {
                const Icon = ICONS[act.type] || Sparkles;
                return (
                  <li key={act.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded ${
                          act.priorite === 1 ? "bg-danger-soft text-danger" : "bg-navy-50 text-navy-700"
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink">{act.titre}</p>
                          <Badge label={act.priorite === 1 ? "P1" : "P2"} niveau={act.priorite === 1 ? "critique" : "attention"} />
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-ink-muted">{act.detail}</p>
                      </div>
                    </div>
                    <Button href={act.action_href} className="shrink-0 !text-xs">
                      {act.action_label}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Journal */}
        <Card title="Journal opérationnel (nuit / matin)">
          {chargement ? (
            <SkeletonBlock rows={7} />
          ) : (
            <ul className="space-y-0">
              {journal.map((e, i) => (
                <li key={i} className="flex gap-3 border-b border-line py-2.5 last:border-0">
                  <span className="w-10 shrink-0 font-mono text-[11px] text-ink-faint">{e.heure}</span>
                  <div>
                    <Badge
                      label={e.type}
                      niveau={e.type === "alerte" || e.type === "incident" ? "critique" : e.type === "ia" ? "info" : "neutre"}
                    />
                    <p className="mt-1 text-xs text-ink-soft">{e.texte}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Matrice dépôts — dense */}
      <Card
        title="Matrice des 8 dépôts"
        action={
          <Link href="/stocks" className="text-xs font-medium text-navy-700 hover:underline">
            Vue stocks →
          </Link>
        }
      >
        {chargement ? (
          <SkeletonBlock rows={8} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="px-3 py-2.5 font-semibold">Dépôt</th>
                  <th className="px-3 py-2.5 font-semibold">Région</th>
                  <th className="px-3 py-2.5 font-semibold">Remplissage</th>
                  <th className="px-3 py-2.5 font-semibold">Valeur</th>
                  <th className="px-3 py-2.5 font-semibold">Alertes</th>
                  <th className="px-3 py-2.5 font-semibold">Couverture min.</th>
                  <th className="px-3 py-2.5 font-semibold">Statut</th>
                  <th className="px-3 py-2.5 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {matrice.map((d) => (
                  <tr key={d.id} className="border-b border-line hover:bg-navy-50/50">
                    <td className="px-3 py-2.5 font-medium text-ink">{d.label}</td>
                    <td className="px-3 py-2.5 text-ink-muted">{d.region}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded bg-canvas-tint">
                          <div
                            className="h-1.5 rounded"
                            style={{
                              width: `${d.taux_remplissage}%`,
                              background: d.statut === "critique" ? "#C63B3B" : d.statut === "attention" ? "#C9841A" : "#1E8E5A",
                            }}
                          />
                        </div>
                        <span className="mono-nums text-xs">{formatPct(d.taux_remplissage)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 mono-nums text-xs">{formatUsd(d.valeur_stock_usd)}</td>
                    <td className="px-3 py-2.5">
                      <span className="mono-nums">{d.alertes_ouvertes}</span>
                      {d.alertes_critiques > 0 && (
                        <span className="ml-1 text-[11px] font-semibold text-danger">({d.alertes_critiques} crit.)</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 mono-nums text-xs">{formatJours(d.jours_min_couverture)}</td>
                    <td className="px-3 py-2.5">
                      <Badge
                        label={d.statut === "critique" ? "Critique" : d.statut === "attention" ? "Attention" : "Normal"}
                        niveau={d.statut}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link href={`/stocks?depot=${d.id}`} className="text-xs font-medium text-navy-700 hover:underline">
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Prévisions critiques + alertes top */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Ruptures estimées < 5 jours"
          action={
            <Link href="/previsions" className="text-xs font-medium text-navy-700 hover:underline">
              Centre prévisions →
            </Link>
          }
        >
          {chargement ? (
            <SkeletonBlock />
          ) : rupturesCritiques.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">Aucune rupture critique estimée.</p>
          ) : (
            <ul className="divide-y divide-line">
              {rupturesCritiques.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {labelDepot(r.depot_id)} · {labelProduit(r.produit_id)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Stock {formatNombre(r.stock_actuel)} · conso {formatNombre(r.conso_jour)}/j · suggestion{" "}
                      {formatNombre(r.quantite_suggeree)} · {formatFcfa(r.cout_estime_fcfa)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-danger mono-nums">{formatJours(r.jours_avant_rupture)}</p>
                    {isAchats && (
                      <Link
                        href={`/commandes/nouvelle?depot=${r.depot_id}&produit=${r.produit_id}&qte=${r.quantite_suggeree}`}
                        className="text-[11px] font-medium text-navy-700 hover:underline"
                      >
                        Commander
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Alertes ouvertes (top priorité)"
          action={
            <Link href="/stocks/alertes" className="text-xs font-medium text-navy-700 hover:underline">
              Centre d&apos;alertes →
            </Link>
          }
        >
          {chargement ? (
            <SkeletonBlock />
          ) : (
            <ul className="divide-y divide-line">
              {[...alertesOuvertes]
                .sort((a, b) => a.priorite - b.priorite || a.jours_couverture - b.jours_couverture)
                .slice(0, 6)
                .map((a) => (
                  <li key={a.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink">{a.titre}</p>
                        <p className="mt-0.5 text-xs text-ink-muted">{a.message}</p>
                        <p className="mt-1 text-[11px] text-ink-faint">
                          Suggestion : {formatNombre(a.suggestion.quantite_suggeree)} via {a.suggestion.fournisseur_nom} (score{" "}
                          {formatScore(a.suggestion.fournisseur_score)})
                        </p>
                      </div>
                      <Badge label={a.niveau === "critique" ? "Critique" : "Bas"} niveau={a.niveau} />
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
