import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AlertTriangle, ArrowRight, History } from "lucide-react";
import { api } from "../../lib/api";
import { formatJours, formatNombre, formatPct, formatUsd } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import StatStrip from "../../components/ui/StatStrip";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import TankGauge from "../../components/ui/TankGauge";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import ErrorBanner from "../../components/ui/ErrorBanner";
import { StockAreaChart } from "../../components/charts";

export default function StocksOverviewPage() {
  const router = useRouter();
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [alertes, setAlertes] = useState([]);
  const [matrice, setMatrice] = useState([]);
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
        const [m, a, s, mat] = await Promise.all([
          api.get("/metas/"),
          api.get("/stocks/alertes/"),
          api.get(`/stocks/${depotId}`),
          api.get("/ops/matrice-depots/"),
        ]);
        if (!cancel) {
          setMetas(m);
          setAlertes(a);
          setStocks(s);
          setMatrice(mat);
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
  const alertesDepot = alertes.filter((a) => a.depot_id === depotId && a.statut === "ouverte");
  const depotMeta = matrice.find((d) => d.id === depotId) || metas.depots?.find((d) => d.id === depotId);
  const serie30 = useMemo(() => stocks.slice(-30), [stocks]);
  const entrees30 = serie30.reduce((s, r) => s + (r.entrees || 0), 0);
  const sorties30 = serie30.reduce((s, r) => s + (r.sorties || 0), 0);

  const strip = [
    { label: "Stock actuel", value: formatNombre(dernier?.stock_fin_jour) },
    { label: "Remplissage", value: formatPct(dernier?.taux_remplissage_pct), tone: "success" },
    { label: "Valeur estimée", value: formatUsd((dernier?.stock_fin_jour || 0) * 0.42) },
    { label: "Alertes ouvertes", value: formatNombre(alertesDepot.length), tone: alertesDepot.length ? "danger" : "success" },
    { label: "Entrées 30 j", value: formatNombre(entrees30) },
    { label: "Sorties 30 j", value: formatNombre(sorties30), tone: "warning" },
  ];

  return (
    <div className="animate-fade-up space-y-4">
      <PageHeader
        title="Stocks — poste opérationnel"
        description="Niveaux par dépôt, flux 30 jours, alertes locales et accès aux postes dédiés (historique, centre d'alertes)."
        actions={
          <>
            <Button href="/stocks/alertes" variant="secondary">
              <AlertTriangle size={14} /> Centre d&apos;alertes
            </Button>
            <Button href={`/stocks/historique?depot=${depotId}`}>
              <History size={14} /> Historique <ArrowRight size={14} />
            </Button>
          </>
        }
      />

      {erreur && <ErrorBanner title="Erreur" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="field-label">Dépôt actif</label>
            <select className="field-input max-w-md" value={depotId} onChange={(e) => setDepotId(e.target.value)}>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} — {d.region} (cap. {formatNombre(d.capacite)})
                </option>
              ))}
            </select>
          </div>
          {depotMeta && (
            <div className="flex items-center gap-3 text-xs text-ink-muted">
              <Badge
                label={depotMeta.statut === "critique" ? "Critique" : depotMeta.statut === "attention" ? "Attention" : "Normal"}
                niveau={depotMeta.statut || "normal"}
              />
              <span>Couverture min. {formatJours(depotMeta.jours_min_couverture)}</span>
            </div>
          )}
        </div>
      </Card>

      <StatStrip items={strip} />

      <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
        <Card title="Niveau" bodyClassName="flex justify-center py-6">
          {chargement ? <SkeletonBlock rows={4} /> : <TankGauge taux={dernier?.taux_remplissage_pct || 0} height={160} />}
        </Card>
        <Card title={`Évolution 30 j — ${labelDepot(depotId)}`}>
          {chargement ? <SkeletonBlock rows={8} /> : <StockAreaChart data={serie30} />}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Alertes ouvertes — ${labelDepot(depotId)}`}>
          {alertesDepot.length === 0 ? (
            <p className="text-sm text-ink-muted">Aucune alerte ouverte sur ce dépôt.</p>
          ) : (
            <ul className="divide-y divide-line">
              {alertesDepot.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{a.titre || labelProduit(a.produit_id)}</p>
                    <p className="text-xs text-ink-muted">
                      Stock {formatNombre(a.stock_fin_jour)} · seuil {formatNombre(a.seuil_alerte)} ·{" "}
                      {formatJours(a.jours_couverture)}
                    </p>
                    {a.suggestion && (
                      <p className="mt-1 text-[11px] text-ink-faint">
                        Suggestion : {formatNombre(a.suggestion.quantite_suggeree)} via {a.suggestion.fournisseur_nom}
                      </p>
                    )}
                  </div>
                  <Badge label={a.niveau === "critique" ? "Critique" : "Bas"} niveau={a.niveau} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Tous les dépôts (aperçu)">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-muted">
                  <th className="py-2 pr-3">Dépôt</th>
                  <th className="py-2 pr-3">Alertes</th>
                  <th className="py-2 pr-3">Couverture</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {matrice.map((d) => (
                  <tr key={d.id} className={`border-b border-line ${d.id === depotId ? "bg-navy-50" : ""}`}>
                    <td className="py-2 pr-3 font-medium">{d.label}</td>
                    <td className="py-2 pr-3 mono-nums">
                      {d.alertes_ouvertes}
                      {d.alertes_critiques > 0 && <span className="text-danger"> ({d.alertes_critiques}c)</span>}
                    </td>
                    <td className="py-2 pr-3 mono-nums text-xs">{formatJours(d.jours_min_couverture)}</td>
                    <td className="py-2 text-right">
                      <button type="button" className="text-xs font-medium text-navy-700 hover:underline" onClick={() => setDepotId(d.id)}>
                        Activer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <p className="text-xs text-ink-faint">
        Pour le détail jour par jour (entrées/sorties/anomalies) →{" "}
        <Link href={`/stocks/historique?depot=${depotId}`} className="font-medium text-navy-700 hover:underline">
          Historique détaillé
        </Link>
        .
      </p>
    </div>
  );
}
