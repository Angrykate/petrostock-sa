import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  FileWarning,
  Gauge,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { api } from "../lib/api";
import { formatHeure, formatJours, formatNombre, formatPct, formatUsd } from "../lib/format";
import { labelDepot, labelProduit, niveauAlerte } from "../lib/mockData";
import { useProfile } from "../context/ProfileContext";
import PageHeader from "../components/ui/PageHeader";
import KpiCard from "../components/ui/KpiCard";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import ErrorBanner from "../components/ui/ErrorBanner";
import TankGauge from "../components/ui/TankGauge";
import { SkeletonKpi, SkeletonBlock } from "../components/ui/Skeleton";
import { StockAreaChart } from "../components/charts";

export default function DashboardPage() {
  const { isDirection, isDepot } = useProfile();
  const [kpi, setKpi] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [metas, setMetas] = useState({ depots: [] });
  const [periode, setPeriode] = useState(30);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [dernierRefresh, setDernierRefresh] = useState(null);
  const [rafraichit, setRafraichit] = useState(false);

  const charger = useCallback(async (silent = false) => {
    if (!silent) setChargement(true);
    else setRafraichit(true);
    setErreur(null);
    try {
      const [k, a, i, s, m] = await Promise.all([
        api.get("/kpi/"),
        api.get("/stocks/alertes/"),
        api.get("/incidents/"),
        api.get("/stocks/D001"),
        api.get("/metas/"),
      ]);
      setKpi(k);
      setAlertes(a);
      setIncidents(i.filter((x) => x.statut === "Ouvert").slice(0, 5));
      setStocks(s);
      setMetas(m);
      setDernierRefresh(new Date());
    } catch (e) {
      setErreur(e.message);
    } finally {
      setChargement(false);
      setRafraichit(false);
    }
  }, []);

  useEffect(() => {
    charger(false);
    const id = setInterval(() => charger(true), 60000);
    return () => clearInterval(id);
  }, [charger]);

  const depotsCards = useMemo(() => {
    return (metas.depots || []).map((d) => {
      const alertesDepot = alertes.filter((a) => a.depot_id === d.id);
      const niveau = alertesDepot.some((a) => niveauAlerte(a.niveau) === "critique")
        ? "critique"
        : alertesDepot.length
          ? "attention"
          : "normal";
      const taux =
        niveau === "critique" ? 42 : niveau === "attention" ? 58 : 86;
      return { ...d, niveau, taux, alertes: alertesDepot.length };
    });
  }, [metas, alertes]);

  const serie = useMemo(() => stocks.slice(-periode), [stocks, periode]);
  const alertesUrgentes = useMemo(
    () => [...alertes].sort((a, b) => (a.jours_couverture || 99) - (b.jours_couverture || 99)).slice(0, 10),
    [alertes]
  );

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Tableau de bord"
        description="État opérationnel des stocks, alertes et incidents en un coup d'œil."
        actions={
          <Button variant="secondary" onClick={() => charger(true)} loading={rafraichit}>
            <RefreshCw size={14} /> Actualiser
          </Button>
        }
      />

      {erreur && (
        <ErrorBanner
          title="Impossible de contacter le serveur"
          description={`Dernière mise à jour : ${formatHeure(dernierRefresh)}. ${erreur}`}
          onRetry={() => charger(false)}
        />
      )}

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonKpi key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 stagger">
          <KpiCard
            title="Valeur totale du stock"
            value={formatUsd(kpi?.valeur_totale_stock_usd)}
            icon={DollarSign}
            variation={isDirection ? kpi?.variation_journaliere_pct : undefined}
          />
          <KpiCard
            title="Alertes actives"
            value={formatNombre(kpi?.nombre_alertes_actives)}
            icon={AlertTriangle}
            tone={(kpi?.nombre_alertes_actives || 0) > 3 ? "danger" : "warning"}
          />
          <KpiCard
            title="Taux de remplissage moyen"
            value={formatPct(kpi?.taux_remplissage_moyen_pct)}
            icon={Gauge}
            tone="success"
          />
          <KpiCard
            title="Incidents ouverts"
            value={formatNombre(kpi?.incidents_ouverts)}
            icon={FileWarning}
            tone={(kpi?.incidents_ouverts || 0) > 0 ? "warning" : "default"}
          />
        </div>
      )}

      <Card
        title="État des dépôts"
        action={rafraichit ? <span className="text-[11px] text-ink-faint">Mise à jour…</span> : null}
      >
        {chargement ? (
          <SkeletonBlock rows={2} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {depotsCards.map((d) => (
              <Link
                key={d.id}
                href={`/stocks?depot=${d.id}`}
                className="flex items-center gap-3 rounded border border-line p-3 transition hover:border-navy-300 hover:bg-navy-50"
              >
                <TankGauge taux={d.taux} height={72} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{d.label}</p>
                  <p className="text-xs text-ink-muted">{d.region}</p>
                  <div className="mt-1.5">
                    <Badge
                      label={d.niveau === "critique" ? "Critique" : d.niveau === "attention" ? "Attention" : "Normal"}
                      niveau={d.niveau}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card
          title="Alertes de stock bas"
          action={
            <Link href="/stocks/alertes" className="text-xs font-medium text-navy-700 hover:underline">
              Voir toutes
            </Link>
          }
        >
          {chargement ? (
            <SkeletonBlock />
          ) : alertesUrgentes.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Aucune alerte active"
              description="Tous les dépôts sont au-dessus du seuil critique."
            />
          ) : (
            <ul className="divide-y divide-line">
              {alertesUrgentes.map((a) => (
                <li key={`${a.depot_id}-${a.produit_id}-${a.date}`}>
                  <Link
                    href={`/previsions/ruptures?depot=${a.depot_id}&produit=${a.produit_id}`}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-canvas"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {labelDepot(a.depot_id)} · {labelProduit(a.produit_id)}
                      </p>
                      <p className="text-xs text-ink-muted">{formatJours(a.jours_couverture)} de couverture</p>
                    </div>
                    <Badge
                      label={niveauAlerte(a.niveau) === "critique" ? "Critique" : "Bas"}
                      niveau={niveauAlerte(a.niveau)}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card
          title="Incidents récents"
          action={
            <Link href="/incidents" className="text-xs font-medium text-navy-700 hover:underline">
              Voir tous
            </Link>
          }
        >
          {chargement ? (
            <SkeletonBlock />
          ) : incidents.length === 0 ? (
            <EmptyState
              icon={ShieldCheck}
              title="Aucun incident récent"
              description="Rien à signaler sur les 30 derniers jours."
            />
          ) : (
            <ul className="divide-y divide-line">
              {incidents.map((inc) => (
                <li key={inc.incident_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {inc.type_incident} · {labelDepot(inc.depot_id)}
                    </p>
                    <p className="text-xs text-ink-muted">{inc.date_incident}</p>
                  </div>
                  <Badge
                    label={inc.gravite}
                    niveau={
                      inc.gravite === "Critique" || inc.gravite === "Élevé"
                        ? "critique"
                        : inc.gravite === "Modéré"
                          ? "attention"
                          : "neutre"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {!isDepot && (
        <Card
          title="Évolution du stock (dépôt référence)"
          action={
            <div className="flex gap-1">
              {[7, 30, 90].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriode(p)}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    periode === p ? "bg-navy-700 text-white" : "border border-line text-ink-muted hover:bg-canvas"
                  }`}
                >
                  {p}j
                </button>
              ))}
            </div>
          }
        >
          {chargement ? <SkeletonBlock rows={6} /> : <StockAreaChart data={serie} animate={!rafraichit} />}
        </Card>
      )}
    </div>
  );
}
