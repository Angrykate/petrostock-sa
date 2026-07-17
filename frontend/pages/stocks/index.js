import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { formatNombre, formatPct, formatUsd } from "../../lib/format";
import { labelDepot, labelProduit, niveauAlerte } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import KpiCard from "../../components/ui/KpiCard";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TankGauge from "../../components/ui/TankGauge";
import { SkeletonBlock, SkeletonKpi } from "../../components/ui/Skeleton";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { StockAreaChart } from "../../components/charts";

export default function StocksOverviewPage() {
  const router = useRouter();
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [alertes, setAlertes] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [depotId, setDepotId] = useState("D001");
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (router.query.depot) setDepotId(String(router.query.depot));
  }, [router.query.depot]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [m, a, s] = await Promise.all([
          api.get("/metas/"),
          api.get("/stocks/alertes/"),
          api.get(`/stocks/${depotId}`),
        ]);
        if (!cancel) {
          setMetas(m);
          setAlertes(a);
          setStocks(s);
        }
      } catch (e) {
        if (!cancel) setErreur(e.message);
      } finally {
        if (!cancel) setChargement(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [depotId]);

  const dernier = stocks[stocks.length - 1];
  const alertesDepot = alertes.filter((a) => a.depot_id === depotId);

  const resumeDepots = useMemo(() => {
    return (metas.depots || []).map((d) => {
      const al = alertes.filter((a) => a.depot_id === d.id);
      const niveau = al.some((a) => niveauAlerte(a.niveau) === "critique")
        ? "critique"
        : al.length
          ? "attention"
          : "normal";
      return { ...d, alertes: al.length, niveau, taux: niveau === "critique" ? 38 : niveau === "attention" ? 55 : 88 };
    });
  }, [metas, alertes]);

  return (
    <div className="animate-fade-up space-y-5">
      <PageHeader
        title="Stocks"
        description="Niveaux par dépôt, alertes et historique détaillé."
        actions={
          <>
            <Button href="/stocks/alertes" variant="secondary">
              <AlertTriangle size={14} /> Voir les alertes
            </Button>
            <Button href={`/stocks/historique?depot=${depotId}`}>
              Historique détaillé <ArrowRight size={14} />
            </Button>
          </>
        }
      />

      {erreur && (
        <ErrorBanner
          title="Une erreur est survenue"
          description={erreur}
          onRetry={() => {
            setChargement(true);
            setErreur(null);
            Promise.all([
              api.get("/metas/"),
              api.get("/stocks/alertes/"),
              api.get(`/stocks/${depotId}`),
            ])
              .then(([m, a, s]) => {
                setMetas(m);
                setAlertes(a);
                setStocks(s);
              })
              .catch((e) => setErreur(e.message))
              .finally(() => setChargement(false));
          }}
        />
      )}

      <Card>
        <label className="field-label">Dépôt</label>
        <select className="field-input max-w-md" value={depotId} onChange={(e) => setDepotId(e.target.value)}>
          {(metas.depots || []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.label} ({d.region})
            </option>
          ))}
        </select>
      </Card>

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 stagger">
          <KpiCard title="Stock actuel" value={formatNombre(dernier?.stock_fin_jour)} />
          <KpiCard title="Taux de remplissage" value={formatPct(dernier?.taux_remplissage_pct)} tone="success" />
          <KpiCard title="Valeur estimée" value={formatUsd((dernier?.stock_fin_jour || 0) * 0.42)} />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        <Card title="Niveau actuel" bodyClassName="flex justify-center py-6">
          {chargement ? <SkeletonBlock rows={4} /> : <TankGauge taux={dernier?.taux_remplissage_pct || 0} height={160} />}
        </Card>
        <Card title="Évolution (30 derniers jours)">
          {chargement ? <SkeletonBlock rows={8} /> : <StockAreaChart data={stocks.slice(-30)} />}
        </Card>
      </div>

      <Card title="Alertes sur ce dépôt">
        {alertesDepot.length === 0 ? (
          <p className="text-sm text-ink-muted">Aucune alerte pour ce dépôt.</p>
        ) : (
          <ul className="divide-y divide-line">
            {alertesDepot.map((a) => (
              <li key={`${a.produit_id}-${a.date}`} className="flex items-center justify-between py-2.5">
                <span className="text-sm">{labelProduit(a.produit_id)}</span>
                <Badge label={niveauAlerte(a.niveau) === "critique" ? "Critique" : "Bas"} niveau={niveauAlerte(a.niveau)} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Tous les dépôts">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {resumeDepots.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                setDepotId(d.id);
                router.replace(`/stocks?depot=${d.id}`, undefined, { shallow: true });
              }}
              className={`rounded border p-3 text-left transition ${
                depotId === d.id ? "border-navy-500 bg-navy-50" : "border-line hover:bg-canvas"
              }`}
            >
              <p className="text-sm font-semibold text-ink">{d.label}</p>
              <p className="mt-1 text-xs text-ink-muted">{d.alertes} alerte(s)</p>
              <div className="mt-2">
                <Badge
                  label={d.niveau === "critique" ? "Critique" : d.niveau === "attention" ? "Attention" : "Normal"}
                  niveau={d.niveau}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
