import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Download, SearchX } from "lucide-react";
import { api } from "../../lib/api";
import { exporterCsv, formatDate, formatNombre, formatPct } from "../../lib/format";
import { labelDepot, labelProduit } from "../../lib/mockData";
import PageHeader from "../../components/ui/PageHeader";
import SubNav from "../../components/ui/SubNav";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import ErrorBanner from "../../components/ui/ErrorBanner";
import KpiCard from "../../components/ui/KpiCard";
import { SkeletonBlock, SkeletonKpi } from "../../components/ui/Skeleton";
import { StockComposedChart } from "../../components/charts";

export default function HistoriqueStocksPage() {
  const router = useRouter();
  const [metas, setMetas] = useState({ depots: [], produits: [] });
  const [depotId, setDepotId] = useState("D001");
  const [produitId, setProduitId] = useState("tous");
  const [jours, setJours] = useState(90);
  const [series, setSeries] = useState({ entrees: true, sorties: true, stock: true });
  const [donnees, setDonnees] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    if (router.query.depot) setDepotId(String(router.query.depot));
  }, [router.query.depot]);

  useEffect(() => {
    api.get("/metas/").then(setMetas).catch(() => {});
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const d = await api.get(`/stocks/${depotId}`);
        if (!cancel) setDonnees(d);
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

  const filtre = useMemo(() => {
    let rows = donnees.slice(-jours);
    if (produitId !== "tous") rows = rows.filter((r) => r.produit_id === produitId);
    return rows;
  }, [donnees, jours, produitId]);

  const dernier = filtre[filtre.length - 1];

  const reset = () => {
    setDepotId("D001");
    setProduitId("tous");
    setJours(90);
  };

  const exportData = () => {
    const lignes = [
      ["Date", "Dépôt", "Produit", "Stock début", "Entrées", "Sorties", "Stock fin", "Taux %", "Alerte"],
      ...filtre.map((r) => [
        r.date,
        labelDepot(r.depot_id),
        labelProduit(r.produit_id),
        r.stock_debut_jour,
        r.entrees,
        r.sorties,
        r.stock_fin_jour,
        r.taux_remplissage_pct,
        r.alerte_stock_bas ? "Oui" : "Non",
      ]),
    ];
    exporterCsv(`stocks_${depotId}.csv`, lignes);
  };

  const columns = [
    { key: "date", label: "Date", sortable: true, render: (r) => formatDate(r.date) },
    { key: "produit_id", label: "Produit", sortable: true, render: (r) => labelProduit(r.produit_id) },
    { key: "stock_debut_jour", label: "Début", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.stock_debut_jour)}</span> },
    { key: "entrees", label: "Entrées", sortable: true, className: "hidden md:table-cell", render: (r) => <span className="mono-nums">{formatNombre(r.entrees)}</span> },
    { key: "sorties", label: "Sorties", sortable: true, className: "hidden md:table-cell", render: (r) => <span className="mono-nums">{formatNombre(r.sorties)}</span> },
    { key: "stock_fin_jour", label: "Fin", sortable: true, render: (r) => <span className="mono-nums">{formatNombre(r.stock_fin_jour)}</span> },
    { key: "taux_remplissage_pct", label: "Taux", sortable: true, className: "hidden lg:table-cell", render: (r) => formatPct(r.taux_remplissage_pct) },
    {
      key: "statut",
      label: "Statut",
      render: (r) => (
        <Badge
          label={r.alerte_stock_bas ? (r.anomalie_detectee ? "Critique" : "Bas") : "Normal"}
          niveau={r.alerte_stock_bas ? (r.anomalie_detectee ? "critique" : "attention") : "normal"}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <SubNav parentHref="/stocks" parentLabel="Stocks" current="Historique" />
      <PageHeader
        title="Historique des stocks"
        description="Exploration détaillée par dépôt, produit et période."
        actions={
          <Button variant="secondary" onClick={exportData}>
            <Download size={14} /> Exporter CSV
          </Button>
        }
      />

      {erreur && <ErrorBanner title="Impossible de charger l'historique" description={erreur} />}

      <Card>
        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="field-label">Dépôt</label>
            <select className="field-input" value={depotId} onChange={(e) => setDepotId(e.target.value)}>
              {(metas.depots || []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Produit</label>
            <select className="field-input" value={produitId} onChange={(e) => setProduitId(e.target.value)}>
              <option value="tous">Tous</option>
              {(metas.produits || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Période</label>
            <select className="field-input" value={jours} onChange={(e) => setJours(Number(e.target.value))}>
              <option value={7}>7 jours</option>
              <option value={30}>30 jours</option>
              <option value={90}>90 jours</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="secondary" onClick={reset} className="w-full">
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      {chargement ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonKpi />
          <SkeletonKpi />
          <SkeletonKpi />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard title="Stock actuel" value={formatNombre(dernier?.stock_fin_jour)} />
          <KpiCard title="Taux actuel" value={formatPct(dernier?.taux_remplissage_pct)} />
          <KpiCard title="Points d'anomalie" value={formatNombre(filtre.filter((r) => r.anomalie_detectee).length)} tone="warning" />
        </div>
      )}

      <Card
        title="Évolution du stock"
        action={
          <div className="flex flex-wrap gap-3 text-xs text-ink-muted">
            {[
              ["stock", "Stock"],
              ["entrees", "Entrées"],
              ["sorties", "Sorties"],
            ].map(([key, label]) => (
              <label key={key} className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={series[key]}
                  onChange={(e) => setSeries((s) => ({ ...s, [key]: e.target.checked }))}
                />
                {label}
              </label>
            ))}
          </div>
        }
      >
        {chargement ? (
          <SkeletonBlock rows={8} />
        ) : (
          <StockComposedChart
            data={filtre}
            showEntrees={series.entrees}
            showSorties={series.sorties}
            showStock={series.stock}
          />
        )}
      </Card>

      <Card title="Historique détaillé">
        {chargement ? (
          <SkeletonBlock rows={8} />
        ) : (
          <DataTable
            columns={columns}
            rows={[...filtre].reverse()}
            rowKey={(r) => `${r.date}-${r.produit_id}`}
            empty={
              <EmptyState
                icon={SearchX}
                title="Aucune donnée pour ces filtres"
                description="Essaie d'élargir la période ou de changer de dépôt/produit."
              />
            }
          />
        )}
      </Card>
    </div>
  );
}
